const express = require('express');
const router = express.Router();
const analytics = require('../controllers/analyticsController');
router.get('/sales-current-month',   analytics.getSalesCurrentMonth);
router.get('/sales-last-10-days', analytics.getSalesLast10Days);
router.get('/kpis', analytics.getKpis);
router.get('/recent-orders', analytics.getRecentOrders);
router.get('/top-credits', analytics.getTopCredits);
// routes/analytics.js
router.get('/sales-by-month', analytics.getSalesByMonth);
router.get('/sales-report/print-html', analytics.getSalesReportPrintHtml);
router.get('/sales-report/excel', analytics.getSalesReportExcel);

module.exports = router;
