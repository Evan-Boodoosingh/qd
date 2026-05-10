import API from '../services/api'
import { useState, useEffect } from 'react'
import Nav from '../components/Nav/Nav'
import { proxyImage } from '../services/anime'
import { Search as SearchIcon } from 'lucide-react'

type AnimeResult = {
  id: number
  title: string
  image: string | null
  score: number
  genres: string[]
  episodes: number | null
  synopsis: string
  year: number | null
}

type UserResult = {
  _id: string
  username: string
  displayName: string
}

function Search() {
const [query, setQuery] = useState('')
  const [animeResults, setAnimeResults] = useState<AnimeResult[]>([])
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'shows' | 'users'>('shows')
  const [searched, setSearched] = useState(false)

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  useEffect(() => {
    if (!query.trim()) return

    const delay = setTimeout(async () => {
      setLoading(true)
      setSearched(true)

      try {
        const [animeRes, usersRes] = await Promise.all([
          fetch(`${API}/api/anime/search?q=${encodeURIComponent(query)}`),
          token
            ? fetch(`${API}/api/users/search?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            : Promise.resolve(null),
        ])

        const animeData = await animeRes.json()
        setAnimeResults(animeData.results || [])

        if (usersRes) {
          const usersData = await usersRes.json()
          setUserResults(Array.isArray(usersData) ? usersData : [])
        }
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delay)
  }, [query])

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Search</h1>
          <p className="text-[13px] text-[#9a9590]">Find shows and people on Queued</p>
        </div>

        {/* Search input */}
        <div className="relative mb-6">
          <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5650]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for anime or users..."
            autoFocus
            className="w-full bg-[#1a1815] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-[14px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setAnimeResults([])
                setUserResults([])
                setSearched(false)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a5650] hover:text-[#9a9590] transition-all cursor-pointer text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tabs — only show when there are results */}
        {searched && !loading && (
          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 w-fit mb-6">
            <button
              onClick={() => setActiveTab('shows')}
              className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'shows' ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
              }`}
              style={activeTab === 'shows' ? { backgroundColor: '#D13924' } : {}}
            >
              Shows
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'shows' ? 'bg-white/20' : 'bg-white/5'
              }`}>
                {animeResults.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2 ${
                activeTab === 'users' ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
              }`}
              style={activeTab === 'users' ? { backgroundColor: '#D13924' } : {}}
            >
              Users
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === 'users' ? 'bg-white/20' : 'bg-white/5'
              }`}>
                {userResults.length}
              </span>
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-[#9a9590] text-sm animate-pulse">Searching...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && animeResults.length === 0 && userResults.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#9a9590] text-sm mb-2">No results for "{query}"</p>
            <p className="text-[#5a5650] text-[12px]">Try a different search term</p>
          </div>
        )}

        {/* Default state */}
        {!searched && (
          <div className="text-center py-16">
            <p className="text-[#9a9590] text-sm">Start typing to search for anime or users</p>
          </div>
        )}

        {/* Shows results */}
        {!loading && searched && activeTab === 'shows' && animeResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {animeResults.map((show) => (
              <div
                key={show.id}
                onClick={() => window.location.href = `/show/${show.id}`}
                className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden cursor-pointer hover:border-[#D13924]/30 transition-all flex gap-4 p-4"
              >
                <div className="w-16 h-24 bg-[#0f0e0d] rounded-lg overflow-hidden flex-shrink-0">
                  {show.image ? (
                    <img
                      src={proxyImage(show.image)}
                      alt={show.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5a5650] text-[10px]">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#f0ede8] mb-1 truncate">{show.title}</div>
                  <div className="text-[11px] text-[#9a9590] mb-2">
                    {show.genres.slice(0, 2).join(' · ')}
                    {show.year && ` · ${show.year}`}
                  </div>
                  {show.score > 0 && (
                    <div className="text-[11px] text-[#D13924] mb-2">♥ {show.score}</div>
                  )}
                  {show.synopsis && (
                    <p className="text-[11px] text-[#5a5650] line-clamp-2 leading-relaxed">
                      {show.synopsis.replace(/\[Written by MAL Rewrite\]/g, '').trim()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty shows */}
        {!loading && searched && activeTab === 'shows' && animeResults.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#9a9590] text-sm">No shows found for "{query}"</p>
          </div>
        )}

        {/* Users results */}
        {!loading && searched && activeTab === 'users' && userResults.length > 0 && (
          <div className="flex flex-col gap-3">
            {userResults.map((user) => {
              const colors = ['#c4622d', '#1D9E75', '#7F77DD', '#dcb43c', '#D13924', '#4A90D9']
              const color = colors[user._id.charCodeAt(0) % colors.length]
              const initials = (user.displayName || user.username).slice(0, 2).toUpperCase()
              return (
                <div
                  key={user._id}
                  onClick={() => window.location.href = `/profile/${user.username}`}
                  className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: `${color}25`, color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#f0ede8]">{user.displayName || user.username}</div>
                    <div className="text-[11px] text-[#9a9590]">@{user.username}</div>
                  </div>
                  <span className="text-[11px] text-[#D13924]">View profile ›</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty users */}
        {!loading && searched && activeTab === 'users' && userResults.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#9a9590] text-sm">No users found for "{query}"</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default Search