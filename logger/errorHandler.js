// errorHandler.js

const logger = require('./winston.config');

const logError = (route, error, next) => {
    logger.error(`Error occurred in ${route} route: ${error.message}`);
    next(error);
};

module.exports = logError;