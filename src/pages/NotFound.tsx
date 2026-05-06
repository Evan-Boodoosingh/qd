import Nav from '../components/Nav/Nav'

function NotFound() {
  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="text-[120px] font-medium text-[#D13924] leading-none mb-4">404</div>
        <h1 className="text-2xl font-medium text-[#f0ede8] mb-3">Page not found</h1>
        <p className="text-[13px] text-[#9a9590] mb-8 max-w-sm">
          This page doesn't exist or was moved. Head back home and find something to watch.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = '/home'}
            className="text-[13px] text-white font-medium px-6 py-2.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
            style={{ backgroundColor: '#D13924' }}
          >
            Go home
          </button>
          <button
            onClick={() => window.history.back()}
            className="text-[13px] text-[#9a9590] border border-white/10 px-6 py-2.5 rounded-full cursor-pointer hover:bg-white/5 transition-all"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound