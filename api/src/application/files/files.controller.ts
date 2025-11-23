import {
  Controller,
  Post,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileResponseDto } from './dtos/file.dto';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, type: FileResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async upload(@Request() req, @UploadedFile() file: any) {
    return this.filesService.uploadFile(file, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get signed url for a file' })
  @Get(':id/signed-url')
  async getSignedUrl(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.getFileSignedUrl(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List files uploaded by a user' })
  @Get('user/:userId')
  async listByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.filesService.listFilesByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file' })
  @Delete(':id')
  async delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    // could check ownership here if desired
    return this.filesService.deleteFile(id);
  }
}


