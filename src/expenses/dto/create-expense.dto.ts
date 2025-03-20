import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RecurrenceInterval } from '../schemas/expense.schema';

export class CreateExpenseDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    date: Date;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsEnum(RecurrenceInterval)
    recurrenceInterval?: RecurrenceInterval;
}
