import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
    _id: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop()
    resetPasswordToken: string;

    @Prop()
    resetPasswordTokenExpires: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Date, default: Date.now })
    lastLoginAt: Date;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ resetPasswordToken: 1 });
