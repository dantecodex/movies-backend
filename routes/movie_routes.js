import express from 'express';
import { getMovie, createMovie, getMovieByID, updateMovie, deleteMovie, getHighestRated, getMoviestats, getMovieByGenre } from '../controllers/movie_controller.js';
const router = express.Router();
import { protect, restrict } from '../controllers/aut_controller.js';

// router.param('id', checkId)

router.route('/highest-rated').get(getHighestRated, getMovie)

router.route('/movie-stats').get(getMoviestats)
router.route('/movie-genre/:genre').get(getMovieByGenre)

router.route('/')
    .get(protect, getMovie)
    .post(createMovie)


router.route('/:id')
    .get(protect, getMovieByID)
    .patch(updateMovie)
    .delete(protect, restrict('admin', "test"), deleteMovie)


export default router