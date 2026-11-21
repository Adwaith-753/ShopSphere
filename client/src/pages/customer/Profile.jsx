
/* eslint-disable react-hooks/set-state-in-effect */
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
  Store,
  ArrowLeft,
  ArrowRight,
  Sparkles,
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

  // Flip card states
  const [profileFlipped, setProfileFlipped] = useState(false);
  const [passwordFlipped, setPasswordFlipped] = useState(false);

  // Personal information states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password states
  const [passwordMode, setPasswordMode] = useState("readonly");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeToken, setPasswordChangeToken] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Synchronize profile with AuthContext
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Personal information editing
  const openProfileCard = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setProfileError("");
    setProfileMessage("");
    setIsEditing(false);
    setProfileFlipped(true);
  };

  const closeProfileCard = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setProfileError("");
    setProfileMessage("");
    setIsEditing(false);
    setProfileFlipped(false);
  };

  const handleSaveProfile = async (e) => {
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

  // Password editing
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

  const openPasswordCard = () => {
    resetPasswordEditing();
    setPasswordFlipped(true);
  };

  const closePasswordCard = () => {
    if (passwordLoading) return;

    resetPasswordEditing();
    setPasswordFlipped(false);
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
      setPasswordError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
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

      resetPasswordEditing();
      navigate("/login", { replace: true });
    } catch (error) {
      setPasswordError(
        error.message || "Unable to change your password."
      );

      setPasswordChangeToken("");
      setPasswordMode("verify");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Loading
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

        {/* Profile Header */}
        <div className="profile-dashboard-heading">
          <div>
            <span className="profile-eyebrow">
              <Sparkles size={15} />
              ACCOUNT DASHBOARD
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal details, security and seller journey.
            </p>
          </div>

          <div className="profile-user-badge">
            <div className="profile-user-avatar">
              <UserRound size={30} />
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>{user.role || "Customer"}</span>
            </div>
          </div>
        </div>

        {/* Flip Cards */}
        <div className="profile-flip-grid">

          {/* PERSONAL INFORMATION CARD */}
          <div
            className={`profile-flip-card ${
              profileFlipped ? "is-flipped" : ""
            }`}
          >
            <div className="profile-flip-inner">

              {/* FRONT */}
              <div className="profile-flip-face profile-flip-front">

                <div className="profile-card-top">
                  <div className="profile-card-icon personal-icon">
                    <UserRound size={29} />
                  </div>

                  <span className="profile-card-number">01</span>
                </div>

                <div className="profile-card-content">
                  <span className="profile-card-label">
                    YOUR ACCOUNT
                  </span>

                  <h2>Personal Information</h2>

                  <p>
                    Manage your name, email address and personal
                    account information.
                  </p>

                  <div className="profile-preview-info">
                    <div className="profile-preview-row">
                      <UserRound size={18} />
                      <span>{user.name}</span>
                    </div>

                    <div className="profile-preview-row">
                      <Mail size={18} />
                      <span>{user.email}</span>
                    </div>

                    <div className="profile-preview-row">
                      <ShieldCheck size={18} />
                      <span>{user.role || "Customer"}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-flip-button"
                  onClick={openProfileCard}
                >
                  View Details
                  <ArrowRight size={18} />
                </button>

              </div>

              {/* BACK */}
              <div className="profile-flip-face profile-flip-back">

                <div className="profile-back-heading">
                  <div>
                    <span className="profile-card-label">
                      ACCOUNT DETAILS
                    </span>
                    <h2>
                      {isEditing ? "Edit Information" : "Your Information"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="profile-back-close"
                    onClick={closeProfileCard}
                    aria-label="Close personal information"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveProfile}>

                  <div className="profile-form-group">
                    <label htmlFor="profile-name">Full Name</label>

                    <div className="profile-input-wrapper">
                      <UserRound size={18} />

                      <input
                        id="profile-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing || profileLoading}
                        required
                        maxLength={100}
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="profile-email">Email Address</label>

                    <div className="profile-input-wrapper">
                      <Mail size={18} />

                      <input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing || profileLoading}
                        required
                        placeholder="Your email address"
                      />
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label>Account Type</label>

                    <div className="profile-input-wrapper">
                      <ShieldCheck size={18} />

                      <input
                        value={user.role || "Customer"}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  {profileError && (
                    <div className="profile-message profile-error">
                      <AlertCircle size={17} />
                      {profileError}
                    </div>
                  )}

                  {profileMessage && (
                    <div className="profile-message profile-success">
                      <CheckCircle size={17} />
                      {profileMessage}
                    </div>
                  )}

                  <div className="profile-card-actions">

                    {isEditing ? (
                      <>
                        <button
                          type="submit"
                          className="profile-primary-button"
                          disabled={profileLoading}
                        >
                          <Save size={17} />
                          {profileLoading ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          className="profile-secondary-button"
                          onClick={() => {
                            setName(user.name || "");
                            setEmail(user.email || "");
                            setIsEditing(false);
                            setProfileError("");
                          }}
                          disabled={profileLoading}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="profile-primary-button"
                        onClick={() => {
                          setProfileMessage("");
                          setProfileError("");
                          setIsEditing(true);
                        }}
                      >
                        <Pencil size={17} />
                        Edit Profile
                      </button>
                    )}

                    <button
                      type="button"
                      className="profile-secondary-button"
                      onClick={closeProfileCard}
                      disabled={profileLoading}
                    >
                      <ArrowLeft size={17} />
                      Back
                    </button>

                  </div>
                </form>
              </div>

            </div>
          </div>

          {/* PASSWORD & SECURITY CARD */}
          <div
            className={`profile-flip-card ${
              passwordFlipped ? "is-flipped" : ""
            }`}
          >
            <div className="profile-flip-inner">

              {/* FRONT */}
              <div className="profile-flip-face profile-flip-front">

                <div className="profile-card-top">
                  <div className="profile-card-icon security-icon">
                    <LockKeyhole size={29} />
                  </div>

                  <span className="profile-card-number">02</span>
                </div>

                <div className="profile-card-content">
                  <span className="profile-card-label">
                    ACCOUNT PROTECTION
                  </span>

                  <h2>Password & Security</h2>

                  <p>
                    Protect your account by managing your password
                    and security settings.
                  </p>

                  <div className="profile-security-preview">
                    <div className="profile-security-check">
                      <CheckCircle size={19} />
                      <span>Password protected account</span>
                    </div>

                    <div className="profile-security-password">
                      <KeyRound size={19} />
                      <span>••••••••••••</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-flip-button"
                  onClick={openPasswordCard}
                >
                  Manage Security
                  <ArrowRight size={18} />
                </button>

              </div>

              {/* BACK */}
              <div className="profile-flip-face profile-flip-back">

                <div className="profile-back-heading">
                  <div>
                    <span className="profile-card-label">
                      SECURITY SETTINGS
                    </span>

                    <h2>Change Password</h2>
                  </div>

                  <button
                    type="button"
                    className="profile-back-close"
                    onClick={closePasswordCard}
                    disabled={passwordLoading}
                    aria-label="Close password settings"
                  >
                    <X size={20} />
                  </button>
                </div>

                {passwordMode === "readonly" && (
                  <div className="profile-password-intro">
                    <div className="profile-security-large-icon">
                      <LockKeyhole size={30} />
                    </div>

                    <h3>Keep Your Account Secure</h3>

                    <p>
                      Verify your existing password before creating
                      a new one.
                    </p>

                    <button
                      type="button"
                      className="profile-primary-button"
                      onClick={() => {
                        setPasswordError("");
                        setPasswordMessage("");
                        setPasswordMode("verify");
                      }}
                    >
                      <Pencil size={17} />
                      Change Password
                    </button>
                  </div>
                )}

                {passwordMode === "verify" && (
                  <form onSubmit={handleVerifyPassword}>

                    <div className="profile-password-step">
                      <span>STEP 1 OF 2</span>
                      <h3>Verify Current Password</h3>
                      <p>
                        Enter your existing password to continue.
                      </p>
                    </div>

                    <div className="profile-form-group">
                      <label htmlFor="current-password">
                        Current Password
                      </label>

                      <div className="profile-input-wrapper">
                        <LockKeyhole size={18} />

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
                          className="profile-password-toggle"
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
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="profile-message profile-error">
                        <AlertCircle size={17} />
                        {passwordError}
                      </div>
                    )}

                    <p className="profile-forgot-note">
                      Forgot your password?{" "}
                      <Link to="/login">Go to login</Link>
                    </p>

                    <div className="profile-card-actions">
                      <button
                        type="submit"
                        className="profile-primary-button"
                        disabled={passwordLoading}
                      >
                        <CheckCircle size={17} />
                        {passwordLoading ? "Verifying..." : "Verify Password"}
                      </button>

                      <button
                        type="button"
                        className="profile-secondary-button"
                        onClick={closePasswordCard}
                        disabled={passwordLoading}
                      >
                        Cancel
                      </button>
                    </div>

                  </form>
                )}

                {passwordMode === "new" && (
                  <form onSubmit={handleChangePassword}>

                    <div className="profile-password-step">
                      <span>STEP 2 OF 2</span>
                      <h3>Create New Password</h3>
                      <p>
                        Your current password has been verified.
                      </p>
                    </div>

                    {passwordMessage && (
                      <div className="profile-message profile-success">
                        <CheckCircle size={17} />
                        {passwordMessage}
                      </div>
                    )}

                    <div className="profile-form-group">
                      <label htmlFor="new-password">
                        New Password
                      </label>

                      <div className="profile-input-wrapper">
                        <KeyRound size={18} />

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
                          className="profile-password-toggle"
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
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="profile-form-group">
                      <label htmlFor="confirm-password">
                        Confirm New Password
                      </label>

                      <div className="profile-input-wrapper">
                        <LockKeyhole size={18} />

                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
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
                          className="profile-password-toggle"
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
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="profile-password-hint">
                      Minimum 8 characters required.
                    </p>

                    {passwordError && (
                      <div className="profile-message profile-error">
                        <AlertCircle size={17} />
                        {passwordError}
                      </div>
                    )}

                    <div className="profile-card-actions">
                      <button
                        type="submit"
                        className="profile-primary-button"
                        disabled={passwordLoading}
                      >
                        <Save size={17} />
                        {passwordLoading ? "Saving..." : "Save Password"}
                      </button>

                      <button
                        type="button"
                        className="profile-secondary-button"
                        onClick={() => {
                          setPasswordMode("verify");
                          setPasswordChangeToken("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordError("");
                          setPasswordMessage("");
                        }}
                        disabled={passwordLoading}
                      >
                        Back
                      </button>
                    </div>

                  </form>
                )}

              </div>

            </div>
          </div>

        </div>

        {/* SELLER CENTRE CARD */}
        <section className="profile-seller-card">

          <div className="profile-seller-icon">
            <Store size={31} />
          </div>

          <div className="profile-seller-content">
            <span className="profile-card-label">
              GROW YOUR BUSINESS
            </span>

            <h2>Sell on ShopSphere</h2>

            <p>
              Become a seller, submit your application and track
              your approval status from Seller Centre.
            </p>
          </div>

          <Link
            to="/seller-centre"
            className="profile-seller-button"
          >
            Open Seller Centre
            <ArrowRight size={18} />
          </Link>

        </section>

        <p className="profile-footer-note">
          Your ShopSphere account. Your control. Your security.
        </p>

      </div>
    </div>
  );
}

export default Profile;
