import {
  ApmService,
  CacheService,
  LimiterService,
  logger,
  SCHEDULER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ethers } from 'ethers';
import _ from 'lodash';
import moment from 'moment';
import { Mutex } from 'redis-semaphore';
import { ApiService, MarketListingDto } from '../../shared/api';
import {
  CACHE_MARKET_BUY_DOCUMENTS,
  PROCESS_MARKET_BUYS,
  PROCESS_MATCH_LOG,
} from '../../util';
import { MarketBuyController } from './market-buy.controller';
import { MarketBuyDocument } from './ui/market-buy.document';

@Processor(SCHEDULER_QUEUE)
export class MarketBuyProcessor {
  constructor(
    private apmService: ApmService,
    private cacheService: CacheService,
    private apiService: ApiService,
    private marketBuyController: MarketBuyController,
    limiterService: LimiterService,
  ) {
    this.mutex = limiterService.createMutex('market-buy-processor-mutex');
  }

  private mutex: Mutex;

  @Process(PROCESS_MATCH_LOG)
  async processMatch(job: Job<ethers.providers.Log>) {
    try {
      const log = job.data;

      const tokenId = ethers.BigNumber.from(log.topics[1]).toNumber();

      await this.mutex.acquire();

      const existingDocuments = await this.cacheService.get<
        MarketBuyDocument[]
      >(CACHE_MARKET_BUY_DOCUMENTS);

      if (!existingDocuments?.length) {
        logger.warn(
          'Token was sold, but no market documents available: ' + tokenId,
        );
        return;
      }

      const documentExists = _.some(
        existingDocuments,
        (document) => document.tokenId === tokenId.toString(),
      );

      if (!documentExists) {
        logger.warn(
          'Token was sold, but was not present in the market documents: ' +
            tokenId,
        );
        return;
      }

      const updatedDocuments = _.filter(
        existingDocuments,
        (document) => document.tokenId !== tokenId.toString(),
      );

      await this.cacheService.set(CACHE_MARKET_BUY_DOCUMENTS, updatedDocuments);

      logger.log('Removed token id from market documents: ' + tokenId);

      const viewers = await this.marketBuyController.getViewers();

      await Promise.all(
        viewers.map((viewer) =>
          this.marketBuyController.onClientStateChanged(viewer),
        ),
      );
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    } finally {
      await this.mutex.release();
    }
  }

  @Process(PROCESS_MARKET_BUYS)
  async processMarket() {
    await this.mutex.acquire();

    try {
      const limit = !!process.env.MARKET_BUY_FETCH_LIMIT
        ? Number(process.env.MARKET_BUY_FETCH_LIMIT)
        : undefined;

      let existingDocuments = await this.cacheService.get<MarketBuyDocument[]>(
        CACHE_MARKET_BUY_DOCUMENTS,
      );

      if (!existingDocuments) {
        existingDocuments = [];
      }

      let fetchUntil = 0;

      if (existingDocuments.length > 0) {
        fetchUntil = _.chain(existingDocuments)
          .map((listing) => listing.lastModified)
          .max()
          .value();
      }

      const [newListings] = await Promise.all([
        this.apiService.fetchLatestMarketListings(fetchUntil, limit),
        // this.apiService.fetchHeroConfigs(),
        // this.apiService.fetchHeroSkinConfigs(),
      ]);

      const newDocuments = this.mapMarketDocuments(newListings);

      const updatedDocuments = _.chain(existingDocuments)
        .unionBy(newDocuments, 'id')
        .value();

      logger.log(
        'Fetched new market documents, length: ' + newDocuments.length,
      );

      if (!updatedDocuments.length) {
        return;
      }

      await this.cacheService.set(CACHE_MARKET_BUY_DOCUMENTS, updatedDocuments);

      const viewers = await this.marketBuyController.getViewers();

      await Promise.all(
        viewers.map((viewer) =>
          this.marketBuyController.onClientStateChanged(viewer),
        ),
      );
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    } finally {
      await this.mutex.release();
    }
  }

  private mapMarketDocuments(
    marketListingDtos: MarketListingDto[],
  ): MarketBuyDocument[] {
    const now = moment().unix();

    return _.chain(marketListingDtos)
      .map((dto) => {
        const price = Number(
          ethers.utils.formatUnits(
            dto.systemCurrency.value,
            dto.systemCurrency.decimals,
          ),
        );

        const type = dto.heroTypeId;

        let skinId = dto.skinId;

        if (type > 0) {
          skinId = skinId - type * 100 + type * 1000;
        }

        let battleColor = 'success';

        if (dto.battleCap / dto.battleCapMax < 0.2) {
          battleColor = 'danger';
        } else if (dto.battleCap / dto.battleCapMax < 0.4) {
          battleColor = 'warning';
        }

        const document: MarketBuyDocument = {
          id: dto.id,
          updated: now,
          battleCap: dto.battleCap,
          battleCapMax: dto.battleCapMax,
          battleColor,
          battlesUsed: dto.battleCapMax - dto.battleCap,
          created: moment(dto.created).unix(),
          dmg: dto.dmg,
          hp: dto.hp,
          lastModified: moment(dto.lastModified).unix(),
          level: dto.level,
          name: dto.name,
          ownerAddress: dto.ownerAddress,
          ownerId: dto.ownerId,
          price,
          pricePerBattle:
            dto.battleCap === 0 ? undefined : price / dto.battleCap,
          priceSymbol: dto.systemCurrency.name,
          rarity: dto.heroRarity,
          refId: dto.refId,
          role: dto.heroRole,
          skinId,
          skinName: dto.skinName,
          statusId: dto.status,
          tokenId: dto.tokenId,
          trophyClass: dto.trophyClass,
          type: dto.heroTypeId,
        };

        return document;
      })
      .filter((it) => !!it)
      .value();
  }
}
