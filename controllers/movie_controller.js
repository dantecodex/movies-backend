import Movie from '../models/movie_model.js';
import ApiFeatures from '../utils/apiFeatures.js';
import asyncErrorHandler from '../utils/asyncErrorHandler.js';
import CustomError from '../utils/customError.js';
import fs from 'fs'


// Middelware
const getHighestRated = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratings';
    next();
}

//Route Hnadler Function
const getMovie = asyncErrorHandler(async (req, res, next) => {
    const features = new ApiFeatures(Movie.find(), req.query).sort().limitFields().paginate();
    let movie = await features.query

    res.status(200).json({
        status: "Success",
        length: movie.length,
        data: {
            movie
        }
    })
    

})

const getMovieByID = asyncErrorHandler(async (req, res, next) => {
    // const movie = Movie.find({_id: req.params.id})
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        throw new CustomError("Movie with ID is not found", 404)
        // const err = new CustomError("Movie with ID is not found",404)
        // return next(err)
    }

    res.status(200).json({
        status: "Success",
        data: {
            movie
        }
    })

})

const createMovie = asyncErrorHandler(async (req, res, next) => {
    const movie = await Movie.create(req.body);
    res.status(201).json({
        status: "Success",
        data: {
            movie
        }
    })
})

const updateMovie = asyncErrorHandler(async (req, res, next) => {
    const updatedtMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!updateMovie) {
        throw new CustomError("Movie with ID is not found", 404)
    }
    res.status(200).json({
        status: "Success",
        data: {
            movie: updatedtMovie
        }
    })

})

const deleteMovie = asyncErrorHandler(async (req, res, next) => {
    const deleteMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deleteMovie) {
        throw new CustomError("Movie with ID is not found", 404)
    }
    res.status(204).json({
        status: 'Success',
        message: "The movie has been Deleted"
    })
})

const getMoviestats = asyncErrorHandler(async (req, res, next) => {
    const stats = await Movie.aggregate([
        { $match: { ratings: { $gte: 3 } } },
        {
            $group: {
                _id: '$releaseYear',
                avgRating: { $avg: `$ratings` },
                avgPrice: { $avg: `$price` },
                minPrice: { $min: `$price` },
                maxPrice: { $max: `$price` },
                totalPrice: { $sum: '$price' },
                movieCount: { $sum: 1 }
            }
        },
        { $sort: { minPrice: 1 } },
        { $match: { maxPrice: { $gte: 10 } } }

    ]);
    res.status(200).json({
        status: 'Success',
        count: stats.length,
        data: {
            stats
        }
    })

})

const getMovieByGenre = asyncErrorHandler(async (req, res, next) => {
    const genre = req.params.genre;
    const movie = await Movie.aggregate([
        { $unwind: '$genres' },
        {
            $group: {
                _id: '$genres',
                movieCount: { $sum: 1 },
                movie: { $push: "$name" },
            }
        },
        { $addFields: { genres: "$_id" } },
        { $project: { _id: 0 } },
        { $sort: { movieCount: -1 } },
        { $match: { genres: genre } }

    ]);
    res.status(200).json({
        status: 'Success',
        count: movie.length,
        data: {
            movie
        }
    })

})


export {
    getMovie,
    createMovie,
    getMovieByID,
    updateMovie,
    deleteMovie,
    getHighestRated,
    getMoviestats,
    getMovieByGenre
}