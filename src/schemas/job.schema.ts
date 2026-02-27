import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum JobStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    CLOSED = 'closed',
}

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
    _id: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    budget: number;

    @Prop({ type: [String], required: true })
    requiredSkills: string[];

    @Prop({ type: String, enum: JobStatus, default: JobStatus.OPEN })
    status: JobStatus;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    hirerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    selectedHustlerId?: Types.ObjectId;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);
