import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1748378375995 implements MigrationInterface {
    name = 'InitDatabase1748378375995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "image" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_951b8f1dfc94ac1d0301a14b7e1" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_cdc7776894e484eaed828ca0616" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("user_uuid" uuid NOT NULL, "role_uuid" uuid NOT NULL, CONSTRAINT "PK_6e8053f625564c1662c6602dcfc" PRIMARY KEY ("user_uuid", "role_uuid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2ebc2e1e2cb1d730d018893dae" ON "user_roles" ("user_uuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_0ea82c7b2302d7af0f8b789d79" ON "user_roles" ("role_uuid") `);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_2ebc2e1e2cb1d730d018893daef" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_0ea82c7b2302d7af0f8b789d797" FOREIGN KEY ("role_uuid") REFERENCES "roles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_0ea82c7b2302d7af0f8b789d797"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_2ebc2e1e2cb1d730d018893daef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ea82c7b2302d7af0f8b789d79"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ebc2e1e2cb1d730d018893dae"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
