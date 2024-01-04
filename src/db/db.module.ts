import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: __dirname + "/../../db.sqlite3",
            entities: [__dirname + "/../**/*.entity{.js,.ts}"],
            synchronize: true
        })
    ]
})
export class DbModule {}
