import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav/Nav'
import Hero from './components/Hero/Hero'
import Ticker from './components/Ticker/Ticker'
import Calendar from './components/Calendar/Calendar'
import Friends from './components/Friends/Friends'
import Discussions from './components/Discussions/Discussions'
import Liked from './components/Liked/Liked'
import Login from './pages/Login'
import Register from './pages/Register'

function HomePage() {
  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />
      <Hero />
      <Ticker />
      <Calendar />
      <Friends />
      <Discussions />
      <Liked />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  )
}

export default App