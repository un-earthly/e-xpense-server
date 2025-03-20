import { IsOptional, IsString, IsDate, IsNumber, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryExpenseDto {
    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    limit?: number = 10;
}