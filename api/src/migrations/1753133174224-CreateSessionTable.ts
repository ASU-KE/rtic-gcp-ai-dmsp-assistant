import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionTable1753133174224 implements MigrationInterface {
  name = 'CreateSessionTable1753133174224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`session\` (\`expiredAt\` bigint NOT NULL, \`id\` varchar(255) NOT NULL, \`json\` text NOT NULL, \`destroyedAt\` datetime(6) NULL, INDEX \`IDX_28c5d1d16da7908c97c9bc2f74\` (\`expiredAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_28c5d1d16da7908c97c9bc2f74\` ON \`session\``
    );
    await queryRunner.query(`DROP TABLE \`session\``);
  }
}
