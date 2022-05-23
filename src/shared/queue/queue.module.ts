import { EmbedModule } from '@/feature/embed/embed.module';
import { MarketBuyModule } from '@/feature/market-buy/market-buy.module';
import { MarketRentModule } from '@/feature/market-rent/market-rent.module';
import { MATCH_LOG_QUEUE, RENT_HERO_LOG_QUEUE } from '@/util';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ApiModule } from '../api';
import { MatchLogProcessor } from './match-log.processor';
import { MatchRentHeroProcessor } from './match-rent-hero.processor';
import { QueueEventsService } from './queue-events.service';

@Module({
  imports: [
    ApiModule,
    MarketBuyModule,
    MarketRentModule,
    EmbedModule,
    BullModule.registerQueue(
      { name: MATCH_LOG_QUEUE },
      { name: RENT_HERO_LOG_QUEUE },
    ),
  ],
  providers: [QueueEventsService, MatchLogProcessor, MatchRentHeroProcessor],
})
export class QueueModule {}
