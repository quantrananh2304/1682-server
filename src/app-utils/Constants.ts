const CONSTANTS = {
  DEFAULT_PASSWORD: "FinalProject1682!",

  PASSWORD_SALT: 10,

  ACCOUNT_REGISTERED: "Register Successfully",

  ACCOUNT_REGISTERED_BODY:
    "<p>Your account {user.username} has been registered successfully. You can login to <a href=onemorepage.com><b>One more page</b></a> using your username or email.</p>",

  RESET_PASSWORD: "Reset password code",

  RESET_PASSWORD_BODY:
    "<p>You are requesting for a reset password code. Your code is <b>{user.resetPasswordCode}</b>.</p>",

  PASSWORD_MIN_LENGTH: 8,

  PASSWORD_MAX_LENGTH: 16,

  SUCCESS: "Success",

  ERROR: "Error",

  BAD_REQUEST: "Bad request",

  FORBIDDEN: "Forbidden",

  UNAUTHORIZED: "Unauthorized",

  INTERNAL_ERROR: "Internal error",

  RESET_PASSWORD_CODE_LENGTH: 8,

  SERVER_ERROR: {
    USER_EXISTED: {
      errorCode: "01",
      message: "Email, username or phone number already in use",
    },

    USER_NOT_EXIST: {
      errorCode: "02",
      message: "User not existed",
    },

    ACCOUNT_LOCKED: {
      errorCode: "03",
      message: "Account locked",
    },

    LOGIN_INFO_INVALID: {
      errorCode: "04",
      message: "Wrong username or password",
    },

    INTERNAL_EMAIL_ERROR: {
      errorCode: "05",
      message: "Internal email server error, email not sent",
    },

    WRONG_PASSWORD: {
      errorCode: "06",
      message: "Wrong password",
    },

    EMAIL_OR_CODE_WRONG: {
      errorCode: "07",
      message: "Email or reset code wrong",
    },

    NEW_PASSWORD_NOT_CHANGED: {
      errorCode: "08",
      message: "New password must be different from old password",
    },

    UNKNOWN_DATA: {
      errorCode: "010",
      message: "Unknown parameters passed",
    },

    ADMIN_ONLY: {
      errorCode: "011",
      message: "Required admin permission",
    },

    TOPIC_EXISTED: {
      errorCode: "012",
      message: "Topic already existed",
    },

    TOPIC_NOT_EXIST: {
      errorCode: "013",
      message: "Topic not exist",
    },

    AUTHOR_ONLY: {
      errorCode: "014",
      message: "Author only",
    },

    BOOK_NOT_EXIST: {
      errorCode: "015",
      message: "Book not exist",
    },

    CANNOT_UPDATE_OTHER_BOOK: {
      errorCode: "016",
      message: "Cannot update others' book",
    },

    REPORT_ALREADY_SUBMITTED: {
      errorCode: "017",
      message: "Report or feedback already submitted",
    },

    CANNOT_UPDATE_OTHER_POST: {
      errorCode: "018",
      message: "Cannot update others' post",
    },

    POST_NOT_EXIST: {
      errorCode: "019",
      message: "Post not exist",
    },

    BOOK_ALREADY_IN_FAV_LIST: {
      errorCode: "020",
      message: "Book already in favorite list",
    },

    BOOK_NOT_IN_FAV_LIST: {
      errorCode: "021",
      message: "Book not in favorite list",
    },

    COMMENT_NOT_EXIST: {
      errorCode: "022",
      message: "Comment not exist",
    },

    CANNOT_EDIT_OTHER_COMMENT: {
      errorCode: "023",
      message: "Cannot edit others' comment",
    },

    CANNOT_DELETE_OTHER_COMMENT: {
      errorCode: "024",
      message: "Cannot delete others' comment",
    },

    AUTHORIZATION_UNAUTHORIZED: {
      errorCode: "401",
      message: "Unauthorized",
    },

    AUTHORIZATION_FORBIDDEN: {
      errorCode: "403",
      message: "Authorization forbidden",
    },
  },

  VALIDATION_MESSAGE: {
    EMAIL_FORMAT_NOT_VALID: "Email format invalid",

    DATE_FORMAT_NOT_VALID: "Date format invalid",

    PASSWORD_NOT_VALID: "Password invalid",

    CONFIRM_PASSWORD_DIFFERENT: "Confirm password not the same",

    OBJECTID_INVALID: "Not a valid ObjectId",

    SORT_OPTION_INVALID: "Sort option invalid",

    ACTION_INVALID: "Action invalid",
  },
};

export default CONSTANTS;
