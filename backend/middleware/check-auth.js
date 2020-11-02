const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // required if token header begins with space separated word ie: "bearer a3klsif4wf"
    const decodedToken = jwt.verify(token,
    process.env.JWT_KEY
    );
    req.userData = {email: decodedToken.email, userId: decodedToken.userId};
    next();
  } catch (error) {
    res.status(401).json({
      message: 'You are not authenticated!'
    });
  }
};
