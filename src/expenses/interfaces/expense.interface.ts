
import { Document, Types } from 'mongoose';
import { RecurrenceInterval } from '../schemas/expense.schema';

export interface ExpenseQuery {
    user: string;
    category?: string;
    date?: {
        $gte?: Date;
        $lte?: Date;
    };
}

export interface ExpensePaginationResult {
    expenses: Array<ExpenseDocument>;
    total: number;
    page: number;
    limit: number;
}

export interface IExpense {
    amount: number;
    description: string;
    date: Date;
    category: string | Types.ObjectId | ICategory;
    user: string;
    recurrenceInterval: RecurrenceInterval;
    nextRecurrenceDate: Date | null;
}

export interface ICategory {
    name: string;
    user: string;
}

export interface ExpenseDocument extends IExpense, Document {
    _id: Types.ObjectId;
}

export interface CategoryDocument extends ICategory, Document {
    _id: Types.ObjectId;
}

export interface DailySummary {
    date: string;
    totalAmount: number;
    count: number;
}

export interface MonthlyReportData {
    userId: string;
    period: {
        startDate: Date;
        endDate: Date;
    };
    summary: {
        totalExpenses: number;
        totalAmount: number;
        averageExpense: number;
    };
    categorySummary: CategorySummary[];
    expenses: ExpenseSummary[];
}

export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    count: number;
    percentage: number;
}

export interface ExpenseSummary {
    id: string;
    amount: number;
    description: string;
    date: Date;
    category: string;
}

export interface ReportQueuePayload {
    userId: string;
    month: string;
    report: MonthlyReportData;
}