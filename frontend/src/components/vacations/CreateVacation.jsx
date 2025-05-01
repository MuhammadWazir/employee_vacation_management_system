import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { formatDateForInput, calculateDuration } from "../../utils/dateUtils"
import Loader from "../common/Loader"
import "../../styles/CreateVacation.css"

const CreateVacation = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize with today and tomorrow as default dates
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [formData, setFormData] = useState({
    description: "",
    from: formatDateForInput(today),
    to: formatDateForInput(tomorrow),
  })

  const [duration, setDuration] = useState(2) // Default duration (2 days)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Calculate duration whenever dates change
  useEffect(() => {
    if (formData.from && formData.to) {
      try {
        const days = calculateDuration(formData.from, formData.to)
        setDuration(days)
        setErrors((prev) => ({ ...prev, dates: null }))
      } catch (err) {
        setErrors((prev) => ({ ...prev, dates: err.message }))
      }
    }
  }, [formData.from, formData.to])

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

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.from) {
      newErrors.from = "Start date is required"
    }

    if (!formData.to) {
      newErrors.to = "End date is required"
    }

    try {
      const fromDate = new Date(formData.from)
      const toDate = new Date(formData.to)

      if (toDate < fromDate) {
        newErrors.dates = "End date must be after start date"
      }
    } catch (err) {
      newErrors.dates = "Invalid date format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")

      const response = await fetch("http://localhost:5275/api/Vacation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create vacation")
      }

      // Show success message and redirect
      navigate("/vacations")
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className="create-vacation-container">
      <div className="create-vacation-header">
        <h1>Create New Vacation</h1>
        <p>Fill in the details to add a new vacation period</p>
      </div>

      {errors.general && (
        <div className="error-message">
          <span className="error-icon">!</span>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-vacation-form">
        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="e.g., Summer Vacation, Family Trip"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "input-error" : ""}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="date-fields">
          <div className="form-group">
            <label htmlFor="from">
              From Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="from"
              name="from"
              value={formData.from}
              onChange={handleChange}
              className={errors.from || errors.dates ? "input-error" : ""}
            />
            {errors.from && <span className="error-text">{errors.from}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="to">
              To Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleChange}
              className={errors.to || errors.dates ? "input-error" : ""}
            />
            {errors.to && <span className="error-text">{errors.to}</span>}
          </div>
        </div>

        {errors.dates && <div className="error-text dates-error">{errors.dates}</div>}

        <div className="duration-card">
          <div className="duration-icon">📅</div>
          <div className="duration-info">
            <h3>Duration</h3>
            <p>{errors.dates ? "Invalid date selection" : `${duration} days`}</p>
            <span className="duration-note">Automatically calculated based on selected dates</span>
          </div>
        </div>

        <div className="form-actions">
          <Link to="/vacations" className="btn-cancel">
            Cancel
          </Link>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              "Create Vacation"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateVacation
