import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/interfaces/user.interface';
import { CategoryFilterDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category, CategoryDocument } from './schema/category.schema';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto, user: User): Promise<Category> {
        const category = new this.categoryModel({
            ...createCategoryDto,
            user: user._id,
        });
        return category.save();
    }

    async findAll(user: User, filterDto: CategoryFilterDto): Promise<Category[]> {
        const query: any = { user: user._id };

        if (filterDto.type) {
            query.type = filterDto.type;
        }

        if (filterDto.search) {
            query.$text = { $search: filterDto.search };
        }

        return this.categoryModel.find(query).exec();
    }

    async findOne(id: string, user: User): Promise<Category> {
        const category = await this.categoryModel.findOne({ _id: id, user: user._id }).exec();
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto, user: User): Promise<Category> {
        const category = await this.categoryModel
            .findOneAndUpdate(
                { _id: id, user: user._id },
                { $set: updateCategoryDto },
                { new: true }
            )
            .exec();

        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async remove(id: string, user: User): Promise<void> {
        const result = await this.categoryModel.deleteOne({ _id: id, user: user._id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Category not found');
        }
    }

    async getTopCategories(user: User): Promise<{
        topExpenses: Category[];
        topIncomes: Category[];
    }> {
        const [topExpenses, topIncomes] = await Promise.all([
            this.categoryModel.aggregate([
                { $match: { user: user._id, type: 'expense' } },
                {
                    $lookup: {
                        from: 'expenses',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'expenses'
                    }
                },
                {
                    $project: {
                        name: 1,
                        type: 1,
                        color: 1,
                        icon: 1,
                        totalAmount: { $sum: '$expenses.amount' }
                    }
                },
                { $sort: { totalAmount: -1 } },
                { $limit: 5 }
            ]).exec(),
            this.categoryModel.aggregate([
                { $match: { user: user._id, type: 'income' } },
                {
                    $lookup: {
                        from: 'expenses',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'expenses'
                    }
                },
                {
                    $project: {
                        name: 1,
                        type: 1,
                        color: 1,
                        icon: 1,
                        totalAmount: { $sum: '$expenses.amount' }
                    }
                },
                { $sort: { totalAmount: -1 } },
                { $limit: 5 }
            ]).exec()
        ]);

        return { topExpenses, topIncomes };
    }
}
