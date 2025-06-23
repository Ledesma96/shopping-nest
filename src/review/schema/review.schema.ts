import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Review {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    comment: string;

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

}

export type ReviewDocument = Review & Document;
export const ReviewSchema = SchemaFactory.createForClass(Review);
