import { Module } from '@nestjs/common';
import { UiController } from './ui.controller';
import { DynamicFileModule } from 'src/dynamic-file/dynamic-file.module';

@Module({
  controllers: [UiController],
  imports: [DynamicFileModule]
})
export class UiModule {}
