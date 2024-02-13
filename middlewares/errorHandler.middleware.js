function errorHandler(error, req, res, next) {
  error.status = error.status || 500;
  error.message = error.message || "Internal server error!";

  return res.status(error.status).json({
    success: false,
    message: error.message,
    validationError:
      error.validationError != null ? error.validationError : undefined,
  });
}

module.exports = errorHandler;
