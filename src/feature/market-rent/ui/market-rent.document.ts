import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class MarketRentDocument extends DocumentDto {
  constructor(properties: MarketRentDocument) {
    super(properties);
  }

  readonly apr?: number;
  readonly battleCap: number;
  readonly daysCap: number;
  readonly created: number;
  readonly dmg: number;
  readonly fiatSymbol?: string;
  readonly hp: number;
  readonly lastModified: number;
  readonly level: number;
  readonly minWinRate?: number;
  readonly name: string;
  readonly ownerAddress: string;
  readonly ownerId: string;
  readonly price: number;
  readonly priceFiat?: number;
  readonly priceFiatPerBattle?: number;
  readonly pricePerBattle: number;
  readonly priceSymbol: string;
  readonly profit?: number;
  readonly profitFiat?: number;
  readonly profitPerDay?: number;
  readonly profitPerDayFiat?: number;
  readonly rarity: number;
  readonly refId: string;
  readonly revenue?: number;
  readonly roi?: number;
  readonly role: number;
  readonly skinId: number;
  readonly skinName: string;
  readonly statusId: number;
  readonly tokenId: string;
  readonly totalDays?: number;
  readonly trophyClass: number;
  readonly type: number;
}
