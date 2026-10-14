import React from "react";

const FavoriteCast = ({show}) => {
  return (
    <>
      <p className="text-lg font-medium mt-20">Your Favorite Cast</p>

      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max p-4">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img src={cast.profile_path} alt="" className="rounded-full h-20, md:h-30 aspect-square object-cover "/>
              <p className="font-medium text-xs mt-3">{cast.name}</p>

            </div>
          ))}
        </div>
        
      </div>
    </>
  );
};

export default FavoriteCast;
