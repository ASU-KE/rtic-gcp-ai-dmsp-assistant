import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRubricTable1758052699942 implements MigrationInterface {
  name = 'CreateRubricTable1758052699942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`rubric\` (\`id\` int NOT NULL AUTO_INCREMENT, \`agency\` enum ('NSF', 'DOE', 'DOD', 'NIH', 'NASA', 'NOAA', 'USDA', 'USGS') NOT NULL, \`rubricText\` text NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9557bd1d6a6342ee92eed3eb8a\` (\`agency\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`rubric\``);
  }
}
