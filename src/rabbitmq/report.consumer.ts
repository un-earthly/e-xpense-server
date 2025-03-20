import { Injectable, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Injectable()
export class ReportConsumer {
    private readonly logger = new Logger(ReportConsumer.name);

    @MessagePattern('monthly-report')
    async processMonthlyReport(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.log(`Processing monthly report for user: ${data.userId}, month: ${data.month}`);

            // In a real application, this would:
            // 1. Format the report data
            // 2. Generate a PDF or other format
            // 3. Send an email to the user with the report attached

            this.logger.log(`Report processed successfully for user: ${data.userId}`);

            // Acknowledge the message (remove it from the queue)
            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(`Error processing report: ${error.message}`);
            // Reject the message and put it back in the queue
            channel.nack(originalMsg);
        }
    }
}