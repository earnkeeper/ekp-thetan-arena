import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeroListing } from './hero-listing.schema';

@Injectable()
export class HeroListingRepository {
  constructor(
    @InjectModel(HeroListing.name)
    public heroListingModel: Model<HeroListing>,
  ) {}

  async findAll(): Promise<HeroListing[]> {
    const results = await this.heroListingModel.find().exec();

    if (!results) {
      return [];
    }

    return results;
  }
}
