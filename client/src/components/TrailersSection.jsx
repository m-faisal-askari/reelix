import ReactPlayer from "react-player";
import React, { useState, useEffect } from "react";
import BlurCircle from "./BlurCircle";
import { PlayCircleIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const TrailersSection = () => {
  const { trailers } = useAppContext();
  const trailerList = trailers && trailers.length > 0 ? trailers : [];

  const [currentTrailer, setCurrentTrailer] = useState(trailerList[0] || null);

  useEffect(() => {
    if (trailerList.length > 0) {
      // If currentTrailer is null or no longer in the list, default to first
      const exists = trailerList.some(
        (t) =>
          (t.id && currentTrailer?.id && t.id === currentTrailer.id) ||
          t.videoUrl === currentTrailer?.videoUrl
      );
      if (!exists || !currentTrailer) {
        setCurrentTrailer(trailerList[0]);
      }
    } else {
      setCurrentTrailer(null);
    }
  }, [trailerList]);

  if (trailerList.length === 0) return null;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-12 md:py-20 overflow-hidden">
      <div className="flex items-center justify-between max-w-[960px] mx-auto">
        <p className="text-gray-300 font-medium text-lg">Latest Trailers</p>
        {currentTrailer?.title && (
          <p className="text-sm text-primary font-medium truncate max-w-xs md:max-w-md">
            {currentTrailer.title}
          </p>
        )}
      </div>

      <div className="relative mt-6 max-w-[960px] mx-auto aspect-video rounded-xl overflow-hidden bg-black/60 border border-primary/20 shadow-2xl">
        <BlurCircle top="-100px" right="-100px" />
        {currentTrailer && (
          <ReactPlayer
            src={currentTrailer.videoUrl}
            controls={true}
            playing={false}
            className="mx-auto"
            width="100%"
            height="100%"
          />
        )}
      </div>

      <div className="group grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 md:mt-8 max-w-3xl mx-auto">
        {trailerList.map((trailer, idx) => {
          const isSelected =
            (trailer.id && currentTrailer?.id && trailer.id === currentTrailer.id) ||
            trailer.videoUrl === currentTrailer?.videoUrl;

          return (
            <div
              key={trailer.id || trailer.videoUrl || idx}
              className={`relative group-hover:not-hover:opacity-40 hover:-translate-y-1 duration-300 transition aspect-video cursor-pointer rounded-lg overflow-hidden border ${
                isSelected
                  ? "border-primary ring-2 ring-primary/50 opacity-100"
                  : "border-primary/20 hover:border-primary/50"
              }`}
              onClick={() => setCurrentTrailer(trailer)}
              title={trailer.title || "Play Trailer"}
            >
              <img
                src={trailer.image}
                alt={trailer.title || "trailer"}
                className="w-full h-full object-cover brightness-75"
              />

              <PlayCircleIcon
                strokeWidth={1.6}
                className={`absolute top-1/2 left-1/2 w-6 h-6 md:w-10 md:h-10 transform -translate-x-1/2 -translate-y-1/2 transition ${
                  isSelected ? "text-primary scale-110" : "text-white"
                }`}
              />

              {trailer.title && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                  <p className="text-[10px] md:text-xs text-white truncate font-medium">
                    {trailer.title}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrailersSection;
