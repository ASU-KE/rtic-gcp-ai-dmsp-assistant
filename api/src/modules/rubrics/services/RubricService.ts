import { DataSource, Repository } from 'typeorm';
import { Rubric } from '../../../entities/rubric.entity';

export class RubricService {
  private repo: Repository<Rubric>;

  constructor(appDataSource: DataSource) {
    this.repo = appDataSource.getRepository(Rubric);
  }

  findRubric(query: Partial<Rubric>) {
    return this.repo.findOneBy(query);
  }

  findAllRubrics(): Promise<Rubric[]> {
    return this.repo.find();
  }

  createRubric(rubric: Partial<Rubric>) {
    return this.repo.save(rubric);
  }

  updateRubric(query: Partial<Rubric>, updated: Partial<Rubric>) {
    return this.repo.update(query, updated);
  }

  deleteRubric(query: Partial<Rubric>) {
    return this.repo.delete(query);
  }
}
