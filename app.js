import express from "express"
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import sanitize from "express-mongo-sanitize"
import xss from "xss-clean"
import hpp from "hpp";

import moviesRouter from "./routes/movie_routes.js"
import authRouter from "./routes/auth_routes.js";
import userRouter from "./routes/user_routes.js";
import CustomError from "./utils/customError.js";
import globalErrorHandler from "./controllers/errorController.js";


const app = express();

app.use(helmet())
let limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000, // 60 minutes
    message: "We have recieved too many request from this IP, Please try again after one hour."
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); // middleware to access req.body
app.use(sanitize())
app.use(xss())
// app.use(hpp())

app.use(morgan('dev'));
app.use(express.static('./public'));
app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();
}) // custom middleware

app.use('/api/v1/movies', moviesRouter) // Middelware to router movie
app.use('/api/v1/auth', authRouter) // Middleware to router auth
app.use('/api/v1/user', userRouter) // Middleware to router user

app.all('*', (req, res, next) => {
    const err = new CustomError(`Invalid ${req.originalUrl} URL on the server`, 404)
    next(err);
}) // Default route for Invalid Url



app.use(globalErrorHandler)

export default app