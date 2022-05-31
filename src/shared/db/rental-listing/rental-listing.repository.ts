import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RentalListing } from './rental-listing.schema';

@Injectable()
export class RentalListingRepository {
  constructor(
    @InjectModel(RentalListing.name)
    public rentalListingModel: Model<RentalListing>,
  ) {}

  async findAll(): Promise<RentalListing[]> {
    const results = await this.rentalListingModel.find().exec();

    if (!results) {
      return [];
    }

    return results;
  }
}
