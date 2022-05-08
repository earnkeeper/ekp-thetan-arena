import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { ethers } from 'ethers';
import {
  MATCH_LOG_QUEUE,
  RENT_HERO_LOG_QUEUE,
  THETAN_MARKET_ADDRESS,
  THETAN_MATCH_TOPIC,
  THETAN_RENT_HERO_ADDRESS,
  THETAN_RENT_HERO_TOPIC,
} from '../util';

@Injectable()
export class ProviderService {
  constructor(
    @InjectQueue(MATCH_LOG_QUEUE) private matchLogQueue: Queue,
    @InjectQueue(RENT_HERO_LOG_QUEUE) private rentHeroLogQueue: Queue,
  ) {}

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
        this.matchLogQueue.add(log, {
          delay: 0,
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
        this.rentHeroLogQueue.add(log, {
          removeOnComplete: true,
          removeOnFail: true,
        });
      },
    );
  }
}
