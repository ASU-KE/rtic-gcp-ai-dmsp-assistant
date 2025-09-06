import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubmissionTable1754954357873 implements MigrationInterface {
  name = 'CreateSubmissionTable1754954357873';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`submission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`dmspText\` text NOT NULL, \`llmResponse\` text NOT NULL, \`submittedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`submission\``);
  }
}
