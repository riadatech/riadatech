const MIN_PASSWORD_LENGTH = 8;

export function getAuthCopy(locale = "ar") {
  return locale === "ar"
    ? {
        loginTitle: "تسجيل الدخول",
        registerTitle: "إنشاء حساب",
        profileTitle: "الملف الشخصي",
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        loginButton: "تسجيل الدخول",
        registerButton: "إنشاء الحساب",
        loggingIn: "جارٍ تسجيل الدخول...",
        registering: "جارٍ إنشاء الحساب...",
        noAccount: "ليس لديك حساب؟",
        haveAccount: "لديك حساب؟",
        createAccount: "إنشاء حساب",
        signIn: "تسجيل الدخول",
        fullNameRequired: "الاسم الكامل مطلوب.",
        emailRequired: "البريد الإلكتروني مطلوب.",
        validEmailRequired: "يرجى إدخال بريد إلكتروني صحيح.",
        passwordRequired: "كلمة المرور مطلوبة.",
        passwordMin: `كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل.`,
      }
    : {
        loginTitle: "Login",
        registerTitle: "Register",
        profileTitle: "Profile",
        fullName: "Full name",
        email: "Email address",
        password: "Password",
        loginButton: "Login",
        registerButton: "Create account",
        loggingIn: "Signing in...",
        registering: "Creating account...",
        noAccount: "Don’t have an account?",
        haveAccount: "Already have an account?",
        createAccount: "Create one",
        signIn: "Login",
        fullNameRequired: "Full name is required.",
        emailRequired: "Email is required.",
        validEmailRequired: "Enter a valid email address.",
        passwordRequired: "Password is required.",
        passwordMin: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      };
}

export function translateAuthError(message = "", locale = "ar") {
  const normalized = String(message || "").trim();

  if (locale !== "ar") {
    return normalized || "Something went wrong.";
  }

  const dictionary = {
    "Name is required.": "الاسم الكامل مطلوب.",
    "Email is required.": "البريد الإلكتروني مطلوب.",
    "Enter a valid email address.": "يرجى إدخال بريد إلكتروني صحيح.",
    "Password is required.": "كلمة المرور مطلوبة.",
    "Password must be at least 8 characters long.":
      "كلمة المرور يجب أن تكون 8 أحرف على الأقل.",
    "An account with this email already exists.":
      "يوجد حساب بهذا البريد الإلكتروني بالفعل.",
    "User not found.": "لا يوجد حساب مرتبط بهذا البريد الإلكتروني.",
    "Authentication failed": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "Registration could not be completed.":
      "تعذر إكمال إنشاء الحساب. حاول مرة أخرى.",
    "Login could not be completed.": "تعذر إكمال تسجيل الدخول. حاول مرة أخرى.",
    "An error occurred": "حدث خطأ غير متوقع. حاول مرة أخرى.",
    "Database connection is not ready. Add a valid MONGO_URI to enable map analysis and saved reports.":
      "اتصال قاعدة البيانات غير جاهز حاليًا. يرجى التحقق من إعدادات الخادم.",
  };

  return dictionary[normalized] || normalized || "حدث خطأ غير متوقع. حاول مرة أخرى.";
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export { MIN_PASSWORD_LENGTH };
