import { Controller, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
    constructor(
        private readonly mailerService: MailerService
    ){}

    @Post()
    async verifyMail(
        @Query('token') token: string
    ): Promise<any>
    {
        try {
            
            const verify = await this.mailerService.verifyMail(token)
        } catch (error) {
            console.log(error.message);
            
            throw new HttpException(
                'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
