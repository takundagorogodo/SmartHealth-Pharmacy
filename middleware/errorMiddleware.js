
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true; // distinguishes our errors from unexpected crashes

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: "${err.value}" is not a valid ID`;
  return new AppError(message, 400);
};


const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `"${value}" is already registered for field "${field}". Please use a different value.`;
  return new AppError(message, 409);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError(
    `Validation failed on: ${errors.map((e) => e.field).join(", ")}`,
    400,
    errors
  );
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

// ─────────────────────────────────────────────
// DEV response — full error detail for debugging
// ─────────────────────────────────────────────
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,       
    error: err,
  });
};


const sendProdError = (err, res) => {
  // Operational errors → safe to show to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.validationErrors && { errors: err.validationErrors }),
    });
  }

  // Unexpected/programming errors → hide details from client
  console.error("UNEXPECTED ERROR 💥:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    
    if (error.name === "CastError")              error = handleCastError(error);
    if (error.code === 11000)                    error = handleDuplicateKeyError(error);
    if (error.name === "ValidationError")        error = handleValidationError(error);
    if (error.name === "JsonWebTokenError")      error = handleJWTError();
    if (error.name === "TokenExpiredError")      error = handleJWTExpiredError();

    sendProdError(error, res);
  }
};

export const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};