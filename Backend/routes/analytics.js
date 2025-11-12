const express = require('express');
const router = express.Router();
const analytics = require('../controllers/analyticsController');

router.get('/sales-last-10-days', analytics.getSalesLast10Days);
router.get('/kpis', analytics.getKpis);
router.get('/recent-orders', analytics.getRecentOrders);
router.get('/top-credits', analytics.getTopCredits);

module.exports = router;
