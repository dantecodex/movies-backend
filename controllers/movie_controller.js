import Movie from '../models/movie_model.js';


// Middelware
const getHighestRated = (req, res, next) => {
    console.log('middleware called');
    req.query.limit = '5';
    req.query.sort = '-ratings';
    next();
}

//Route Hnadler Function
const getMovie = async (req, res) => {
    try {
        // Filter {This won't work due to to the way pagination method implemented}
        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const queryObj = JSON.parse(queryStr);

        let movieQuery = Movie.find(queryObj);
        // Sorting
        let query = Movie.find();
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            movieQuery = query.sort(sortBy);
        }

        // Limiting fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            movieQuery = query.select(fields);
        }
        else {
            movieQuery = movieQuery.select('-__v');
        }

        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;
        const skip = (page - 1) * limit
        movieQuery = query.skip(skip).limit(limit); // This will cause filter method to not work
        // Page 1: 1-10, Page 2: 11-20: Page 3: 21-30
        if (req.query.page) {

            const moviesCount = await Movie.countDocuments();
            if (skip >= moviesCount) {
                throw new Error("This Page is not found");
            }
        }

        const movie = await movieQuery;

        res.status(200).json({
            status: "Success",
            length: movie.length,
            data: {
                movie
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message || "Failed to Fetch Movie from DB"
        })
    }
}

const getMovieByID = async (req, res) => {

    try {
        // const movie = Movie.find({_id: req.params.id})
        const movie = await Movie.findById(req.params.id);
        res.status(200).json({
            status: "Success",
            data: {
                movie
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message || "Failed to Fetch Movie using ID from DB"
        })
    }
}

const createMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json({
            status: "Success",
            data: {
                movie
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message || "Failed to Create Movie in DB"
        })
    }
}

const updateMovie = async (req, res) => {
    try {
        const updatedtMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json({
            status: "Success",
            data: {
                movie: updatedtMovie
            }
        })

    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message || "Failed to Update Movie in DB"
        })
    }
}

const deleteMovie = async (req, res) => {
    try {
        const deleteMovie = await Movie.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'Success',
            message: "The movie has been Deleted"
        })
    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: error.message || "Failed to delete movie from DB"
        })
    }
}


export {
    getMovie,
    createMovie,
    getMovieByID,
    updateMovie,
    deleteMovie,
    getHighestRated
}