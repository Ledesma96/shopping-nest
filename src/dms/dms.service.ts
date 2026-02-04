import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DmsService {
    private client: S3Client;
    private bucketName = process.env.S3_BUCKET_NAME;

    constructor(
        private readonly configService: ConfigService
    ){
        const s3_region = process.env.S3_REGION;

        if (!s3_region) {
            throw new Error('S3_REGION not found in environment variables');
        }

        this.client = new S3Client({
            region: s3_region,
            credentials:{
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
            },
            forcePathStyle: true
        })
    }

    async uploadFiles({
        files,
        isPublic = true,
    }: {
        files: { [fieldname: string]: Express.Multer.File[] }; // ← objeto con arrays por campo
        isPublic: boolean;
    }) {
        try {
            const results = await Promise.all(
                (files.images ?? []).map(async (file) => {
                    const key = `${uuidv4()}`;
                    const command = new PutObjectCommand({
                        Bucket: this.bucketName,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype,
                        Metadata: {
                            originalName: file.originalname,
                        },
                    });
    
                    await this.client.send(command);
    
                    const url = isPublic
                        ? (await this.getFileUrl(key)).url
                        : (await this.getPresignedSignedUrl(key)).url;
                    
                    return {
                        url,
                        key,
                        isPublic,
                    };
                })
            );
    
            return results;
        } catch (error) {
            throw error;
        }
    }
    

    async getFileUrl(key: string) {
        return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
    }

    async getPresignedSignedUrl(key: string) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const url = await getSignedUrl(this.client, command, {
                expiresIn: 60 * 60 * 24, // 24 hours
            });
        
            return { url };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async deleteFile(key: string) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
        
            await this.client.send(command);
        
            return { message: 'File deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
