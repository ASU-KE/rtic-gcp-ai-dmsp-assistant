import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRubricTable1757729936971 implements MigrationInterface {
  name = 'CreateRubricTable1757729936971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`rubric\` (\`agency\` varchar(255) NOT NULL, \`rubricText\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`agency\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`rubric\``);
  }
}
