import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum CategoryType {
    INCOME = 'income',
    EXPENSE = 'expense'
}

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true })
    name: string;

    @Prop({
        type: String,
        enum: CategoryType,
        required: true
    })
    type: CategoryType;

    @Prop({ required: false })
    color: string;

    @Prop({ required: false })
    desc: string;

    @Prop({ required: false })
    icon: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;
}

export type CategoryDocument = Category & Document;
export const CategorySchema = SchemaFactory.createForClass(Category);


CategorySchema.index({ name: 'text', desc: 'text' });