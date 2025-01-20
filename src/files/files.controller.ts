import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  StreamableFile,
  Headers,
  Query,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { documentFileFilter, editFileName } from './utils/file-upload.utils';
import { createReadStream } from 'fs';
import { join } from 'path';
import { File } from '../entities/file.entity';
import * as fs from 'fs';
import { AuthGuard } from '../auth/auth.guard';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async findAll(): Promise<File[]> {
    return this.filesService.findAll();
  }

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: documentFileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 限制文件大小为10MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // 确保文件名使用 UTF-8 编码
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    try {
      const fileRecord = await this.filesService.create({
        filename: file.filename,
        path: `uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      });

      return {
        id: fileRecord.id,
        originalname,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('check')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './temp-uploads',
        filename: editFileName,
      }),
      fileFilter: documentFileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 限制文件大小为10MB
      },
    }),
  )
  async checkFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.filesService.checkFileExists(file.path);
      
      // 检查完成后删除临时文件
      fs.unlinkSync(file.path);
      
      if (result.exists && result.existingFile) {
        const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        return {
          exists: true,
          file: {
            id: result.existingFile.id,
            originalname,
            mimetype: result.existingFile.mimetype,
            size: result.existingFile.size,
          }
        };
      }
      
      return {
        exists: false
      };
    } catch (error) {
      // 确保在发生错误时也删除临时文件
      try {
        fs.unlinkSync(file.path);
      } catch {}
      throw error;
    }
  }

  @Get(':id')
  async getFile(
    @Param('id') id: string,
    @Headers('user-agent') userAgent: string,
    @Query('token') token?: string,
  ): Promise<StreamableFile> {
    try {
      if (!token) {
        throw new UnauthorizedException('Access token is required');
      }

      const file = await this.filesService.validateAccessToken(token);

      if (id !== file.id) {
        throw new UnauthorizedException('Invalid access token for this file');
      }

      const filePath = join(process.cwd(), file.path);
      
      // 检查文件是否存在
      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
      } catch (error) {
        throw new NotFoundException('File not found on disk');
      }

      const stream = createReadStream(filePath);
      const filename = Buffer.from(file.filename).toString('utf8');
      
      // 根据浏览器类型设置不同的 Content-Disposition
      const isIE = userAgent.includes('MSIE') || userAgent.includes('Trident');
      const encodedFilename = isIE
        ? encodeURIComponent(filename)
        : `UTF-8''${encodeURIComponent(filename)}`;

      return new StreamableFile(stream, {
        disposition: `attachment; filename="${encodedFilename}"`,
        type: file.mimetype,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      // 处理其他未预期的错误
      console.error('Error while serving file:', error);
      throw new InternalServerErrorException('Error while serving file');
    }
  }

  @Post(':id/access-token')
  @UseGuards(AuthGuard)
  async generateAccessToken(@Param('id') id: string) {
    try {
      const accessToken = await this.filesService.generateAccessToken(id);
      
      return {
        fileId: id,
        accessToken: accessToken.token,
        expiresAt: accessToken.expiresAt
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.message === 'Entity not found') {
        throw new NotFoundException('File not found');
      }

      console.error('Error generating access token:', error);
      throw new InternalServerErrorException('Error generating access token');
    }
  }
}
