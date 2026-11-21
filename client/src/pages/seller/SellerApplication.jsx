
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { submitSellerApplication } from "../../services/sellerService";
import "./SellerApplication.css";

function SellerApplication() {
  const { token, user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sellerType: "individual",
    storeName: "",
    storeDescription: "",
    storeCategory: "",
    contactPhone: "",
    contactEmail: "",
    businessWebsite: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    acceptedSellerTerms: false,
  });

  // Update form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit seller application
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token || !user) {
      setError("Please log in before submitting your application.");
      return;
    }

    if (!formData.acceptedSellerTerms) {
      setError("Please accept the seller terms and conditions.");
      return;
    }

    setSubmitting(true);

    try {
      await submitSellerApplication(formData, token);

      setUser((previousUser) => ({
        ...previousUser,
        sellerApplicationStatus: "pending",
      }));

      setSuccess("Your seller application was submitted successfully!");

      navigate("/profile", {
        state: {
          sellerApplicationSubmitted: true,
        },
      });
    } catch (err) {
      setError(err.message || "Unable to submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="seller-application-page">
      <h1>Become a ShopSphere Seller</h1>

      <p>
        Complete the details below to apply for a seller account.
        Our admin team will review your application.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Seller Type */}
        <section>
          <h2>1. Seller Type</h2>

          <label>
            <input
              type="radio"
              name="sellerType"
              value="individual"
              checked={formData.sellerType === "individual"}
              onChange={handleChange}
            />
            Individual Seller
          </label>

          <label>
            <input
              type="radio"
              name="sellerType"
              value="business"
              checked={formData.sellerType === "business"}
              onChange={handleChange}
            />
            Business Seller
          </label>
        </section>

        {/* Store Information */}
        <section>
          <h2>2. Store Information</h2>

          <label htmlFor="storeName">Store Name</label>
          <input
            id="storeName"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Enter your store name"
          />

          <label htmlFor="storeDescription">Store Description</label>
          <textarea
            id="storeDescription"
            name="storeDescription"
            value={formData.storeDescription}
            onChange={handleChange}
            required
            maxLength={1000}
            placeholder="Describe the products you plan to sell"
            rows={5}
          />

          <label htmlFor="storeCategory">Store Category</label>
          <select
            id="storeCategory"
            name="storeCategory"
            value={formData.storeCategory}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Books">Books</option>
            <option value="Beauty">Beauty</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </section>

        {/* Contact Information */}
        <section>
          <h2>3. Contact Information</h2>

          <label htmlFor="contactPhone">Contact Phone</label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
          />

          <label htmlFor="contactEmail">Contact Email</label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            required
            placeholder="Enter your contact email"
          />

          <label htmlFor="businessWebsite">
            Business Website (Optional)
          </label>
          <input
            id="businessWebsite"
            name="businessWebsite"
            type="url"
            value={formData.businessWebsite}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </section>

        {/* Store Address */}
        <section>
          <h2>4. Store Address</h2>

          <label htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Street and building details"
          />

          <label htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <label htmlFor="state">State</label>
          <input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />

          <label htmlFor="postalCode">Postal Code</label>
          <input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
          />

          <label htmlFor="country">Country</label>
          <input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </section>

        {/* Seller Agreement */}
        <section>
          <h2>5. Seller Agreement</h2>

          <label>
            <input
              type="checkbox"
              name="acceptedSellerTerms"
              checked={formData.acceptedSellerTerms}
              onChange={handleChange}
              required
            />
            I agree to the ShopSphere Seller Terms and Conditions.
          </label>
        </section>

        {/* Messages */}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message" role="status">
            {success}
          </p>
        )}

        {/* Submit */}
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default SellerApplication;
