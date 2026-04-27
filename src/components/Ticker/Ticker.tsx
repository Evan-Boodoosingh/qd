const items = [
  { name: "Demon Slayer S5", emoji: "⛩", isNew: true },
  { name: "One Piece Ep 1122", emoji: "⚡", isNew: true },
  { name: "Solo Leveling S3", emoji: "🌙", isNew: false },
  { name: "Mushishi Returns", emoji: "🌿", isNew: true },
  { name: "JJK Season 3", emoji: "🔥", isNew: false },
  { name: "Frieren S2", emoji: "🌸", isNew: true },
  { name: "Vinland Saga S3", emoji: "⚔️", isNew: false },
  { name: "Gundam: Requiem", emoji: "🤖", isNew: true },
];

const allItems = [...items, ...items];

function Ticker() {
  return (
    <div className="overflow-hidden border-t border-b border-white/5 bg-[#0d0c0b]">
      <div className="inline-flex animate-marquee whitespace-nowrap">
        {allItems.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-r border-white/5 cursor-pointer hover:bg-white/5 flex-shrink-0"
          >
            <span className="text-sm">{item.emoji}</span>
            <span className="text-[11px] text-[#c8c4be]">{item.name}</span>
            {item.isNew && (
              <span className="text-[9px] text-[#D13924] bg-[#D13924]/10 px-1.5 py-0.5 rounded">
                New
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Ticker;
