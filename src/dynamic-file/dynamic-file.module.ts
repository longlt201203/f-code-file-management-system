import { Module } from '@nestjs/common';
import { DynamicFileService } from './dynamic-file.service';
import { DynamicFileController } from './dynamic-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicFile } from 'src/dynamic-file/entities/dynamic-file.entity';

@Module({
  controllers: [DynamicFileController],
  providers: [DynamicFileService],
  imports: [TypeOrmModule.forFeature([DynamicFile])],
  exports: [DynamicFileService]
})
export class DynamicFileModule {}
