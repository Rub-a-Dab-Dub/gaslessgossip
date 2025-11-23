import { User } from '@/application/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  RelationCount,
} from 'typeorm';


@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  filename: string;

  @Column('text')
  url: string;

  @Column('text')
  storageKey: string;

  @Column('text')
  mimetype: string;

  @Column('bigint')
  size: number;

  @ManyToOne(() => User, (user) => user.files)
  uploader: User;

  @CreateDateColumn()
  uploadedAt: Date;
}
