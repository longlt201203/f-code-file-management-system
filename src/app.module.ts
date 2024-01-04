import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from 'src/utils/validation.pipe';
import { DynamicFileModule } from './dynamic-file/dynamic-file.module';
import { UiModule } from './ui/ui.module';
import MyExceptionFilter from 'src/utils/my-exception.filter';

@Module({
  imports: [DbModule, DynamicFileModule, UiModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_FILTER,
      useClass: MyExceptionFilter
    },
    AppService
  ],
})
export class AppModule {}
