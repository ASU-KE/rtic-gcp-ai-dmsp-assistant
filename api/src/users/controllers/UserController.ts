import UserModel from './../../common/models/User';

export default {
  getUser: (req: any, res: any) => {
    const {
      user: { userId },
    } = req;

    UserModel.findUser({ id: userId })
      .then((user: any) => {
        return res.status(200).json({
          status: true,
          data: user.toJSON(),
        });
      })
      .catch((err: any) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  updateUser: (req: any, res: any) => {
    const {
      user: { userId },
      body: payload,
    } = req;

    // IF the payload does not have any keys,
    // THEN we can return an error, as nothing can be updated
    if (!Object.keys(payload).length) {
      return res.status(400).json({
        status: false,
        error: {
          message: 'Body is empty, hence can not update the user.',
        },
      });
    }

    UserModel.updateUser({ id: userId }, payload)
      .then(() => {
        return UserModel.findUser({ id: userId });
      })
      .then((user: any) => {
        return res.status(200).json({
          status: true,
          data: user.toJSON(),
        });
      })
      .catch((err: any) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  deleteUser: (req: any, res: any) => {
    const {
      params: { userId },
    } = req;

    UserModel.deleteUser({ id: userId })
      .then((numberOfEntriesDeleted: any) => {
        return res.status(200).json({
          status: true,
          data: {
            numberOfUsersDeleted: numberOfEntriesDeleted,
          },
        });
      })
      .catch((err: any) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  getAllUsers: (req: any, res: any) => {
    UserModel.findAllUsers(req.query)
      .then((users: any) => {
        return res.status(200).json({
          status: true,
          data: users,
        });
      })
      .catch((err: any) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  changeRole: (req: any, res: any) => {
    const {
      params: { userId },
      body: { role },
    } = req;

    UserModel.updateUser({ id: userId }, { role })
      .then(() => {
        return UserModel.findUser({ id: userId });
      })
      .then((user: any) => {
        return res.status(200).json({
          status: true,
          data: user.toJSON(),
        });
      })
      .catch((err: any) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },
};
