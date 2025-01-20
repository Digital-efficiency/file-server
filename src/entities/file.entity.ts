import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('files')
export class File {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    comment: '文件ID',
  })
  id: string;

  @Field()
  @Column({
    name: 'filename',
    comment: '文件名',
    type: 'varchar',
    length: 255,
  })
  filename: string;

  @Field()
  @Column({
    name: 'path',
    comment: '文件路径',
    type: 'varchar',
    length: 255,
  })
  path: string;

  @Field()
  @Column({
    name: 'mimetype',
    comment: '文件类型',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mimetype: string;

  @Field()
  @Column({
    name: 'size',
    comment: '文件大小',
    type: 'bigint',
  })
  size: number;

  @Field()
  @Column({
    name: 'hash',
    comment: '文件内容哈希值',
    type: 'varchar',
    length: 64,
  })
  hash: string;

  @Field()
  @CreateDateColumn({
    name: 'created_at',
    comment: '创建时间',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    name: 'updated_at',
    comment: '更新时间',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
