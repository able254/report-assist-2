const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');

function createTriageRoutes({ reportService }) {
    router.use(requireRole(['TRIAGE_OFFICER']));

    // POST /api/triage/assign
    router.post('/assign', async (req, res, next) => {
        try {
            const { reportId, assignedOfficerId } = req.body;

            if (!reportId || !assignedOfficerId) {
                return res.status(400).json({ success: false, message: 'Report ID and Assigned Officer ID are required.' });
            }

            const updatedReport = await reportService.assign({
                triageOfficerId: req.user.userId,
                reportId: Number(reportId),
                assignedOfficerId: Number(assignedOfficerId),
            });

            res.status(200).json({
                success: true,
                message: `Case ${updatedReport.case_number} created and assigned successfully.`,
                report: updatedReport
            });
        } catch (e) {
            next(e);
        }
    });

    return router;
}

module.exports = { createTriageRoutes };
