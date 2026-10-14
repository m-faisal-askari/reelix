import { Construction, HomeIcon, PackageOpen, Rocket, Sparkles, TriangleAlert } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const NotAvailable = () => {
    const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-2">
      <Rocket size={50} />
      <p className="text-gray-600 text-xl mt-3">This page is not available right now...</p>
      <div
        onClick={() => (navigate("/"), scrollTo(0, 0))}
        className="flex items-center justify-center gap-2 cursor-pointer text-primary hover:text-primary-dull"
      >
        <HomeIcon size={15} />
        <p>Home</p>
      </div>
    </div>
  );
}

export default NotAvailable