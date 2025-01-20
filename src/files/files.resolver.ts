import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { FilesService } from './files.service';
import { File } from '../entities/file.entity';
import { CreateFileInput } from './dto/create-file.input';

@Resolver(() => File)
export class FilesResolver {
  constructor(private readonly filesService: FilesService) {}

  @Mutation(() => File)
  async createFile(
    @Args('createFileInput') createFileInput: CreateFileInput,
  ): Promise<File> {
    return await this.filesService.create(createFileInput);
  }

  @Query(() => [File], { name: 'files' })
  async findAll(): Promise<File[]> {
    return await this.filesService.findAll();
  }

  @Query(() => File, { name: 'file' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<File> {
    return await this.filesService.findOne(id);
  }

  @Mutation(() => Boolean)
  async removeFile(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return await this.filesService.remove(id);
  }
}
