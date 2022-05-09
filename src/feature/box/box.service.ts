import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { DEFAULT_WIN_RATE_FORM, WinRateForm } from '@/util/forms';
import { calculateRevenue } from '@/util/revenue';
import { BoxDocument } from './ui/box.document';

@Injectable()
export class BoxService {
  constructor(private coingeckoService: CoingeckoService) {}

  async getBoxDocuments(
    currency: CurrencyDto,
    form: WinRateForm,
  ): Promise<BoxDocument[]> {
    const prices = await this.coingeckoService.latestPricesOf(
      ['thetan-coin', 'thetan-arena'],
      currency.id,
    );

    const expectedWinRate = Number(
      (form?.winRate ?? DEFAULT_WIN_RATE_FORM.winRate).replace(' %', ''),
    );

    const thcPrice = prices.find((it) => it.coinId === 'thetan-coin').price;
    const thgPrice = prices.find((it) => it.coinId === 'thetan-arena').price;

    const boxes = [
      {
        name: 'Common',
        rarity: 0,
        cost: 1000,
        coinId: 'thetan-coin',
        coinSymbol: 'THC',
        coinPrice: thcPrice,
        battlesPerDay: 8,
        drops: [
          { rate: 0.85, minBattles: 215, maxBattles: 227 },
          { rate: 0.1, minBattles: 228, maxBattles: 240 },
          { rate: 0.05, minBattles: 241, maxBattles: 253 },
        ],
        imageUrl: 'https://assets.thetanarena.com/thetanbox/box_1.png',
      },
      {
        name: 'Epic',
        rarity: 1,
        cost: 2200,
        coinId: 'thetan-coin',
        coinSymbol: 'THC',
        coinPrice: thcPrice,
        battlesPerDay: 10,
        drops: [
          { rate: 0.8, minBattles: 348, maxBattles: 373 },
          { rate: 0.15, minBattles: 376, maxBattles: 402 },
          { rate: 0.05, minBattles: 405, maxBattles: 433 },
        ],
        imageUrl: 'https://assets.thetanarena.com/thetanbox/box_2.png',
      },
      {
        name: 'Legendary',
        rarity: 2,
        cost: _.max([(10500 * thcPrice) / thgPrice, 126]),
        coinId: 'thetan-arena',
        coinSymbol: 'THG',
        coinPrice: thgPrice,
        battlesPerDay: 12,
        drops: [
          { rate: 0.7, minBattles: 753, maxBattles: 829 },
          { rate: 0.25, minBattles: 839, maxBattles: 923 },
          { rate: 0.05, minBattles: 933, maxBattles: 1026 },
        ],
        imageUrl: 'https://assets.thetanarena.com/thetanbox/box_3.png',
      },
    ];

    const now = moment().unix();

    const documents: BoxDocument[] = _.chain(boxes)
      .map((box) => {
        const minRevenue = calculateRevenue(
          box.rarity,
          1,
          box.drops[0].minBattles,
          expectedWinRate,
        );

        const maxRevenue = calculateRevenue(
          box.rarity,
          1,
          box.drops[2].maxBattles,
          expectedWinRate,
        );

        const minDays = box.drops[0].minBattles / box.battlesPerDay;
        const maxDays = box.drops[2].maxBattles / box.battlesPerDay;

        const costFiat = box.cost * box.coinPrice;

        const minRevenueFiat = minRevenue * thcPrice;
        const maxRevenueFiat = maxRevenue * thcPrice;

        const minProfitFiat = minRevenueFiat - costFiat;
        const maxProfitFiat = maxRevenueFiat - costFiat;

        const document: BoxDocument = {
          id: box.name,
          updated: now,
          cost: box.cost,
          costFiat,
          costImageUrl: box.coinId === 'thetan-coin' ? 'thc.png' : 'thg.png',
          costSymbol: box.coinSymbol,
          fiatSymbol: currency.symbol,
          imageUrl: box.imageUrl,
          maxDays: Math.ceil(maxDays),
          maxProfitFiat,
          maxProfitPerDayFiat: maxProfitFiat / maxDays,
          minDays: Math.ceil(minDays),
          minProfitFiat,
          minProfitPerDayFiat: minProfitFiat / minDays,
          name: box.name,
          rarity: box.rarity,
          minRoi: ((minProfitFiat + costFiat) * 100) / costFiat,
          maxRoi: ((maxProfitFiat + costFiat) * 100) / costFiat,
        };

        return document;
      })
      .value();

    return documents;
  }
}
