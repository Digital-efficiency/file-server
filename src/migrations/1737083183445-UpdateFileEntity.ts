import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFileEntity1737083183445 implements MigrationInterface {
    name = 'UpdateFileEntity1737083183445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 更新时间字段
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "files" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."created_at" IS '创建时间'`);
        await queryRunner.query(`ALTER TABLE "files" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."updated_at" IS '更新时间'`);
        
        // 更新 ID 注释
        await queryRunner.query(`COMMENT ON COLUMN "files"."id" IS '文件ID'`);

        // 处理 filename 字段
        await queryRunner.query(`UPDATE "files" SET "filename" = 'unknown_file' WHERE "filename" IS NULL`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "filename" TYPE character varying(255)`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "filename" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."filename" IS '文件名'`);

        // 处理 path 字段
        await queryRunner.query(`UPDATE "files" SET "path" = 'uploads/unknown_file' WHERE "path" IS NULL`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "path" TYPE character varying(255)`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "path" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."path" IS '文件路径'`);

        // 处理 mimetype 字段
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "mimetype" TYPE character varying(100)`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."mimetype" IS '文件类型'`);

        // 更新 size 注释
        await queryRunner.query(`COMMENT ON COLUMN "files"."size" IS '文件大小'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "files"."size" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."mimetype" IS NULL`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "mimetype" TYPE character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."path" IS NULL`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "path" TYPE character varying`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "path" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."filename" IS NULL`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "filename" TYPE character varying`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "filename" DROP NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."id" IS NULL`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "files" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "files" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }
}
