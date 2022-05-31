import { DEFAULT_WIN_RATE_FORM, WinRateForm } from '@/util/forms';
import { CurrencyDto } from '@earnkeeper/ekp-sdk';
import { CoingeckoService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { RentalListingRepository } from '../../shared/db/rental-listing/rental-listing.repository';
import { MarketRentDocument } from './ui/market-rent.document';

@Injectable()
export class MarketRentService {
  constructor(
    private rentalListingRepository: RentalListingRepository,
    private coingeckoService: CoingeckoService,
  ) {}

  async getRentDocuments(
    currency: CurrencyDto,
    form: WinRateForm,
  ): Promise<MarketRentDocument[]> {
    const documents = await this.rentalListingRepository.findAll();

    const now = moment().unix();

    if (!documents?.length) {
      return [];
    }

    const prices = await this.coingeckoService.latestPricesOf(
      ['thetan-coin'],
      currency.id,
    );

    const expectedWinRate = Number(
      (form?.winRate ?? DEFAULT_WIN_RATE_FORM.winRate).replace(' %', ''),
    );
    const profitableOnly =
      form?.profitableOnly ?? DEFAULT_WIN_RATE_FORM.profitableOnly;

    const updatedDocuments: MarketRentDocument[] = _.chain(documents)
      .filter((document) => document.battleCap > 0)
      .map((document) => {
        const coinPrice = prices.find((it) => it.coinId === 'thetan-coin');

        const winReward = 6;

        const lossReward = 1;

        let winBonus = 0;

        switch (document.rarity) {
          case 0:
            switch (document.level) {
              case 11:
              case 10:
              case 9:
                winBonus = 4.032;
                break;
              case 8:
              case 7:
                winBonus = 3.739;
                break;
              case 6:
              case 5:
                winBonus = 3.511;
                break;
              case 4:
              case 3:
                winBonus = 3.348;
                break;
              default:
                winBonus = 3.25;
                break;
            }
            break;
          case 1:
            switch (document.level) {
              case 11:
              case 10:
              case 9:
                winBonus = 8.06;
                break;
              case 8:
              case 7:
                winBonus = 7.475;
                break;
              case 6:
              case 5:
                winBonus = 7.02;
                break;
              case 4:
              case 3:
                winBonus = 6.695;
                break;
              default:
                winBonus = 6.5;
                break;
            }
            break;
          case 2:
            switch (document.level) {
              case 11:
                winBonus = 31.795;
                break;
              case 10:
              case 9:
                winBonus = 29.204;
                break;
              case 8:
              case 7:
                winBonus = 27.084;
                break;
              case 6:
              case 5:
                winBonus = 25.435;
                break;
              case 4:
              case 3:
                winBonus = 24.257;
                break;
              default:
                winBonus = 23.55;
                break;
            }
            break;
        }

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

        // Use shorter non standard variables here to make the maths easier to read
        const w_pc = expectedWinRate / 100; // percent of matches won
        const w_thc = winReward + winBonus; // thc earned for a win
        const l_thc = lossReward; // thc earned for a loss
        const b = document.battleCap; // battles available
        const c_thc = document.price; // cost (the nft price)

        // Revenue at the user entered win rate
        const revenue = (w_pc * w_thc + (1 - w_pc) * l_thc) * b;

        // Profit at the user entered win rate
        const profit = revenue - c_thc;

        // Battles needed to pay back the nft (might be more than available battles)
        const battlesToRoi = c_thc / (w_pc * w_thc + (1 - w_pc) * l_thc);

        // Days of play to pay back the nft (set this to undefined if the nft does not have enough battles)
        let breakEvenDays = undefined;
        if (document.battleCap >= battlesToRoi) {
          breakEvenDays = battlesToRoi / battlesPerDay;
        }

        // Ignoring user entered win rate, which win rate would pay back the nft (could be more than 100% if the nft is not profitable)
        // Needed to do some arithmatic to get this formula, can discuss in discord if interested
        const breakEvenWinRate = (c_thc / b - l_thc) / (w_thc - l_thc);

        const totalDays = document.battleCap / battlesPerDay;

        const profitPerDay = profit / totalDays;

        const roi = profit <= 0 ? 0 : profit / document.price + 1;

        const updatedDocument: MarketRentDocument = {
          id: document.id,
          battleCap: document.battleCap,
          daysCap: document.daysCap,
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
          updated: now,
          apr: (365 / totalDays) * roi * 100,
          fiatSymbol: currency.symbol,
          minWinRate: Math.ceil(breakEvenWinRate * 100),
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

    return updatedDocuments;
  }
}
