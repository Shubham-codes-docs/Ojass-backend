const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let decoded;
  const header = req.get("Authorization");

  if (!header) {
    req.isAuth = false;
    const error = new Error("Authorization failed");
    error.statusCode = 401;
    return next(error);
  }
  const token = req.get("Authorization").split(" ")[1];

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next(err);
  }
  if (!decoded) {
    req.isAuth = false;
    const error = new Error("Authorization failed");
    error.statusCode = 401;
    return next(error);
  }

  req.userId = decoded.userId;
  req.username = decoded.username;
  req.type = decoded.type;
  req.isAuth = true;
  next();
};
