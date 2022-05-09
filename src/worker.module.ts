import { SdkModule } from '@earnkeeper/ekp-sdk-nestjs';
import { Module } from '@nestjs/common';
import { BoxModule } from './feature/box/box.module';
import { EmbedModule } from './feature/embed/embed.module';
import { MarketBuyModule } from './feature/market-buy/market-buy.module';
import { MarketDetailModule } from './feature/market-detail/market-detail.module';
import { MarketRentModule } from './feature/market-rent/market-rent.module';
import { QueueModule } from './shared/queue/queue.module';

export const MODULE_DEF = {
  imports: [
    MarketBuyModule,
    MarketRentModule,
    MarketDetailModule,
    BoxModule,
    QueueModule,
    SdkModule,
    EmbedModule,
  ],
};

@Module(MODULE_DEF)
export class WorkerModule {}
