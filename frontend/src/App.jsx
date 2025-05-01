import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import VacationList from "./components/vacations/VacationList"
import VacationForm from "./components/vacations/VacationForm"
import CreateVacation from "./components/vacations/CreateVacation"
import Navbar from "./components/layout/Navbar"
import { AuthProvider } from "./context/AuthContext"
import PrivateRoute from "./components/auth/PrivateRoute"
import "./styles/App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/vacations"
                element={
                  <PrivateRoute>
                    <VacationList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vacations/create"
                element={
                  <PrivateRoute>
                    <CreateVacation />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vacations/edit/:id"
                element={
                  <PrivateRoute>
                    <VacationForm />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/vacations" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
