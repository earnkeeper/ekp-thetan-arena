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
import { MarketBuyController } from '../../feature/market-buy/market-buy.controller';
import { MarketBuyDocument } from '../../feature/market-buy/ui/market-buy.document';
import { MarketRentController } from '../../feature/market-rent/market-rent.controller';
import { MarketRentDocument } from '../../feature/market-rent/ui/market-rent.document';
import {
  CACHE_MARKET_BUY_DOCUMENTS,
  CACHE_MARKET_RENT_DOCUMENTS,
  PROCESS_MARKET_BUYS,
  PROCESS_MARKET_RENTS,
  PROCESS_MATCH_LOG,
  PROCESS_RENT_HERO_LOG,
} from '../../util';
import { ApiService, MarketBuyDto } from '../api';
import { MarketRentDto } from '../api/dto/market-rent.dto';

@Processor(SCHEDULER_QUEUE)
export class MarketProcessor {
  constructor(
    private apmService: ApmService,
    private cacheService: CacheService,
    private apiService: ApiService,
    private marketBuyController: MarketBuyController,
    private marketRentController: MarketRentController,
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

      logger.debug(
        `Received market match log for token id and transaction hash: ${tokenId} - ${log.transactionHash}`,
      );

      await this.mutex.acquire();

      const buyDocuments: MarketBuyDocument[] = await this.cacheService.get(
        CACHE_MARKET_BUY_DOCUMENTS,
      );

      const buyDocumentExists = _.some(
        buyDocuments,
        (document) => document.tokenId === tokenId.toString(),
      );

      if (buyDocumentExists) {
        const updatedDocuments = _.filter(
          buyDocuments,
          (document) => document.tokenId !== tokenId.toString(),
        );

        await this.cacheService.set(
          CACHE_MARKET_BUY_DOCUMENTS,
          updatedDocuments,
        );

        logger.log('Removed token id from market buys: ' + tokenId);

        const viewers = await this.marketBuyController.getViewers();

        await Promise.all(
          viewers.map((viewer) =>
            this.marketBuyController.onClientStateChanged(viewer),
          ),
        );
      }
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    } finally {
      await this.mutex.release();
    }
  }

  @Process(PROCESS_RENT_HERO_LOG)
  async processRentHeroLog(job: Job<ethers.providers.Log>) {
    try {
      const log = job.data;

      const tokenId = ethers.BigNumber.from(log.topics[3]).toNumber();

      logger.debug(
        `Received rent hero log for token id and transaction hash: ${tokenId} - ${log.transactionHash}`,
      );

      await this.mutex.acquire();

      const rentDocuments: MarketRentDocument[] = await this.cacheService.get(
        CACHE_MARKET_RENT_DOCUMENTS,
      );

      const rentDocumentExists = _.some(
        rentDocuments,
        (document) => document.tokenId === tokenId.toString(),
      );

      if (rentDocumentExists) {
        const updatedDocuments = _.filter(
          rentDocuments,
          (document) => document.tokenId !== tokenId.toString(),
        );

        await this.cacheService.set(
          CACHE_MARKET_RENT_DOCUMENTS,
          updatedDocuments,
        );

        logger.log('Removed token id from market rents: ' + tokenId);

        const viewers = await this.marketRentController.getViewers();

        await Promise.all(
          viewers.map((viewer) =>
            this.marketRentController.onClientStateChanged(viewer),
          ),
        );
      }
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    } finally {
      await this.mutex.release();
    }
  }

  @Process(PROCESS_MARKET_BUYS)
  async processMarketBuys() {
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
        this.apiService.fetchLatestMarketBuys(fetchUntil, limit),
      ]);

      const newDocuments = this.mapMarketBuys(newListings);

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

  @Process(PROCESS_MARKET_RENTS)
  async processMarketRents() {
    await this.mutex.acquire();

    try {
      const limit = !!process.env.MARKET_BUY_FETCH_LIMIT
        ? Number(process.env.MARKET_BUY_FETCH_LIMIT)
        : undefined;

      let existingDocuments: MarketRentDocument[] = await this.cacheService.get(
        CACHE_MARKET_RENT_DOCUMENTS,
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

      const newDtos = await this.apiService.fetchLatestMarketRents(
        fetchUntil,
        limit,
      );

      const newDocuments = this.mapMarketRents(newDtos);

      const updatedDocuments = _.chain(existingDocuments)
        .unionBy(newDocuments, 'id')
        .value();

      logger.log(
        'Fetched new market documents, length: ' + newDocuments.length,
      );

      if (!updatedDocuments.length) {
        return;
      }

      await this.cacheService.set(
        CACHE_MARKET_RENT_DOCUMENTS,
        updatedDocuments,
      );

      const viewers = await this.marketRentController.getViewers();

      await Promise.all(
        viewers.map((viewer) =>
          this.marketRentController.onClientStateChanged(viewer),
        ),
      );
    } catch (error) {
      this.apmService.captureError(error);
      logger.error(error);
    } finally {
      await this.mutex.release();
    }
  }

  private mapMarketRents(dtos: MarketRentDto[]): MarketRentDocument[] {
    const now = moment().unix();

    return _.chain(dtos)
      .map((dto) => {
        const price = Number(
          ethers.utils.formatUnits(
            dto.rentOutInfo.price.value,
            dto.rentOutInfo.price.decimals,
          ),
        );

        const type = dto.heroTypeId;

        let skinId = dto.skinId;

        if (type > 0) {
          skinId = skinId - type * 100 + type * 1000;
        }

        const document: MarketRentDocument = {
          id: dto.id,
          updated: now,
          battleCap: dto.rentOutInfo.rentBattles,
          created: moment(dto.created).unix(),
          daysCap: dto.rentOutInfo.periodHours / 24,
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
          priceSymbol: dto.rentOutInfo.price.name,
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

  private mapMarketBuys(dtos: MarketBuyDto[]): MarketBuyDocument[] {
    const now = moment().unix();

    return _.chain(dtos)
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
          battlesUsed: dto.battleCapMax - dto.battleCap,
          battleColor,
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
