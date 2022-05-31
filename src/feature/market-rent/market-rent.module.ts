import { Module } from '@nestjs/common';
import { ApiModule } from '@/shared/api';
import { MarketRentController } from './market-rent.controller';
import { MarketRentService } from './market-rent.service';
import { DbModule } from '@/shared/db/db.module';

@Module({
  imports: [ApiModule, DbModule],
  providers: [MarketRentController, MarketRentService],
  exports: [MarketRentController],
})
export class MarketRentModule {}
