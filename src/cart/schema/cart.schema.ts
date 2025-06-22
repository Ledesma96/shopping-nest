import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cart {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop([
        {
            productId: { type: Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1 },
        }
    ])
    products: {
        productId: Types.ObjectId;
        quantity: number;
    }[];

    @Prop({ type: Boolean, default: true })
    active: boolean;

}

export type CartDocument = Cart & Document;
export const CartSchema = SchemaFactory.createForClass(Cart);
