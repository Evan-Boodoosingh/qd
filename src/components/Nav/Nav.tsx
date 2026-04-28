function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0f0e0d]/95 backdrop-blur-md z-50">

      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/queued.png"
          alt="Queued"
          className="h-8 object-contain"
        />
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <button type="button" className="text-[#D13924] text-sm cursor-pointer transition hover:text-[#f0ede8]">
          Home
        </button>
        <button type="button" className="text-[#9a9590] text-sm cursor-pointer transition hover:text-[#f0ede8]">
          Schedule
        </button>
        <button type="button" className="text-[#9a9590] text-sm cursor-pointer transition hover:text-[#f0ede8]">
          Community
        </button>
        <button type="button" className="text-[#9a9590] text-sm cursor-pointer transition hover:text-[#f0ede8]">
          My List
        </button>
        <button type="button" className="text-[#9a9590] text-sm cursor-pointer transition hover:text-[#f0ede8]">
          Friends
        </button>
      </div>

      {/* Join Button */}
      <button
        className="text-white text-sm font-medium px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
        style={{ backgroundColor: '#D13924' }}
      >
        Join Queued
      </button>

    </nav>
  )
}

export default Nav