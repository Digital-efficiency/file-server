import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { File } from './file.entity';

@Entity()
export class FileAccessToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => File, { onDelete: 'CASCADE' })
  file: File;

  @Column()
  fileId: string;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}
