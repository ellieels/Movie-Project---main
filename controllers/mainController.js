import Movie from '../models/Movie.js';
let savedMovies, totalMovies, totalTimesWatched, sortCriteria, favoriteMovies;

export const showMovies = async (req, res) => {
  await aggregateMoviesData();
  savedMovies = await Movie.find().sort(sortCriteria);
  res.render('index', { savedMovies, totalMovies, totalTimesWatched });
}


export const showFavorites = async (req, res) => 
  {
  try {
    // Find all movies with a rating of 5
    const favoriteMovies = await Movie.find({ rating: 5 });
    // Render the favorites page and pass the favoriteMovies data
    res.render('favorites', { favoriteMovies });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const searchMovies = async (req, res) => {
  const movieTitle = req.body.movieTitle;
  try {
    const response = await fetch(`http://www.omdbapi.com/?t=${movieTitle}&apikey=${process.env.MOVIE_KEY}`);
    const movie = await response.json();
    console.log(movie);
    res.render('results', {movie});
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
};




export const saveMovie = async (req, res) => {
  const { title, poster, director, year, boxOffice } = req.body;

  try {
    // Check if the movie already exists in the database
    let movie = await Movie.findOne({ title: title });

    if (movie) {
      // If movie exists, increment the timesWatched
      movie.timesWatched += 1;
      await movie.save();
      req.flash('update', `You already have ${movie.title} added!`)
    } else {
      // If movie doesn't exist, create a new one
      movie = new Movie({
        title,
        poster,
        director,
        year,
        boxOffice,
        timesWatched: 1
      });
      await movie.save();
      req.flash('update', `You added ${movie.title} successfully!`)
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const watchMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
      req.flash('update', `You watched ${movie.title}.  Did you know it grossed ${movie.boxOffice} at the box office?!`)
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};


export const rateMovie = async (req, res) => {
  const rating = req.params.rating;
  let ratingChange = 1;
  const movieId = req.params.id;
  if (rating == 'down'){
    ratingChange = -1;
  }
  
  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.rating = movie.rating + ratingChange;
      if (movie.rating < 0){
        movie.rating = 0;
      }
      
      if (movie.rating > 5){
        movie.rating = 5;
      }
      console.log(movie.rating);
      await movie.save();
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};


export const deleteMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const result = await Movie.findByIdAndDelete(movieId);
    console.log(result);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const sortMovies = async (req, res) => {
  try {
    sortCriteria = { timesWatched: -1 };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};


export const sortRating = async (req, res) => {
  try {
    sortCriteria = { rating: -1 };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};



const aggregateMoviesData = async () => {
  try {
    const result = await Movie.aggregate([
      {
        $group: {
          _id: null, // Grouping without a specific field to aggregate all documents
          totalMovies: { $sum: 1 }, // Counting the total number of movies
          totalTimesWatched: { $sum: "$timesWatched" } // Summing up all timesWatched values
        }
      }
    ]);

    if (result.length > 0) {
      // Extracting the result from the first element of the result array
      totalMovies = result[0].totalMovies;
      totalTimesWatched = result[0].totalTimesWatched;
      console.log(`Total Movies: ${totalMovies}, Total Times Watched: ${totalTimesWatched}`);
    } else {
      console.log("No data found.");
    }
  } catch (error) {
    console.error("Error aggregating movie data:", error);
  }
};
