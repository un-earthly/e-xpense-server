import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument, RecurrenceInterval } from './schemas/expense.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { Cron } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ExpenseQuery } from './interfaces/expense.interface';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        @Inject('REPORT_SERVICE') private reportClient: ClientProxy,
    ) { }

    async createExpense(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense> {
        let categoryId = createExpenseDto.category;

        if (categoryId && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            const existingCategory = await this.categoryModel.findOne({
                name: categoryId,
                user: userId,
            });

            if (existingCategory) {
                categoryId = existingCategory._id.toString();
            } else {
                const newCategory = await this.categoryModel.create({
                    name: categoryId,
                    user: userId,
                });
                categoryId = newCategory._id.toString();
            }
        }

        // Calculate next recurrence date if it's a recurring expense
        let nextRecurrenceDate: Date | null = null;
        if (createExpenseDto.recurrenceInterval) {
            nextRecurrenceDate = this.calculateNextRecurrenceDate(
                createExpenseDto.date,
                createExpenseDto.recurrenceInterval,
            );
        }

        const expense = new this.expenseModel({
            ...createExpenseDto,
            category: categoryId,
            user: userId,
            nextRecurrenceDate,
        });

        return expense.save();
    }

    async findAllExpenses(
        queryExpenseDto: QueryExpenseDto,
        userId: string,
    ): Promise<{ expenses: Expense[]; total: number; page: number; limit: number }> {
        const { category, startDate, endDate, page = 1, limit = 10 } = queryExpenseDto;
        const skip = (page - 1) * limit;

        const query: ExpenseQuery = { user: userId };

        if (category) {
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                query.category = category;
            } else {
                const categoryDoc = await this.categoryModel.findOne({
                    name: category,
                    user: userId,
                });
                query.category = categoryDoc && categoryDoc._id ? categoryDoc._id.toString() : undefined;
            }
        }

        if (startDate) {
            query.date = { $gte: new Date(startDate) };
        }

        if (endDate) {
            query.date = { ...query.date, $lte: new Date(endDate) };
        }

        const [expenses, total] = await Promise.all([
            this.expenseModel
                .find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .populate('category', 'name'),
            this.expenseModel.countDocuments(query),
        ]);

        return {
            expenses,
            total,
            page,
            limit,
        };
    }

    async findOneExpense(id: string, userId: string): Promise<Expense> {
        const expense = await this.expenseModel
            .findOne({ _id: id, user: userId })
            .populate('category', 'name');

        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }

        return expense;
    }

    async updateExpense(
        id: string,
        updateExpenseDto: UpdateExpenseDto,
        userId: string,
    ): Promise<Expense> {
        const expense = await this.expenseModel.findOne({ _id: id, user: userId });

        if (!expense) {
            throw new NotFoundException(`Expense with ID ${id} not found`);
        }

        // Handle category updates
        if (updateExpenseDto.category) {
            if (!updateExpenseDto.category.match(/^[0-9a-fA-F]{24}$/)) {
                const existingCategory = await this.categoryModel.findOne({
                    name: updateExpenseDto.category,
                    user: userId,
                });

                if (existingCategory) {
                    updateExpenseDto.category = existingCategory._id.toString();
                } else {
                    // Create new category
                    const newCategory = await this.categoryModel.create({
                        name: updateExpenseDto.category,
                        user: userId,
                    });
                    updateExpenseDto.category = newCategory._id.toString();
                }
            }
        }

        // Calculate next recurrence date if it's a recurring expense
        if (updateExpenseDto.recurrenceInterval || updateExpenseDto.date) {
            const interval = updateExpenseDto.recurrenceInterval || expense.recurrenceInterval;
            const date = updateExpenseDto.date || expense.date;

            if (interval !== RecurrenceInterval.NONE) {
                updateExpenseDto.nextRecurrenceDate = this.calculateNextRecurrenceDate(date, interval);
            }
        }

        const updatedExpense = await this.expenseModel
            .findByIdAndUpdate(id, updateExpenseDto, { new: true })
            .populate('category', 'name');

        return updatedExpense;
    }

    async removeExpense(id: string, userId: string): Promise<{ deleted: boolean }> {
        const result = await this.expenseModel.deleteOne({ _id: id, user: userId });
        return { deleted: result.deletedCount > 0 };
    }

    async createCategory(
        createCategoryDto: CreateCategoryDto,
        userId: string,
    ): Promise<Category> {
        const existingCategory = await this.categoryModel.findOne({
            name: createCategoryDto.name,
            user: userId,
        });

        if (existingCategory) {
            return existingCategory;
        }

        const category = new this.categoryModel({
            ...createCategoryDto,
            user: userId,
        });

        return category.save();
    }

    async findAllCategories(userId: string): Promise<Category[]> {
        return this.categoryModel.find({ user: userId }).sort({ name: 1 });
    }

    async removeCategory(id: string, userId: string): Promise<{ deleted: boolean }> {
        const result = await this.categoryModel.deleteOne({ _id: id, user: userId });
        return { deleted: result.deletedCount > 0 };
    }

    async getDailySummary(userId: string): Promise<any[]> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyExpenses = await this.expenseModel.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
            {
                $project: {
                    date: '$_id',
                    totalAmount: 1,
                    count: 1,
                    _id: 0,
                },
            },
        ]);

        return dailyExpenses;
    }

    @Cron('0 0 * * *') // Run at midnight every day
    async handleRecurringExpenses() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find all recurring expenses that need to be processed today
        const recurringExpenses = await this.expenseModel.find({
            recurrenceInterval: { $ne: RecurrenceInterval.NONE },
            nextRecurrenceDate: { $gte: today, $lt: tomorrow },
        });

        for (const expense of recurringExpenses) {
            // Create a new expense based on the recurring one
            const newExpense = new this.expenseModel({
                amount: expense.amount,
                description: expense.description,
                category: expense.category,
                user: expense.user,
                date: new Date(), // Today's date
                recurrenceInterval: RecurrenceInterval.NONE, // Non-recurring
            });

            await newExpense.save();

            // Update the next recurrence date
            expense.nextRecurrenceDate = this.calculateNextRecurrenceDate(
                expense.nextRecurrenceDate,
                expense.recurrenceInterval,
            );
            await expense.save();
        }
    }

    @Cron('0 0 1 * *')
    async generateMonthlyReportsForAllUsers() {
        // In a real application, you would fetch all users and generate reports for each
        const users = await this.expenseModel.distinct('user');

        for (const user of users) {
            this.generateMonthlyReport(user._id);
        }
    }

    async generateMonthlyReport(userId: string) {
        // Get the previous month's date range
        const date = new Date();
        date.setDate(1); // First day of current month
        date.setHours(0, 0, 0, 0);

        const startDate = new Date(date);
        startDate.setMonth(startDate.getMonth() - 1); // First day of previous month

        const endDate = new Date(date);
        endDate.setMilliseconds(-1); // Last millisecond of previous month

        // Generate the report data
        const expenses = await this.expenseModel.find({
            user: userId,
            date: { $gte: startDate, $lt: endDate },
        }).populate('category', 'name');

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        const categorySummary = await this.expenseModel.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: startDate, $lt: endDate },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo',
                },
            },
            {
                $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true },
            },
            {
                $group: {
                    _id: '$category',
                    categoryName: { $first: '$categoryInfo.name' },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    categoryId: '$_id',
                    categoryName: { $ifNull: ['$categoryName', 'Uncategorized'] },
                    totalAmount: 1,
                    count: 1,
                    percentage: { $multiply: [{ $divide: ['$totalAmount', totalAmount] }, 100] },
                },
            },
            {
                $sort: { totalAmount: -1 },
            },
        ]);

        const report = {
            userId,
            period: {
                startDate,
                endDate,
            },
            summary: {
                totalExpenses: expenses.length,
                totalAmount,
                averageExpense: totalAmount / (expenses.length || 1),
            },
            categorySummary,
            expenses: expenses.map(expense => ({
                id: expense._id,
                amount: expense.amount,
                description: expense.description,
                date: expense.date,
                category: expense.category ? (expense.category as any).name : 'Uncategorized',
            })),
        };

        // Send the report to the queue
        this.reportClient.emit('monthly-report', {
            userId,
            month: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
            report,
        });

        return {
            message: 'Monthly report generation has been queued',
            period: {
                startDate,
                endDate,
            },
        };
    }

    private calculateNextRecurrenceDate(
        currentDate: Date,
        interval: RecurrenceInterval,
    ): Date | null {
        const nextDate = new Date(currentDate);

        switch (interval) {
            case RecurrenceInterval.DAILY:
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case RecurrenceInterval.WEEKLY:
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case RecurrenceInterval.MONTHLY:
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            default:
                return null;
        }

        return nextDate;
    }
}