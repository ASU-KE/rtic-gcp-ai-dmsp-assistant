// NB: filename moved from models/User to services/UserService
import { Repository } from 'typeorm';
import { User } from '../models/User';

export class UserService {
  private static repo: Repository<User>;

  static initialise(repo: Repository<User>) {
    UserService.repo = repo;
  }

  static createUser(user: Partial<User>) {
    return this.repo.save(user);
  }

  static findUser(query: Partial<User>) {
    return this.repo.findOneBy(query);
  }

  static updateUser(query: Partial<User>, updated: Partial<User>) {
    return this.repo.update(query, updated);
  }

  static findAllUsers(query: Partial<User>) {
    return this.repo.findBy(query);
  }

  static deleteUser(query: Partial<User>) {
    return this.repo.delete(query);
  }
}
