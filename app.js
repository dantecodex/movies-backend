import express from "express"
import morgan from "morgan";
import moviesRouter from "./routes/movie_routes.js"
import CustomError from "./utils/customError.js";
import globalErrorHandler from "./controllers/errorController.js";
import fs from 'fs'


const app = express();


app.use(express.json()); // middleware to access req.body
app.use(morgan('dev'));
app.use(express.static('./public'));
app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();
}) // custom middleware

app.use('/api/v1/movies', moviesRouter) // Middelware to router movie

app.all('/home', (req,res)=> {
    let htmlFile = fs.readFileSync('./public/template/demo.html','utf8')
    htmlFile = htmlFile.replace("@movieId@", req.query.movieId ?? '')
    console.log(req.body);
    res.send(htmlFile)
})
app.all('*', (req, res, next) => {
    const err = new CustomError(`Invalid ${req.originalUrl} URL on the server`, 404)
    next(err);
}) // Default route for Invalid Url

app.use(globalErrorHandler)

export default app