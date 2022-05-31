import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HeroListingRepository } from './hero-listing/hero-listing.repository';
import {
  HeroListing,
  HeroListingSchema,
} from './hero-listing/hero-listing.schema';
import {
  RentalListing,
  RentalListingRepository,
  RentalListingSchema,
} from './rental-listing';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HeroListing.name, schema: HeroListingSchema },
      { name: RentalListing.name, schema: RentalListingSchema },
    ]),
  ],
  providers: [HeroListingRepository, RentalListingRepository],
  exports: [HeroListingRepository, RentalListingRepository],
})
export class DbModule {}
