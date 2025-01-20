import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { CreateFileInput } from './dto/create-file.input';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { FileAccessToken } from '../entities/file-access-token.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(FileAccessToken)
    private readonly tokenRepository: Repository<FileAccessToken>,
  ) {}

  private calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('error', err => reject(err));
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  async create(createFileInput: CreateFileInput): Promise<File> {
    // Calculate file hash
    const hash = await this.calculateFileHash(createFileInput.path);
    
    // Check if file with same hash exists
    const existingFile = await this.fileRepository.findOne({ where: { hash } });
    
    if (existingFile) {
      // 如果文件存在，删除旧文件
      try {
        const oldFilePath = path.join(process.cwd(), existingFile.path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (error) {
        console.error('Error deleting old file:', error);
      }

      // 更新现有记录
      Object.assign(existingFile, createFileInput);
      existingFile.hash = hash;
      return await this.fileRepository.save(existingFile);
    }
    
    // If no duplicate found, create new file record
    const file = this.fileRepository.create({
      ...createFileInput,
      hash,
    });
    return await this.fileRepository.save(file);
  }

  async findAll(): Promise<File[]> {
    return this.fileRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async checkFileExists(filePath: string): Promise<{ exists: boolean; existingFile?: File }> {
    const hash = await this.calculateFileHash(filePath);
    const existingFile = await this.fileRepository.findOne({ where: { hash } });
    
    return {
      exists: !!existingFile,
      existingFile: existingFile || undefined,
    };
  }

  async findOne(id: string): Promise<File> {
    return await this.fileRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.fileRepository.delete(id);
    return result.affected > 0;
  }

  async generateAccessToken(fileId: string): Promise<FileAccessToken> {
    const file = await this.fileRepository.findOneOrFail({ where: { id: fileId } });
    
    // 生成随机令牌
    const token = crypto.randomBytes(32).toString('hex');
    
    // 设置5分钟后过期
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    // 创建新的访问令牌
    const accessToken = this.tokenRepository.create({
      file,
      fileId: file.id,
      token,
      expiresAt,
    });
    
    return await this.tokenRepository.save(accessToken);
  }

  async validateAccessToken(token: string): Promise<File> {
    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    const accessToken = await this.tokenRepository.findOne({
      where: { token },
      relations: ['file'],
    });

    if (!accessToken) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (accessToken.expiresAt < new Date()) {
      // 删除过期的令牌
      await this.tokenRepository.remove(accessToken);
      throw new UnauthorizedException('Access token has expired');
    }

    if (!accessToken.file) {
      throw new NotFoundException('File not found');
    }

    return accessToken.file;
  }

  // 清理过期的令牌
  async cleanupExpiredTokens(): Promise<void> {
    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
