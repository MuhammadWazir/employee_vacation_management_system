import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import "../../styles/Navbar.css"

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">Vacation Manager</Link>
        </div>

        {currentUser && (
          <div className="navbar-menu">
            <Link to="/vacations" className="nav-link">
              My Vacations
            </Link>

            <div className="user-menu">
              <span className="username">{currentUser.userName}</span>
              <button onClick={handleLogout} className="btn-logout">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar