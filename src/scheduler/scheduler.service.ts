import { CacheService, SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { RedisService } from 'nestjs-redis';
import { PROCESS_MARKET_BUYS, PROCESS_MARKET_RENTS } from '../util';
import {
  CACHE_MARKET_BUY_DOCUMENTS,
  CACHE_MARKET_RENT_DOCUMENTS,
} from '../util/constants';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectQueue(SCHEDULER_QUEUE) private queue: Queue,
    private redisService: RedisService,
    private cacheService: CacheService,
  ) {}

  async onModuleInit() {
    const marketBuys = await this.cacheService.get(CACHE_MARKET_BUY_DOCUMENTS);
    const marketRents = await this.cacheService.get(
      CACHE_MARKET_RENT_DOCUMENTS,
    );

    const client = this.redisService.getClient('DEFAULT_CLIENT');
    await client.flushall();
    await client.flushdb();

    await this.cacheService.set(CACHE_MARKET_BUY_DOCUMENTS, marketBuys);
    await this.cacheService.set(CACHE_MARKET_RENT_DOCUMENTS, marketRents);

    this.queue.add(
      PROCESS_MARKET_BUYS,
      {},
      {
        delay: 0,
        repeat: { every: 60 * 1000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    this.queue.add(
      PROCESS_MARKET_RENTS,
      {},
      {
        delay: 0,
        repeat: { every: 60 * 1000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
