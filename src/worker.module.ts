import { EkConfigService, SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketBuyModule } from './feature/market-buy/market-buy.module';
import { QueueModule } from './shared/queue/queue.module';

export const MODULE_DEF = {
  imports: [
    MongooseModule.forRootAsync({ useClass: EkConfigService }),
    MarketBuyModule,
    QueueModule,
    SdkModule,
  ],
};

@Module(MODULE_DEF)
export class WorkerModule {}
