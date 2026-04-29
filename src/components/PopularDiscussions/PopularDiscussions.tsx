type PopularDiscussion = {
  show: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  preview: string
  replies: number
  likes: number
  timeAgo: string
  totalParticipants: number
}

const discussions: PopularDiscussion[] = [
  {
    show: 'Frieren S2',
    threadTitle: 'The writing in this show is on another level',
    threadType: 'show',
    preview: 'I\'ve watched a lot of anime but nothing hits quite like Frieren. The way it handles grief, time, and connection without ever being heavy handed is just masterful storytelling.',
    replies: 847,
    likes: 3200,
    timeAgo: '2h ago',
    totalParticipants: 412,
  },
  {
    show: 'Solo Leveling S3',
    threadTitle: 'Ep 6 had the best animation of the entire season',
    threadType: 'episode',
    season: 3,
    episode: 6,
    preview: 'The fight sequence at the 14 minute mark is some of the best sakuga I\'ve seen in years. A-1 Pictures absolutely went all out for this one.',
    replies: 1203,
    likes: 5800,
    timeAgo: '4h ago',
    totalParticipants: 891,
  },
  {
    show: 'Demon Slayer S5',
    threadTitle: 'Is this the best season Ufotable has ever produced?',
    threadType: 'season',
    season: 5,
    preview: 'Every episode this season has been a visual masterpiece. The breathing technique animations have evolved so much from Season 1. Genuine question — does any other studio come close right now?',
    replies: 2104,
    likes: 8900,
    timeAgo: '6h ago',
    totalParticipants: 1247,
  },
]

function PopularDiscussions() {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user')

  return (
    <div className="px-6 py-5 border-t border-white/5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">Popular discussions</h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">What the community is talking about right now</p>
        </div>
        <span className="text-[11px] text-[#D13924] cursor-pointer">See all threads</span>
      </div>

      {/* Discussion cards */}
      <div className="flex flex-col gap-3">
        {discussions.map((disc, i) => (
          <div
            key={i}
            className="bg-[#1a1815] border border-white/7 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
          >
            {/* Top row */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[#9a9590]">Discussion about</div>
                <div className="text-[12px] text-[#D13924] font-medium truncate">
                  {disc.show} —{' '}
                  {disc.threadType === 'episode' && `S${disc.season} Ep ${disc.episode} · `}
                  {disc.threadType === 'season' && `Season ${disc.season} · `}
                  {disc.threadTitle}
                </div>
              </div>

              {/* Thread type badge */}
              <span className={`text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 border ${
                disc.threadType === 'episode'
                  ? 'bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25'
                  : disc.threadType === 'season'
                  ? 'bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/25'
                  : 'bg-white/5 text-[#9a9590] border-white/10'
              }`}>
                {disc.threadType === 'episode' ? 'Episode' : disc.threadType === 'season' ? 'Season' : 'Show'}
              </span>

              <span className="text-[10px] text-[#5a5650] flex-shrink-0">{disc.timeAgo}</span>
            </div>

            {/* Preview */}
            <div className="text-[12px] text-[#c8c4be] leading-relaxed bg-white/3 rounded-lg px-3 py-2.5 mb-3 line-clamp-2">
              {disc.preview}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-[#9a9590]">
                  <span className="text-[#D13924]">{disc.replies.toLocaleString()}</span> replies
                </span>
                <span className="text-[11px] text-[#9a9590]">
                  <span className="text-[#D13924]">{disc.likes.toLocaleString()}</span> likes
                </span>
                <span className="text-[11px] text-[#9a9590]">
                  {disc.totalParticipants.toLocaleString()} participants
                </span>
              </div>

              {user ? (
                <button className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer">
                  Join thread ›
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/register'}
                  className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer"
                >
                  Sign up to reply ›
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default PopularDiscussions