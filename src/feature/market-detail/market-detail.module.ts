import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { MarketDetailController } from './market-detail.controller';
import { MarketDetailService } from './market-detail.service';

@Module({
  imports: [ApiModule],
  providers: [MarketDetailController, MarketDetailService],
})
export class MarketDetailModule {}
