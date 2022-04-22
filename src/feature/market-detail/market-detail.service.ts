import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CacheService, CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import _ from 'lodash';
import moment from 'moment';
import { ApiService } from '../../shared/api/api.service';
import { RARITY_MAP } from '../../util';
import { MarketDetailDocument } from './ui/market-detail.document';

@Injectable()
export class MarketDetailService {
  constructor(
    private cacheService: CacheService,
    private coingeckoService: CoingeckoService,
    private apiService: ApiService,
  ) {}

  async getHero(
    currency: CurrencyDto,
    heroId: string,
  ): Promise<MarketDetailDocument> {
    const dto = await this.apiService.fetchHero(heroId);

    const prices = await this.coingeckoService.latestPricesOf(
      ['thetan-coin', 'thetan-arena'],
      currency.id,
    );

    const thcPrice = prices.find((it) => it.coinId === 'thetan-coin')?.price;

    let price = undefined;
    let priceFiat = undefined;

    if (!!dto.sale) {
      price = Number(
        ethers.utils.formatUnits(dto.sale.price.value, dto.sale.price.decimals),
      );
      priceFiat = price * thcPrice;
    }

    const now = moment().unix();

    const battleCap = dto.heroRanking.battleCapTHC;
    const battleCapMax = dto.heroRanking.totalBattleCapTHC;
    const battlesPerDay = dto.heroRanking.dailyTHCBattleCap;

    const totalDays = battleCap / battlesPerDay;

    const rewardPerWin = dto.thcBonus + 6;
    const rewardPerLoss = 1;

    const document: MarketDetailDocument = {
      id: dto.id,
      battleCap,
      battleCapMax,
      battlesPerDay,
      heroName: dto.heroInfo.name,
      price,
      priceFiat,
      rarity: dto.rarity,
      skinRarity: dto.skinRarity,
      skinName: dto.skinInfo.name,
      fiatSymbol: currency.symbol,
      skinId: dto.skinId,
      skinImageAvatar: `https://assets.thetanarena.com/${dto.skinInfo.imageAvatar.replace(
        '/avatar/',
        '/full/',
      )}`,
      updated: now,
      totalDays: Math.ceil(totalDays),
      rewardPerWin,
      profits: _.range(10, 110, 10).map((winRate) => {
        const revenue =
          (winRate / 100) * rewardPerWin +
          ((100 - winRate) / 100) * rewardPerLoss;

        const revenueFiat = thcPrice * revenue;

        const roi = (revenueFiat / priceFiat) * 100;

        return {
          id: winRate,
          updated: now,
          fiatSymbol: currency.symbol,
          revenue,
          revenueFiat,
          profit: revenue - price,
          profitFiat: revenueFiat - priceFiat,
          winRate,
          roi,
        };
      }),
      details: [
        { key: 'Hero Rarity', value: RARITY_MAP[dto.rarity] },
        { key: 'Skin Rarity', value: RARITY_MAP[dto.skinRarity] },
        { key: 'Total Battles', value: battleCapMax },
        { key: 'Used Battles', value: battleCapMax - battleCap },
        { key: 'Battles Remaining', value: battleCap },
        { key: 'Battles Per Day', value: battlesPerDay },
        { key: 'Total Days', value: totalDays },
        { key: 'Win Reward', value: rewardPerWin },
      ],
    };
    return document;
  }
}
