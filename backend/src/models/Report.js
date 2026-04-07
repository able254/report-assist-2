const REPORT_STATUSES = [
  'Pending',
  'Under Review',
  'Assigned',
  'In Progress',
  'Closed',
  'Escalated',
  'Rejected',
];

class Report {
  #id;
  #caseNumber;
  #status;
  #severityScore;
  #transcript;
  #structuredData;
  #createdBy;
  #assignedTo;
  #createdAt;
  #updatedAt;

  constructor({
    id,
    caseNumber,
    status = 'Pending',
    severityScore = 0,
    transcript = '',
    structuredData = {},
    createdBy,
    assignedTo = null,
    createdAt = null,
    updatedAt = null,
  }) {
    this.#id = id;
    this.#caseNumber = caseNumber;
    this.updateStatus(status);
    this.#severityScore = severityScore;
    this.#transcript = transcript;
    this.#structuredData = structuredData;
    this.#createdBy = createdBy;
    this.#assignedTo = assignedTo;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  updateStatus(newStatus) {
    if (!REPORT_STATUSES.includes(newStatus)) throw new Error('Invalid status');
    this.#status = newStatus;
  }

  assignOfficer(officerId) {
    this.#assignedTo = officerId;
  }

  calculateSeverity() {
    // Minimal implementation: uses Botpress confidenceScore as a proxy.
    const c = Number(this.#structuredData?.confidenceScore ?? 0);
    this.#severityScore = Math.max(0, Math.min(100, Math.round(c * 100)));
    return this.#severityScore;
  }
}

module.exports = { Report, REPORT_STATUSES };

