import { useEffect } from 'react'
import Nav from '../components/Nav/Nav'
import Hero from '../components/Hero/Hero'
import Calendar from '../components/Calendar/Calendar'
import Trending from '../components/Trending/Trending'
import PopularDiscussions from '../components/PopularDiscussions/PopularDiscussions'
import AiringToday from '../components/AiringToday/AiringToday'

function Landing() {
  useEffect(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (user) {
      window.location.href = '/home'
    }
  }, [])

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      {/* Hero — all screen sizes */}
      <Hero watchedIds={[]} onAdded={() => {}} />

      {/* Mobile/tablet — airing today */}
      <div className="lg:hidden">
        <AiringToday />
      </div>

      {/* Weekly grid — tablet and desktop only */}
      <div className="hidden lg:block">
        <Calendar />
      </div>

      <Trending watchedIds={[]} onAdded={() => {}} />
      <PopularDiscussions />

      {/* Call to action */}
      <div className="px-4 md:px-6 py-12 md:py-16 border-t border-white/5 text-center">
        <h2 className="text-xl md:text-2xl font-medium text-[#f0ede8] mb-3">
          Your nakama are already inside
        </h2>
        <p className="text-[13px] text-[#9a9590] mb-8 max-w-md mx-auto leading-relaxed">
          Track what you watch, see what your friends are into, and never miss a drop. The community Crunchyroll forgot to build.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.href = '/register'}
            className="w-full sm:w-auto text-white font-medium px-8 py-3 rounded-full cursor-pointer hover:opacity-90 transition-all"
            style={{ backgroundColor: '#D13924' }}
          >
            Join The Queue
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full sm:w-auto text-[#f0ede8] font-medium px-8 py-3 rounded-full cursor-pointer border border-white/10 hover:bg-white/5 transition-all"
          >
            Sign in
          </button>
        </div>
      </div>

    </div>
  )
}

export default Landing