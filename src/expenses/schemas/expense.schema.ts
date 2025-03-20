import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Category } from './category.schema';

export enum RecurrenceInterval {
    NONE = 'none',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}

@Schema({ timestamps: true })
export class Expense {
    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    description: string;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    category: Category;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ type: String, enum: RecurrenceInterval, default: RecurrenceInterval.NONE })
    recurrenceInterval: RecurrenceInterval;

    @Prop({ type: Date })
    nextRecurrenceDate: Date;
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);