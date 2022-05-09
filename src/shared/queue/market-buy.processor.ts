import { MarketBuyController } from '@/feature/market-buy/market-buy.controller';
import { MarketBuyDocument } from '@/feature/market-buy/ui/market-buy.document';
import {
  CACHE_MARKET_BUY_DOCUMENTS,
  CACHE_MARKET_BUY_LAST_FULL_UPDATE,
  MARKET_BUY_QUEUE,
  RunBuilder,
} from '@/util';
import { CacheService, logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import { ethers } from 'ethers';
import _ from 'lodash';
import moment from 'moment';
import { ApiService, MarketBuyDto } from '../api';

@Processor(MARKET_BUY_QUEUE)
export class MarketBuyProcessor {
  constructor(
    private apiService: ApiService,
    private cacheService: CacheService,
    private marketBuyController: MarketBuyController,
  ) {}

  private runBuilder(): RunBuilder {
    return new RunBuilder(this.cacheService);
  }

  @Process()
  async process() {
    await this.runBuilder()
      .skipIfBusy(CACHE_MARKET_BUY_DOCUMENTS)
      .logErrors()
      .run(async () => {
        const limit = !!process.env.MARKET_BUY_FETCH_LIMIT
          ? Number(process.env.MARKET_BUY_FETCH_LIMIT)
          : undefined;

        const lastFullUpdate =
          (await this.cacheService.get<number>(
            CACHE_MARKET_BUY_LAST_FULL_UPDATE,
          )) ?? 0;

        const doFullUpdate = moment().unix() - lastFullUpdate > 1800;

        let existingDocuments: MarketBuyDocument[];

        if (!doFullUpdate) {
          existingDocuments = await this.cacheService.get<MarketBuyDocument[]>(
            CACHE_MARKET_BUY_DOCUMENTS,
          );
        }

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

        const newListings = await this.apiService.fetchLatestMarketBuys(
          fetchUntil,
          limit,
        );

        const newDocuments = this.mapMarketBuys(newListings);

        const updatedDocuments = _.chain(existingDocuments)
          .unionBy(newDocuments, 'id')
          .value();

        logger.log(
          'Fetched new market buy documents, length: ' + newDocuments.length,
        );

        if (!updatedDocuments.length) {
          return;
        }

        if (doFullUpdate) {
          await this.cacheService.set(
            CACHE_MARKET_BUY_LAST_FULL_UPDATE,
            moment().unix(),
          );
        }

        await this.cacheService.set(
          CACHE_MARKET_BUY_DOCUMENTS,
          updatedDocuments,
        );

        const viewers = await this.marketBuyController.getViewers();

        await Promise.all(
          viewers.map((viewer) =>
            this.marketBuyController.processClientState(viewer),
          ),
        );
      });
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
