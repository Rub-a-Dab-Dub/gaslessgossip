import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File } from './entities/files.entity';
import { R2Service } from '@/infrastructure/bucket/core/r2';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FilesController],
  providers: [FilesService, R2Service],
  exports: [FilesService],
})
export class FilesModule {}
