import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required field"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required field"],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, "Duration is required field"]
    },
    ratings: {
        type: Number
    },
    totalRating: {
        type: Number
    },
    releaseYear: {
        type: Number,
        required: [true, "Release Year is a required field"]
    },
    releaseDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true, "Genre is a required field"]
    },
    director: {
        type: [String],
        required: [true, "Director is a required field"]
    },
    coverImage: {
        type: String,
        required: [true, "Cover Image is a required field"]
    },
    actors: {
        type: [String],
        required: [true, "Actor is a required field"]
    },
    price: {
        type: Number,
        required: [true, "Price is a required field"]
    }
});

const Movie = mongoose.model("Movie", movieSchema);

export default Movie