module.exports = {
  getHello: (req, res) => {
    return res.status(200).json({
      status: true,
      message: 'Hello!',
    });
  },
};
