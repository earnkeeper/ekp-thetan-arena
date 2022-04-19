import { EkConfigService, SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoxModule } from './feature/box/box.module';
import { MarketBuyModule } from './feature/market-buy/market-buy.module';
import { MarketRentModule } from './feature/market-rent/market-rent.module';
import { QueueModule } from './shared/queue/queue.module';

export const MODULE_DEF = {
  imports: [
    MongooseModule.forRootAsync({ useClass: EkConfigService }),
    MarketBuyModule,
    MarketRentModule,
    BoxModule,
    QueueModule,
    SdkModule,
  ],
};

@Module(MODULE_DEF)
export class WorkerModule {}
