import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class BoxDocument extends DocumentDto {
  constructor(properties: BoxDocument) {
    super(properties);
  }
  readonly cost: number;
  readonly costFiat: number;
  readonly costImageUrl: string;
  readonly costSymbol: string;
  readonly fiatSymbol: string;
  readonly imageUrl: string;
  readonly maxDays: number;
  readonly maxProfitFiat: number;
  readonly maxProfitPerDayFiat: number;
  readonly minDays: number;
  readonly minProfitFiat: number;
  readonly minProfitPerDayFiat: number;
  readonly name: string;
  readonly rarity: number;
  readonly minRoi: number;
  readonly maxRoi: number;
}
