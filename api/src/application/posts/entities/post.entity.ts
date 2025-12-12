import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  RelationCount,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column('text', { array: true, nullable: true })
  medias: string[];

  @Column({ default: false })
  isAnonymous: boolean;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post, { cascade: true })
  likes: Like[];

  @RelationCount((post: Post) => post.comments)
  commentCount: number;

  @RelationCount((post: Post) => post.likes)
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
