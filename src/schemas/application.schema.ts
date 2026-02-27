import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum ApplicationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

export type ApplicationDocument = HydratedDocument<Application>;

@Schema({ timestamps: true })
export class Application {
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    jobId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    hustlerId: Types.ObjectId;

    @Prop({ required: true })
    message: string;

    @Prop({ required: true })
    expectedCost: number;

    @Prop({ required: true })
    fileUrl: string;

    @Prop({ type: String, enum: ApplicationStatus, default: ApplicationStatus.PENDING })
    status: ApplicationStatus;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
