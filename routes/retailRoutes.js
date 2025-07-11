const express = require('express');
const router = express.Router();
const { createRetail, getAllRetail, deleteRetail, searchRetail, getCurrentPrices, getRetailAnalysis, searchAnalysisRetail, getAllProductsWithPerformance} = require('../controllers/retailController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createRetail)
    .get(protect, getAllRetail);

router.route('/:id')
    .delete(protect, deleteRetail);

router.get('/search', protect, searchRetail)
router.get('/current-prices', protect, getCurrentPrices);
router.get('/analysis', protect, getRetailAnalysis);
router.get('/search-product', protect, searchAnalysisRetail);
router.get('/all-products', protect, getAllProductsWithPerformance);



module.exports = router;
