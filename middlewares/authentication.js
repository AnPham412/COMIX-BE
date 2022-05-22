const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { AppError } = require("../helpers/utils");
const authMiddleware = {};

authMiddleware.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString)
      return next(new AppError(401, "Login required", "Validation Error"));
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return next(new AppError(401, "Token expired", "Validation Error"));
        } else {
          return next(
            new AppError(401, "Token is invalid", "Validation Error")
          );
        }
      }
      req.userId = payload._id;
      req.currentRole = payload.roles;
    });
    next();
  } catch (error) {
    next(error);
  }
};

authMiddleware.isAdmin = (req, res, next) => {
  try {
    const { currentRole } = req;
    if (currentRole === "admin") {
      return next();
    }
    throw new AppError(
      401,
      "You do not have the permission",
      "Permission error"
    );
  } catch (error) {
    next(error);
  }
};
module.exports = authMiddleware;
