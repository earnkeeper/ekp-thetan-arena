import { Module } from '@nestjs/common';
import { ApiModule } from '@/shared/api';
import { EmbedController } from './embed.controller';
import { EmbedService } from './embed.service';
import { DbModule } from '@/shared/db';

@Module({
  imports: [ApiModule, DbModule],
  providers: [EmbedController, EmbedService],
  exports: [EmbedController],
})
export class EmbedModule {}
