import { useState, useEffect } from "react";

const slides = [
  {
    title: "Demon Slayer Season 5",
    tag: "Airing now · Ep 8",
    genre: "Action · Supernatural",
    platform: "Crunchyroll",
    day: "Sundays",
    emoji: "⛩",
    gradient: "from-[#1e0e08] via-[#2a1208] to-[#0f0e0d]",
  },
  {
    title: "One Piece — Egghead Arc",
    tag: "Airing now · Ep 1122",
    genre: "Adventure · Shonen",
    platform: "Netflix",
    day: "Saturdays",
    emoji: "⚡",
    gradient: "from-[#08101e] via-[#0a1828] to-[#0f0e0d]",
  },
  {
    title: "Solo Leveling Season 3",
    tag: "Airing now · Ep 6",
    genre: "Action · Fantasy",
    platform: "Prime Video",
    day: "Wednesdays",
    emoji: "🌙",
    gradient: "from-[#12081e] via-[#1a0a28] to-[#0f0e0d]",
  },
  {
    title: "Mushishi Returns",
    tag: "Airing now · Ep 4",
    genre: "Slice of life · Mystery",
    platform: "HiDive",
    day: "Fridays",
    emoji: "🌿",
    gradient: "from-[#081e10] via-[#0a2814] to-[#0f0e0d]",
  },
  {
    title: "Jujutsu Kaisen Season 3",
    tag: "Airing now · Ep 9",
    genre: "Action · Dark fantasy",
    platform: "Crunchyroll",
    day: "Thursdays",
    emoji: "🔥",
    gradient: "from-[#1e1208] via-[#281a08] to-[#0f0e0d]",
  },
];

function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative h-[220px] overflow-hidden">
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700`}
      />

      {/* Decorative emoji */}
      <div className="absolute inset-0 flex items-center justify-end pr-10 text-[90px] opacity-10 select-none">
        {slide.emoji}
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] to-transparent" />

      {/* Left fade */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e0d] to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-7 z-10">
        <div className="inline-block text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/30 rounded-full px-3 py-1 mb-2">
          ● {slide.tag}
        </div>
        <h2 className="text-2xl font-medium text-[#f0ede8] mb-2">
          {slide.title}
        </h2>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] text-[#9a9590]">{slide.genre}</span>
          <span className="text-[10px] text-[#D13924] bg-[#D13924]/10 px-2 py-0.5 rounded">
            {slide.platform}
          </span>
          <span className="text-[11px] text-[#9a9590]">{slide.day}</span>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#D13924] text-white text-[11px] font-medium px-4 py-1.5 rounded-md cursor-pointer hover:bg-[#e04030]">
            + Add to list
          </button>
          <button className="bg-white/5 text-[#f0ede8] text-[11px] px-4 py-1.5 rounded-md border border-white/10 cursor-pointer hover:bg-white/10">
            Community
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 right-5 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-[3px] rounded-full cursor-pointer transition-all duration-300 ${
              i === current ? "w-6 bg-[#D13924]" : "w-4 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Hero;
