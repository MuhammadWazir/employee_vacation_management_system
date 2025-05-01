import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import "./Vacation.css"

const EditVacation = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    description: "",
    from: "",
    to: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVacation = async () => {
      try {
        const token = localStorage.getItem("token")
        // Use absolute URL path to prevent path combination issues
        const API_BASE_URL = "http://localhost:5275";
        const response = await fetch(`${API_BASE_URL}/api/Vacation/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch vacation details")
        }

        const data = await response.json()

        // Format dates for input fields (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
          const date = new Date(dateString)
          return date.toISOString().split("T")[0]
        }

        setFormData({
          description: data.description,
          from: formatDateForInput(data.from),
          to: formatDateForInput(data.to),
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVacation()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
  
    try {
      // Create properly formatted data for API
      const apiData = {
        id: id, // Make sure to include the ID
        description: formData.description,
        from: new Date(formData.from).toISOString(),
        to: new Date(formData.to).toISOString()
      };
      
      console.log("Sending data:", apiData); // For debugging
      
      const token = localStorage.getItem("token");
      // Use absolute URL path to prevent path combination issues
      const API_BASE_URL = "http://localhost:5275";
      const res = await fetch(`${API_BASE_URL}/api/Vacation/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });
  
      // Check if response is ok
      if (!res.ok) {
        // Try to read error as JSON first
        let errorMessage;
        const contentType = res.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || JSON.stringify(errorData);
          } catch (jsonError) {
            // If JSON parsing fails, try to get text
            errorMessage = await res.text();
          }
        } else {
          // Not JSON, get as text
          errorMessage = await res.text();
        }
        
        throw new Error(errorMessage || `HTTP ${res.status} ${res.statusText}`);
      }
      
      // For successful responses, carefully handle the response
      // Some APIs might return no content on success
      if (res.status !== 204) { // 204 is No Content
        try {
          // Only try to parse JSON if there's content
          const contentLength = res.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > 0) {
            await res.json(); // Just to make sure it's valid JSON
          }
        } catch (jsonError) {
          console.warn("Response is not valid JSON, but request was successful");
        }
      }
  
      // Navigate on success
      navigate(`/vacations/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) return <div className="loading">Loading vacation details...</div>

  return (
    <div className="vacation-form-container">
      <div className="vacation-form-header">
        <h2>Edit Vacation</h2>
        <Link to={`/vacations/${id}`} className="back-button">
          Back to Details
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="vacation-form">
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="from">From Date</label>
          <input type="date" id="from" name="from" value={formData.from} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="to">To Date</label>
          <input type="date" id="to" name="to" value={formData.to} onChange={handleChange} required />
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? "Updating..." : "Update Vacation"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditVacation