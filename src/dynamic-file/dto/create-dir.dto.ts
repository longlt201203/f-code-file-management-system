import { ApiProperty } from "@nestjs/swagger";

export class CreateDirDto {
    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    parent?: number;
}
