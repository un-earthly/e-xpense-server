import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryExpenseDto {
    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;
}
