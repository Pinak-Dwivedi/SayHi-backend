module.exports = function formatZodError(error) {
  const errorObj = {};

  error.errors.forEach((err) => {
    errorObj[err.path[0]] = err.message;
  });

  return errorObj;
};
