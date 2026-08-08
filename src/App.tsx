import './index.css'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import About from './pages/About'
import Layout from './component/layout'
import AdminDashboard from './pages/Admin'
import Login from './pages/Login/index'
import SignUp from './pages/Login/SignUp'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/about" element={<About />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
