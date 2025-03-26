import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CategoryFilterDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { User } from '../users/schemas/user.schema';
import { ResponseUtil } from '../common/utils/response.util';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { GetUser } from 'src/users/user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() createCategoryDto: CreateCategoryDto,
        @GetUser() user: User
    ): Promise<ApiResponse<any>> {
        const category = await this.categoryService.create(createCategoryDto, user);
        return ResponseUtil.success('Category created successfully', category);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @GetUser() user: User,
        @Query() filterDto: CategoryFilterDto
    ): Promise<ApiResponse<any>> {
        const categories = await this.categoryService.findAll(user, filterDto);
        return ResponseUtil.success('Categories retrieved successfully', categories);
    }

    @Get('distribution')
    @HttpCode(HttpStatus.OK)
    async getTopCategories(@GetUser() user: User): Promise<ApiResponse<any>> {
        const distribution = await this.categoryService.getTopCategories(user);
        return ResponseUtil.success('Category distribution retrieved successfully', distribution);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('id') id: string,
        @GetUser() user: User
    ): Promise<ApiResponse<any>> {
        const category = await this.categoryService.findOne(id, user);
        return ResponseUtil.success('Category retrieved successfully', category);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @GetUser() user: User,
    ): Promise<ApiResponse<any>> {
        const category = await this.categoryService.update(id, updateCategoryDto, user);
        return ResponseUtil.success('Category updated successfully', category);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id') id: string,
        @GetUser() user: User
    ): Promise<void> {
        await this.categoryService.remove(id, user);
    }
}
