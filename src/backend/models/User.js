class User {
  #userId;
  #username;
  #passwordHash;
  #role;
  #accountStatus;
  #sessionId;

  constructor({
    userId,
    username,
    passwordHash,
    role,
    accountStatus = 'ACTIVE',
    sessionId = null,
  }) {
    this.setUserId(userId);
    this.setUsername(username);
    this.setPasswordHash(passwordHash);
    this.setRole(role);
    this.setAccountStatus(accountStatus);
    this.setSessionId(sessionId);
  }

  getUserId() {
    return this.#userId;
  }
  setUserId(v) {
    if (v == null) {
      this.#userId = null;
      return;
    }
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) throw new Error('Invalid userId');
    this.#userId = n;
  }

  getUsername() {
    return this.#username;
  }
  setUsername(v) {
    if (typeof v !== 'string' || v.trim().length < 3) throw new Error('Invalid username');
    this.#username = v.trim();
  }

  getPasswordHash() {
    return this.#passwordHash;
  }
  setPasswordHash(v) {
    if (typeof v !== 'string' || v.length < 20) throw new Error('Invalid passwordHash');
    this.#passwordHash = v;
  }

  getRole() {
    return this.#role;
  }
  setRole(v) {
    const allowed = new Set(['CITIZEN', 'TRIAGE_OFFICER', 'ASSIGNED_OFFICER', 'SYSTEM_ADMIN']);
    if (!allowed.has(v)) throw new Error('Invalid role');
    this.#role = v;
  }

  getAccountStatus() {
    return this.#accountStatus;
  }
  setAccountStatus(v) {
    const allowed = new Set(['ACTIVE', 'INACTIVE']);
    if (!allowed.has(v)) throw new Error('Invalid accountStatus');
    this.#accountStatus = v;
  }

  getSessionId() {
    return this.#sessionId;
  }
  setSessionId(v) {
    if (v == null) {
      this.#sessionId = null;
      return;
    }
    if (typeof v !== 'string' || v.length < 16) throw new Error('Invalid sessionId');
    this.#sessionId = v;
  }
}

class Citizen extends User {
  #contactInfo;
  constructor(props) {
    super({ ...props, role: 'CITIZEN' });
    this.setContactInfo(props.contactInfo ?? null);
  }
  getContactInfo() {
    return this.#contactInfo;
  }
  setContactInfo(v) {
    if (v == null) {
      this.#contactInfo = null;
      return;
    }
    if (typeof v !== 'string' || v.trim().length < 3) throw new Error('Invalid contactInfo');
    this.#contactInfo = v.trim();
  }
}

class TriageOfficer extends User {
  #badgeId;
  constructor(props) {
    super({ ...props, role: 'TRIAGE_OFFICER' });
    this.setBadgeId(props.badgeId);
  }
  getBadgeId() {
    return this.#badgeId;
  }
  setBadgeId(v) {
    if (typeof v !== 'string' || v.trim().length < 2) throw new Error('Invalid badgeId');
    this.#badgeId = v.trim();
  }
}

class AssignedOfficer extends User {
  #badgeId;
  constructor(props) {
    super({ ...props, role: 'ASSIGNED_OFFICER' });
    this.setBadgeId(props.badgeId);
  }
  getBadgeId() {
    return this.#badgeId;
  }
  setBadgeId(v) {
    if (typeof v !== 'string' || v.trim().length < 2) throw new Error('Invalid badgeId');
    this.#badgeId = v.trim();
  }
}

class SystemAdmin extends User {
  constructor(props) {
    super({ ...props, role: 'SYSTEM_ADMIN' });
  }
}

module.exports = {
  User,
  Citizen,
  TriageOfficer,
  AssignedOfficer,
  SystemAdmin,
};

