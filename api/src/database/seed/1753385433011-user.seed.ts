import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User } from '../../entities/user.entity';

import * as password from 'secure-random-password';

export class UserSeed1753385433011 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        // factoryManager: SeederFactoryManager
    ): Promise<void> {
      const repository =  dataSource.getRepository(User);
        await repository.insert([
            {
                username: 'ndrollin',
                firstName: 'Nathan',
                lastName: 'Rollins',
                email: 'ndrollin@asu.edu',
                role: 'admin',
                password: password.randomPassword({
                    length: 24,
                }),
            }
        ]);
    }
}
