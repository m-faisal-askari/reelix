import { ArrowRight, Calendar1Icon, Clock10Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const HeroSection = () => {
  const navigate = useNavigate();
  const { heroData } = useAppContext();

  const image =
    heroData?.image ||
    "/Avengers-Doomsday-All-Teasers-Our-Theories-Marvel-MCU.jpg";
  const logo = heroData?.logo;
  const title = heroData?.title || "Avengers:\nDoomsday";
  const genres = heroData?.genres || "Action | Adventure | Sci-Fi";
  const releaseYear = heroData?.releaseYear || "2026";
  const runtime = heroData?.runtime || "2h 34m";
  const overview =
    heroData?.overview ||
    "Heroes from three different worlds must unite when they're thrust together to confront a catastrophic danger that could destroy everything they know.";
  const buttonText = heroData?.buttonText || "Explore Movies";
  const buttonLink = heroData?.buttonLink || "/movies";

  return (
    <div
      className="relative flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center h-screen overflow-hidden transition-all duration-500"
      style={{
      backgroundImage: `linear-gradient(to right, rgba(13, 10, 22, 0.92) 0%, rgba(13, 10, 22, 0.72) 42%, rgba(13, 10, 22, 0.28) 100%), url("${image}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {logo ? (
        <img
          src={logo}
          alt={title}
          className="max-h-11 lg:h-11 mt-20 object-contain drop-shadow"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : null}

      <h1 className="text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110 whitespace-pre-line drop-shadow-md">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-gray-300">
        {genres && <span>{genres}</span>}
        {releaseYear && (
          <div className="flex items-center gap-1">
            <Calendar1Icon className="w-4.5 h-4.5 text-primary" /> {releaseYear}
          </div>
        )}
        {runtime && (
          <div className="flex items-center gap-1">
            <Clock10Icon className="w-4.5 h-4.5 text-primary" /> {runtime}
          </div>
        )}
      </div>

      <p className="max-w-md text-gray-300 leading-relaxed drop-shadow">
        {overview}
      </p>

      <button
        onClick={() => navigate(buttonLink)}
        className="flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer shadow-lg shadow-primary/25"
      >
        {buttonText}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default HeroSection;
