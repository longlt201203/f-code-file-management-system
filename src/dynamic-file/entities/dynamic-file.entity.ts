import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum DynamicFileTypeEnum {
    FILE,
    DIR
}

@Entity()
export class DynamicFile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ enum: DynamicFileTypeEnum })
    type: DynamicFileTypeEnum;

    @Column()
    name: string;

    @Column({ nullable: true })
    ext: string;

    @Column({ nullable: true })
    mimetype: string;

    @Column({ type: "blob", nullable: true })
    blob: Buffer;

    @ManyToOne(() => DynamicFile, df => df.children, { onDelete: "CASCADE" })
    parent: DynamicFile;

    @OneToMany(() => DynamicFile, df => df.parent)
    children: DynamicFile[];
}
