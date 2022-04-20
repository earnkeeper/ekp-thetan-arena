import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class MarketDetailDocument extends DocumentDto {
  constructor(properties: MarketDetailDocument) {
    super(properties);
  }

  readonly battleCap: number;
  readonly battleCapMax: number;
  readonly battlesPerDay: number;
  readonly heroName: string;
  readonly price: number;
  readonly priceFiat: number;
  readonly rarity: number;
  readonly rewardPerWin: number;
  readonly skinId: number;
  readonly fiatSymbol: string;
  readonly skinName: string;
  readonly skinRarity: number;
  readonly skinImageAvatar: string;
  readonly totalDays: number;
  readonly profits: Readonly<{
    id: number;
    updated: number;
    winRate: number;
    revenue: number;
    revenueFiat: number;
    fiatSymbol: string;
    profit: number;
    profitFiat: number;
    roi: number;
  }>[];
  readonly details: { key: string; value: string }[];
}
