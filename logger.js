function timestamp() {
  return new Date().toISOString();
}

function info(...args) {
  console.log("[INFO]", timestamp(), ...args);
}

function warn(...args) {
  console.warn("[WARN]", timestamp(), ...args);
}

function error(...args) {
  console.error("[ERROR]", timestamp(), ...args);
}

function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
}

module.exports = {
  info,
  warn,
  error,
  requestLogger,
};
