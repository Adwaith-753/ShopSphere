
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "./LogoutModal.css";

function LogoutModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="logout-modal-overlay"
      onClick={onCancel}
    >
      <div
        className="logout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="logout-modal-close"
          onClick={onCancel}
          aria-label="Close logout confirmation"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className="logout-modal-icon">
          <FontAwesomeIcon icon={faRightFromBracket} />
        </div>

        <h2 id="logout-modal-title">Confirm Logout</h2>

        <p>
          Are you sure you want to log out of your ShopSphere account?
        </p>

        <div className="logout-modal-actions">
          <button
            type="button"
            className="logout-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="logout-confirm-btn"
            onClick={onConfirm}
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
