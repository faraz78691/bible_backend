const { createLogger, transports, format } = require('winston');

// Create a logger instance
const logger = createLogger({
  level: 'error', // Set the logging level to 'error' or another appropriate level for production
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }), // Log errors to a file named error.log
    // You can add more transports like Console or others depending on your requirement
  ],
});

module.exports = logger;