import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { CategoryType } from '../schema/category.schema';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(CategoryType)
    @IsNotEmpty()
    type: CategoryType;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    desc?: string;

    @IsString()
    @IsOptional()
    icon?: string;
}

export class UpdateCategoryDto extends CreateCategoryDto { }

export class CategoryFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(CategoryType)
    type?: CategoryType;
}