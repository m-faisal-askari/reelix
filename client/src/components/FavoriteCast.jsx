import React from "react";

const FavoriteCast = ({ show }) => {
  const getProfileUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `https://image.tmdb.org/t/p/w200${path}`;
  };

  return (
    <>
      <p className="text-lg font-medium mt-10 md:mt-20">Your Favorite Cast</p>

      <div className="overflow-x-auto no-scrollbar mt-4 md:mt-8 pb-4">
        <div className="flex items-center gap-4 w-max p-2 md:p-4">
          {(show?.movie?.casts || []).slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center w-16 md:w-24">
              <img
                src={getProfileUrl(cast.profile_path)}
                alt={cast.name}
                className="rounded-full h-14 w-14 md:h-24 md:w-24 aspect-square object-cover"
              />
              <p className="font-medium text-xs mt-2 truncate w-full">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FavoriteCast;
