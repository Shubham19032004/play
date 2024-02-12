const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req)).catch((err) => next(err));
  };
};

export { asyncHandler };
