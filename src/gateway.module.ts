import {
  CacheService,
  EkConfigModule,
  EkConfigService,
  SocketService,
  WORKER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { BullModule } from '@nestjs/bull';
import { CacheModule, Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ProviderService } from './scheduler/provider.service';
import { SchedulerService } from './scheduler/scheduler.service';
import {
  MARKET_BUY_QUEUE,
  MARKET_RENT_QUEUE,
  MATCH_LOG_QUEUE,
  RENT_HERO_LOG_QUEUE,
} from './util';

export const MODULE_DEF = {
  imports: [
    EkConfigModule,
    BullModule.forRootAsync({ useClass: EkConfigService }),
    BullModule.registerQueue(
      { name: WORKER_QUEUE },
      { name: MARKET_BUY_QUEUE },
      { name: MARKET_RENT_QUEUE },
      { name: MATCH_LOG_QUEUE },
      { name: RENT_HERO_LOG_QUEUE },
    ),
    RedisModule.forRootAsync(EkConfigService.createRedisAsyncOptions()),
    CacheModule.registerAsync({ useClass: EkConfigService }),
  ],
  providers: [SchedulerService, SocketService, ProviderService, CacheService],
};

@Module(MODULE_DEF)
export class GatewayModule {}
