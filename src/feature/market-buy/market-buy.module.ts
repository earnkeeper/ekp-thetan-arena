import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { MarketBuyController } from './market-buy.controller';
import { MarketBuyProcessor } from './market-buy.processor';
import { MarketBuyService } from './market-buy.service';

@Module({
  imports: [ApiModule],
  providers: [MarketBuyController, MarketBuyService, MarketBuyProcessor],
})
export class MarketBuyModule {}
