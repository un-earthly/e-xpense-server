import { IsNumber, IsString, IsDate, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RecurrenceInterval } from '../schemas/expense.schema';

export class UpdateExpenseDto {
    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    date?: Date;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsEnum(RecurrenceInterval)
    recurrenceInterval?: RecurrenceInterval;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    nextRecurrenceDate?: Date | null;
}