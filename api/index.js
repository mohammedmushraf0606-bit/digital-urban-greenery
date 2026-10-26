const { app, connectDB } = require('../server/server');

let dbPromise;

module.exports = async (req, res) => {
  if (!dbPromise) {
    dbPromise = connectDB();
  }

  await dbPromise;
  return app(req, res);
};