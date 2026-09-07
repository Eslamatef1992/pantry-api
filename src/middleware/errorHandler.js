const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
