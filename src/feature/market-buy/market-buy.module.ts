import { Module } from '@nestjs/common';
import { ApiModule } from '@/shared/api';
import { MarketBuyController } from './market-buy.controller';
import { MarketBuyService } from './market-buy.service';
import { DbModule } from '@/shared/db/db.module';

@Module({
  imports: [ApiModule, DbModule],
  providers: [MarketBuyController, MarketBuyService],
  exports: [MarketBuyController],
})
export class MarketBuyModule {}
