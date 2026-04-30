type Show = {
  name: string
  emoji: string
  ep: number
  isNew: boolean
  isMatch?: boolean
}

type DaySchedule = {
  day: string
  isToday: boolean
  shows: Show[]
}

const schedule: DaySchedule[] = [
  {
    day: 'Mon',
    isToday: false,
    shows: [{ name: 'Frieren S2', emoji: '🌸', ep: 3, isNew: true }],
  },
  {
    day: 'Tue',
    isToday: false,
    shows: [{ name: 'Vinland Saga S3', emoji: '⚔️', ep: 7, isNew: false }],
  },
  {
    day: 'Wed',
    isToday: true,
    shows: [
      { name: 'Solo Leveling S3', emoji: '🌙', ep: 6, isNew: true, isMatch: true },
      { name: 'Gundam: Requiem', emoji: '🤖', ep: 2, isNew: true },
      { name: 'Re:ZERO S4', emoji: '❄️', ep: 4, isNew: false },
      { name: 'Classroom of the Elite S4', emoji: '📚', ep: 3, isNew: true },
    ],
  },
  {
    day: 'Thu',
    isToday: false,
    shows: [{ name: 'JJK Season 3', emoji: '🔥', ep: 9, isNew: false }],
  },
  {
    day: 'Fri',
    isToday: false,
    shows: [
      { name: 'Mushishi Returns', emoji: '🌿', ep: 4, isNew: true },
      { name: 'Slime S4', emoji: '💧', ep: 3, isNew: false },
    ],
  },
  {
    day: 'Sat',
    isToday: false,
    shows: [{ name: 'One Piece', emoji: '⚡', ep: 1122, isNew: true }],
  },
  {
    day: 'Sun',
    isToday: false,
    shows: [{ name: 'Demon Slayer S5', emoji: '⛩', ep: 8, isNew: false }],
  },
]

function Calendar() {
  return (
    <div className="px-6 pt-2 pb-5 border-t border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">This week's schedule</h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">Spring 2026 · Updated daily</p>
        </div>
        <span className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/20 px-3 py-1 rounded-full">
          Spring 2026
        </span>
      </div>

      {/* 7 day grid */}
      <div className="grid grid-cols-7 gap-2 items-start">
        {schedule.map((day) => (
          <div key={day.day} className="flex flex-col gap-1.5">
            <div className={`text-[9px] text-center uppercase tracking-wider pb-1.5 border-b border-white/5 ${
              day.isToday ? 'text-[#D13924]' : 'text-[#9a9590]'
            }`}>
              {day.isToday ? `${day.day} · Today` : day.day}
            </div>

            {day.shows.length === 0 ? (
              <div className="h-16 rounded-lg border border-dashed border-white/5 bg-white/[0.02]" />
            ) : (
              day.shows.map((show) => (
                <div
                  key={show.name}
                  className={`h-16 rounded-lg p-2 border cursor-pointer text-center transition-all hover:border-[#D13924]/40 ${
                    show.isMatch
                      ? 'bg-[#D13924]/06 border-[#D13924]/30'
                      : 'bg-[#1a1815] border-white/7'
                  }`}
                >
                  <div className="text-base mb-1">{show.emoji}</div>
                  <div className="text-[9px] text-[#c8c4be] leading-tight truncate">{show.name}</div>
                  <div className="text-[8px] text-[#9a9590] mt-0.5">Ep {show.ep}</div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 text-center">
        <span className="text-[11px] text-[#D13924] cursor-pointer hover:underline">
          View full season schedule ›
        </span>
      </div>
    </div>
  )
}

export default Calendar