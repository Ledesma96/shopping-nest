import { IsString } from "class-validator";

export class Auth {
    @IsString()
    email: string;

    @IsString()
    password: string;
}