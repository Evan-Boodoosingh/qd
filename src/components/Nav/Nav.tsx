import { useLocation } from 'react-router-dom'

function Nav() {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const parsedUser = user ? JSON.parse(user) : null
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0f0e0d]/95 backdrop-blur-md z-50">

      {/* Logo */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => window.location.href = '/'}
      >
        <img src="/queued.png" alt="Queued" className="h-8 object-contain" />
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => window.location.href = '/home'}
          className={`text-md cursor-pointer transition ${
            isActive('/home') || isActive('/') ? 'text-[#D13924]' : 'text-[#9a9590] hover:text-[#f0ede8]'
          }`}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => window.location.href = '/schedule'}
          className={`text-md cursor-pointer transition ${
            isActive('/schedule') ? 'text-[#D13924]' : 'text-[#9a9590] hover:text-[#f0ede8]'
          }`}
        >
          Schedule
        </button>
        <button
          type="button"
          onClick={() => window.location.href = '/community'}
          className={`text-md cursor-pointer transition ${
            isActive('/community') ? 'text-[#D13924]' : 'text-[#9a9590] hover:text-[#f0ede8]'
          }`}
        >
          Community
        </button>
        <button
          type="button"
          onClick={() => window.location.href = '/my-list'}
          className={`text-md cursor-pointer transition ${
            isActive('/my-list') ? 'text-[#D13924]' : 'text-[#9a9590] hover:text-[#f0ede8]'
          }`}
        >
          My List
        </button>
        <button
          type="button"
          onClick={() => window.location.href = '/friends'}
          className={`text-md cursor-pointer transition ${
            isActive('/friends') ? 'text-[#D13924]' : 'text-[#9a9590] hover:text-[#f0ede8]'
          }`}
        >
          Friends
        </button>
      </div>

      {/* Auth section */}
      {parsedUser ? (
        <div className="flex items-center gap-5">
          <span
            className={`text-md cursor-pointer transition-all ${
              location.pathname.startsWith('/profile') ? 'text-[#D13924]' : 'text-[#f0ede8] hover:text-[#D13924]'
            }`}
            onClick={() => window.location.href = `/profile/${parsedUser.username}`}
          >
            {parsedUser.username}
          </span>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              sessionStorage.removeItem('token')
              sessionStorage.removeItem('user')
              window.location.href = '/login'
            }}
            className="text-white text-sm font-medium px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
            style={{ backgroundColor: '#D13924' }}
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <button
            onClick={() => window.location.href = '/login'}
            className="text-[#f0ede8] text-md cursor-pointer hover:text-[#D13924] transition-all"
          >
            Sign in
          </button>
          <button
            onClick={() => window.location.href = '/register'}
            className="text-white text-sm font-medium px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
            style={{ backgroundColor: '#D13924' }}
          >
            Join Queued
          </button>
        </div>
      )}

    </nav>
  )
}

export default Nav