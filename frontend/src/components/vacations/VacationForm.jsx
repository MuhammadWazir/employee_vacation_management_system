import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { formatDateForInput, calculateDuration } from "../../utils/dateUtils"
import Loader from "../common/Loader"
import "../../styles/VacationForm.css"

const VacationForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    description: "",
    from: formatDateForInput(new Date()),
    to: formatDateForInput(new Date(Date.now() + 86400000)), // tomorrow
  })

  const [duration, setDuration] = useState(1)
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditMode) {
      fetchVacation()
    }
  }, [id])

  useEffect(() => {
    // Calculate duration whenever dates change
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

  const fetchVacation = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5275/api/Vacation/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch vacation details")
      }

      const data = await response.json()
      setFormData({
        description: data.description,
        from: formatDateForInput(data.from),
        to: formatDateForInput(data.to),
      })
      setDuration(data.duration)
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
      const url = isEditMode ? `http://localhost:5275/api/Vacation/${id}` : "api/Vacation"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${isEditMode ? "update" : "create"} vacation`)
      }

      navigate("/vacations")
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="vacation-form-container">
      <div className="vacation-form-header">
        <h1>{isEditMode ? "Edit Vacation" : "New Vacation"}</h1>
      </div>

      {errors.general && <div className="error-message">{errors.general}</div>}

      <form onSubmit={handleSubmit} className="vacation-form">
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "input-error" : ""}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="from">From Date</label>
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
            <label htmlFor="to">To Date</label>
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

        <div className="form-group duration-display">
          <label>Duration:</label>
          <span className="duration-value">{errors.dates ? "—" : `${duration} days`}</span>
        </div>

        <div className="form-actions">
          <Link to="/vacations" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Save Vacation"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VacationForm