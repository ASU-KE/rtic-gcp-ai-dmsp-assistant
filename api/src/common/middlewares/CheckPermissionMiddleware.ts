import UserModel from '../models/User';

export default {
  has: (role: any) => {
    return (req: any, res: any, next: any) => {
      const {
        user: { userId },
      } = req;

      UserModel.findUser({ id: userId }).then((user: any) => {
        // IF user does not exist in our database, means something is fishy
        // THEN we will return forbidden error and ask user to login again
        if (!user) {
          return res.status(403).json({
            status: false,
            error: 'Invalid access token provided, please login again.',
          });
        }

        const userRole = user.role;

        // IF user does not possess the required role
        // THEN return forbidden error
        if (userRole !== role) {
          return res.status(403).json({
            status: false,
            error: `You need to be a ${role} to access this endpoint.`,
          });
        }

        next();
      });
    };
  },
};
