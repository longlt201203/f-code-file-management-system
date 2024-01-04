import { ApiProperty } from "@nestjs/swagger";

export class CreateFileDto {
    @ApiProperty({ type: [String] })
    names: string;

    @ApiProperty({ type: ["file"] })
    files: Blob[];

    @ApiProperty({ required: false })
    parent?: number;
}
