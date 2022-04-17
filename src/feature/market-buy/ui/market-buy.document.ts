import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class MarketBuyDocument extends DocumentDto {
  constructor(properties: MarketBuyDocument) {
    super(properties);
  }
  readonly battleCap: number;
  readonly battleCapMax: number;
  readonly battlesRemaining: number;
  readonly battleColor: string;
  readonly created: number;
  readonly dmg: number;
  readonly fiatSymbol?: string;
  readonly hp: number;
  readonly lastModified: number;
  readonly level: number;
  readonly name: string;
  readonly ownerAddress: string;
  readonly ownerId: string;
  readonly price: number;
  readonly priceFiat?: number;
  readonly priceSymbol: string;
  readonly rarity: number;
  readonly refId: string;
  readonly role: number;
  readonly skinId: number;
  readonly skinName: string;
  readonly statusId: number;
  readonly tokenId: string;
  readonly trophyClass: number;
  readonly type: number;
}
