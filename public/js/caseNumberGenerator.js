/**
 * Legacy helper (frontend-only). Case numbers must be generated server-side
 * to guarantee uniqueness and auditability.
 * @returns {string} The generated case number.
 */
function generateCaseNumber() {
    const year = new Date().getFullYear();
    // Generates a 5-digit random number
    const randomNumber = Math.floor(10000 + Math.random() * 90000).toString();
    return `RA-${year}-${randomNumber.substring(0, 5)}`;
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateCaseNumber };
}
