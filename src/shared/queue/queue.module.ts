import { Module } from '@nestjs/common';
import { EmbedModule } from '../../feature/embed/embed.module';
import { MarketBuyModule } from '../../feature/market-buy/market-buy.module';
import { MarketRentModule } from '../../feature/market-rent/market-rent.module';
import { ApiModule } from '../api';
import { MarketProcessor } from './market.processor';
import { QueueEventsService } from './queue-events.service';

@Module({
  imports: [ApiModule, MarketBuyModule, MarketRentModule, EmbedModule],
  providers: [QueueEventsService, MarketProcessor],
})
export class QueueModule {}
