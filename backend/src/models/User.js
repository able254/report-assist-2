class User {
  #id;
  #name;
  #email;
  #passwordHash;
  #role;
  #accountStatus;
  #sessionVersion;
  #createdAt;
  #updatedAt;

  constructor({
    id,
    name,
    email,
    passwordHash = null,
    role,
    accountStatus = 'Active',
    sessionVersion = 0,
    createdAt = null,
    updatedAt = null,
  }) {
    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#passwordHash = passwordHash;
    this.#role = role;
    this.#accountStatus = accountStatus;
    this.#sessionVersion = sessionVersion;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
  get email() {
    return this.#email;
  }
  get role() {
    return this.#role;
  }
  get accountStatus() {
    return this.#accountStatus;
  }
  get sessionVersion() {
    return this.#sessionVersion;
  }

  validatePassword() {
    throw new Error('Password validation handled by Supabase Auth');
  }

  updateAccountStatus(newStatus) {
    this.#accountStatus = newStatus;
  }

  incrementSessionVersion() {
    this.#sessionVersion += 1;
    return this.#sessionVersion;
  }
}

module.exports = { User };

