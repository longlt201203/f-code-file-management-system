import { Controller, Get, Query, Render } from '@nestjs/common';
import { DynamicFileService } from 'src/dynamic-file/dynamic-file.service';
import { DynamicFile, DynamicFileTypeEnum } from 'src/dynamic-file/entities/dynamic-file.entity';
import * as hbs from "hbs";

@Controller('ui')
export class UiController {
    constructor(
        private readonly dynamicFileService: DynamicFileService
    ) {
        hbs.registerHelper("isFolder", (type: DynamicFileTypeEnum) => {
            return type && type == DynamicFileTypeEnum.DIR;
        });
    }

    @Get()
    @Render("index")
    async homePage(@Query("folderId") folderId?: number) {
        let dynamicFiles: Array<DynamicFile> = [];
        if (folderId) {
            const dir = await this.dynamicFileService.findOneDir(folderId);
            dynamicFiles = dir.children;
        } else {
            dynamicFiles = await this.dynamicFileService.findAll();
        }
        return { dynamicFiles };
    }
}
