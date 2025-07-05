module.exports = (err, req, res, next) => {
  console.error("Error:", err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};