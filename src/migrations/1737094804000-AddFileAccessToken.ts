import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileAccessToken1737094804000 implements MigrationInterface {
    name = 'AddFileAccessToken1737094804000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 检查 file 表是否存在，如果不存在则创建
        const fileTableExists = await queryRunner.hasTable('file');
        if (!fileTableExists) {
            await queryRunner.query(`
                CREATE TABLE "file" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "filename" character varying NOT NULL,
                    "path" character varying NOT NULL,
                    "mimetype" character varying NOT NULL,
                    "size" integer NOT NULL,
                    "hash" character varying NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_file" PRIMARY KEY ("id")
                )
            `);
        }

        await queryRunner.query(`
            CREATE TABLE "file_access_token" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fileId" uuid NOT NULL,
                "token" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "expiresAt" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_file_access_token" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "file_access_token"
            ADD CONSTRAINT "FK_file_access_token_file"
            FOREIGN KEY ("fileId")
            REFERENCES "file"("id")
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "file_access_token" DROP CONSTRAINT "FK_file_access_token_file"
        `);
        await queryRunner.query(`
            DROP TABLE "file_access_token"
        `);
    }
}
