import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
    timestamps: true,
    collection: 'address'
})

export class Address extends Document{
    @Prop({
        type: String
    })
    addressType: string

    @Prop({
        type: String
    })
    street: string;
    
    @Prop({
        type: String
    })
    city: string;
    
    @Prop({
        type: String
    })
    cp: string;
}

export type AddressDocument = Address & Document;
const schema = SchemaFactory.createForClass(Address);
export const addresSchema = schema;