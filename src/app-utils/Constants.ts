const CONSTANTS = {
  DEFAULT_PASSWORD: "FinalProject1682!",

  PASSWORD_SALT: 10,

  ACCOUNT_REGISTERED: "Register Successfully",

  ACCOUNT_REGISTERED_BODY:
    "<p>Your account has been registered successfully. You can login to <a href=onemorepage.com><b>One more page</b></a> using your email.</p>",

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

  MINIMUM_PRICE: 10000,

  REGISTER_FOR_AUTHOR: "Register for author",

  WARN_FOR_VIOLATION: "Warned for violation",

  SERVER_ERROR: {
    USER_EXISTED: {
      errorCode: "01",
      message: "Email or phone number already in use",
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
      message: "Wrong email or password",
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

    USER_ALREADY_IN_FOLLOW_LIST: {
      errorCode: "025",
      message: "Already followed this user",
    },

    USER_NOT_IN_FOLLOW_LIST: {
      errorCode: "026",
      message: "User not followed",
    },

    USER_NOT_FOLLOWED_OR_FOLLOWING: {
      errorCode: "027",
      message: "User not in following or follower list",
    },

    PAYMENT_METHOD_EXISTED: {
      errorCode: "028",
      message: "Payment method existed",
    },

    PAYMENT_METHOD_NOT_EXIST: {
      errorCode: "029",
      message: "Payment method not exist",
    },

    PAYMENT_NOT_EXIST: {
      errorCode: "030",
      message: "Order not exist",
    },

    CANNOT_READ_OTHER_NOTIFICATION: {
      errorCode: "031",
      message: "Cannot read others' notifications",
    },

    CANNOT_FOLLOW_YOURSELF: {
      errorCode: "032",
      message: "Cannot follow yourself",
    },

    USER_ALR_LOCKED: {
      errorCode: "033",
      message: "User already locked",
    },

    USER_ALR_UNLOCKED: {
      errorCode: "034",
      message: "User already unlocked",
    },

    USER_ALR_PURCHASED_BOOK: {
      errorCode: "035",
      message: "User already purchased this book",
    },

    VALID_TIME_REQUIRED: {
      errorCode: "036",
      message: "Valid time required",
    },

    USER_ALR_BE_AUTHOR: {
      errorCode: "037",
      message: "User already is author",
    },

    USER_ALR_REGISTER_FOR_AUTHOR: {
      errorCode: "038",
      message: "User already registered for author",
    },

    REPORT_NOT_EXIST: {
      errorCode: "039",
      message: "Report not exist",
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

    AMOUNT_INVALID: "Amount invalid",

    PAYMENT_STATUS_INVALID: "Payment status invalid",

    BOOK_PRICE_MINIMUM: "Book price must be ${MINIMUM_PRICE} minimum",

    VALID_TIME_INVALID: "Valid time invalid",

    CURRENCY_INVALID: "Currency invalid",

    STATUS_INVALID: "Status invalid",
  },
};

export default CONSTANTS;
