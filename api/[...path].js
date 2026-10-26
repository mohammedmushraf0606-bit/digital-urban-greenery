const { app, connectDB } = require('../server/server');

let connectionPromise;

module.exports = async (req, res) => {
  if (!connectionPromise) {
    connectionPromise = connectDB().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
  return app(req, res);
};
