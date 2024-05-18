import CustomError from "../utils/customError.js";

const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
    });
}

// Production Error

const castErrorHandler = (err) => {
    const msg = `Invalid value for ${err.path}: ${err.value}!`
    return new CustomError(msg, 400)
}

const duplicateKeyErrorHandler = (err) => {
    console.log(err);
    const msg = `There is already a data with ${Object.keys(err.keyValue)[0]} ${Object.values(err.keyValue)[0]}. Please use another`
    return new CustomError(msg, 400)
}

const validationErrorHandler = (err) => {
    const errors = Object.values(err.errors).map(value => value.message);
    const errMessage = errors.join('. ');
    const msg = `Invalid Input data: ${errMessage}`
    return new CustomError(msg, 400)
}

const expiredJwtHandler = (err) => {
    return new CustomError('JWT token has expired, Please Login again', 401)
}

const invalidJwtHandler = (err) => {
    return new CustomError('Invalid Token, Please Login again', 401)

}

const prodErrors = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }
    else {
        res.status(500).json({
            status: 'error',
            message: "Something went wrong, Please Try again later"
        })
    }
}


const globalErrorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        devErrors(res, error);
    } else if (process.env.NODE_ENV === 'production') {
        if (error.name === 'CastError')
            error = castErrorHandler(error)
        if (error.code === 11000)
            error = duplicateKeyErrorHandler(error)
        if (error.name === 'ValidationError')
            error = validationErrorHandler(error)
        if (error.name === 'TokenExpiredError')
            error = expiredJwtHandler(error)
        if (error.name === 'JsonWebTokenError')
            error = invalidJwtHandler(error)

        prodErrors(res, error)
    }
}

export default globalErrorHandler