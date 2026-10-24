import { useState } from "react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import {
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Clock,
  RotateCcw,
  ExternalLink,
  Save,
  Check,
  Film,
  Type,
  FileText,
  Link as LinkIcon,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const popularPresets = [
  {
    name: "Avengers: Doomsday",
    title: "Avengers:\nDoomsday",
    image: "/Avengers-Doomsday-All-Teasers-Our-Theories-Marvel-MCU.jpg",
    logo: assets.marvelLogo,
    releaseYear: "2026",
    runtime: "2h 34m",
    genres: "Action | Adventure | Sci-Fi",
    overview:
      "Heroes from three different worlds must unite when they're thrust together to confront a catastrophic danger that could destroy everything they know.",
    buttonText: "Explore Movies",
    buttonLink: "/movies",
  },
  {
    name: "Dune: Part Two",
    title: "Dune:\nPart Two",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80",
    logo: "",
    releaseYear: "2024",
    runtime: "2h 46m",
    genres: "Sci-Fi | Adventure | Drama",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    buttonText: "Book Tickets",
    buttonLink: "/movies",
  },
  {
    name: "Deadpool & Wolverine",
    title: "Deadpool &\nWolverine",
    image:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    logo: assets.marvelLogo,
    releaseYear: "2024",
    runtime: "2h 08m",
    genres: "Action | Comedy | Sci-Fi",
    overview:
      "Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy.",
    buttonText: "Watch Now",
    buttonLink: "/movies",
  },
  {
    name: "Interstellar",
    title: "Interstellar",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80",
    logo: "",
    releaseYear: "2014",
    runtime: "2h 49m",
    genres: "Sci-Fi | Drama | Adventure",
    overview:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.",
    buttonText: "Explore Movies",
    buttonLink: "/movies",
  },
];

const availableGenreTags = [
  "Action",
  "Adventure",
  "Sci-Fi",
  "Drama",
  "Thriller",
  "Comedy",
  "Fantasy",
  "Horror",
  "Crime",
  "Mystery",
  "Animation",
];

const HeroEditor = ({ heroData, updateHeroData, resetHeroData, shows }) => {
  // Form states initialized with heroData
  const [title, setTitle] = useState(heroData?.title || "");
  const [image, setImage] = useState(heroData?.image || "");
  const [logo, setLogo] = useState(heroData?.logo || "");
  const [overview, setOverview] = useState(heroData?.overview || "");
  const [runtime, setRuntime] = useState(heroData?.runtime || "");
  const [releaseYear, setReleaseYear] = useState(heroData?.releaseYear || "");
  const [genres, setGenres] = useState(heroData?.genres || "");
  const [buttonText, setButtonText] = useState(heroData?.buttonText || "Explore Movies");
  const [buttonLink, setButtonLink] = useState(heroData?.buttonLink || "/movies");
  const [isSaving, setIsSaving] = useState(false);

  // Handle saving changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!image.trim()) {
      return toast.error("Please provide a background image URL");
    }

    if (!overview.trim()) {
      return toast.error("Please provide an overview summary");
    }

    setIsSaving(true);
    try {
      const updated = {
        title: title.trim() || "Avengers:\nDoomsday",
        image: image.trim(),
        logo: logo.trim(),
        overview: overview.trim(),
        runtime: runtime.trim() || "2h 30m",
        releaseYear: releaseYear.trim() || "2026",
        genres: genres.trim() || "Action | Adventure",
        buttonText: buttonText.trim() || "Explore Movies",
        buttonLink: buttonLink.trim() || "/movies",
      };

      await updateHeroData(updated);
      toast.success("Hero Section updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update Hero Section");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset to default
  const handleReset = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset the Hero Section to the default Avengers: Doomsday theme?"
      )
    ) {
      await resetHeroData();
      toast.success("Hero Section reset to defaults");
    }
  };

  // Apply a preset
  const applyPreset = (preset) => {
    setTitle(preset.title);
    setImage(preset.image);
    setLogo(preset.logo);
    setReleaseYear(preset.releaseYear);
    setRuntime(preset.runtime);
    setGenres(preset.genres);
    setOverview(preset.overview);
    setButtonText(preset.buttonText || "Explore Movies");
    setButtonLink(preset.buttonLink || "/movies");
    toast.success(`Loaded "${preset.name}" preset into editor`);
  };

  // Autofill from active movie in database
  const handleAutofillFromShow = (e) => {
    const movieId = e.target.value;
    if (!movieId) return;

    const selectedShow = shows.find((s) => s.movie?._id === movieId);
    if (!selectedShow?.movie) return;

    const m = selectedShow.movie;
    setTitle(m.title || "");
    if (m.backdrop_path) {
      const backdropUrl = m.backdrop_path.startsWith("http")
        ? m.backdrop_path
        : `https://image.tmdb.org/t/p/original${m.backdrop_path}`;
      setImage(backdropUrl);
    } else if (m.poster_path) {
      const posterUrl = m.poster_path.startsWith("http")
        ? m.poster_path
        : `https://image.tmdb.org/t/p/original${m.poster_path}`;
      setImage(posterUrl);
    }

    if (m.overview) setOverview(m.overview);
    if (m.release_date) {
      const year = new Date(m.release_date).getFullYear();
      if (!isNaN(year)) setReleaseYear(String(year));
    }
    if (m.runtime) {
      const hrs = Math.floor(m.runtime / 60);
      const mins = m.runtime % 60;
      setRuntime(`${hrs}h ${mins}m`);
    }
    if (Array.isArray(m.genres) && m.genres.length > 0) {
      const genreNames = m.genres.map((g) => (typeof g === "string" ? g : g.name)).filter(Boolean);
      setGenres(genreNames.join(" | "));
    }
    setButtonText("Book Tickets");
    setButtonLink(`/movies/${m._id}`);

    toast.success(`Autofilled details from "${m.title}"!`);
  };

  // Toggle genre in the genres string
  const toggleGenre = (genre) => {
    const currentList = genres
      .split(/[|,/]/)
      .map((g) => g.trim())
      .filter(Boolean);

    if (currentList.includes(genre)) {
      const updated = currentList.filter((g) => g !== genre);
      setGenres(updated.join(" | "));
    } else {
      const updated = [...currentList, genre];
      setGenres(updated.join(" | "));
    }
  };

  const parsedGenres = genres
    .split(/[|,/]/)
    .map((g) => g.trim())
    .filter(Boolean);

  return (
    <div className="pb-16 max-w-6xl">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Title text1="Manage" text2="Hero Section" />
          <p className="text-xs text-gray-400 mt-1">
            Customize the featured hero banner on the homepage: image, logo, overview, runtime, release year, and genres.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Home
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary/10 border border-primary/20 text-gray-300 hover:text-white hover:bg-primary/20 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Quick Presets & Autofill Toolbar */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-white flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Quick Presets:
          </span>
          {popularPresets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-primary hover:text-white border border-white/10 text-gray-300 transition cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>

        {shows && shows.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Film className="w-3.5 h-3.5 text-primary" />
            <select
              onChange={handleAutofillFromShow}
              defaultValue=""
              className="bg-[#1c1228] border border-primary/30 rounded-lg px-2.5 py-1 text-white outline-none focus:border-primary text-xs cursor-pointer"
            >
              <option value="" disabled>
                Autofill from active show...
              </option>
              {shows.map((s) => (
                <option key={s.movie?._id} value={s.movie?._id}>
                  {s.movie?.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Live Hero Section Preview Card */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Live Banner Preview
            </span>
            <span className="text-[11px] text-gray-400">
              (Interactive preview showing how visitors will see the hero)
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 font-medium">
            Real-time
          </span>
        </div>

        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-primary/30 min-h-[360px] md:min-h-[440px] flex flex-col justify-center px-6 md:px-14 py-12 transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(13, 10, 22, 0.94) 0%, rgba(13, 10, 22, 0.75) 45%, rgba(13, 10, 22, 0.3) 100%), url("${
              image || "/Avengers-Doomsday-All-Teasers-Our-Theories-Marvel-MCU.jpg"
            }")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt="Logo Preview"
              className="max-h-10 w-auto object-contain mb-3 drop-shadow"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}

          <h2 className="text-3xl md:text-5xl font-bold text-white whitespace-pre-line leading-tight max-w-lg drop-shadow-md">
            {title || "Avengers:\nDoomsday"}
          </h2>

          <div className="flex flex-wrap items-center gap-3.5 mt-3 text-xs text-gray-300">
            {genres && (
              <span className="font-medium text-white">{genres}</span>
            )}
            {releaseYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" /> {releaseYear}
              </span>
            )}
            {runtime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> {runtime}
              </span>
            )}
          </div>

          <p className="mt-3 text-xs md:text-sm text-gray-300 max-w-lg line-clamp-3 leading-relaxed drop-shadow">
            {overview || "No overview provided yet."}
          </p>

          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold bg-primary text-white rounded-full shadow-lg shadow-primary/30 pointer-events-none"
            >
              {buttonText || "Explore Movies"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <div className="relative mt-10 p-6 md:p-8 bg-primary/5 border border-primary/25 rounded-2xl shadow-xl">
        <BlurCircle top="-40px" left="20px" />

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Visuals (Image & Logo) */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4 pb-2 border-b border-primary/20">
              <ImageIcon className="w-4 h-4 text-primary" />
              1. Hero Background & Logo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Background Image URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Hero Image URL (Backdrop) <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="e.g. /Avengers-Doomsday-...jpg or https://image.tmdb.org/..."
                    className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm font-mono"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Supports local public paths (e.g. /Avengers-Doomsday-All-Teasers-Our-Theories-Marvel-MCU.jpg) or full URLs.
                </p>

                {/* Quick image preset chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-gray-400 mr-1 self-center">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setImage("/Avengers-Doomsday-All-Teasers-Our-Theories-Marvel-MCU.jpg")}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-primary/20 border border-white/10 text-gray-300"
                  >
                    Avengers Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80")}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-primary/20 border border-white/10 text-gray-300"
                  >
                    Sci-Fi Desert
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80")}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-primary/20 border border-white/10 text-gray-300"
                  >
                    Deep Space
                  </button>
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Logo Image URL
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setLogo(assets.marvelLogo)}
                      className="text-[10px] px-2 py-0.5 rounded bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                    >
                      Marvel Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogo(assets.icon)}
                      className="text-[10px] px-2 py-0.5 rounded bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                    >
                      Reelix Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="e.g. Logo SVG or transparent PNG URL"
                  className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Logo displayed directly above title. Leave blank if only text title is preferred.
                </p>

                {logo && (
                  <div className="flex items-center gap-3 mt-2 p-2 bg-[#10091c] border border-primary/20 rounded-lg">
                    <img
                      src={logo}
                      alt="Logo preview"
                      className="h-8 max-w-28 object-contain"
                    />
                    <span className="text-[11px] text-gray-400">Logo active</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Movie Metadata */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4 pb-2 border-b border-primary/20">
              <Type className="w-4 h-4 text-primary" />
              2. Title, Year, Runtime & Genres
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Movie Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Avengers: Doomsday (supports \n)"
                  className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Tip: Multi-line breaks will render on homepage.
                </p>
              </div>

              {/* Release Year */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Release Year <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full bg-[#150d24] border border-primary/30 rounded-xl pl-9 pr-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
                  />
                  <Calendar className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Runtime */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Runtime <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={runtime}
                    onChange={(e) => setRuntime(e.target.value)}
                    placeholder="e.g. 2h 34m"
                    className="w-full bg-[#150d24] border border-primary/30 rounded-xl pl-9 pr-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
                  />
                  <Clock className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Genres <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="e.g. Action | Adventure | Sci-Fi"
                className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
              />

              {/* Clickable Quick Genre Tags */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-[11px] text-gray-400 self-center mr-1">
                  Click to add/remove:
                </span>
                {availableGenreTags.map((tag) => {
                  const isSelected = parsedGenres.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleGenre(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-primary border-primary text-white font-medium"
                          : "bg-white/5 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Overview & Action Button */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4 pb-2 border-b border-primary/20">
              <FileText className="w-4 h-4 text-primary" />
              3. Overview Synopsis & CTA Button
            </h3>

            {/* Overview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Overview Summary <span className="text-primary">*</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  {overview.length} characters
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Write an enticing synopsis for the featured movie..."
                className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm leading-relaxed"
              />
            </div>

            {/* CTA Button Customization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="e.g. Explore Movies"
                  className="w-full bg-[#150d24] border border-primary/30 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  CTA Button Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="e.g. /movies or /movies/1001"
                    className="w-full bg-[#150d24] border border-primary/30 rounded-xl pl-9 pr-3.5 py-2.5 text-white outline-none focus:border-primary text-sm font-mono"
                  />
                  <LinkIcon className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/20">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 text-xs font-medium rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer"
            >
              Reset to Defaults
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white transition cursor-pointer shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminHero = () => {
  const { heroData, updateHeroData, resetHeroData, shows } = useAppContext();

  // Key the HeroEditor with a unique signature so that any fresh heroData instantly populates state without cascading effects
  const editorKey = heroData
    ? `${heroData.title}_${heroData.image}_${heroData.releaseYear}`
    : "initial-hero";

  return (
    <HeroEditor
      key={editorKey}
      heroData={heroData}
      updateHeroData={updateHeroData}
      resetHeroData={resetHeroData}
      shows={shows}
    />
  );
};

export default AdminHero;
