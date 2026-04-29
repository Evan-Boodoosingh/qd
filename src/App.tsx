import { Routes, Route } from "react-router-dom"
import Nav from "./components/Nav/Nav"
import Hero from "./components/Hero/Hero"
import Ticker from "./components/Ticker/Ticker"
import Calendar from "./components/Calendar/Calendar"
import Friends from "./components/Friends/Friends"
import Discussions from "./components/Discussions/Discussions"
import Liked from "./components/Liked/Liked"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import Landing from './pages/Landing'
import Trending from "./components/Trending/Trending"
import PopularDiscussions from "./components/PopularDiscussions/PopularDiscussions"
import MyList from "./pages/MyList"
import Profile from "./pages/Profile"
import FriendsPage from "./pages/Friends"
import Schedule from "./pages/Schedule"
import Community from "./pages/Community"
import Show from "./pages/Show"
import Thread from "./pages/Thread"

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
      <Trending />
      <PopularDiscussions />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/community" element={<Community />} />
      <Route path="/show/:id" element={<Show />} />
      <Route path="/thread/:id" element={<Thread />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-list"
        element={
          <ProtectedRoute>
            <MyList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        }
      />
    </Routes>

  )
}

export default App