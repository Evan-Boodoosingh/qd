import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: "Home", path: "/home", public: true },
  { label: "Schedule", path: "/schedule", public: true },
  { label: "Community", path: "/community", public: true },
  { label: "My List", path: "/my-list", public: false },
  { label: "Friends", path: "/friends", public: false },
];

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;
  const location = useLocation();

  const isActive = (link: (typeof navLinks)[0]) => {
    if (link.path === "/home")
      return location.pathname === "/" || location.pathname === "/home";
    return location.pathname === link.path;
  };

  const handleNav = (path: string) => {
    setMenuOpen(false);
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  };

  const visibleLinks = navLinks.filter((link) => link.public || parsedUser);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0f0e0d]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer shrink-0"
            onClick={() => handleNav("/")}
          >
            <img src="/queued.png" alt="Queued" className="h-8 object-contain" />
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6">
            {visibleLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => handleNav(link.path)}
                className={`text-md cursor-pointer transition ${
                  isActive(link) ? "text-[#D13924]" : "text-[#9a9590] hover:text-[#f0ede8]"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-5">
            {parsedUser ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNav("/search")}
                  className={`cursor-pointer transition ${
                    location.pathname === "/search" ? "text-[#D13924]" : "text-[#9a9590] hover:text-[#f0ede8]"
                  }`}
                >
                  <Search size={18} />
                </button>
                <span
                  className={`text-md cursor-pointer transition-all ${
                    location.pathname.startsWith("/profile") ? "text-[#D13924]" : "text-[#f0ede8] hover:text-[#D13924]"
                  }`}
                  onClick={() => handleNav(`/profile/${parsedUser.username}`)}
                >
                  {parsedUser.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white text-sm font-medium px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#D13924" }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav("/login")}
                  className="text-[#f0ede8] text-md cursor-pointer hover:text-[#D13924] transition-all"
                >
                  Sign in
                </button>
                <button
                  onClick={() => handleNav("/register")}
                  className="text-white text-sm font-medium px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#D13924" }}
                >
                  Join Queued
                </button>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex lg:hidden items-center gap-4">
            {parsedUser && (
              <button
                type="button"
                onClick={() => handleNav("/search")}
                className={`cursor-pointer transition ${
                  location.pathname === "/search" ? "text-[#D13924]" : "text-[#9a9590]"
                }`}
              >
                <Search size={20} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#9a9590] hover:text-[#f0ede8] transition cursor-pointer"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 bg-[#1a1815] border-l border-white/10 z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-end px-6 py-5 border-b border-white/10">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-[#9a9590] hover:text-[#f0ede8] transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {parsedUser && (
                <div
                  className="flex items-center gap-3 px-6 py-4 border-b border-white/10 cursor-pointer"
                  onClick={() => handleNav(`/profile/${parsedUser.username}`)}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold"
                    style={{ backgroundColor: '#D13924' }}
                  >
                    {parsedUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-[#f0ede8]">{parsedUser.username}</div>
                    <div className="text-[11px] text-[#9a9590]">View profile</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col py-4 flex-1">
                {visibleLinks.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => handleNav(link.path)}
                    className={`text-left px-6 py-3.5 text-[14px] transition cursor-pointer ${
                      isActive(link)
                        ? "text-[#D13924] bg-[#D13924]/10"
                        : "text-[#9a9590] hover:text-[#f0ede8] hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="px-6 py-6 border-t border-white/10">
                {parsedUser ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-white text-sm font-medium px-4 py-2.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
                    style={{ backgroundColor: "#D13924" }}
                  >
                    Log out
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleNav("/login")}
                      className="w-full text-[#f0ede8] text-sm py-2.5 rounded-full border border-white/15 cursor-pointer hover:bg-white/5 transition-all"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => handleNav("/register")}
                      className="w-full text-white text-sm font-medium py-2.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: "#D13924" }}
                    >
                      Join Queued
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Nav;