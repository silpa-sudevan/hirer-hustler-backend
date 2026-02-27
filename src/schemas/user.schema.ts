import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IsArray, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { timestamp } from 'rxjs';

export enum UserRole {
    HIRER = 'hirer',
    HUSTLER = 'hustler',
}



export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    _id: Types.ObjectId;

    @Prop({ required: true, lowercase: true })
    @IsNotEmpty({ message: 'Please provide your email' })
    @IsEmail({}, { message: 'Please provide a valid email' })
    email: string;

    @Prop({ required: false })
    name?: string;

    @Prop({ required: false })
    firstName: string;

    @Prop({ required: false })
    lastName: string;

    @Prop()
    avatarUrl?: string;

    @Prop({ required: false, select: false }) // Hide password in queries
    password?: string;

    @Prop({ type: Boolean, default: true })
    isActive?: boolean;

    @Prop({ type: String, enum: UserRole, required: true })
    role: UserRole;

    @Prop({ required: false })
    phoneNumber?: string;

    @Prop({ type: Date, default: Date.now })
    lastActiveAt: Date;

    @Prop({ select: false })
    refreshToken?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;

    @Prop({ type: Boolean, default: false, select: false })
    isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook for email lowercasing & optional password hashing
// UserSchema.pre<UserDocument>('save', async function (next) {
//     if (this.isModified('email')) {
//         this.email = this.email.toLowerCase();
//     }

//     // if (this.isModified('password') && this.password) {
//     //     const salt = await bcrypt.genSalt(10);
//     //     this.password = await bcrypt.hash(this.password, salt);
//     // }

//     next();
// });
