export default {
  getHello: (req: any, res: any) => {
    return res.status(200).json({
      status: true,
      message: 'Hello!',
    });
  },
};
