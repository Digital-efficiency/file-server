import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
import { FilesController } from './files.controller';
import { File } from '../entities/file.entity';
import { FileAccessToken } from '../entities/file-access-token.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([File, FileAccessToken]), AuthModule],
  controllers: [FilesController],
  providers: [FilesResolver, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
