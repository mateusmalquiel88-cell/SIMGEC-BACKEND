const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "change_this_secret";

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  if (req.query && req.query.token) {
    return req.query.token;
  }

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookie = cookies.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith("simgc_token="));
    if (tokenCookie) {
      return decodeURIComponent(tokenCookie.split("=")[1]);
    }
  }

  return null;
}

function authenticate(req, res, next) {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

function authorize(requiredRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    next();
  };
}

function verifyPageToken(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.redirect("/");
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.redirect("/");
  }
}

module.exports = { authenticate, authorize, verifyPageToken, SECRET };
