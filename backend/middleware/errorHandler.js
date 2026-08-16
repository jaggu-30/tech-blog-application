export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  // SQLite UNIQUE constraint violation
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.'
    });
  }

  // SQLite constraint errors
  if (err.message && err.message.includes('SQLITE_CONSTRAINT')) {
    return res.status(400).json({
      success: false,
      message: 'Database constraint error. Please check your input.'
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}
