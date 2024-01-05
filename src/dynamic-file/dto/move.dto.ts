import { ApiProperty } from "@nestjs/swagger";

export class MoveDto {
    @ApiProperty({ type: [Number] })
    ids: number[];

    @ApiProperty({ required: false })
    parent?: number;
}