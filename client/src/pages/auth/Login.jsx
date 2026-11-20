import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { loginUser, registerUser } from "../../services/authService.js";
import "./Auth.css";

function Login() {
  // Authentication context
  const { setUser, setToken } = useContext(AuthContext);

  // Navigation
  const navigate = useNavigate();
  const location = useLocation();

  // Flip card state
  const [isFlipped, setIsFlipped] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");
    setLoginLoading(true);

    try {
      const data = await loginUser(email, password);

      setToken(data.token);
      setUser(data.user);

      const redirectTo = location.state?.from || "/";

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setLoginError(error.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // Register function
  const handleRegister = async (e) => {
    e.preventDefault();

    setRegisterError("");
    setRegisterSuccess("");
    setRegisterLoading(true);

    try {
      await registerUser(name, registerEmail, registerPassword);

      setRegisterSuccess("Registration successful! Please login.");

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
      setRegisterError(error.message || "Registration failed");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-scene">
        <div className={`auth-card ${isFlipped ? "flipped" : ""}`}>
          {/* LOGIN - FRONT SIDE */}
          <section className="auth-face auth-front">
            <h2 className="auth-brand">ShopSphere</h2>

            <h1 className="auth-heading">Welcome Back!</h1>

            <p className="auth-subheading">Login to your ShopSphere account</p>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-form-group">
                <label htmlFor="login-email">Email Address</label>

                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="login-password">Password</label>

                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && <p className="auth-error">{loginError}</p>}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loginLoading}
              >
                {loginLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="auth-switch-text">
              Don't have an account?{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => {
                  setLoginError("");
                  setIsFlipped(true);
                }}
              >
                Register
              </button>
            </p>
          </section>

          {/* REGISTER - BACK SIDE */}
          <section className="auth-face auth-back">
            <h2 className="auth-brand">ShopSphere</h2>

            <h1 className="auth-heading">Create an Account</h1>

            <p className="auth-subheading">
              Join ShopSphere and start shopping
            </p>

            <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-form-group">
                <label htmlFor="register-name">Full Name</label>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="register-email">Email Address</label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="register-password">Password</label>

                <input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>

              {registerError && <p className="auth-error">{registerError}</p>}

              {registerSuccess && (
                <p className="auth-success">{registerSuccess}</p>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={registerLoading}
              >
                {registerLoading ? "Creating Account..." : "Register"}
              </button>
            </form>

            <p className="auth-switch-text">
              Already have an account?{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => setIsFlipped(false)}
              >
                Login
              </button>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Login;
