import { SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { BoxModule } from './feature/box/box.module';
import { EmbedModule } from './feature/embed/embed.module';
import { MarketBuyModule } from './feature/market-buy/market-buy.module';
import { MarketDetailModule } from './feature/market-detail/market-detail.module';
import { MarketRentModule } from './feature/market-rent/market-rent.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from '@earnkeeper/ekp-sdk';

export const MODULE_DEF = {
  imports: [
    MongooseModule.forRoot(
      config('MONGO_URI', {
        default: 'mongodb://localhost:27017/thetan_arena',
      }),
    ),
    MarketBuyModule,
    MarketRentModule,
    MarketDetailModule,
    BoxModule,
    SdkModule,
    EmbedModule,
  ],
};

@Module(MODULE_DEF)
export class WorkerModule {}
