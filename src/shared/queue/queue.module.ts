import { Module } from '@nestjs/common';
import { QueueEventsService } from './queue-events.service';

@Module({
  providers: [QueueEventsService],
})
export class QueueModule {}
