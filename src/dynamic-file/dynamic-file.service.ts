import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { In, IsNull, Repository } from 'typeorm';
import { DynamicFile, DynamicFileTypeEnum } from 'src/dynamic-file/entities/dynamic-file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFileDto } from 'src/dynamic-file/dto/create-file.dto';
import { CreateDirDto } from 'src/dynamic-file/dto/create-dir.dto';
import { MoveDto } from 'src/dynamic-file/dto/move.dto';

@Injectable()
export class DynamicFileService {
  constructor(
    @InjectRepository(DynamicFile)
    private readonly dynamicFileRepository: Repository<DynamicFile>
  ) {}

  findAll() {
    return this.dynamicFileRepository.find({ where: { parent: IsNull() }, select: { id: true, name: true, mimetype: true, type: true } });
  }

  async createFiles(files: Array<Express.Multer.File>, createFileDto: CreateFileDto) {
    const nameArr = createFileDto.names.split(",");
    let filesArr: Array<DynamicFile> = [];
    for (let i = 0; i < files.length; i++) {
      const originalFilenameParts = files[i].originalname.split(".");
      const filename = nameArr[i] ? nameArr[i] : originalFilenameParts[0];
      const f = this.dynamicFileRepository.create({
        type: DynamicFileTypeEnum.FILE,
        name: filename,
        ext: originalFilenameParts[1] ? originalFilenameParts[1] : "",
        mimetype: files[i].mimetype,
        blob: files[i].buffer,
        parent: createFileDto.parent && await this.isDir(createFileDto.parent) ? { id: createFileDto.parent } : undefined
      });
      filesArr.push(f);
    }
    filesArr = await this.dynamicFileRepository.save(filesArr);
    return filesArr.map((item) => item.id);
  }

  async findOneFile(id: number) {
    const f = await this.dynamicFileRepository.findOne({ where: { id: id, type: DynamicFileTypeEnum.FILE } });
    if (!f) {
      throw new NotFoundException("File not found");
    }
    return f;
  }

  async findManyFilesByIds(ids: number[]) {
    return await this.dynamicFileRepository.find({ where: { id: In(ids), type: DynamicFileTypeEnum.FILE } });
  }

  async createDir(createDirDto: CreateDirDto) {
    const dir = this.dynamicFileRepository.create({
      type: DynamicFileTypeEnum.DIR,
      name: createDirDto.name,
      parent: createDirDto.parent && await this.isDir(createDirDto.parent) ? { id: createDirDto.parent } : undefined
    });
    return this.dynamicFileRepository.save(dir);
  }

  async findOneDir(id: number) {
    const f = await this.dynamicFileRepository.findOne({ where: { id: id, type: DynamicFileTypeEnum.DIR }, relations: { children: true }, select: { children: { name: true, type: true, ext: true, mimetype: true } } });
    if (!f) {
      throw new NotFoundException("Folder not found");
    }
    return f;
  }

  async remove(ids: number[]) {
    return await this.dynamicFileRepository.delete({ id: In(ids) } );
  }

  async isDir(id: number) {
    return await this.dynamicFileRepository.exists({ where: { id: id, type: DynamicFileTypeEnum.DIR } });
  }

  async move(dto: MoveDto) {
    if (dto.parent) {
      if (dto.ids.find(id => id == dto.parent)) {
        throw new BadRequestException("Cannot move a folder/file to itself");
      }

      if (!(await this.dynamicFileRepository.exists({ where: { id: dto.parent, type: DynamicFileTypeEnum.DIR } }))) {
        throw new BadRequestException("Folder is not existed");
      }
    }
    return await this.dynamicFileRepository.update({ id: In(dto.ids) }, { parent: { id: dto.parent ? dto.parent : null } });
  }
}
