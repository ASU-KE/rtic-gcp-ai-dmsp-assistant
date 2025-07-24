import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../entities/user.entity';

export default setSeederFactory(User, (faker) => {
    const user = new User();
    user.firstName = faker.person.firstName('male');
    user.lastName = faker.person.lastName('male');
    user.username = faker.internet.userName(user.firstName, user.lastName);
    user.email = faker.internet.email(user.firstName, user.lastName);
    user.password = faker.internet.password(12, false, /[a-zA-Z0-9]/);
    user.role = 'USER'; // Default role, can be changed later

    return user;
})
