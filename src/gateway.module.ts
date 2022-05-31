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

export const MODULE_DEF = {
  imports: [
    EkConfigModule,
    BullModule.forRootAsync({ useClass: EkConfigService }),
    BullModule.registerQueue({ name: WORKER_QUEUE }),
    RedisModule.forRootAsync(EkConfigService.createRedisAsyncOptions()),
    CacheModule.registerAsync({ useClass: EkConfigService }),
  ],
  providers: [SocketService, CacheService],
};

@Module(MODULE_DEF)
export class GatewayModule {}
