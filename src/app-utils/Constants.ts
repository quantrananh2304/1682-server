const CONSTANTS = {
  DEFAULT_PASSWORD: "FinalProject1682!",

  PASSWORD_SALT: 10,

  ACCOUNT_REGISTERED: "Register Successfully",

  ACCOUNT_REGISTERED_BODY:
    "<p>Your account {user.username} has been registered successfully. You can login to <a href=onemorepage.com><b>One more page</b></a> using your username or email.</p>",

  PASSWORD_MIN_LENGTH: 8,

  PASSWORD_MAX_LENGTH: 12,

  SUCCESS: "Success",

  ERROR: "Error",

  BAD_REQUEST: "Bad request",

  FORBIDDEN: "Forbidden",

  UNAUTHORIZED: "Unauthorized",

  INTERNAL_ERROR: "Internal error",

  SERVER_ERROR: {
    USER_EXISTED: {
      errorCode: "01",
      message: "Email, username or phone number already in use",
    },

    INTERNAL_EMAIL_ERROR: {
      errorCode: "05",
      message: "Internal email server error, email not sent",
    },

    UNKNOWN_DATA: {
      errorCode: "010",
      message: "Unknown parameters passed",
    },
  },

  VALIDATION_MESSAGE: {
    EMAIL_FORMAT_NOT_VALID: "Email format invalid",

    DATE_FORMAT_NOT_VALID: "Date format invalid",

    PASSWORD_NOT_VALID: "Password invalid",

    CONFIRM_PASSWORD_DIFFERENT: "Confirm password not the same",
  },
};

export default CONSTANTS;
