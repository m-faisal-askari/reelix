import { FileQuestion, HomeIcon, SearchX } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {

    const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-2">
      <SearchX size={40} />
      <p className="text-gray-600 text-xl mt-3">404 Not found...</p>
      <div onClick={() => (
        navigate("/"), scrollTo(0,0)
      )} className="flex items-center justify-center gap-2 cursor-pointer text-primary hover:text-primary-dull">
        <HomeIcon size={15} />
        <p>Home</p>
      </div>
    </div>
  );
};

export default NotFound;
