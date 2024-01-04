import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query, Res, BadRequestException } from '@nestjs/common';
import { DynamicFileService } from './dynamic-file.service';
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { Response } from 'express';
import * as fs from "fs";
import * as archiver from 'archiver';
import { rimrafSync } from 'rimraf';
import { CreateFileDto } from 'src/dynamic-file/dto/create-file.dto';
import { CreateDirDto } from 'src/dynamic-file/dto/create-dir.dto';

@Controller('dynamic-file')
@ApiTags("dynamic-file")
export class DynamicFileController {
  constructor(
    private readonly dynamicFileService: DynamicFileService,
  ) {}

  @Get()
  findAll() {
    return this.dynamicFileService.findAll();
  }

  @Post("files")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FilesInterceptor("files"))
  createFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Body() createFileDto: CreateFileDto) {
    return this.dynamicFileService.createFiles(files, createFileDto);
  }

  @Get("files/download")
  @ApiQuery({ type: [Number], name: "ids" })
  async downloadFiles(@Query("ids") ids: number | number[], @Res() res: Response) {
    const downloadId = randomUUID();
    if (!ids || (typeof ids != "number" && ids.length == 0)) {
      throw new BadRequestException("Please choose at lease 1 file");
    }

    fs.mkdirSync(downloadId);

    if (typeof ids == "string" || typeof ids == "number") {
      // download single file
      const f = await this.dynamicFileService.findOneFile(ids);
      const filepath = `${downloadId}/${f.name}.${f.ext}`;
      fs.writeFileSync(filepath, f.blob);
      res.status(200).download(filepath);
    } else {
      // download multiple files
      const files = await this.dynamicFileService.findManyFilesByIds(ids);
      files.forEach(f => {
        const filepath = `${downloadId}/${f.name}.${f.ext}`;
        fs.writeFileSync(filepath, f.blob);
      });

      const zippath = `${downloadId}.zip`
      const output = fs.createWriteStream(zippath);

      output.on("close", () => {
        res.status(200).download(zippath);
      });

      const archive = archiver("zip", {
        zlib: { level: 9 }
      });

      archive.pipe(output);

      archive.directory(downloadId, downloadId);

      archive.finalize();
    }

    res.on("finish", () => {
      rimrafSync([downloadId, `${downloadId}.zip`]);
    });
  }

  @Get('files/:id')
  async findOneFile(@Param('id') id: number, @Res() res: Response) {
    const f = await this.dynamicFileService.findOneFile(id);
    res.setHeader("Content-Type", f.mimetype);
    res.send(f.blob);
  }

  @Post("directories")
  createDir(@Body() createDirDto: CreateDirDto) {
    return this.dynamicFileService.createDir(createDirDto);
  }

  @Get("directories/:id")
  findOneDir(@Param('id') id: number) {
    return this.dynamicFileService.findOneDir(id);
  }

  @Delete()
  remove(@Query('ids') ids: number | number[]) {
    if (typeof ids == "string" || typeof ids == "number") {
      ids = [ids];
    }
    return this.dynamicFileService.remove(ids);
  }
}
