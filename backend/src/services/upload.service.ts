import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/AppError';
import { Readable } from 'stream';

interface UploadResult {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

interface UploadOptions {
  folder?: string;
  maxWidth?: number;
  quality?: string;
}

const DEFAULT_OPTIONS: UploadOptions = {
  folder: 'products',
  maxWidth: 1200,
  quality: 'auto',
};

const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

export const uploadService = {
  async uploadImage(
    file: Express.Multer.File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: opts.folder,
          transformation: [
            {
              width: opts.maxWidth,
              crop: 'limit',
              quality: opts.quality,
              fetch_format: 'auto',
            },
          ],
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(
              AppError.internal(
                `Failed to upload image: ${error.message}`,
                'UPLOAD_FAILED'
              )
            );
            return;
          }

          if (!result) {
            reject(AppError.internal('Upload returned no result', 'UPLOAD_FAILED'));
            return;
          }

          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );

      bufferToStream(file.buffer).pipe(uploadStream);
    });
  },

  async uploadImages(
    files: Express.Multer.File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results = await Promise.all(
      files.map((file) => this.uploadImage(file, options))
    );
    return results;
  },

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw AppError.internal(
        `Failed to delete image: ${(error as Error).message}`,
        'DELETE_FAILED'
      );
    }
  },

  async deleteImages(publicIds: string[]): Promise<void> {
    if (publicIds.length === 0) return;

    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      throw AppError.internal(
        `Failed to delete images: ${(error as Error).message}`,
        'DELETE_FAILED'
      );
    }
  },

  extractPublicId(url: string): string | null {
    try {
      const regex = /\/v\d+\/(.+)\.[a-zA-Z]+$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  },
};

export default uploadService;
