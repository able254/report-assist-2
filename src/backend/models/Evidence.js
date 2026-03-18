class Evidence {
  #evidenceId;
  #reportId;
  #fileName;
  #filePath;
  #fileType;
  #uploadedAt;

  constructor({ evidenceId, reportId, fileName, filePath, fileType = null, uploadedAt = null }) {
    this.setEvidenceId(evidenceId);
    this.setReportId(reportId);
    this.setFileName(fileName);
    this.setFilePath(filePath);
    this.setFileType(fileType);
    this.setUploadedAt(uploadedAt);
  }

  getEvidenceId() {
    return this.#evidenceId;
  }
  setEvidenceId(v) {
    if (v == null) {
      this.#evidenceId = null;
      return;
    }
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('Invalid evidenceId');
    this.#evidenceId = n;
  }

  getReportId() {
    return this.#reportId;
  }
  setReportId(v) {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('Invalid reportId');
    this.#reportId = n;
  }

  getFileName() {
    return this.#fileName;
  }
  setFileName(v) {
    if (typeof v !== 'string' || v.trim().length < 1) throw new Error('Invalid fileName');
    this.#fileName = v.trim();
  }

  getFilePath() {
    return this.#filePath;
  }
  setFilePath(v) {
    if (typeof v !== 'string' || v.trim().length < 1) throw new Error('Invalid filePath');
    this.#filePath = v.trim();
  }

  getFileType() {
    return this.#fileType;
  }
  setFileType(v) {
    if (v == null) {
      this.#fileType = null;
      return;
    }
    if (typeof v !== 'string' || v.trim().length < 1) throw new Error('Invalid fileType');
    this.#fileType = v.trim();
  }

  getUploadedAt() {
    return this.#uploadedAt;
  }
  setUploadedAt(v) {
    if (v == null) {
      this.#uploadedAt = null;
      return;
    }
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) throw new Error('Invalid uploadedAt');
    this.#uploadedAt = d.toISOString();
  }
}

module.exports = { Evidence };

