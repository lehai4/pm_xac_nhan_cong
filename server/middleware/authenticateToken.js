const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Kiểm tra nếu token đã hết hạn
    const currentTime = Math.floor(Date.now() / 1000); // Lấy thời gian hiện tại theo giây
    if (decoded.exp < currentTime) {
      return res.status(401).json({ error: "Token has expired" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticateToken;
