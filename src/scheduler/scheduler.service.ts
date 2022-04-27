import { CacheService, SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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

    await this.cacheService.set(CACHE_MARKET_BUY_DOCUMENTS, marketBuys, {
      ttl: 1800,
    });
    await this.cacheService.set(CACHE_MARKET_RENT_DOCUMENTS, marketRents, {
      ttl: 1800,
    });

    this.addJob(PROCESS_MARKET_BUYS, {}, 5000, PROCESS_MARKET_BUYS);
    this.addJob(PROCESS_MARKET_RENTS, {}, 5000, PROCESS_MARKET_RENTS);
  }

  @Cron('0 * * * * *')
  everyMinute() {
    this.addJob(PROCESS_MARKET_BUYS, {}, 0, PROCESS_MARKET_BUYS);
    this.addJob(PROCESS_MARKET_RENTS, {}, 0, PROCESS_MARKET_RENTS);
  }

  async addJob<T>(jobName: string, data?: T, delay = 0, jobId?: string) {
    try {
      if (!!jobId) {
        await this.queue.add(jobName, data, {
          jobId,
          removeOnComplete: true,
          removeOnFail: true,
          delay,
        });
      } else {
        await this.queue.add(jobName, data, {
          removeOnComplete: true,
          removeOnFail: true,
          delay,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}
