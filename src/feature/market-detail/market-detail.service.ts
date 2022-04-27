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

    const now = moment().unix();

    const battleCap = dto.heroRanking.battleCapTHC;
    const battleCapMax = dto.heroRanking.totalBattleCapTHC;
    const battlesRemaining = battleCapMax - battleCap;

    const battlesPerDay = dto.dailyTHCBattleConfig;
    let price = undefined;
    let priceFiat = undefined;
    let rental = false;
    let battlesForRent = undefined;
    let rentalPeriodDays = undefined;
    let daysToFinishBattles = battlesRemaining / battlesPerDay;

    if (!!dto.rentInfo) {
      rental = true;
      battlesForRent = dto.rentInfo.rentBattles;
      rentalPeriodDays = dto.rentInfo.periodHours / 24;
      daysToFinishBattles = battlesForRent / battlesPerDay;
      if (!!dto.rentInfo?.cost?.value) {
        price = Number(
          ethers.utils.formatUnits(
            dto.rentInfo.cost.value,
            dto.rentInfo.cost.decimals,
          ),
        );
        priceFiat = price * thcPrice;
      }
    //filter out rented heroes
    if(dto.rentInfo.expiredTime>0){
        price =0;
      }
      
    } else {
      if (!!dto.sale?.price?.value) {
        price = Number(
          ethers.utils.formatUnits(
            dto.sale.price.value,
            dto.sale.price.decimals,
          ),
        );
        priceFiat = price * thcPrice;
      }
    }

    const rewardPerWin = dto.thcBonus + 6;
    const rewardPerLoss = 1;

    let details = [
      {
        key: 'Hero Battles Remaining',
        value: `${battlesRemaining} / ${battleCapMax}`,
      },

      { key: 'Win Reward', value: `${rewardPerWin} THC` },
      { key: 'Hero Rarity', value: RARITY_MAP[dto.rarity] },
      { key: 'Skin Rarity', value: RARITY_MAP[dto.skinRarity] },
    ];

    if (battlesPerDay > 0) {
      details = [
        { key: 'Max Battles Per Day', value: `${battlesPerDay} /day` },
        {
          key: 'Min Time to Complete Battles',
          value: `${Math.ceil(daysToFinishBattles)} days`,
        },
        ...details,
      ];
    } else {
      details = [
        { key: 'Max Battles Per Day', value: `No Battles Left` },
        {
          key: 'Min Time to Complete Battles',
          value: `No Battles Left`,
        },
        ...details,
      ];
    }

    if (rental) {
      details = [
        { key: 'Battles for Rent', value: `${battlesForRent} battles` },
        { key: 'Rental Period', value: `${Math.ceil(rentalPeriodDays)} days` },
        ...details,
      ];
    }

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
      rental,
      skinId: dto.skinId,
      skinImageAvatar: `https://assets.thetanarena.com/${dto.skinInfo.imageAvatar.replace(
        '/avatar/',
        '/full/',
      )}`,
      updated: now,
      totalDays: Math.ceil(daysToFinishBattles),
      rewardPerWin,
      profits: _.range(10, 110, 10).map((winRate) => {
        let revenue =
          (winRate / 100) * rewardPerWin +
          ((100 - winRate) / 100) * rewardPerLoss;
          
        if (rental) {
          revenue *= battlesForRent;
        } else {
          revenue *= battlesRemaining;
        }

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
      details,
    };
    return document;
  }
}
