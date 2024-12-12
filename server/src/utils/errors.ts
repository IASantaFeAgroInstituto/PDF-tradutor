export class BaseError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}