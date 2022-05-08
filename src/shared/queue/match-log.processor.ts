import { CacheService, logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ethers } from 'ethers';
import _ from 'lodash';
import { MarketBuyController } from '@/feature/market-buy/market-buy.controller';
import { MarketBuyDocument } from '@/feature/market-buy/ui/market-buy.document';
import {
  CACHE_MARKET_BUY_DOCUMENTS,
  MATCH_LOG_QUEUE,
  RunBuilder,
} from '@/util';

@Processor(MATCH_LOG_QUEUE)
export class MatchLogProcessor {
  constructor(
    private cacheService: CacheService,
    private marketBuyController: MarketBuyController,
  ) {}

  private runBuilder(): RunBuilder {
    return new RunBuilder(this.cacheService);
  }

  @Process()
  async process(job: Job<ethers.providers.Log>) {
    await this.runBuilder()
      .skipIfBusy(CACHE_MARKET_BUY_DOCUMENTS)
      .logErrors()
      .run(async () => {
        const log = job.data;

        const tokenId = ethers.BigNumber.from(log.topics[1]).toNumber();

        logger.debug(
          `Received market match log for token id and transaction hash: ${tokenId} - ${log.transactionHash}`,
        );

        const buyDocuments: MarketBuyDocument[] = await this.cacheService.get(
          CACHE_MARKET_BUY_DOCUMENTS,
        );

        const buyDocumentExists = _.some(
          buyDocuments,
          (document) => document.tokenId === tokenId.toString(),
        );

        if (buyDocumentExists) {
          const updatedDocuments = _.filter(
            buyDocuments,
            (document) => document.tokenId !== tokenId.toString(),
          );

          await this.cacheService.set(
            CACHE_MARKET_BUY_DOCUMENTS,
            updatedDocuments,
          );

          logger.log('Removed token id from market buys: ' + tokenId);

          const viewers = await this.marketBuyController.getViewers();

          await Promise.all(
            viewers.map((viewer) =>
              this.marketBuyController.processClientState(viewer),
            ),
          );
        }
      });
  }
}
