import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportConsumer } from './report.consumer';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'REPORT_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                    queue: 'reports_queue',
                    queueOptions: {
                        durable: true,
                    },
                },
            },
        ]),
    ],
    providers: [ReportConsumer],
    exports: [ClientsModule],
})
export class RabbitMQModule { }

