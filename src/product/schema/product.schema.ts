import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ default: 0 })
    stock: number;

    @Prop({ type: [String], default: [] })
    images: string[]; // URLs (guardadas en S3, por ejemplo)

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    seller: Types.ObjectId; // Relación con el usuario creador del producto

    @Prop({ type: [String], default: [] })
    categories: string[]; // Ej: ['tecnología', 'hogar']

    @Prop({ type: [String], default: [] })
    tags: string[]; // Ej: ['nuevo', 'importado']

    @Prop({ default: 0 })
    salesCount: number;

    @Prop({ default: true })
    isActive: boolean; // Para soft delete

    @Prop({ default: true })
    isVisible: boolean; // Para mostrar/ocultar sin eliminar

    @Prop({ default: false })
    featured: boolean; // Para destacados en home

    @Prop({ default: 0 })
    ratingAverage: number; // Promedio de calificaciones

    @Prop({ type: [{ user: { type: Types.ObjectId, ref: 'User' }, comment: String, rating: Number, date: Date }], default: [] })
    reviews: {
        user: Types.ObjectId;
        comment: string;
        rating: number; // 1 a 5
        date: Date;
    }[];
}

export type ProductDocument = Product & Document;
const schema = SchemaFactory.createForClass(Product)
schema.plugin(paginate)
export const ProductSchema = schema
