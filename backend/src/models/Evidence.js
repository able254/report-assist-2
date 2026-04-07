class Evidence {
  #id;
  #reportId;
  #fileUrl;
  #metadata;
  #uploadedAt;

  constructor({ id, reportId, fileUrl, metadata = {}, uploadedAt = null }) {
    this.#id = id;
    this.#reportId = reportId;
    this.#fileUrl = fileUrl;
    this.#metadata = metadata;
    this.#uploadedAt = uploadedAt;
  }
}

module.exports = { Evidence };

