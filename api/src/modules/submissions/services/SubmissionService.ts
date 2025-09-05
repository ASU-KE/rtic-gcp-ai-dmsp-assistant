import { DataSource, Repository } from 'typeorm';
import { Submission } from '../../../entities/submission.entity';

export class SubmissionService {
  private repo: Repository<Submission>;

  constructor(appDataSource: DataSource) {
    this.repo = appDataSource.getRepository(Submission);
  }

  findAllSubmissions(): Promise<Submission[]> {
    return this.repo.find();
  }
}
