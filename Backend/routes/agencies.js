const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');

// ===================== Agency Routes =====================

// Get all agencies
// GET http://localhost:5000/api/agencies
router.get('/', agencyController.getAgencies);

// Get a single agency by ID
// GET http://localhost:5000/api/agencies/:id
router.get('/:id', agencyController.getAgencyById);

// Create a new agency
// POST http://localhost:5000/api/agencies
router.post('/', agencyController.createAgency);

// Update an existing agency
// PUT http://localhost:5000/api/agencies/:id
router.put('/:id', agencyController.updateAgency);

// Delete an agency
// DELETE http://localhost:5000/api/agencies/:id
router.delete('/:id', agencyController.deleteAgency);

module.exports = router;
