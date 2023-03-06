const ErrorMessage = {
  field: {
    email: {
      invalide: "errors.field.email.invalid",
      isExist: "errors.field.email.isExist",
    },
    phoneNumber: {
      invalid: "errors.field.phoneNumber.invalid",
      isExist: "errors.field.phoneNumber.isExist",
    },
    string: {
      empty: "errors.field.string.empty",
      invalid: "errors.field.string.invalid",
      length: "errors.field.string.length",
    },
    boolean: {
      invalid: "errors.field.string.invalid",
    },
    object: {
      empty: "errors.field.object.empty",
      invalid: "errors.field.object.invalid",
      length: "errors.field.object.length",
    },
    username: {
      isExist: "errors.field.username.isExist",
    },
    password: {
      match: "errors.field.password.match",
      length: "errors.field.password.length",
      invalid: "errors.field.password.invalid",
      beSame: "errors.field.password.beSame",
    },
    otp: {
      invalid: "errors.field.otp.invalid",
      expirate: "errors.field.otp.expirate",
      tooSoon: "errors.field.otp.tooSoon",
    },
    number: {
      empty: "errors.field.number.empty",
      invalid: "errors.field.number.invalid",
    },
    array: {
      empty: "errors.field.array.empty",
      invalid: "errors.field.array.invalid",
    },
  },
  server: {
    internal: "errors.server.internal",
    error: "errors.server.error",
    success: "errors.server.success",
    forbidden: "errors.server.forbidden",
    unauthorize: "errors.server.unauthorize",
    badRequest: "errors.server.badRequest",
  },
  user: {
    invalid: "errors.user.invalid",
    notFound: "errors.user.notFound",
  },
  auth: {
    missDeviceId: "errors.auth.missDeviceId",
    missFirebaseToken: "errors.auth.missFirebaseToken",
    forbidden: "errors.auth.forbidden",
    unauthorized: "errors.auth.unauthorized",
  },
  action: {
    changePassword: {
      duplicate: "errors.action.changePassword.duplicate",
    },
    failed: "errors.action.failed",
  },
  phoneBook: {
    notFound: "errors.phoneBook.notFound",
  },
  notification: {
    notFound: "errors.notification.notFound",
  },
  wallet: {
    notFound: "errors.wallet.notFound",
  },
  order: {
    notFound: "errors.order.notFound",
  },
  boxslot: {
    notHaveAvailable: "error.boxslot.notHaveAvailable",
  },
  payment: {
    paymentThan3Order: "error.order.paymentThan3Order",
  },
  thirdParty: {
    invalidIpAddress: "errors.thirdParty.invalidIpAddress",
    unauthorized: "errors.thirdParty.unauthorized",
    userNotFound: "errors.thirdParty.notFound",
  },
  banner: {
    duplicate: "errors.banner.duplicate",
    notFound: "errors.banner.notFound",
    files: "errors.files.empty",
    screenType: "screenType must be: 1: APP, or 2: LCD",
    position: "errors.position.notFound",
    date: "fromDate must less toDate",
    status:
      "status must be: -1: Hidden, 0: Ongoing, or 1: Pending, 2 or Stoping",
  },
  article: {
    notFound: "errors.article.notFound",
    files: "errors.files.empty",
    position: "errors.position.notFound",
    date: "fromDate must less toDate",
    status: "status must be: -1: Hidden, 0: Ongoing, or 1: Pending",
  },
  registerDriver: {
    idCard: "idCard/cccd must numeric and lenght 9 or 12 number",
  },
};

export default ErrorMessage;
