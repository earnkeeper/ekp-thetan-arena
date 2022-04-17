import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CacheService, CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { CACHE_MARKET_BUY_DOCUMENTS } from '../../util/constants';
import { MarketBuyDocument } from './ui/market-buy.document';

@Injectable()
export class MarketBuyService {
  constructor(
    private cacheService: CacheService,
    private coingeckoService: CoingeckoService,
  ) {}

  async getListingDocuments(
    currency: CurrencyDto,
  ): Promise<MarketBuyDocument[]> {
    const documents = await this.cacheService.get<MarketBuyDocument[]>(
      CACHE_MARKET_BUY_DOCUMENTS,
    );

    if (!documents?.length) {
      return [];
    }

    const prices = await this.coingeckoService.latestPricesOf(
      ['thetan-coin'],
      currency.id,
    );

    const updatedDocuments: MarketBuyDocument[] = _.chain(documents)
      .map((document) => {
        const coinPrice = prices.find((it) => it.coinId === 'thetan-coin');

        return {
          ...document,
          fiatSymbol: currency.symbol,
          priceFiat: coinPrice.price * document.price,
        };
      })
      .value();

    return updatedDocuments;
  }
}
