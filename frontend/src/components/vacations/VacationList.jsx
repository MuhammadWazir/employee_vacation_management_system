import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { formatDate } from "../../utils/dateUtils"
import Loader from "../common/Loader"
import Pagination from "../common/Pagination"
import "../../styles/VacationList.css"

const VacationList = () => {
  const [vacations, setVacations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  })
  const [sortField, setSortField] = useState("from")
  const [sortDirection, setSortDirection] = useState("desc")

  const fetchVacations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const { page, pageSize } = pagination

      const response = await fetch(`http://localhost:5275/api/Vacation?page=${page}&pageSize=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch vacations")
      }

      const data = await response.json()
      setVacations(data.items)
      setPagination((prev) => ({
        ...prev,
        total: data.total,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVacations()
  }, [pagination.page, pagination.pageSize])

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = async (id) => {
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

        // Refresh the list
        fetchVacations()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const getSortIcon = (field) => {
    if (field !== sortField) return null
    return sortDirection === "asc" ? "▲" : "▼"
  }

  if (loading && vacations.length === 0) return <Loader />

  return (
    <div className="vacation-list-container">
      <div className="vacation-list-header">
        <h1>My Vacations</h1>
        <Link to="/vacations/create" className="btn-create">
          <span className="icon">+</span> New Vacation
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="vacation-table-container">
        <table className="vacation-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("description")}>Description {getSortIcon("description")}</th>
              <th onClick={() => handleSort("from")}>From {getSortIcon("from")}</th>
              <th onClick={() => handleSort("to")}>To {getSortIcon("to")}</th>
              <th onClick={() => handleSort("duration")}>Duration {getSortIcon("duration")}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vacations.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  No vacations found. Click "New Vacation" to create one.
                </td>
              </tr>
            ) : (
              vacations.map((vacation) => (
                <tr key={vacation.id}>
                  <td>{vacation.description}</td>
                  <td>{formatDate(vacation.from)}</td>
                  <td>{formatDate(vacation.to)}</td>
                  <td>{vacation.duration} days</td>
                  <td className="actions-cell">
                    <Link to={`/vacations/edit/${vacation.id}`} className="btn-edit">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(vacation.id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.pageSize)}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default VacationList