import { Repository } from 'typeorm';
import { User } from '../entities/User';

export class UserService {
  private repo: Repository<User>;

  constructor(repo: Repository<User>) {
    this.repo = repo;
  }

  createUser(user: Partial<User>) {
    return this.repo.save(user);
  }

  findUser(query: Partial<User>) {
    return this.repo.findOneBy(query);
  }

  updateUser(query: Partial<User>, updated: Partial<User>) {
    return this.repo.update(query, updated);
  }

  findAllUsers(query: Partial<User>) {
    return this.repo.findBy(query);
  }

  deleteUser(query: Partial<User>) {
    return this.repo.delete(query);
  }
}
