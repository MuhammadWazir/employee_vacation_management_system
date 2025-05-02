"use client"

import { useState } from "react"
import "../../styles/DeleteAccountModal.css"

const DeleteAccountModal = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password) {
      setError("Password is required")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("Backend/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Incorrect password")
        }
        throw new Error("Failed to delete account")
      }

      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="delete-account-modal">
        <div className="modal-header">
          <h2>Delete Account</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="warning-icon">⚠️</div>
          <p className="warning-text">Are you sure you want to delete your account? This action cannot be undone.</p>
          <p className="warning-text">All your data, including vacations, will be permanently deleted.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="delete-password">Enter your password to confirm</label>
              <input
                type="password"
                id="delete-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={error ? "input-error" : ""}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-delete-confirm" disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountModal
