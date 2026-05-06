import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Calendar from "./components/Calendar/Calendar";
import Friends from "./components/Friends/Friends";
import Discussions from "./components/Discussions/Discussions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Trending from "./components/Trending/Trending";
import PopularDiscussions from "./components/PopularDiscussions/PopularDiscussions";
import MyList from "./pages/MyList";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import FriendsPage from "./pages/Friends";
import Schedule from "./pages/Schedule";
import Community from "./pages/Community";
import Show from "./pages/Show";
import Thread from "./pages/Thread";
import Episode from "./pages/Episode";
import NewThread from "./pages/NewThread";
import Hero from "./components/Hero/Hero";
import { fetchWatchlist } from "./services/watchlist";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import { ToastProvider } from "./components/Toast/Toast";

type WatchlistEntry = {
  showId: number
}

function HomePage() {
  const [watchedIds, setWatchedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchWatchlist()
      .then((data: WatchlistEntry[]) => setWatchedIds(data.map((e) => e.showId)))
      .catch(() => {});
  }, []);

  const handleAddedToList = (showId: number) => {
    setWatchedIds((prev) => [...prev, showId]);
  };

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Hero watchedIds={watchedIds} onAdded={handleAddedToList} />
      <Calendar />
      <Friends />
      <Discussions />
      {/* <Liked /> */}
      <Trending watchedIds={watchedIds} onAdded={handleAddedToList} />
      <PopularDiscussions />
    </div>
  );
}

function App() {
  return (
    <>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/community" element={<Community />} />
        <Route path="/show/:id" element={<Show />} />
        <Route path="/thread/:id" element={<Thread />} />
        <Route path="/show/:id/episode/:ep" element={<Episode />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<NotFound />} />
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
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
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
        <Route
          path="/thread/new"
          element={
            <ProtectedRoute>
              <NewThread />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;