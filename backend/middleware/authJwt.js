const jwt = require("jsonwebtoken");
const { ACCESS_SECRET } = require("../utils/tokens");

function authJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Токен отсутствует" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Неверный формат токена" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Токен недействителен или истёк" });
  }
}

module.exports = authJwt;