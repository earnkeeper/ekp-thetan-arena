import { Module } from '@nestjs/common';
import { ApiModule } from '@/shared/api';
import { BoxController } from './box.controller';
import { BoxService } from './box.service';

@Module({
  imports: [ApiModule],
  providers: [BoxController, BoxService],
  exports: [BoxController],
})
export class BoxModule {}
