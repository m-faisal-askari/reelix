import React from 'react'
import { assets } from '../assets/assets';
import { Link } from "react-router-dom";


const Logo = () => {
  return (
    <div className="flex items-start ">
      <Link to="/" className=" flex justify-center items-center">
        <img src={assets.icon} alt="" className="w-15 h-auto" />
        <h1 className="text-2xl cursor-pointer">Reelix</h1>
      </Link>
    </div>
  );
}

export default Logo