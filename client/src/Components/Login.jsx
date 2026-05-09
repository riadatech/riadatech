import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";

import SiteFooter from "./SiteFooter.jsx";
import "./AuthPage.css";
import { clearAuthError, loginUser } from "../store/authSlice";
import { getAuthCopy, isValidEmail, translateAuthError } from "../utils/authMessages";

function Login({ locale = "ar" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const text = getAuthCopy(locale);
  const direction = locale === "ar" ? "rtl" : "ltr";
  const redirectPath = useMemo(
    () => location.state?.from?.pathname || "/profile",
    [location.state]
  );

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitError("");
    dispatch(clearAuthError());
  }

  function validateForm() {
    const nextErrors = {};

    if (!values.email.trim()) {
      nextErrors.email = text.emailRequired;
    } else if (!isValidEmail(values.email.trim())) {
      nextErrors.email = text.validEmailRequired;
    }

    if (!values.password) {
      nextErrors.password = text.passwordRequired;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const action = await dispatch(
      loginUser({
        email: values.email.trim(),
        password: values.password,
      })
    );

    setIsSubmitting(false);

    if (loginUser.fulfilled.match(action)) {
      navigate(redirectPath, { replace: true });
      return;
    }

    setSubmitError(translateAuthError(action.payload, locale));
  }

  return (
    <div className="rt-auth-page" dir={direction}>
      <main className="rt-auth-main rt-auth-center">
        <div className="rt-auth-card-simple">
          <h1 className="rt-auth-card-title">{text.loginTitle}</h1>

          <form className="rt-auth-form" onSubmit={handleSubmit} noValidate>
            <div className="rt-auth-field">
              <label htmlFor="email">{text.email}</label>
              <div className="rt-auth-input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email ? <div className="rt-auth-field-error">{errors.email}</div> : null}
            </div>

            <div className="rt-auth-field">
              <label htmlFor="password">{text.password}</label>
              <div className="rt-auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
              {errors.password ? (
                <div className="rt-auth-field-error">{errors.password}</div>
              ) : null}
            </div>

            {submitError ? <div className="rt-auth-submit-error">{submitError}</div> : null}

            <button className="rt-auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? text.loggingIn : text.loginButton}
            </button>
          </form>

          <p className="rt-auth-card-switch">
            {text.noAccount}{" "}
            <Link to="/register" className="rt-auth-link">
              {text.createAccount}
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}

export default Login;
