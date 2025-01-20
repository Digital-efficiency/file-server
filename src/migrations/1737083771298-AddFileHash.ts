import { MigrationInterface, QueryRunner } from "typeorm";
import * as crypto from 'crypto';
import * as fs from 'fs';
import { promisify } from 'util';

export class AddFileHash1737083771298 implements MigrationInterface {
    name = 'AddFileHash1737083771298'

    private async calculateFileHash(filePath: string): Promise<string> {
        try {
            const hash = crypto.createHash('sha256');
            const fileBuffer = await promisify(fs.readFile)(filePath);
            hash.update(fileBuffer);
            return hash.digest('hex');
        } catch (error) {
            console.error(`Error calculating hash for file ${filePath}:`, error);
            return 'default-hash-' + Date.now(); // 如果文件不存在，生成一个默认hash
        }
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 先添加 hash 列，允许为空
        await queryRunner.query(`ALTER TABLE "files" ADD "hash" character varying(64)`);
        await queryRunner.query(`COMMENT ON COLUMN "files"."hash" IS '文件哈希值'`);

        // 2. 获取所有现有文件记录
        const files = await queryRunner.query(`SELECT id, path FROM "files"`);

        // 3. 为每个文件计算并更新 hash
        for (const file of files) {
            const hash = await this.calculateFileHash(file.path);
            await queryRunner.query(
                `UPDATE "files" SET "hash" = $1 WHERE "id" = $2`,
                [hash, file.id]
            );
        }

        // 4. 将 hash 列设置为非空
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "hash" SET NOT NULL`);

        // 5. 创建索引
        await queryRunner.query(`CREATE INDEX "IDX_b7fd70eedc0d46577c63639855" ON "files" ("hash") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b7fd70eedc0d46577c63639855"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "hash"`);
    }
}
