class Report {
  #reportId;
  #citizenId;
  #caseNumber;
  #status;
  #chatTranscript;
  #triageOfficerId;
  #assignedOfficerId;
  #createdAt;
  #updatedAt;

  constructor({
    reportId,
    citizenId,
    caseNumber = null,
    status = 'PENDING',
    chatTranscript,
    triageOfficerId = null,
    assignedOfficerId = null,
    createdAt = null,
    updatedAt = null,
  }) {
    this.setReportId(reportId);
    this.setCitizenId(citizenId);
    this.setCaseNumber(caseNumber);
    this.setStatus(status);
    this.setChatTranscript(chatTranscript);
    this.setTriageOfficerId(triageOfficerId);
    this.setAssignedOfficerId(assignedOfficerId);
    this.setCreatedAt(createdAt);
    this.setUpdatedAt(updatedAt);
  }

  getReportId() {
    return this.#reportId;
  }
  setReportId(v) {
    if (v == null) {
      this.#reportId = null;
      return;
    }
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('Invalid reportId');
    this.#reportId = n;
  }

  getCitizenId() {
    return this.#citizenId;
  }
  setCitizenId(v) {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('Invalid citizenId');
    this.#citizenId = n;
  }

  getCaseNumber() {
    return this.#caseNumber;
  }
  setCaseNumber(v) {
    if (v == null) {
      this.#caseNumber = null;
      return;
    }
    if (typeof v !== 'string' || !/^RA-\d{4}-\d{5}$/.test(v)) throw new Error('Invalid caseNumber');
    this.#caseNumber = v;
  }

  getStatus() {
    return this.#status;
  }
  setStatus(v) {
    const allowed = new Set(['PENDING', 'ASSIGNED', 'CLOSED']);
    if (!allowed.has(v)) throw new Error('Invalid status');
    this.#status = v;
  }

  getChatTranscript() {
    return this.#chatTranscript;
  }
  setChatTranscript(v) {
    if (typeof v !== 'string' || v.trim().length < 1) throw new Error('Invalid chatTranscript');
    this.#chatTranscript = v;
  }

  getTriageOfficerId() {
    return this.#triageOfficerId;
  }
  setTriageOfficerId(v) {
    if (v == null) {
      this.#triageOfficerId = null;
      return;
    }
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('Invalid triageOfficerId');
    this.#triageOfficerId = n;
  }

  getAssignedOfficerId() {
    return this.#assignedOfficerId;
  }
  setAssignedOfficerId(v) {
    if (v == null) {
      this.#assignedOfficerId = null;
      return;
    }
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('Invalid assignedOfficerId');
    this.#assignedOfficerId = n;
  }

  getCreatedAt() {
    return this.#createdAt;
  }
  setCreatedAt(v) {
    if (v == null) {
      this.#createdAt = null;
      return;
    }
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) throw new Error('Invalid createdAt');
    this.#createdAt = d.toISOString();
  }

  getUpdatedAt() {
    return this.#updatedAt;
  }
  setUpdatedAt(v) {
    if (v == null) {
      this.#updatedAt = null;
      return;
    }
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) throw new Error('Invalid updatedAt');
    this.#updatedAt = d.toISOString();
  }

  canAssign() {
    return this.#status === 'PENDING';
  }

  markAssigned({ caseNumber, assignedOfficerId, triageOfficerId }) {
    if (!this.canAssign()) throw new Error('Report is not assignable');
    this.setCaseNumber(caseNumber);
    this.setAssignedOfficerId(assignedOfficerId);
    this.setTriageOfficerId(triageOfficerId);
    this.setStatus('ASSIGNED');
  }
}

module.exports = { Report };

