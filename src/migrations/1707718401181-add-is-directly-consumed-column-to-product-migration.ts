import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDirectlyConsumedColumnToProductMigration1707718401181 implements MigrationInterface {
    name = 'AddIsDirectlyConsumedColumnToProductMigration1707718401181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "is_directly_consumed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_directly_consumed"`);
    }

}
