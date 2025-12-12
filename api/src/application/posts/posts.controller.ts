import {
  Controller,
  Get,
  Post as HttpPost,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UploadedFiles,
  UseInterceptors,
  Sse,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto, EditPostDto } from './dtos/post.dto';
import { CommentDto, EditCommentDto } from './dtos/comment.dto';
import { FilesService } from '../files/files.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { map } from 'rxjs/operators';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly filesService: FilesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  async createPost(
    @Request() req,
    @Body() dto: CreatePostDto,
    @UploadedFiles() files?: any[],
  ) {
    let medias = dto.medias ?? [];
    if (files && files.length) {
      const uploaded = await Promise.all(
        files.map((f) => this.filesService.uploadFile(f, req.user)),
      );
      // store signed urls in medias array
      medias = medias.concat(uploaded.map((u) => u.url));
    }

    const isAnonymous = dto.isAnonymous === 'true' || dto.isAnonymous === true;
    return this.postsService.createPost(req.user.userId, dto.content, medias, isAnonymous);
  }

  @Sse('stream')
  streamNewPosts() {
    // Map the internal payload to a MessageEvent-like object with `data` property
    return this.postsService.postStream.pipe(map((data) => ({ data })));
  }

  @Get()
  getAll(@Request() req) {
    const userId = req?.user?.userId;
    return this.postsService.getAllPosts(userId);
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.postsService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  editPost(@Request() req, @Param('id') id: number, @Body() dto: EditPostDto) {
    return this.postsService.editPost(req.user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePost(@Request() req, @Param('id') id: number) {
    return this.postsService.deletePost(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/like')
  toggleLike(@Request() req, @Param('id') id: number) {
    return this.postsService.toggleLike(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/comment')
  addComment(@Request() req, @Param('id') id: number, @Body() dto: CommentDto) {
    return this.postsService.addComment(
      req.user.userId,
      id,
      dto.content,
      dto.parent_id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('comment/:commentId')
  editComment(
    @Request() req,
    @Param('commentId') commentId: number,
    @Body() dto: EditCommentDto,
  ) {
    return this.postsService.editComment(
      req.user.userId,
      commentId,
      dto.content,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comment/:commentId')
  deleteComment(@Request() req, @Param('commentId') commentId: number) {
    return this.postsService.deleteComment(req.user.userId, commentId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('user/me')
  getMyPosts(@Request() req) {
    return this.postsService.getMyPosts(req.user.userId);
  }

  @Get('user/:username')
  getPostsByUser(@Param('username') username: string) {
    return this.postsService.getPostsByUsername(username);
  }
}
