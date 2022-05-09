import { Module } from '@nestjs/common';
import { ApiModule } from '@/shared/api';
import { MarketBuyController } from './market-buy.controller';
import { MarketBuyService } from './market-buy.service';

@Module({
  imports: [ApiModule],
  providers: [MarketBuyController, MarketBuyService],
  exports: [MarketBuyController],
})
export class MarketBuyModule {}
