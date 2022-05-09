import { Module } from '@nestjs/common';
import { ApiModule } from '@/shared/api';
import { EmbedController } from './embed.controller';
import { EmbedService } from './embed.service';

@Module({
  imports: [ApiModule],
  providers: [EmbedController, EmbedService],
  exports: [EmbedController],
})
export class EmbedModule {}
