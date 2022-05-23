import { CacheService } from '@earnkeeper/ekp-sdk-nestjs';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { RedisService } from 'nestjs-redis';
import {
  CACHE_MARKET_BUY_DOCUMENTS,
  CACHE_MARKET_RENT_DOCUMENTS,
  MARKET_BUY_QUEUE,
  MARKET_RENT_QUEUE,
} from '../util/constants';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectQueue(MARKET_BUY_QUEUE) private marketBuyQueue: Queue,
    @InjectQueue(MARKET_RENT_QUEUE) private marketRentQueue: Queue,
    private redisService: RedisService,
    private cacheService: CacheService,
  ) {}

  async onModuleInit() {
    return
    const marketBuys = await this.cacheService.get(CACHE_MARKET_BUY_DOCUMENTS);
    const marketRents = await this.cacheService.get(
      CACHE_MARKET_RENT_DOCUMENTS,
    );

    const client = this.redisService.getClient('DEFAULT_CLIENT');
    await client.flushall();
    await client.flushdb();

    await this.cacheService.set(CACHE_MARKET_BUY_DOCUMENTS, marketBuys);
    await this.cacheService.set(CACHE_MARKET_RENT_DOCUMENTS, marketRents);

    this.marketBuyQueue.add(
      {},
      {
        delay: 0,
        repeat: { every: 10 * 60 * 1000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    this.marketRentQueue.add(
      {},
      {
        delay: 0,
        repeat: { every: 10 * 60 * 1000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
