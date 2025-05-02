import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import "../../styles/Navbar.css"

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
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

            <div className="user-menu-container">
              <button className="user-menu-button" onClick={toggleUserMenu}>
                <span className="username">{currentUser.userName}</span>
                <span className="dropdown-icon">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/account/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    Account Settings
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
