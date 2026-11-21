
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import {
  getSellerApplications,
  approveSellerApplication,
  rejectSellerApplication,
} from "../../services/adminService.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faRotate,
  faMagnifyingGlass,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import "./SellerApplications.css";

function SellerApplications() {
  const { token } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSellerApplications(token);
      setApplications(data.applications || []);
    } catch (error) {
      setError(error.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token, fetchApplications]);

  // Search and filter
  const filteredApplications = applications.filter((application) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      application.storeName?.toLowerCase().includes(searchText) ||
      application.user?.name?.toLowerCase().includes(searchText) ||
      application.user?.email?.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "all" || application.status === filter;

    return matchesSearch && matchesFilter;
  });

  // Statistics
  const pendingCount = applications.filter(
    (application) => application.status === "pending"
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === "approved"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "rejected"
  ).length;

  // Status icon
  const getStatusIcon = (status) => {
    if (status === "approved") return faCheckCircle;
    if (status === "rejected") return faTimesCircle;
    return faClock;
  };

  // Open application details
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowRejectForm(false);
    setRejectReason("");
    setNotice("");
  };

  // Approve application
  const handleApprove = async () => {
    if (!selectedApplication) return;

    const confirmed = window.confirm(
      "Are you sure you want to approve this seller application?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      const result = await approveSellerApplication(
        selectedApplication._id,
        token
      );

      setNotice(result.message || "Application approved successfully.");
      setSelectedApplication(null);

      await fetchApplications();
    } catch (error) {
      setError(error.message || "Unable to approve application.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject application
  const handleReject = async (event) => {
    event.preventDefault();

    if (!selectedApplication || !rejectReason.trim()) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const result = await rejectSellerApplication(
        selectedApplication._id,
        rejectReason,
        token
      );

      setNotice(result.message || "Application rejected successfully.");
      setSelectedApplication(null);
      setShowRejectForm(false);
      setRejectReason("");

      await fetchApplications();
    } catch (error) {
      setError(error.message || "Unable to reject application.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="seller-applications-page">

      {/* Header */}
      <div className="seller-applications-header">
        <div>
          <h1>Seller Applications</h1>
          <p>Review and manage seller registration requests.</p>
        </div>

        <button
          type="button"
          className="seller-refresh-btn"
          onClick={fetchApplications}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRotate} />
          Refresh
        </button>
      </div>

      {/* Success and Error Messages */}
      {notice && (
        <div className="seller-success-message">
          {notice}
          <button type="button" onClick={() => setNotice("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {error && (
        <div className="seller-error-message">
          {error}
          <button type="button" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="seller-application-stats">
        <div className="seller-stat-card">
          <FontAwesomeIcon icon={faStore} />
          <div>
            <h3>{applications.length}</h3>
            <p>Total Applications</p>
          </div>
        </div>

        <div className="seller-stat-card pending">
          <FontAwesomeIcon icon={faClock} />
          <div>
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="seller-stat-card approved">
          <FontAwesomeIcon icon={faCheckCircle} />
          <div>
            <h3>{approvedCount}</h3>
            <p>Approved</p>
          </div>
        </div>

        <div className="seller-stat-card rejected">
          <FontAwesomeIcon icon={faTimesCircle} />
          <div>
            <h3>{rejectedCount}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="seller-application-toolbar">
        <div className="seller-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            placeholder="Search store or applicant..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All Applications</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="seller-applications-message">
          Loading seller applications...
        </div>
      ) : (
        !error && (
          filteredApplications.length === 0 ? (
            <div className="seller-applications-message">
              No seller applications found.
            </div>
          ) : (
            <div className="seller-applications-table-wrapper">
              <table className="seller-applications-table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Applicant</th>
                    <th>Seller Type</th>
                    <th>Category</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application._id}>
                      <td>
                        <strong>{application.storeName}</strong>
                      </td>

                      <td>
                        <strong>
                          {application.user?.name || "Unknown"}
                        </strong>
                        <small>
                          {application.user?.email || "No email"}
                        </small>
                      </td>

                      <td>{application.sellerType}</td>

                      <td>{application.storeCategory}</td>

                      <td>
                        {new Date(
                          application.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <span
                          className={`seller-status ${application.status}`}
                        >
                          <FontAwesomeIcon
                            icon={getStatusIcon(application.status)}
                          />
                          {application.status}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="seller-view-btn"
                          onClick={() => handleViewApplication(application)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )
      )}

      {/* Application Review Panel */}
      {selectedApplication && (
        <div className="seller-review-overlay">
          <div className="seller-review-panel">

            <div className="seller-review-header">
              <div>
                <h2>Application Details</h2>
                <p>Review the seller's submitted information.</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                disabled={actionLoading}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="seller-review-details">

              <h3>Applicant Information</h3>

              <p>
                <strong>Name:</strong>{" "}
                {selectedApplication.user?.name || "Not available"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedApplication.user?.email || "Not available"}
              </p>

              <h3>Store Information</h3>

              <p>
                <strong>Store Name:</strong>{" "}
                {selectedApplication.storeName}
              </p>

              <p>
                <strong>Seller Type:</strong>{" "}
                {selectedApplication.sellerType}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {selectedApplication.storeCategory}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {selectedApplication.storeDescription}
              </p>

              <h3>Contact Information</h3>

              <p>
                <strong>Phone:</strong>{" "}
                {selectedApplication.contactPhone}
              </p>

              <p>
                <strong>Contact Email:</strong>{" "}
                {selectedApplication.contactEmail}
              </p>

              {selectedApplication.businessWebsite && (
                <p>
                  <strong>Website:</strong>{" "}
                  {selectedApplication.businessWebsite}
                </p>
              )}

              <h3>Store Address</h3>

              <p>
                {[
                  selectedApplication.address,
                  selectedApplication.city,
                  selectedApplication.state,
                  selectedApplication.postalCode,
                  selectedApplication.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <h3>Application Information</h3>

              <p>
                <strong>Applied:</strong>{" "}
                {new Date(
                  selectedApplication.createdAt
                ).toLocaleString()}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedApplication.status}
              </p>

              {selectedApplication.status === "rejected" && (
                <p>
                  <strong>Rejection Reason:</strong>{" "}
                  {selectedApplication.rejectionReason}
                </p>
              )}

            </div>

            {/* Pending Application Actions */}
            {selectedApplication.status === "pending" && (
              <div className="seller-review-actions">

                {!showRejectForm ? (
                  <>
                    <button
                      type="button"
                      className="seller-approve-btn"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      {actionLoading ? "Processing..." : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="seller-reject-btn"
                      onClick={() => setShowRejectForm(true)}
                      disabled={actionLoading}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                      Reject
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleReject}>
                    <label htmlFor="rejection-reason">
                      Reason for rejection
                    </label>

                    <textarea
                      id="rejection-reason"
                      value={rejectReason}
                      onChange={(event) =>
                        setRejectReason(event.target.value)
                      }
                      placeholder="Explain why this application is being rejected..."
                      maxLength={1000}
                      required
                    />

                    <p>{rejectReason.length}/1000 characters</p>

                    <button
                      type="submit"
                      className="seller-reject-btn"
                      disabled={actionLoading || !rejectReason.trim()}
                    >
                      {actionLoading ? "Processing..." : "Confirm Rejection"}
                    </button>

                    <button
                      type="button"
                      className="seller-cancel-btn"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReason("");
                      }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                  </form>
                )}

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default SellerApplications;
