import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Category } from 'src/category/schema/category.schema';


export enum RecurrenceInterval {
    NONE = 'none',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

@Schema({ timestamps: true })
export class Expense {
    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, default: Date.now })
    date: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    category: Category;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({
        type: String,
        enum: RecurrenceInterval,
        default: RecurrenceInterval.NONE
    })
    recurrenceInterval: RecurrenceInterval;

    @Prop({ type: Date, default: null })
    nextRecurrenceDate: Date | null;
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);