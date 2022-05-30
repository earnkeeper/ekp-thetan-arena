import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroListingRepository } from './hero-listing/hero-listing.repository';
import {
  HeroListing,
  HeroListingSchema,
} from './hero-listing/hero-listing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HeroListing.name, schema: HeroListingSchema },
    ]),
  ],
  providers: [HeroListingRepository],
  exports: [HeroListingRepository],
})
export class DbModule {}
