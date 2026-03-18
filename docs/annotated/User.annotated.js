/**
 * Annotated reference copy of `src/backend/models/User.js`.
 * This file is for learning/documentation only (not used by the app at runtime).
 */

// Declares the base User class. It represents all accounts in the system.
class User {
  // Declares a private field to store the user's numeric database ID.
  #userId;
  // Declares a private field to store the username (login identifier).
  #username;
  // Declares a private field to store the bcrypt (or similar) password hash.
  #passwordHash;
  // Declares a private field to store the user's role (RBAC).
  #role;
  // Declares a private field to store whether the account is ACTIVE/INACTIVE.
  #accountStatus;
  // Declares a private field to store the current session ID (if attached).
  #sessionId;

  // Constructs a User from a single "props" object (named arguments pattern).
  constructor({
    // Incoming database ID (may be null for a new user not yet stored).
    userId,
    // Incoming username string.
    username,
    // Incoming password hash string.
    passwordHash,
    // Incoming role string.
    role,
    // Incoming account status; defaults to ACTIVE when not provided.
    accountStatus = 'ACTIVE',
    // Incoming session ID; defaults to null when not provided.
    sessionId = null,
  }) {
    // Validates and sets the userId via the setter (encapsulation).
    this.setUserId(userId);
    // Validates and sets the username via the setter.
    this.setUsername(username);
    // Validates and sets the password hash via the setter.
    this.setPasswordHash(passwordHash);
    // Validates and sets the role via the setter.
    this.setRole(role);
    // Validates and sets the accountStatus via the setter.
    this.setAccountStatus(accountStatus);
    // Validates and sets the sessionId via the setter.
    this.setSessionId(sessionId);
  }

  // Getter: returns the current userId value.
  getUserId() {
    // Returns the private userId field.
    return this.#userId;
  }
  // Setter: validates and stores the userId value.
  setUserId(v) {
    // If the caller passes null/undefined, treat it as "no id yet".
    if (v == null) {
      // Store null in the private field.
      this.#userId = null;
      // Exit early so we don't attempt numeric validation.
      return;
    }
    // Converts the incoming value to a Number (handles string IDs safely).
    const n = Number(v);
    // Ensures the ID is a positive integer; otherwise throw to prevent corruption.
    if (!Number.isInteger(n) || n <= 0) throw new Error('Invalid userId');
    // Stores the validated integer ID.
    this.#userId = n;
  }

  // Getter: returns the username.
  getUsername() {
    // Returns the private username field.
    return this.#username;
  }
  // Setter: validates and stores the username.
  setUsername(v) {
    // Enforces type and minimal length; trims whitespace to normalize.
    if (typeof v !== 'string' || v.trim().length < 3) throw new Error('Invalid username');
    // Stores the normalized username.
    this.#username = v.trim();
  }

  // Getter: returns the password hash (not a plaintext password).
  getPasswordHash() {
    // Returns the private passwordHash field.
    return this.#passwordHash;
  }
  // Setter: validates and stores the password hash.
  setPasswordHash(v) {
    // Enforces that a hash-like string exists (length check is a sanity check).
    if (typeof v !== 'string' || v.length < 20) throw new Error('Invalid passwordHash');
    // Stores the hash string.
    this.#passwordHash = v;
  }

  // Getter: returns the role.
  getRole() {
    // Returns the private role field.
    return this.#role;
  }
  // Setter: validates and stores the role.
  setRole(v) {
    // Defines the only allowed role strings (RBAC roles).
    const allowed = new Set(['CITIZEN', 'TRIAGE_OFFICER', 'ASSIGNED_OFFICER', 'SYSTEM_ADMIN']);
    // Rejects any role that isn't explicitly allowed.
    if (!allowed.has(v)) throw new Error('Invalid role');
    // Stores the validated role.
    this.#role = v;
  }

  // Getter: returns the account status.
  getAccountStatus() {
    // Returns the private accountStatus field.
    return this.#accountStatus;
  }
  // Setter: validates and stores the account status.
  setAccountStatus(v) {
    // Defines the allowed status values.
    const allowed = new Set(['ACTIVE', 'INACTIVE']);
    // Rejects invalid statuses to keep the domain model consistent.
    if (!allowed.has(v)) throw new Error('Invalid accountStatus');
    // Stores the validated status.
    this.#accountStatus = v;
  }

  // Getter: returns the sessionId (if one is attached to this model instance).
  getSessionId() {
    // Returns the private sessionId field.
    return this.#sessionId;
  }
  // Setter: validates and stores the sessionId.
  setSessionId(v) {
    // Allows clearing the session ID by passing null/undefined.
    if (v == null) {
      // Stores null when there is no session.
      this.#sessionId = null;
      // Exit early.
      return;
    }
    // Ensures the session ID looks like a real token (basic sanity check).
    if (typeof v !== 'string' || v.length < 16) throw new Error('Invalid sessionId');
    // Stores the session ID.
    this.#sessionId = v;
  }
}

// Defines the Citizen subclass for citizen users.
class Citizen extends User {
  // Private field for citizen contact info (email/phone/etc).
  #contactInfo;
  // Constructs a Citizen and forces the role to CITIZEN.
  constructor(props) {
    // Calls the base constructor while overriding role.
    super({ ...props, role: 'CITIZEN' });
    // Sets citizen-specific property, defaulting to null.
    this.setContactInfo(props.contactInfo ?? null);
  }
  // Getter: returns contact info.
  getContactInfo() {
    // Returns private contactInfo.
    return this.#contactInfo;
  }
  // Setter: validates and stores contact info.
  setContactInfo(v) {
    // Allows contact info to be absent.
    if (v == null) {
      // Stores null when not provided.
      this.#contactInfo = null;
      // Exit early.
      return;
    }
    // Validates contact info as a non-trivial string.
    if (typeof v !== 'string' || v.trim().length < 3) throw new Error('Invalid contactInfo');
    // Stores normalized contact info.
    this.#contactInfo = v.trim();
  }
}

// Defines the TriageOfficer subclass for triage users.
class TriageOfficer extends User {
  // Private field for officer badge ID.
  #badgeId;
  // Constructs a TriageOfficer and forces the role to TRIAGE_OFFICER.
  constructor(props) {
    // Calls the base constructor while overriding role.
    super({ ...props, role: 'TRIAGE_OFFICER' });
    // Sets the badgeId (required for officers).
    this.setBadgeId(props.badgeId);
  }
  // Getter: returns badgeId.
  getBadgeId() {
    // Returns private badgeId.
    return this.#badgeId;
  }
  // Setter: validates and stores badgeId.
  setBadgeId(v) {
    // Enforces a non-empty string badge id.
    if (typeof v !== 'string' || v.trim().length < 2) throw new Error('Invalid badgeId');
    // Stores normalized badgeId.
    this.#badgeId = v.trim();
  }
}

// Defines the AssignedOfficer subclass for case-assigned officers.
class AssignedOfficer extends User {
  // Private field for officer badge ID.
  #badgeId;
  // Constructs an AssignedOfficer and forces the role to ASSIGNED_OFFICER.
  constructor(props) {
    // Calls the base constructor while overriding role.
    super({ ...props, role: 'ASSIGNED_OFFICER' });
    // Sets the badgeId (required for officers).
    this.setBadgeId(props.badgeId);
  }
  // Getter: returns badgeId.
  getBadgeId() {
    // Returns private badgeId.
    return this.#badgeId;
  }
  // Setter: validates and stores badgeId.
  setBadgeId(v) {
    // Enforces a non-empty string badge id.
    if (typeof v !== 'string' || v.trim().length < 2) throw new Error('Invalid badgeId');
    // Stores normalized badgeId.
    this.#badgeId = v.trim();
  }
}

// Defines the SystemAdmin subclass for admin users.
class SystemAdmin extends User {
  // Constructs a SystemAdmin and forces the role to SYSTEM_ADMIN.
  constructor(props) {
    // Calls the base constructor while overriding role.
    super({ ...props, role: 'SYSTEM_ADMIN' });
  }
}

// Exports the classes so other modules can import and use them.
module.exports = {
  // Exports base User.
  User,
  // Exports Citizen subclass.
  Citizen,
  // Exports TriageOfficer subclass.
  TriageOfficer,
  // Exports AssignedOfficer subclass.
  AssignedOfficer,
  // Exports SystemAdmin subclass.
  SystemAdmin,
};

