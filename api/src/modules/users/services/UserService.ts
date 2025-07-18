import { DataSource, Repository } from 'typeorm';
import bcrypt from 'bcrypt';

import { User } from '../../../entities/User';
import config from '../../../config/app.config';

export class UserService {
  private repo: Repository<User>;

  constructor(appDataSource: DataSource) {
    this.repo = appDataSource.getRepository(User);
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

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, config.passwordSaltRounds);
    } catch (err) {
      console.error('Hashing failed:', err);
      throw err;
    }
  }

  async verifyPassword(
    hashedPassword: string,
    password: string
  ): Promise<boolean> {
    try {
      // Verify the password against the hash
      return await bcrypt.compare(password, hashedPassword);
    } catch (err) {
      console.error('Verification failed:', err);
      throw err;
    }
  }
}
