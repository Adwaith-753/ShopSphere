
import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  UserRound,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext.jsx";

import "./Profile.css";

function Profile() {
  const {
    user,
    loading,
    updateProfile,
    verifyPassword,
    changePassword,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  // Personal information states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password editing states
  const [passwordMode, setPasswordMode] = useState("readonly");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeToken, setPasswordChangeToken] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Keep profile information synchronized with AuthContext
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Start profile editing
  const handleEdit = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setProfileMessage("");
    setProfileError("");
    setIsEditing(true);
  };

  // Cancel profile editing
  const handleCancel = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setProfileMessage("");
    setProfileError("");
    setIsEditing(false);
  };

  // Save profile information
  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileMessage("");

      const data = await updateProfile(name.trim(), email.trim());

      setName(data.user.name);
      setEmail(data.user.email);
      setIsEditing(false);
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileError(error.message || "Unable to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Reset password editing states
  const resetPasswordEditing = () => {
    setPasswordMode("readonly");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordChangeToken("");
    setPasswordError("");
    setPasswordMessage("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Start password editing
  const handlePasswordEdit = () => {
    resetPasswordEditing();
    setPasswordMode("verify");
  };

  // Verify current password
  const handleVerifyPassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError("");
      setPasswordMessage("");

      const data = await verifyPassword(currentPassword);

      setPasswordChangeToken(data.passwordChangeToken);
      setCurrentPassword("");
      setPasswordMode("new");
      setPasswordMessage("Current password verified successfully.");
    } catch (error) {
      setPasswordError(
        error.message || "Current password verification failed."
      );
      setPasswordChangeToken("");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Save new password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (!passwordChangeToken) {
      setPasswordError("Please verify your current password again.");
      setPasswordMode("verify");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError("");
      setPasswordMessage("");

      await changePassword(newPassword, passwordChangeToken);

      // AuthContext logs out the user after a successful change
      resetPasswordEditing();

      navigate("/login", { replace: true });
    } catch (error) {
      setPasswordError(
        error.message || "Unable to change your password."
      );

      // Require fresh verification after an unsuccessful save
      setPasswordChangeToken("");
      setPasswordMode("verify");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Loading your profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-loading">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="customer-profile-page">
      <div className="customer-profile-container">

        {/* Page Heading */}
        <div className="customer-profile-heading">
          <h1>My Profile</h1>
          <p>
            Manage your personal information and account security
          </p>
        </div>

        <div className="customer-profile-card">

          {/* Avatar */}
          <div className="customer-profile-avatar">
            <UserRound size={42} />
          </div>

          <h2>{isEditing ? name || "Your Name" : user.name}</h2>

          <p className="customer-profile-role">
            {user.role || "Customer"}
          </p>

          <div className="customer-profile-divider" />

          {/* PERSONAL INFORMATION SECTION */}
          <section className="profile-section">

            <div className="profile-section-heading">
              <div>
                <h3>Personal Information</h3>
                <p>Manage your name and email address</p>
              </div>
            </div>

            <form onSubmit={handleSave}>

              {/* Full Name */}
              <div className="customer-profile-info">
                <div className="customer-profile-info-icon">
                  <UserRound size={20} />
                </div>

                <div className="customer-profile-field">
                  <label htmlFor="profile-name">Full Name</label>

                  {isEditing ? (
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      maxLength={100}
                    />
                  ) : (
                    <strong>{user.name}</strong>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="customer-profile-info">
                <div className="customer-profile-info-icon">
                  <Mail size={20} />
                </div>

                <div className="customer-profile-field">
                  <label htmlFor="profile-email">
                    Email Address
                  </label>

                  {isEditing ? (
                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  ) : (
                    <strong>{user.email}</strong>
                  )}
                </div>
              </div>

              {/* Account Role */}
              <div className="customer-profile-info">
                <div className="customer-profile-info-icon">
                  <ShieldCheck size={20} />
                </div>

                <div className="customer-profile-field">
                  <label>Account Type</label>
                  <strong>{user.role || "Customer"}</strong>
                </div>
              </div>

              {/* Profile Messages */}
              {profileError && (
                <div className="profile-message profile-error">
                  <AlertCircle size={18} />
                  {profileError}
                </div>
              )}

              {profileMessage && (
                <div className="profile-message profile-success">
                  <CheckCircle size={18} />
                  {profileMessage}
                </div>
              )}

              {/* Profile Actions */}
              {isEditing ? (
                <div className="customer-profile-actions">

                  <button
                    type="submit"
                    className="customer-profile-edit-btn"
                    disabled={profileLoading}
                  >
                    <Save size={18} />
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className="customer-profile-cancel-btn"
                    onClick={handleCancel}
                    disabled={profileLoading}
                  >
                    <X size={18} />
                    Cancel
                  </button>

                </div>
              ) : (
                <button
                  type="button"
                  className="customer-profile-edit-btn"
                  onClick={handleEdit}
                >
                  <Pencil size={18} />
                  Edit Profile
                </button>
              )}

            </form>
          </section>

          <div className="customer-profile-divider" />

          {/* PASSWORD SECTION */}
          <section className="profile-section">

            <div className="profile-section-heading">
              <div>
                <h3>Password & Security</h3>
                <p>Manage your account password securely</p>
              </div>
              <LockKeyhole size={23} />
            </div>

            {/* Read-only password mode */}
            {passwordMode === "readonly" && (
              <>
                <div className="customer-profile-info">
                  <div className="customer-profile-info-icon">
                    <KeyRound size={20} />
                  </div>

                  <div className="customer-profile-field">
                    <label>Password</label>
                    <strong>••••••••••••</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="customer-profile-edit-btn"
                  onClick={handlePasswordEdit}
                >
                  <Pencil size={18} />
                  Edit Password
                </button>
              </>
            )}

            {/* Stage 1: Verify current password */}
            {passwordMode === "verify" && (
              <form onSubmit={handleVerifyPassword}>

                <div className="password-stage-heading">
                  <span>Step 1 of 2</span>
                  <h4>Verify Your Current Password</h4>
                  <p>
                    Enter your existing password to continue.
                  </p>
                </div>

                <div className="customer-profile-info">
                  <div className="customer-profile-info-icon">
                    <LockKeyhole size={20} />
                  </div>

                  <div className="customer-profile-field">
                    <label htmlFor="current-password">
                      Current Password
                    </label>

                    <div className="password-input-wrapper">
                      <input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) =>
                          setCurrentPassword(e.target.value)
                        }
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        className="password-visibility-btn"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        aria-label={
                          showCurrentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="profile-message profile-error">
                    <AlertCircle size={18} />
                    {passwordError}
                  </div>
                )}

                <p className="forgot-password-note">
                  Forgot your current password?{" "}
                  <Link to="/login">Go to login</Link>
                </p>

                <div className="customer-profile-actions">
                  <button
                    type="submit"
                    className="customer-profile-edit-btn"
                    disabled={passwordLoading}
                  >
                    <CheckCircle size={18} />
                    {passwordLoading
                      ? "Checking..."
                      : "Check Password"}
                  </button>

                  <button
                    type="button"
                    className="customer-profile-cancel-btn"
                    onClick={resetPasswordEditing}
                    disabled={passwordLoading}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>

              </form>
            )}

            {/* Stage 2: Enter new password */}
            {passwordMode === "new" && (
              <form onSubmit={handleChangePassword}>

                <div className="password-stage-heading">
                  <span>Step 2 of 2</span>
                  <h4>Create Your New Password</h4>
                  <p>
                    Your current password has been verified.
                    Choose a new password below.
                  </p>
                </div>

                {passwordMessage && (
                  <div className="profile-message profile-success">
                    <CheckCircle size={18} />
                    {passwordMessage}
                  </div>
                )}

                {/* New Password */}
                <div className="customer-profile-info">
                  <div className="customer-profile-info-icon">
                    <KeyRound size={20} />
                  </div>

                  <div className="customer-profile-field">
                    <label htmlFor="new-password">
                      New Password
                    </label>

                    <div className="password-input-wrapper">
                      <input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(e.target.value)
                        }
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />

                      <button
                        type="button"
                        className="password-visibility-btn"
                        onClick={() =>
                          setShowNewPassword(!showNewPassword)
                        }
                        aria-label={
                          showNewPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="customer-profile-info">
                  <div className="customer-profile-info-icon">
                    <LockKeyhole size={20} />
                  </div>

                  <div className="customer-profile-field">
                    <label htmlFor="confirm-password">
                      Confirm New Password
                    </label>

                    <div className="password-input-wrapper">
                      <input
                        id="confirm-password"
                        type={
                          showConfirmPassword ? "text" : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="password-visibility-btn"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="password-requirement">
                  Your password must contain at least 8 characters.
                </p>

                {passwordError && (
                  <div className="profile-message profile-error">
                    <AlertCircle size={18} />
                    {passwordError}
                  </div>
                )}

                <div className="customer-profile-actions">
                  <button
                    type="submit"
                    className="customer-profile-edit-btn"
                    disabled={passwordLoading}
                  >
                    <Save size={18} />
                    {passwordLoading
                      ? "Saving Password..."
                      : "Save Password"}
                  </button>

                  <button
                    type="button"
                    className="customer-profile-cancel-btn"
                    onClick={resetPasswordEditing}
                    disabled={passwordLoading}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>

              </form>
            )}

          </section>

        </div>
      </div>
    </div>
  );
}

export default Profile;
