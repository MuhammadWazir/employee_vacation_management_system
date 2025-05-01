import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { formatDate } from "../../utils/dateUtils"
import "./Vacation.css"

const VacationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vacation, setVacation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVacation = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch(`api/Vacation/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch vacation details")
        }

        const data = await response.json()
        setVacation(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVacation()
  }, [id])

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this vacation?")) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:5275/api/Vacation/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to delete vacation")
        }

        navigate("/vacations")
      } catch (err) {
        setError(err.message)
      }
    }
  }

  if (loading) return <div className="loading">Loading vacation details...</div>
  if (error) return <div className="error-message">Error: {error}</div>
  if (!vacation) return <div className="not-found">Vacation not found</div>

  return (
    <div className="vacation-detail-container">
      <div className="vacation-detail-header">
        <h2>Vacation Details</h2>
        <div className="vacation-detail-actions">
          <Link to="/vacations" className="back-button">
            Back to List
          </Link>
          <Link to={`/vacations/edit/${id}`} className="edit-button">
            Edit
          </Link>
          <button onClick={handleDelete} className="delete-button">
            Delete
          </button>
        </div>
      </div>

      <div className="vacation-detail-card">
        <h3>{vacation.description}</h3>
        <div className="vacation-detail-info">
          <div className="info-group">
            <label>From:</label>
            <p>{formatDate(vacation.from)}</p>
          </div>
          <div className="info-group">
            <label>To:</label>
            <p>{formatDate(vacation.to)}</p>
          </div>
          <div className="info-group">
            <label>Duration:</label>
            <p>{vacation.duration} days</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VacationDetail