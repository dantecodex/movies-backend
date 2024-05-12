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
    const msg = `There is already a movie with name ${err.keyValue.name}. Please use another`
    return new CustomError(msg, 400)
}

const validationErrorHandler = (err) => {
    const msg = Object.values(err.errors).map(value => {
        return value.message
    })

    return new CustomError([...msg])
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
        if(error.name === 'ValidationError')
            error = validationErrorHandler(error)
        prodErrors(res, error)
    }
}

export default globalErrorHandler