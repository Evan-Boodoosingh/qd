type Participant = {
  initials: string;
  color: string;
};

type Discussion = {
  participants: Participant[];
  show: string;
  threadTitle: string;
  threadType: "episode" | "show";
  episode?: number;
  preview: string;
  replies: number;
  timeAgo: string;
};

const discussions: Discussion[] = [
  {
    participants: [
      { initials: "JR", color: "#c4622d" },
      { initials: "MK", color: "#1D9E75" },
      { initials: "DT", color: "#7F77DD" },
    ],
    show: "Solo Leveling S3",
    threadTitle: "reaction thread",
    threadType: "episode",
    episode: 6,
    preview:
      'Jordan: "Bro the animation in this episode is INSANE. Sung Jin-Woo just keeps getting more terrifying and I am here for it 🔥"',
    replies: 12,
    timeAgo: "4m ago",
  },
  {
    participants: [
      { initials: "MK", color: "#1D9E75" },
      { initials: "DT", color: "#7F77DD" },
    ],
    show: "Demon Slayer S5",
    threadTitle: "Is this the best season yet?",
    threadType: "show",
    preview:
      'Mia: "I genuinely think Ufotable outdid themselves this season. The breathing sequences have gotten so creative I had to rewatch the fight three times."',
    replies: 7,
    timeAgo: "32m ago",
  },
  {
    participants: [{ initials: "AL", color: "#dcb43c" }],
    show: "Frieren S2",
    threadTitle: "Why this show hits different at 2am",
    threadType: "show",
    preview:
      "Alex: \"There's something about Frieren that only works when it's late and quiet. Anyone else feel like this show was made for a specific emotional state?\"",
    replies: 4,
    timeAgo: "1h ago",
  },
];

function Discussions() {
  return (
    <div className="px-6 py-5 border-t border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">
            Active discussions in your circle
          </h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">
            Threads your mutuals are already talking in
          </p>
        </div>
        <span className="text-[11px] text-[#D13924] cursor-pointer">
          See all threads
        </span>
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
              {/* Stacked avatars */}
              <div className="flex">
                {disc.participants.map((p, j) => (
                  <div
                    key={j}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-[#1a1815]"
                    style={{
                      backgroundColor: `${p.color}35`,
                      color: p.color,
                      marginLeft: j === 0 ? 0 : "-8px",
                      zIndex: disc.participants.length - j,
                      position: "relative",
                    }}
                  >
                    {p.initials}
                  </div>
                ))}
              </div>

              {/* Show + thread title */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[#9a9590]">
                  {disc.participants.length === 1
                    ? "Started a thread about"
                    : `${disc.participants.length} friends talking about`}
                </div>
                <div className="text-[12px] text-[#D13924] font-medium truncate">
                  {disc.show} —{" "}
                  {disc.threadType === "episode" ? `Ep ${disc.episode} · ` : ""}
                  {disc.threadTitle}
                </div>
              </div>

              {/* Thread type badge */}
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                  disc.threadType === "episode"
                    ? "bg-[#D13924]/10 text-[#D13924] border border-[#D13924]/25"
                    : "bg-white/5 text-[#9a9590] border border-white/10"
                }`}
              >
                {disc.threadType === "episode" ? "Episode" : "Show"}
              </span>

              <span className="text-[10px] text-[#5a5650] flex-shrink-0">
                {disc.timeAgo}
              </span>
            </div>

            {/* Preview */}
            <div className="text-[12px] text-[#c8c4be] leading-relaxed bg-white/3 rounded-lg px-3 py-2.5 mb-3 line-clamp-2">
              {disc.preview}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#9a9590]">
                <span className="text-[#D13924]">{disc.replies} replies</span> ·{" "}
                {disc.participants.length} of your friends
              </span>
              <button className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer">
                Join thread ›
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Discussions;
