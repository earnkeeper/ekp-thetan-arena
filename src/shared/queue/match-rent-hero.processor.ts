import { CacheService, logger } from '@earnkeeper/ekp-sdk-nestjs';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ethers } from 'ethers';
import _ from 'lodash';
import { MarketRentController } from '@/feature/market-rent/market-rent.controller';
import { MarketRentDocument } from '@/feature/market-rent/ui/market-rent.document';
import {
  CACHE_MARKET_RENT_DOCUMENTS,
  RENT_HERO_LOG_QUEUE,
  RunBuilder,
} from '@/util';

@Processor(RENT_HERO_LOG_QUEUE)
export class MatchRentHeroProcessor {
  constructor(
    private cacheService: CacheService,
    private marketRentController: MarketRentController,
  ) {}

  private runBuilder(): RunBuilder {
    return new RunBuilder(this.cacheService);
  }

  @Process()
  async process(job: Job<ethers.providers.Log>) {
    await this.runBuilder()
      .skipIfBusy(CACHE_MARKET_RENT_DOCUMENTS)
      .logErrors()
      .run(async () => {
        const log = job.data;

        const tokenId = ethers.BigNumber.from(log.topics[3]).toNumber();

        logger.debug(
          `Received rent hero log for token id and transaction hash: ${tokenId} - ${log.transactionHash}`,
        );

        const rentDocuments: MarketRentDocument[] = await this.cacheService.get(
          CACHE_MARKET_RENT_DOCUMENTS,
        );

        const rentDocumentExists = _.some(
          rentDocuments,
          (document) => document.tokenId === tokenId.toString(),
        );

        if (rentDocumentExists) {
          const updatedDocuments = _.filter(
            rentDocuments,
            (document) => document.tokenId !== tokenId.toString(),
          );

          await this.cacheService.set(
            CACHE_MARKET_RENT_DOCUMENTS,
            updatedDocuments,
          );

          logger.log('Removed token id from market rents: ' + tokenId);

          const viewers = await this.marketRentController.getViewers();

          await Promise.all(
            viewers.map((viewer) =>
              this.marketRentController.processClientState(viewer),
            ),
          );
        }
      });
  }
}
