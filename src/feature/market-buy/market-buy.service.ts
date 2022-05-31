import moment from 'moment';
import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CacheService, CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { CACHE_MARKET_BUY_DOCUMENTS } from '@/util/constants';
import { DEFAULT_WIN_RATE_FORM, WinRateForm } from '@/util/forms';
import { calculateRevenue } from '@/util/revenue';
import { MarketBuyDocument } from './ui/market-buy.document';
import { HeroListingRepository } from '@/shared/db';

@Injectable()
export class MarketBuyService {
  constructor(
    private heroListingRepository: HeroListingRepository,
    private coingeckoService: CoingeckoService,
  ) {}

  async getListingDocuments(
    currency: CurrencyDto,
    form: WinRateForm,
  ): Promise<MarketBuyDocument[]> {
    const now = moment().unix();

    console.time('get from cache');

    const documents = await this.heroListingRepository.findAll();

    console.timeEnd('get from cache');

    if (!documents?.length) {
      return [];
    }

    console.time('get thetan price');
    const prices = await this.coingeckoService.latestPricesOf(
      ['thetan-coin'],
      currency.id,
    );
    console.timeEnd('get thetan price');

    const expectedWinRate = Number(
      (form?.winRate ?? DEFAULT_WIN_RATE_FORM.winRate).replace(' %', ''),
    );
    const profitableOnly =
      form?.profitableOnly ?? DEFAULT_WIN_RATE_FORM.profitableOnly;

    console.time(`map ${documents.length} documents`);

    const updatedDocuments: MarketBuyDocument[] = _.chain(documents)
      .filter((document) => document.battleCap > 0)
      .map((document) => {
        const coinPrice = prices.find((it) => it.coinId === 'thetan-coin');

        const revenue = calculateRevenue(
          document.rarity,
          document.level,
          document.battleCap,
          expectedWinRate,
        );

        let battlesPerDay = 0;

        switch (document.rarity) {
          case 0:
            battlesPerDay = 8;
            break;
          case 1:
            battlesPerDay = 10;
            break;
          case 2:
            battlesPerDay = 12;
            break;
        }

        const c_thc = document.price; // cost (the nft price)

        // Profit at the user entered win rate
        const profit = revenue - c_thc;

        const totalDays = document.battleCap / battlesPerDay;

        const profitPerDay = profit / totalDays;

        const roi = profit <= 0 ? 0 : profit / document.price + 1;

        const updatedDocument: MarketBuyDocument = {
          id: document.id,
          battleCap: document.battleCap,
          battleCapMax: document.battleCapMax,
          battlesUsed: document.battlesUsed,
          battleColor: document.battleColor,
          created: document.created,
          dmg: document.dmg,
          hp: document.hp,
          lastModified: document.lastModified,
          level: document.level,
          name: document.name,
          ownerAddress: document.ownerAddress,
          ownerId: document.ownerId,
          price: document.price,
          pricePerBattle: document.pricePerBattle,
          priceSymbol: document.priceSymbol,
          rarity: document.rarity,
          refId: document.refId,
          role: document.role,
          skinId: document.skinId,
          skinName: document.skinName,
          statusId: document.statusId,
          tokenId: document.tokenId,
          trophyClass: document.trophyClass,
          type: document.type,
          apr: (365 / totalDays) * roi * 100,
          updated: now,
          fiatSymbol: currency.symbol,
          priceFiat: coinPrice.price * document.price,
          priceFiatPerBattle: coinPrice.price * document.pricePerBattle,
          profit,
          profitFiat: profit * coinPrice.price,
          profitPerDay,
          profitPerDayFiat: profitPerDay * coinPrice.price,
          revenue,
          roi: roi * 100,
          totalDays: Math.ceil(totalDays),
        };

        return updatedDocument;
      })
      .filter((document) => profitableOnly !== 'Yes' || document.profit > 0)
      .value();
    console.timeEnd(`map ${documents.length} documents`);
    return updatedDocuments;
  }
}
