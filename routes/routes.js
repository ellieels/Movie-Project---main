// Importing necessary modules
import express from 'express';
import * as mainController from '../controllers/mainController.js';

// Create a router object
const router = express.Router();

// Home page route
router.get('/', mainController.showMovies);
router.post('/favorites', mainController.showFavorites);
router.post('/search', mainController.searchMovies);
router.post('/save', mainController.saveMovie);
router.get('/watch/:id', mainController.watchMovie);
router.get('/rate/:id/:rating', mainController.rateMovie);

router.get('/delete/:id', mainController.deleteMovie);
router.post('/sort', mainController.sortMovies);
router.post('/sortrating', mainController.sortRating);

// Export the router
export default router;
