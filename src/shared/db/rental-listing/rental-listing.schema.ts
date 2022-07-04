import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RentalListingDocument = RentalListing & Document;

@Schema({ collection: 'rental_listings' })
export class RentalListing {
  @Prop()
  readonly id: string;
  @Prop()
  readonly updated: number;
  @Prop()
  readonly battleCap: number;
  @Prop()
  readonly daysCap: number;
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
  @Prop()
  readonly rentBattles: number;
}

export const RentalListingSchema = SchemaFactory.createForClass(RentalListing);
