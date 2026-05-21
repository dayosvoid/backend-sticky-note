const handleError = (err, req, res, next) => {
  // Use 'let' so these variables can be safely modified below
  let statusCode = err.statusCode || 500; 
  let message = err.message || "Internal server error";
  let status = err.status || "error";
  let isOperational = err.isOperational || false;

  // 1. Handle MongoDB Duplicate Key Errors (Note: code is a number, not a string)
  if (err.code === 11000) {
    statusCode = 400;
    status = "fail";
    message = "Email address already exists. Please log in.";
    isOperational = true;
  }

  // 2. Handle Mongoose Validation Errors (Note: capital 'V')
  if (err.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    isOperational = true;
  }

  // Log to server console
  console.error(`[Error] ${req.method} ${req.url} - ${message}`);

  // 3. Handle expected operational errors
  if (isOperational) {
    return res.status(statusCode).json({
      success: false,
      statusCode: statusCode,
      status: status,
      message: message,
    });
  }

  // 4. Handle unexpected server bugs
  console.error("UNEXPECTED ERROR:", err);
  return res.status(500).json({
    success: false,
    status: "error",
    statusCode: 500,
    message: "Something went wrong. Please try again later.",
  });
};

// Export matches the function name exactly
module.exports = handleError;