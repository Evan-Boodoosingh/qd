import { useState, useEffect } from "react";
import { fetchCurrentSeason, proxyImage } from "../../services/anime";

type Show = {
  id: number;
  title: string;
  image: string | null;
  score: number;
  genres: string[];
  synopsis: string;
  studio: string;
};

function Trending() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSeason()
      .then((data) => {
        const top = data
          .filter((s: Show) => s.image && s.score > 0)
          .sort((a: Show, b: Show) => b.score - a.score)
          .filter(
            (s: Show, index: number, self: Show[]) =>
              index === self.findIndex((t) => t.id === s.id),
          )
          .slice(0, 6);
        setShows(top);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-5 border-t border-white/5">
        <div className="text-[#9a9590] text-sm animate-pulse">
          Loading trending...
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-5 border-t border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">
            Trending this season
          </h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">
            Most watched and loved by the community
          </p>
        </div>
        <span className="text-[11px] text-[#D13924] cursor-pointer">
          See all
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 gap-4">
        {shows.map((show, index) => (
          <div
            key={show.id}
            className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden cursor-pointer hover:border-[#D13924]/30 transition-all"
          >
            {/* Poster */}
            <div className="relative h-[160px] overflow-hidden">
              <img
                src={proxyImage(show.image)}
                alt={show.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#D13924] flex items-center justify-center">
                <span className="text-[9px] font-semibold text-white">
                  #{index + 1}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1815] to-transparent opacity-60" />
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="text-[11px] font-medium text-[#f0ede8] truncate mb-1">
                {show.title}
              </div>
              <div className="text-[9px] text-[#9a9590] truncate mb-2">
                {show.genres.slice(0, 2).join(" · ")}
              </div>
              <div className="text-[9px] text-[#9a9590] line-clamp-2 mb-2 leading-relaxed">
                {show.synopsis}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#9a9590]">{show.studio}</span>
                <span className="text-[9px] text-[#D13924]">
                  ♥ {show.score}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Trending;
