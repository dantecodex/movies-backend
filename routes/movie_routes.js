import express from 'express';
import { getMovie, createMovie, getMovieByID, updateMovie, deleteMovie, getHighestRated } from '../controllers/movie_controller.js';
const router = express.Router();

// router.param('id', checkId)

router.route('/highest-rated').get(getHighestRated, getMovie)

router.route('/')
    .get(getMovie)
    .post(createMovie)


router.route('/:id')
    .get(getMovieByID)
    .patch(updateMovie)
    .delete(deleteMovie)


export default router