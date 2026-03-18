const express = require('express');
const router = express.Router();

// POST /api/reports/submit
router.post('/submit', (req, res) => {
    const { chatTranscript, evidence } = req.body;

    if (!chatTranscript) {
        return res.status(400).json({ success: false, message: 'Chat transcript is required.' });
    }

    // --- MOCK IMPLEMENTATION ---
    // TODO: Replace with actual database insertion logic
    console.log('Received new report submission:');
    console.log('Transcript:', chatTranscript);
    console.log('Evidence:', evidence);

    const newReport = {
        report_id: Math.floor(Math.random() * 1000),
        citizen_id: 1, // Mock citizen ID
        status: 'PENDING',
        chat_transcript: chatTranscript,
        created_at: new Date().toISOString()
    };

    res.status(201).json({
        success: true,
        message: 'Report submitted successfully. It is now pending review.',
        report: newReport
    });
});

module.exports = router;
