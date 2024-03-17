const CustomError = require("./CustomError");
const formatZodError = require("../libs/formatZodError");

module.exports = function asyncWrapper(routeHandler) {
  return (req, res, next) => {
    routeHandler(req, res, next).catch((error) => {
      // console.log("error", error);

      if (error instanceof CustomError) {
        if (error.validationError != null)
          error.validationError = formatZodError(error.validationError);

        return next(error);
      } else {
        return next(new CustomError());
      }
    });
  };
};
