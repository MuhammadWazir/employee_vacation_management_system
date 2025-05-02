import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import DeleteAccountModal from "./DeleteAccountModal"
import "../../styles/AccountSettings.css"

const AccountSettings = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: currentUser?.userName || "",
    email: currentUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Only validate username and email if they've been changed
    if (formData.username !== currentUser.userName && !formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (formData.email !== currentUser.email) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    // Validate password fields if any password field is filled
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password"
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required"
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters"
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if any changes were made
    const noChanges =
      formData.username === currentUser.userName &&
      formData.email === currentUser.email &&
      !formData.currentPassword &&
      !formData.newPassword

    if (noChanges) {
      setErrors({ general: "No changes were made" })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSuccessMessage("")

    try {
      const token = localStorage.getItem("token")
      const updateData = {
        username: formData.username,
        email: formData.email,
      }

      // Only include password fields if the user is changing their password
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch("http://localhost:5275/Backend/account/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update account")
      }

      const data = await response.json()

      // Update local storage with new user data
      localStorage.setItem("token", data.token)
      localStorage.setItem(
        "user",
        JSON.stringify({
          userName: data.userName,
          email: data.email,
        }),
      )

      setSuccessMessage("Account updated successfully")

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))

      // Reload the page to update the user context
      window.location.reload()
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="account-settings-container">
      <div className="account-settings-header">
        <h1>Account Settings</h1>
        <p>Manage your account information and password</p>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errors.general && <div className="error-message">{errors.general}</div>}

      <form onSubmit={handleSubmit} className="account-settings-form">
        <div className="form-section">
          <h2>Profile Information</h2>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Change Password</h2>
          <p className="section-description">Leave blank if you don't want to change your password</p>

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={errors.currentPassword ? "input-error" : ""}
            />
            {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? "input-error" : ""}
            />
            {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="danger-zone">
        <h2>Danger Zone</h2>
        <p>Once you delete your account, there is no going back. Please be certain.</p>
        <button type="button" className="btn-delete-confirm" onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            logout()
            navigate("/login")
          }}
        />
      )}
    </div>
  )
}

export default AccountSettings
