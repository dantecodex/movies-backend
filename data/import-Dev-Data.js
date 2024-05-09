import mongoose from "mongoose";
import 'dotenv/config'
import fs from "fs";
import Movie from "../models/movie_model.js";



mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    console.log('DB Connection Successful');
}).catch((error) => {
    console.log('Some error Occured while connecting to DB');
})

// const movies = JSON.parse(fs.readFileSync("./data/movies.json", 'utf-8'));
const movies = JSON.parse(fs.readFileSync("./data/movies.json", 'utf-8'))

const deleteMovies = async () => {
    try {
        await Movie.deleteMany();
        console.log('Data Succesfully Deleted');
    } catch (error) {
        console.log(error.message);
    }
    process.exit();

}


const importMovies = async () => {
    try {
        await Movie.create(movies);
        console.log('Data Succesfully Imported');
    } catch (error) {
        console.log(error.message);
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importMovies();
}
if (process.argv[2] === '--delete') {
    deleteMovies();
}