import { CacheService } from '@earnkeeper/ekp-sdk-nestjs';
import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import {
  CACHE_MARKET_BUY_DOCUMENTS,
  CACHE_MARKET_RENT_DOCUMENTS,
} from '../util/constants';

@Injectable()
export class SchedulerService {
  constructor(
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
  }
}
