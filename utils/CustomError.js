class CustomError extends Error {
  #status;
  #validationError;

  constructor(status, message, validationError) {
    super(message);

    this.#status = status;
    this.#validationError = validationError;
  }

  get status() {
    return this.#status;
  }

  set status(status) {
    this.#status = status;
  }

  get validationError() {
    return this.#validationError;
  }

  set validationError(validationError) {
    this.#validationError = validationError;
  }
}

module.exports = CustomError;
