import mongoose from "mongoose";
import fs, { writeFileSync } from 'fs'
import validator from "validator";

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required field"],
        unique: true,
        maxlength: [100, "Movie name must not be more than 100 chaaracters"],
        minlength: [4, "Movie name must not be less than 4 chaaracters"],
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
        type: Number,
        // min: [1, "Rating must be between 1.0-5.0"],
        // max: [5, "Rating must be between 1.0-5.0"]
        validate: {
            validator: function (value) {
                return value >= 1 && value <= 5;
            },
            message: "Rating {{VALUE}} should be above 1 and below 5"
        }
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
        required: [true, "Genre is a required field"],
        // enum: {
        //     values: ["Sci-Fi", "Fantasy", "Mystery", "Thriller", "Horror", "Romance", "Historical Fiction", "Adventure", "Biography", "Non-fiction", "Crime", "Comedy", "Drama", "Action", "Poetry", "Young Adult", "Children's", "Self-help", "Suspense", "Literary Fiction"],
        //     message: "This genre does not exist"
        // }

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
    },
    createdBy: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// EXECUTE BEFORE THE DOCUMENT IS SAVED
// .save() or .create()
movieSchema.virtual('durationInHours').get(function () {
    return this.duration / 60;
})

movieSchema.pre('save', function (next) {
    this.createdBy = 'Anshul'
    next();
})

movieSchema.post('save', function (doc, next) {
    const content = `A new movie Document with name ${doc.name} has been created by ${doc.createdBy}\n`
    writeFileSync('./files/log.txt', content, { flag: 'a' }, (err) => {
        console.error(err);
    })
    next();
});

movieSchema.pre(/^find/, function (next) {
    this.find({ releaseDate: { $lte: Date.now() } })
    this.startTime = Date.now()
    next();
})

movieSchema.post(/^find/, function (docs, next) {
    this.find({ releaseDate: { $lte: Date.now() } });
    this.endTime = Date.now();

    const content = `Query Took ${this.endTime - this.startTime} milliseconds to fetch the documents.\n`
    writeFileSync('./files/log.txt', content, { flag: 'a' }, (err) => {
        console.error(err);
    })
    next();
})

const Movie = mongoose.model("Movie", movieSchema);

export default Movie