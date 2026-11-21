import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../services/authService.js";
import "./Auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(token, password);
      setMessage(data.message);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (requestError) {
      setError(requestError.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-reset-card">
        <h1 className="auth-heading">Reset Password</h1>
        <p className="auth-subheading">
          Create a new password for your ShopSphere account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              disabled={loading}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reset-confirm-password">Confirm Password</label>
            <input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength={8}
              required
              disabled={loading}
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="auth-switch-text">
          <Link to="/login" className="auth-switch-btn">
            Back to Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default ResetPassword;
