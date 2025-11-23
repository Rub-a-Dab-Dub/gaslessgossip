import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../posts/entities/comment.entity';
import { Like } from '../../posts/entities/like.entity';
import { Message } from '../../messages/entities/message.entity';
import { RoomMember } from '../../rooms/entities/room-member.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { UserVerification } from './user-verification.entity';
import { File } from '@/application/files/entities/files.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  address: string;

  @Column({ default: 0 })
  xp: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => RoomMember, (member) => member.user)
  room_members: RoomMember[];

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable({
    name: 'user_followers',
    joinColumn: {
      name: 'followed_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'follower_id',
      referencedColumnName: 'id',
    },
  })
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
  following: User[];

  @OneToMany(() => Chat, (chat) => chat.sender)
  sentChats: Chat[];

  @OneToMany(() => Chat, (chat) => chat.receiver)
  receivedChats: Chat[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Room, (room) => room.owner)
  createdRooms: Room[];

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToMany(() => UserVerification, (verification) => verification.user)
  verifications: UserVerification[];

  @OneToMany(() => File, (file) => file.uploader)
  files: File[];
}
