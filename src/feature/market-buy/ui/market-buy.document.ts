import { DocumentDto } from '@earnkeeper/ekp-sdk';

export class MarketBuyDocument extends DocumentDto {
  constructor(properties: MarketBuyDocument) {
    super(properties);
  }
  readonly battleCap: number;
  readonly battleCapMax: number;
  readonly battlesRemaining: number;
  readonly created: number;
  readonly dmg: number;
  readonly fiatSymbol?: string;
  readonly heroName: string;
  readonly heroRarityId: number;
  readonly heroRoleId: number;
  readonly heroTypeId: number;
  readonly hp: number;
  readonly lastModified: number;
  readonly level: number;
  readonly ownerAddress: string;
  readonly ownerId: string;
  readonly price: number;
  readonly priceFiat?: number;
  readonly priceSymbol: string;
  readonly refId: string;
  readonly skinId: number;
  readonly skinName: string;
  readonly statusId: number;
  readonly tokenId: string;
  readonly trophyClassId: number;
}
