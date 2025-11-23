import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1763889960300 implements MigrationInterface {
    name = 'Migrations1763889960300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("id" SERIAL NOT NULL, "filename" text NOT NULL, "url" text NOT NULL, "storageKey" text NOT NULL, "mimetype" text NOT NULL, "size" bigint NOT NULL, "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(), "uploaderId" integer, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_e529b53c18487a72385a6a440f0" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_e529b53c18487a72385a6a440f0"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
