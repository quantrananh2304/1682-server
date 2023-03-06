export class ServerError extends Error {
  public internalErrorCode: string;
  public httpErrorCode: number;
  public extraMessage: string;
  public errorMessage: string;

  constructor(
    internalErrorCode: string,
    message: string,
    extraMessage = "",
    httpErrorCode = 500
  ) {
    super(message);

    this.name = "ServerError";
    this.internalErrorCode = internalErrorCode;
    this.httpErrorCode = httpErrorCode;
    this.errorMessage = message;
    this.extraMessage = extraMessage;
  }
}
