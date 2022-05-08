import {
  CacheService,
  EkConfigModule,
  EkConfigService,
  SCHEDULER_QUEUE,
  SocketService,
  WORKER_QUEUE,
} from '@earnkeeper/ekp-sdk-nestjs';
import { BullModule } from '@nestjs/bull';
import { CacheModule, Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ProviderService } from './scheduler/provider.service';
import { SchedulerService } from './scheduler/scheduler.service';

export const MODULE_DEF = {
  imports: [
    EkConfigModule,
    BullModule.forRootAsync({ useClass: EkConfigService }),
    BullModule.registerQueue({ name: WORKER_QUEUE }, { name: SCHEDULER_QUEUE }),
    RedisModule.forRootAsync(EkConfigService.createRedisAsyncOptions()),
    CacheModule.registerAsync({ useClass: EkConfigService }),
  ],
  providers: [SchedulerService, SocketService, ProviderService, CacheService],
};

@Module(MODULE_DEF)
export class GatewayModule {}
