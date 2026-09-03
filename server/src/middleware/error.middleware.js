export const errorMiddleware = (err, req, res, next) => {
  let statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  let message = err.message || "Internal Server Error";

  let errors = err.errors || [];

  // ZOD VALIDATION ERROR
if (err.name === "ZodError") {
  statusCode = 400;
  message = "Validation failed";

  errors = err.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

  // MONGOOSE: INVALID OBJECT ID
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // MONGOOSE: VALIDATION ERROR
  if (err.name === "ValidationError") {
    statusCode = 400;

    errors = Object.values(err.errors).map((error) => error.message);

    message = "Validation failed";
  }

  // MONGODB: DUPLICATE KEY
  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyPattern || {})[0];

    message = `${field || "Field"} already exists`;
  }

  // ERROR LOG
  console.error(
    `[${new Date().toISOString()}] ` + `[Error] ${statusCode} - ${message}`,
  );

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // RESPONSE
  return res.status(statusCode).json({
    success: false,
    status: "error",
    statusCode,
    message,
    data: null,
    errors,

    path: req.originalUrl,
    method: req.method,

    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};
