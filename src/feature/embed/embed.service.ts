import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CacheService, CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { CACHE_MARKET_BUY_DOCUMENTS, calculateRevenue } from '@/util';
import { MarketBuyDocument } from '../market-buy/ui/market-buy.document';
import { EmbedDataDocument } from './ui/embed-data.document';

@Injectable()
export class EmbedService {
  constructor(
    private cacheService: CacheService,
    private coingeckoService: CoingeckoService,
  ) {}

  async getEmbedDocuments(currency: CurrencyDto): Promise<EmbedDataDocument[]> {
    const documents: MarketBuyDocument[] = await this.cacheService.get(
      CACHE_MARKET_BUY_DOCUMENTS,
    );

    const prices = await this.coingeckoService.latestPricesOf(
      ['thetan-coin'],
      currency.id,
    );

    const expectedWinRate = 50;

    const bestRoi: MarketBuyDocument = _.chain(documents)
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
          ...document,
          apr: (365 / totalDays) * roi * 100,
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
      .sortBy('profitFiat')
      .last()
      .value();

    return [bestRoi];
  }
}
