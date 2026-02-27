import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'job-applications',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result.secure_url);
        },
      );

      const readable = Readable.from(file.buffer);
      readable.pipe(uploadStream);
    });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(fileUrl);
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
    }
  }

  private extractPublicId(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return `job-applications/${filename.split('.')[0]}`;
  }
}
