import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1765529878789 implements MigrationInterface {
    name = 'Migrations1765529878789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "isAnonymous" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "isAnonymous"`);
    }

}
