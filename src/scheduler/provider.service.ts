import { SCHEDULER_QUEUE } from '@earnkeeper/ekp-sdk-nestjs';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { ethers } from 'ethers';
import {
  PROCESS_MATCH_LOG,
  PROCESS_RENT_HERO_LOG,
  THETAN_MARKET_ADDRESS,
  THETAN_MATCH_TOPIC,
  THETAN_RENT_HERO_ADDRESS,
  THETAN_RENT_HERO_TOPIC,
} from '../util';

@Injectable()
export class ProviderService {
  constructor(@InjectQueue(SCHEDULER_QUEUE) private queue: Queue) {}

  async onModuleInit() {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.BSC_JSON_RPC_PROVIDER,
    );

    provider.on(
      {
        address: THETAN_MARKET_ADDRESS,
        topics: [THETAN_MATCH_TOPIC],
      },
      (log: ethers.providers.Log) => {
        this.queue.add(PROCESS_MATCH_LOG, log, {
          removeOnComplete: true,
          removeOnFail: true,
        });
      },
    );

    provider.on(
      {
        address: THETAN_RENT_HERO_ADDRESS,
        topics: [THETAN_RENT_HERO_TOPIC],
      },
      (log: ethers.providers.Log) => {
        this.queue.add(PROCESS_RENT_HERO_LOG, log, {
          removeOnComplete: true,
          removeOnFail: true,
        });
      },
    );
  }
}
