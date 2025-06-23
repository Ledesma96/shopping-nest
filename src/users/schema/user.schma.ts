import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    SUPERADMIN = 'superadmin',
}

@Schema({
    timestamps: true,
    collection: 'users'
})
export class User extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], required: true })
    favorites: Types.ObjectId[];

    @Prop()
    avatarUrl?: string;

    @Prop({ default: false })
    verified: boolean;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Cart'})
    cart: Types.ObjectId;

    @Prop({ default: [] })
    permissions: string[];

    @Prop()
    superAdminNote?: string;
}

export type UserDocument = User & Document;
const schema = SchemaFactory.createForClass(User)
export const UserSchema = schema