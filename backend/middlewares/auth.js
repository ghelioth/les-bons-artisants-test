const jwt = require("jsonwebtoken");

module.exports.requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(payload);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid/expired token" + err });
  }
};
