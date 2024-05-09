import express from "express"
import morgan from "morgan";
import moviesRouter from "./routes/movie_routes.js"

const app = express();

const logger = function (req, res, next) {
    console.log('Custom middleware logged');
    next();
}

app.use(express.json()); // middleware to access req.body
app.use(morgan('dev'));
app.use(express.static('./public'));
app.use(logger); // custom middleware
app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();
}) // custom middleware

app.use('/api/v1/movies', moviesRouter) // Middelware to router movie


export default app