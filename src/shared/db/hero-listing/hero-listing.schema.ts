import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeroListingDocument = HeroListing & Document;

@Schema({ collection: 'hero_listings' })
export class HeroListing {
  @Prop()
  readonly id: string;
  @Prop()
  readonly updated: number;
  @Prop()
  readonly battleCap: number;
  @Prop()
  readonly battleCapMax: number;
  @Prop()
  readonly battlesUsed: number;
  @Prop()
  readonly battleColor: string;
  @Prop()
  readonly created: number;
  @Prop()
  readonly dmg: number;
  @Prop()
  readonly hp: number;
  @Prop()
  readonly lastModified: number;
  @Prop()
  readonly level: number;
  @Prop()
  readonly name: string;
  @Prop()
  readonly ownerAddress: string;
  @Prop()
  readonly ownerId: string;
  @Prop()
  readonly price: number;
  @Prop()
  readonly pricePerBattle: number;
  @Prop()
  readonly priceSymbol: string;
  @Prop()
  readonly rarity: number;
  @Prop()
  readonly refId: string;
  @Prop()
  readonly role: number;
  @Prop()
  readonly skinId: number;
  @Prop()
  readonly skinName: string;
  @Prop()
  readonly statusId: number;
  @Prop()
  readonly tokenId: string;
  @Prop()
  readonly trophyClass: number;
  @Prop()
  readonly type: number;
}

export const HeroListingSchema = SchemaFactory.createForClass(HeroListing);
