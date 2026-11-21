
import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext.jsx";

import {
  forgotPassword,
  loginUser,
  registerUser,
} from "../../services/authService.js";

import "./Auth.css";

function Login() {
  const { setUser, setToken } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [isFlipped, setIsFlipped] = useState(false);

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot password popup states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Registration states
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loginLoading) return;

    setLoginError("");
    setLoginLoading(true);

    try {
      const data = await loginUser(email, password);

      setToken(data.token);
      setUser(data.user);

      let redirectTo = "/";

      if (data.user.role === "admin") {
        redirectTo = "/admin";
      } else if (data.user.role === "seller") {
        redirectTo = "/seller-dashboard";
      } else {
        redirectTo = location.state?.from || "/";
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setLoginError(
        error.message || "Unable to log in. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerLoading) return;

    setRegisterError("");
    setRegisterSuccess("");
    setRegisterLoading(true);

    try {
      await registerUser(name, registerEmail, registerPassword);

      setRegisterSuccess(
        "Registration successful! Please login."
      );

      setEmail(registerEmail);
      setPassword("");
      setRegisterPassword("");
      setName("");
      setRegisterEmail("");

      setTimeout(() => {
        setIsFlipped(false);
        setRegisterSuccess("");
      }, 1500);
    } catch (error) {
      setRegisterError(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  // Open forgot password popup
  const openForgotPassword = () => {
    setForgotEmail(email);
    setForgotMessage("");
    setForgotError("");
    setShowForgotPassword(true);
  };

  // Close forgot password popup
  const closeForgotPassword = () => {
    if (forgotLoading) return;

    setShowForgotPassword(false);
    setForgotMessage("");
    setForgotError("");
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (forgotLoading) return;

    setForgotMessage("");
    setForgotError("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }

    try {
      setForgotLoading(true);

      const data = await forgotPassword(forgotEmail.trim());

      setForgotMessage(data.message);
    } catch (error) {
      setForgotError(
        error.message || "Unable to process your request."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-scene">
        <div className={`auth-card ${isFlipped ? "flipped" : ""}`}>

          {/* LOGIN */}
          <section className="auth-face auth-front">
            <h2 className="auth-brand">ShopSphere</h2>

            <h1 className="auth-heading">Welcome Back!</h1>

            <p className="auth-subheading">
              Login to your ShopSphere account
            </p>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-form-group">
                <label htmlFor="login-email">
                  Email Address
                </label>

                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginLoading}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginLoading}
                  required
                />
              </div>

              <button
                type="button"
                className="auth-switch-btn auth-forgot-btn"
                onClick={openForgotPassword}
              >
                Forgot Password?
              </button>

              {loginError && (
                <p className="auth-error" role="alert">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loginLoading}
                aria-busy={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <span
                      className="auth-loading-spinner"
                      aria-hidden="true"
                    />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="auth-switch-text">
              Don't have an account?{" "}

              <button
                type="button"
                className="auth-switch-btn"
                disabled={loginLoading}
                onClick={() => {
                  setLoginError("");
                  setIsFlipped(true);
                }}
              >
                Register
              </button>
            </p>
          </section>

          {/* REGISTER */}
          <section className="auth-face auth-back">
            <h2 className="auth-brand">ShopSphere</h2>

            <h1 className="auth-heading">Create an Account</h1>

            <p className="auth-subheading">
              Join ShopSphere and start shopping
            </p>

            <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-form-group">
                <label htmlFor="register-name">
                  Full Name
                </label>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={registerLoading}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="register-email">
                  Email Address
                </label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={registerLoading}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="register-password">
                  Password
                </label>

                <input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={registerLoading}
                  minLength={8}
                  required
                />
              </div>

              {registerError && (
                <p className="auth-error" role="alert">
                  {registerError}
                </p>
              )}

              {registerSuccess && (
                <p className="auth-success" role="status">
                  {registerSuccess}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={registerLoading}
                aria-busy={registerLoading}
              >
                {registerLoading ? (
                  <>
                    <span
                      className="auth-loading-spinner"
                      aria-hidden="true"
                    />
                    <span>Creating account...</span>
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </form>

            <p className="auth-switch-text">
              Already have an account?{" "}

              <button
                type="button"
                className="auth-switch-btn"
                disabled={registerLoading}
                onClick={() => setIsFlipped(false)}
              >
                Login
              </button>
            </p>
          </section>

        </div>
      </div>

      {/* FORGOT PASSWORD POPUP */}
      {showForgotPassword && (
        <div
          className="auth-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForgotPassword();
            }
          }}
        >
          <div
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-heading"
          >
            <h2 id="forgot-password-heading">
              Forgot Password?
            </h2>

            <p>
              Enter your registered email address.
              We will send you a password reset link.
            </p>

            <form
              className="auth-form"
              onSubmit={handleForgotPassword}
            >
              <div className="auth-form-group">
                <label htmlFor="forgot-email">
                  Email Address
                </label>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(event) =>
                    setForgotEmail(event.target.value)
                  }
                  required
                  disabled={forgotLoading || Boolean(forgotMessage)}
                />
              </div>

              {forgotError && (
                <p className="auth-error" role="alert">
                  {forgotError}
                </p>
              )}

              {forgotMessage && (
                <p className="auth-success" role="status">
                  {forgotMessage}
                </p>
              )}

              {!forgotMessage && (
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <span
                        className="auth-loading-spinner"
                        aria-hidden="true"
                      />
                      <span>Checking email...</span>
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              )}

              {forgotMessage && (
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={closeForgotPassword}
                >
                  OK
                </button>
              )}

              {!forgotMessage && (
                <button
                  type="button"
                  className="auth-modal-close"
                  onClick={closeForgotPassword}
                  disabled={forgotLoading}
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Login;
