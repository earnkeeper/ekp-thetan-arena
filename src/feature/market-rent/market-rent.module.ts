import { Module } from '@nestjs/common';
import { ApiModule } from '../../shared/api';
import { MarketRentController } from './market-rent.controller';
import { MarketRentService } from './market-rent.service';

@Module({
  imports: [ApiModule],
  providers: [MarketRentController, MarketRentService],
  exports: [MarketRentController],
})
export class MarketRentModule {}
