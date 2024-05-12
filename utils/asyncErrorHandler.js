const asyncErrorHandler = (requestHandler) => {
    return (req, res, next) => {
        requestHandler(req, res, next).catch(err => next(err))
    }
}

export default asyncErrorHandler