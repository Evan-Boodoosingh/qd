import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Nav from "../components/Nav/Nav";
import { proxyImage } from "../services/anime";
import {
  addToWatchlist,
  updateWatchlistEntry,
  fetchWatchlist,
} from "../services/watchlist";
import { toast } from "../components/Toast/toastService";

type WatchStatus = "watching" | "completed" | "planToWatch" | "dropped" | null;

type Episode = {
  number: number;
  title: string;
  airDate: string | null;
  filler: boolean;
  recap: boolean;
};

type Related = {
  relation: string;
  entries: {
    id: number;
    title: string;
    type: string;
    url: string;
  }[];
};

type StreamingService = {
  name: string;
  url: string;
};

type ExternalLink = {
  name: string;
  url: string;
};

type Reply = {
  _id: string;
};

type Discussion = {
  _id: string;
  threadTitle: string;
  threadType: "episode" | "season" | "show";
  season?: number;
  episode?: number;
  replies: Reply[];
  likes: string[];
  createdAt: string;
  hasSpoiler: boolean;
  username: string;
};

type Show = {
  id: number;
  title: string;
  titleJapanese: string | null;
  image: string | null;
  score: number;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  genres: string[];
  themes: string[];
  demographics: string[];
  synopsis: string;
  trailer: string | null;
  studio: string;
  source: string | null;
  duration: string | null;
  rating: string | null;
  episodes: number | null;
  status: string;
  airing: boolean;
  airedFrom: string | null;
  airedTo: string | null;
  day: string | null;
  time: string | null;
  season: string;
  year: number | null;
  url: string;
  related: Related[];
  streaming: StreamingService[];
  external: ExternalLink[];
  openingThemes: string[];
  endingThemes: string[];
  episodeList: Episode[];
  totalEpisodePages: number;
};

const timeAgo = (dateString: string) => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const cleanSynopsis = (text: string) => {
  return text
    .replace(/\[Written by MAL Rewrite\]/g, "")
    .replace(/\(Source:.*?\)/g, "")
    .trim();
};

const formatAirDate = (dateString: string | null) => {
  if (!dateString) return "TBA";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type WatchlistEntry = {
  showId: number;
  status: WatchStatus;
  currentEpisode: number;
  rating: number | null;
};

function Show() {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchStatus, setWatchStatus] = useState<WatchStatus>(null);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [onList, setOnList] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"episodes" | "discussions" | "related">("episodes");
  const [episodePage, setEpisodePage] = useState(1);
  const [episodePages, setEpisodePages] = useState<Record<number, Episode[]>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [hideFiller, setHideFiller] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [rating, setRating] = useState<number | null>(null)
const [openRating, setOpenRating] = useState(false)

  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  const isLoggedIn = !!user;

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3001/api/anime/show/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setShow(data);
        if (data.episodeList?.length > 0) {
          setEpisodePages({ 1: data.episodeList });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`http://localhost:3001/api/threads?showId=${id}`)
      .then((res) => res.json())
      .then((data) => setDiscussions(Array.isArray(data) ? data : []))
      .catch(() => {});

    if (isLoggedIn) {
      fetchWatchlist()
        .then((watchlist: WatchlistEntry[]) => {
          const entry = watchlist.find((w) => w.showId === Number(id));
          if (entry) {
            setOnList(true);
            setWatchStatus(entry.status);
            setCurrentEpisode(entry.currentEpisode);
            setRating(entry.rating ?? null);
          }
        })
        .catch(() => {});
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = async (page: number) => {
    setEpisodePage(page);
    if (episodePages[page]) return;
    setLoadingEpisodes(true);
    try {
      const res = await fetch(`http://localhost:3001/api/anime/show/${id}/episodes?page=${page}`);
      const data = await res.json();
      if (data.episodes) {
        setEpisodePages((prev) => ({ ...prev, [page]: data.episodes }));
      }
    } catch {
      toast.error("Failed to load episodes");
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleAddToList = async () => {
    if (!show) return;
    try {
      const currentEps = episodePages[1] || [];
      const airingEpisode = show.airing ? currentEps.length || null : show.episodes;
      await addToWatchlist({
        showId: show.id,
        showName: show.title,
        image: show.image,
        totalEpisodes: show.episodes,
        airingEpisode,
        genres: show.genres,
      });
      setOnList(true);
      setWatchStatus("planToWatch");
      toast.success("Added to list");
    } catch (err) {
      if (err instanceof Error && err.message === "Show already on your list") {
        setOnList(true);
      } else {
        toast.error("Failed to add to list");
      }
    }
  };

  const handleStatusChange = async (status: WatchStatus) => {
    if (!show || !status) return;
    setWatchStatus(status);
    setSavingStatus(true);
    try {
      if (!onList) await handleAddToList();
      await updateWatchlistEntry(show.id, { status });
      const labels: Record<string, string> = {
        watching: "Watching",
        planToWatch: "Plan to Watch",
        completed: "Completed",
        dropped: "Dropped",
      };
      toast.success(`Marked as ${labels[status]}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleEpisodeChange = async (newEp: number) => {
    if (!show) return;
    const firstPageEps = episodePages[1] || [];
    const cap = show.airing ? firstPageEps.length || show.episodes || 999 : show.episodes || 999;
    const capped = Math.min(Math.max(0, newEp), cap);
    setCurrentEpisode(capped);
    try {
      await updateWatchlistEntry(show.id, { currentEpisode: capped });
    } catch {
      toast.error("Failed to update episode");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white" onClick={() => setOpenRating(false)}>
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading show...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm">Show not found</p>
        </div>
      </div>
    );
  }

  const handleRating = async (newRating: number) => {
    setRating(newRating)
    setOpenRating(false)
    try {
      await updateWatchlistEntry(show!.id, { rating: newRating })
      toast.success(`Rated ${newRating}/10`)
    } catch {
      toast.error('Failed to save rating')
    }
  }

  const totalEpisodePages = show.totalEpisodePages || 1;
  const currentPageEpisodes = episodePages[episodePage] || [];
  const firstPageEps = episodePages[1] || [];
  const episodeCap = show.airing ? firstPageEps.length || show.episodes || null : show.episodes;
  const displayedEpisodes = hideFiller ? currentPageEpisodes.filter((ep) => !ep.filler) : currentPageEpisodes;
  const hasFillerOnPage = currentPageEpisodes.some((ep) => ep.filler);

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      {/* ── MOBILE HERO — poster centered in blurred banner ── */}
      <div className="md:hidden relative overflow-hidden bg-[#1a1815]">
        {/* Blurred background */}
        <img
          src={proxyImage(show.image)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0e0d]/30 via-transparent to-[#0f0e0d]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-6">
          {/* Poster */}
          <div className="w-36 rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-5">
            <img
              src={proxyImage(show.image)}
              alt={show.title}
              className="w-full object-cover"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl font-medium text-[#f0ede8] text-center mb-1 leading-tight">
            {show.title}
          </h1>
          {show.titleJapanese && (
            <p className="text-[11px] text-[#5a5650] text-center mb-3">{show.titleJapanese}</p>
          )}

          {/* Genre tags */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {show.genres.slice(0, 4).map((g) => (
              <span key={g} className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2.5 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>

          {/* Studio + status */}
          <p className="text-[12px] text-[#9a9590] text-center">
            {show.studio} · {show.airing ? `Airing · ${show.day}` : show.status}
          </p>
        </div>
      </div>

      {/* ── DESKTOP HERO — blurred banner with title overlay ── */}
      <div className="hidden md:block relative h-[210px] lg:h-[240px] overflow-hidden bg-[#1a1815]">
        <img
          src={proxyImage(show.image)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] via-[#0f0e0d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e0d] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-8 pb-5 lg:pb-6 flex flex-col items-center text-center">
          <h1 className="text-2xl lg:text-3xl font-medium text-[#f0ede8] mb-1 line-clamp-1">{show.title}</h1>
          {show.titleJapanese && (
            <p className="text-[11px] text-[#5a5650] mb-2 truncate max-w-[90%]">{show.titleJapanese}</p>
          )}
          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            {show.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full">{g}</span>
            ))}
            {show.rating && (
              <span className="text-[10px] text-[#9a9590] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{show.rating.split(" ")[0]}</span>
            )}
          </div>
          <p className="text-[12px] text-[#9a9590]">{show.studio} · {show.airing ? `Airing · ${show.day}` : show.status}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-5 lg:gap-6 items-start">

          {/* ── Main column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 w-full">

            {/* Action bar */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 flex-wrap">
              {isLoggedIn ? (
                <>
                  {!onList ? (
                    <button
                      onClick={handleAddToList}
                      className="text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: "#D13924" }}
                    >
                      + Add to list
                    </button>
                  ) : (
                    <div className="flex gap-1 bg-[#0f0e0d] border border-white/7 rounded-lg p-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      {(["watching", "planToWatch", "completed", "dropped"] as WatchStatus[]).map((s) => (
                        <button
                          key={s!}
                          onClick={() => handleStatusChange(s)}
                          disabled={savingStatus}
                          className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-[11px] cursor-pointer transition-all whitespace-nowrap ${
                            watchStatus === s ? "text-white" : "text-[#9a9590] hover:text-[#f0ede8]"
                          }`}
                          style={watchStatus === s ? { backgroundColor: "#D13924" } : {}}
                        >
                          {s === "watching" ? "Watching" : s === "planToWatch" ? "Plan to Watch" : s === "completed" ? "Completed" : "Dropped"}
                        </button>
                      ))}
                    </div>
                  )}

                  {onList && watchStatus === "watching" && (
                    <div className="flex items-center gap-2 bg-[#0f0e0d] border border-white/7 rounded-lg px-3 py-2">
                      <button onClick={() => handleEpisodeChange(currentEpisode - 1)} className="text-[#9a9590] hover:text-[#f0ede8] cursor-pointer w-4 text-center">−</button>
                      <span className="text-[11px] sm:text-[12px] text-[#f0ede8] w-20 sm:w-24 text-center">
                        Ep {currentEpisode} / {episodeCap || "?"}
                      </span>
                      <button onClick={() => handleEpisodeChange(currentEpisode + 1)} className="text-[#9a9590] hover:text-[#f0ede8] cursor-pointer w-4 text-center">+</button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => (window.location.href = "/register")}
                  className="text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                  style={{ backgroundColor: "#D13924" }}
                >
                  Sign up to track this show
                </button>
              )}

              {/* Rating button — only show if on list */}
              {onList && (
                <div className="relative ml-auto" style={{ zIndex: openRating ? 50 : 1 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenRating(!openRating) }}
                    className="flex items-center gap-1.5 text-[11px] sm:text-[12px] border border-white/10 px-3 sm:px-4 py-2 rounded-full cursor-pointer hover:bg-white/5 transition-all whitespace-nowrap"
                    style={{
                      color: rating ? '#D13924' : '#9a9590',
                      borderColor: rating ? 'rgba(209,57,36,0.3)' : undefined,
                      backgroundColor: rating ? 'rgba(209,57,36,0.08)' : undefined,
                    }}
                  >
                    ♥ {rating ? `${rating}/10` : 'Rate'}
                  </button>
                  {openRating && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full right-0 mt-1 bg-[#1a1815] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                      style={{ zIndex: 50, minWidth: '80px' }}
                    >
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                        <button
                          key={n}
                          onClick={() => handleRating(n)}
                          className={`w-full text-left px-4 py-2 text-[12px] transition-all cursor-pointer ${
                            rating === n ? 'text-white bg-[#D13924]' : 'text-[#9a9590] hover:text-[#f0ede8] hover:bg-white/5'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      {rating && (
                        <button
                          onClick={() => handleRating(0)}
                          className="w-full text-left px-4 py-2 text-[11px] text-[#5a5650] hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer border-t border-white/5"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowTrailer(!showTrailer)}
                className="text-[11px] sm:text-[12px] text-[#f0ede8] border border-white/10 px-3 sm:px-4 py-2 rounded-full cursor-pointer hover:bg-white/5 transition-all whitespace-nowrap"
              >
                {showTrailer ? "Hide trailer" : "▶ Trailer"}
              </button>
            </div>

            {/* Trailer */}
            {showTrailer && show.trailer && (
              <div className="rounded-xl overflow-hidden border border-white/7 aspect-video w-full">
                <iframe src={show.trailer} className="w-full h-full" allowFullScreen title={`${show.title} trailer`} />
              </div>
            )}

            {/* ── Mobile stats grid — 2x2 pills ── */}
            <div className="md:hidden grid grid-cols-2 gap-2">
              {[
                { label: "Score", value: `♥ ${show.score}`, highlight: true },
                { label: "Rank", value: show.rank ? `#${show.rank}` : "N/A", highlight: true },
                { label: "Episodes", value: show.episodes ? `${show.episodes} eps` : "Ongoing" },
                { label: "Status", value: show.airing ? "Airing" : show.status },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#1a1815] border border-white/7 rounded-xl px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[10px] text-[#9a9590] uppercase tracking-wider">{stat.label}</span>
                  <span className={`text-[14px] font-medium ${stat.highlight ? 'text-[#D13924]' : 'text-[#f0ede8]'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Mobile streaming ── */}
            {show.streaming.length > 0 && (
              <div className="md:hidden flex flex-wrap gap-2">
                {show.streaming.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => window.open(s.url, "_blank")}
                    className="text-[12px] text-[#f0ede8] bg-[#1a1815] border border-white/10 px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-all"
                  >
                    {s.name} →
                  </button>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 sm:p-5">
              <h2 className="text-[12px] sm:text-[13px] font-medium text-[#f0ede8] mb-2 sm:mb-3">Synopsis</h2>
              {show.synopsis ? (
                <p className="text-[12px] sm:text-[13px] text-[#c8c4be] leading-relaxed">{cleanSynopsis(show.synopsis)}</p>
              ) : (
                <p className="text-[12px] sm:text-[13px] text-[#5a5650]">No synopsis available yet.</p>
              )}
            </div>

            {/* ── Mobile more details — collapsible ── */}
            <div className="md:hidden bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <span className="text-[12px] font-medium text-[#f0ede8]">More details</span>
                <span className="text-[#9a9590] text-[12px]">{showMoreDetails ? '▲' : '▼'}</span>
              </button>
              {showMoreDetails && (
                <div className="px-4 pb-4 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3">
                    {[
                      { label: "Studio", value: show.studio },
                      { label: "Source", value: show.source || "Unknown" },
                      { label: "Duration", value: show.duration || "Unknown" },
                      { label: "Season", value: `${show.season} ${show.year}` },
                      { label: "Aired", value: formatAirDate(show.airedFrom) },
                      { label: "Rating", value: show.rating?.split(" - ")[0] || "Unknown" },
                      ...(show.members ? [{ label: "Members", value: show.members.toLocaleString() }] : []),
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-[#9a9590] uppercase tracking-wider">{item.label}</span>
                        <span className="text-[11px] text-[#f0ede8]">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Genres & Themes */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="text-[10px] text-[#9a9590] uppercase tracking-wider mb-2">Genres & Themes</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[...show.genres, ...show.themes, ...show.demographics].map((g) => (
                        <span key={g} className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full">{g}</span>
                      ))}
                    </div>
                  </div>

                  {/* External links */}
                  {show.external.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="text-[10px] text-[#9a9590] uppercase tracking-wider mb-2">Links</div>
                      <div className="flex flex-wrap gap-2">
                        {show.external.slice(0, 5).map((link) => (
                          <button
                            key={link.name}
                            onClick={() => window.open(link.url, "_blank")}
                            className="text-[11px] text-[#f0ede8] border border-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/5 transition-all"
                          >
                            {link.name} →
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop streaming */}
            {show.streaming.length > 0 && (
              <div className="hidden md:block bg-[#1a1815] border border-white/7 rounded-xl p-4 sm:p-5">
                <h2 className="text-[12px] sm:text-[13px] font-medium text-[#f0ede8] mb-2 sm:mb-3">Where to watch</h2>
                <div className="flex flex-wrap gap-2">
                  {show.streaming.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => window.open(s.url, "_blank")}
                      className="text-[11px] sm:text-[12px] text-[#f0ede8] bg-white/5 border border-white/10 px-3 sm:px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-all"
                    >
                      {s.name} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="overflow-x-auto -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
              <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 w-fit min-w-full sm:min-w-0">
                {[
                  { label: "Episodes", value: "episodes" },
                  { label: `Discussions (${discussions.length})`, value: "discussions" },
                  { label: "Related", value: "related" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value as "episodes" | "discussions" | "related")}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-[12px] cursor-pointer transition-all whitespace-nowrap ${
                      activeTab === tab.value ? "text-white" : "text-[#9a9590] hover:text-[#f0ede8]"
                    }`}
                    style={activeTab === tab.value ? { backgroundColor: "#D13924" } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes tab */}
            {activeTab === "episodes" && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 sm:p-5">
                {currentPageEpisodes.length === 0 && !loadingEpisodes ? (
                  <p className="text-[12px] sm:text-[13px] text-[#5a5650] text-center py-6">Episode list not available yet</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 flex-wrap">
                      <span className="text-[11px] sm:text-[12px] text-[#9a9590]">
                        {currentPageEpisodes.length > 0 ? (
                          <>
                            Eps <span className="text-[#f0ede8]">{currentPageEpisodes[0]?.number}–{currentPageEpisodes[currentPageEpisodes.length - 1]?.number}</span>
                            {show.episodes && <> of <span className="text-[#f0ede8]">{show.episodes}</span></>}
                          </>
                        ) : "Loading..."}
                      </span>
                      <div className="flex items-center gap-2">
                        {hasFillerOnPage && (
                          <button
                            onClick={() => setHideFiller((prev) => !prev)}
                            className={`text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                              hideFiller ? "border-[#D13924] text-[#D13924] bg-[#D13924]/10" : "border-white/10 text-[#9a9590] hover:text-[#f0ede8]"
                            }`}
                          >
                            {hideFiller ? "Canon only" : "Hide filler"}
                          </button>
                        )}
                        {totalEpisodePages > 1 && (
                          <select
                            value={episodePage}
                            onChange={(e) => handlePageChange(Number(e.target.value))}
                            className="bg-[#0f0e0d] border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 text-[11px] sm:text-[12px] text-[#f0ede8] cursor-pointer focus:outline-none focus:border-[#D13924] transition-all"
                          >
                            {Array.from({ length: totalEpisodePages }, (_, i) => {
                              const start = i * 100 + 1;
                              const isLastPage = i === totalEpisodePages - 1;
                              const end = isLastPage && show.airing ? "Current" : (i + 1) * 100;
                              return <option key={i + 1} value={i + 1}>Ep {start}–{end}</option>;
                            })}
                          </select>
                        )}
                      </div>
                    </div>

                    {loadingEpisodes ? (
                      <div className="text-center py-12">
                        <p className="text-[#9a9590] text-sm animate-pulse">Loading episodes...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        {displayedEpisodes.map((ep) => {
                          const watched = watchStatus === "watching" && currentEpisode >= ep.number;
                          return (
                            <div
                              key={ep.number}
                              onClick={() => (window.location.href = `/show/${show.id}/episode/${ep.number}`)}
                              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer ${
                                watched ? "border-[#D13924]/20 bg-[#D13924]/05 hover:border-[#D13924]/40" : "border-white/5 hover:border-white/15"
                              }`}
                            >
                              <div
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-medium shrink-0"
                                style={{
                                  backgroundColor: watched ? "#D13924" : "rgba(255,255,255,0.08)",
                                  color: watched ? "#fff" : "#9a9590",
                                }}
                              >
                                {ep.number}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] sm:text-[12px] text-[#f0ede8] truncate">{ep.title}</div>
                                {ep.airDate && (
                                  <div className="text-[9px] sm:text-[10px] text-[#5a5650] mt-0.5">{formatAirDate(ep.airDate)}</div>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                {ep.filler && <span className="text-[9px] text-[#9a9590] bg-white/5 px-1.5 sm:px-2 py-0.5 rounded">Filler</span>}
                                {ep.recap && <span className="text-[9px] text-[#9a9590] bg-white/5 px-1.5 sm:px-2 py-0.5 rounded">Recap</span>}
                                <span className="text-[10px] text-[#D13924]">›</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Discussions tab */}
            {activeTab === "discussions" && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-[12px] sm:text-[13px] font-medium text-[#f0ede8]">Community discussions</h2>
                  {isLoggedIn && (
                    <button
                      onClick={() => (window.location.href = `/thread/new?showId=${show.id}&showName=${encodeURIComponent(show.title)}`)}
                      className="text-[10px] sm:text-[11px] text-white px-2.5 sm:px-3 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all whitespace-nowrap"
                      style={{ backgroundColor: "#D13924" }}
                    >
                      + New thread
                    </button>
                  )}
                </div>
                {discussions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#9a9590] text-sm">No discussions yet</p>
                    <p className="text-[#5a5650] text-[12px] mt-1">Be the first to start a conversation</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {discussions.map((disc) => (
                      <div
                        key={disc._id}
                        onClick={() => (window.location.href = `/thread/${disc._id}`)}
                        className="border border-white/5 rounded-xl p-3 sm:p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-[#9a9590] mb-1">
                              {disc.threadType === "episode" && `S${disc.season} Ep ${disc.episode}`}
                              {disc.threadType === "season" && `Season ${disc.season}`}
                              {disc.threadType === "show" && "General discussion"}
                            </div>
                            <div className="text-[12px] sm:text-[13px] font-medium text-[#f0ede8] line-clamp-2">{disc.threadTitle}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                              disc.threadType === "episode" ? "bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25"
                              : disc.threadType === "season" ? "bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/25"
                              : "bg-white/5 text-[#9a9590] border-white/10"
                            }`}>
                              {disc.threadType === "episode" ? "Episode" : disc.threadType === "season" ? "Season" : "Show"}
                            </span>
                            {disc.hasSpoiler && (
                              <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full">⚠ Spoiler</span>
                            )}
                            <span className="text-[10px] text-[#5a5650]">{timeAgo(disc.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <span className="text-[10px] sm:text-[11px] text-[#9a9590]"><span className="text-[#D13924]">{disc.replies.length}</span> replies</span>
                            <span className="text-[10px] sm:text-[11px] text-[#9a9590]"><span className="text-[#D13924]">{disc.likes.length}</span> likes</span>
                            <span className="hidden sm:inline text-[11px] text-[#9a9590]">by @{disc.username}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); window.location.href = `/thread/${disc._id}`; }}
                            className="text-[10px] sm:text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-2 sm:px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer whitespace-nowrap"
                          >
                            Join ›
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Related tab */}
            {activeTab === "related" && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 sm:p-5">
                {show.related.length === 0 ? (
                  <p className="text-[12px] sm:text-[13px] text-[#5a5650] text-center py-6">No related entries found</p>
                ) : (
                  <div className="flex flex-col gap-4 sm:gap-6">
                    {show.related.map((group) => (
                      <div key={group.relation}>
                        <h3 className="text-[11px] sm:text-[12px] font-medium text-[#9a9590] mb-2 sm:mb-3 uppercase tracking-wider">{group.relation}</h3>
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          {group.entries.map((entry) => (
                            <div
                              key={entry.id}
                              onClick={() => entry.type === "anime" && (window.location.href = `/show/${entry.id}`)}
                              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-white/5 transition-all ${
                                entry.type === "anime" ? "cursor-pointer hover:border-[#D13924]/30" : "cursor-default"
                              }`}
                            >
                              <div>
                                <div className="text-[11px] sm:text-[12px] text-[#f0ede8]">{entry.title}</div>
                                <div className="text-[10px] text-[#9a9590] mt-0.5 capitalize">{entry.type}</div>
                              </div>
                              {entry.type === "anime" && <span className="text-[11px] text-[#D13924]">View →</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Music */}
            {(show.openingThemes.length > 0 || show.endingThemes.length > 0) && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 sm:p-5">
                <h2 className="text-[12px] sm:text-[13px] font-medium text-[#f0ede8] mb-3 sm:mb-4">Music</h2>
                {show.openingThemes.length > 0 && (
                  <div className="mb-3 sm:mb-4">
                    <div className="text-[10px] sm:text-[11px] text-[#9a9590] mb-2 uppercase tracking-wider">Opening</div>
                    {show.openingThemes.map((theme, i) => (
                      <div key={i} className="text-[11px] sm:text-[12px] text-[#c8c4be] py-2 border-b border-white/5 last:border-0">{theme}</div>
                    ))}
                  </div>
                )}
                {show.endingThemes.length > 0 && (
                  <div>
                    <div className="text-[10px] sm:text-[11px] text-[#9a9590] mb-2 uppercase tracking-wider">Ending</div>
                    {show.endingThemes.map((theme, i) => (
                      <div key={i} className="text-[11px] sm:text-[12px] text-[#c8c4be] py-2 border-b border-white/5 last:border-0">{theme}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
          {/* end main column */}

          {/* ── Right sidebar — desktop/tablet only ── */}
          <div className="hidden md:flex md:w-[200px] lg:w-[260px] shrink-0 flex-col gap-3 lg:gap-4">

            <div className="rounded-xl overflow-hidden border border-white/7">
              <img src={proxyImage(show.image)} alt={show.title} className="w-full object-cover" />
            </div>

            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 lg:p-5">
              <h2 className="text-[12px] lg:text-[13px] font-medium text-[#f0ede8] mb-3 lg:mb-4">Details</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Studio", value: show.studio },
                  { label: "Source", value: show.source || "Unknown" },
                  { label: "Episodes", value: show.episodes ? `${show.episodes} episodes` : "Ongoing" },
                  { label: "Duration", value: show.duration || "Unknown" },
                  { label: "Status", value: show.status },
                  { label: "Season", value: `${show.season} ${show.year}` },
                  { label: "Airs", value: show.day || "TBA" },
                  { label: "Premiered", value: formatAirDate(show.airedFrom) },
                  { label: "Rating", value: show.rating?.split(" - ")[0] || "Unknown" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-2">
                    <span className="text-[10px] lg:text-[11px] text-[#9a9590] shrink-0">{item.label}</span>
                    <span className="text-[11px] text-[#f0ede8] text-right leading-snug">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] lg:text-[11px] text-[#9a9590]">MAL Score</span>
                  <span className="text-[11px] text-[#f0ede8]">♥ {show.score}</span>
                </div>
                {show.rank && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] lg:text-[11px] text-[#9a9590]">Rank</span>
                    <span className="text-[11px] text-[#D13924]">#{show.rank}</span>
                  </div>
                )}
                {show.members && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] lg:text-[11px] text-[#9a9590]">Members</span>
                    <span className="text-[11px] text-[#f0ede8]">{show.members.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 lg:p-5">
              <h2 className="text-[12px] lg:text-[13px] font-medium text-[#f0ede8] mb-2 lg:mb-3">Genres & Themes</h2>
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {[...show.genres, ...show.themes, ...show.demographics].map((g) => (
                  <span key={g} className="text-[9px] lg:text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-1 rounded-full">{g}</span>
                ))}
              </div>
            </div>

            {show.external.length > 0 && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 lg:p-5">
                <h2 className="text-[12px] lg:text-[13px] font-medium text-[#f0ede8] mb-3">Links</h2>
                <div className="flex flex-col gap-2">
                  {show.external.slice(0, 5).map((link) => (
                    <button
                      key={link.name + link.url}
                      onClick={() => window.open(link.url, "_blank")}
                      className="flex items-center justify-between text-left border border-white/5 hover:border-[#D13924]/30 rounded-lg px-3 py-2 transition-all"
                    >
                      <span className="text-[11px] lg:text-[12px] text-[#f0ede8]">{link.name}</span>
                      <span className="text-[#D13924] text-sm">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => window.open(show.url, "_blank")}
              className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center justify-between hover:border-[#D13924]/30 transition-all"
            >
              <span className="text-[11px] lg:text-[12px] text-[#f0ede8]">View on MyAnimeList</span>
              <span className="text-[#D13924] text-sm">→</span>
            </button>

          </div>
          {/* end sidebar */}

        </div>
      </div>
    </div>
  );
}

export default Show;