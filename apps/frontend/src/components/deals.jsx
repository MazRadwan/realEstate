import React from 'react';
import Tabs from '@/components/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { AiOutlineUser, AiOutlineLock } from 'react-icons/ai';

const Deals = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth');
  };

  return (
    <div id="deals" className="relative p-4 mb-4">
      <div className="flex justify-center items-center p-3">
        <button className="mt-[90px] mb-4 bg-orange-200 hover:bg-orange-600 px-4 py-1 rounded-2xl text-orange-500 hover:text-white h-8 w-28 font-black text-xs uppercase cursor-pointer ">
          deals
        </button>
      </div>
      <div className="relative ">
        <div className="flex flex-col justify-center items-center">
          <p className=" text-[140px] sm:text-[180px] text-blue-700 opacity-5 font-black text-center z-0 absolute top-0 left-0 w-full uppercase dark:text-white">
            deals
          </p>
          <p className="text-4xl text-blue-900 font-bold text-center z-20 relative capitalize mt-20 sm:mt-28 dark:text-gray-300">
            our best deals for today
          </p>
        </div>
      </div>

      <div className="relative justify-center items-center">
        <p className="font-medium text-base text-center mt-20 text-bluePText">
          Real estate is &quot;property consisting of land and the buildings on
          <br />
          it, along with its natural resources such as crops,
          <br /> minerals or water, immovable property of this nature&quot;
        </p>
      </div>

      <div className="mt-14">
        {currentUser ? (
          <Tabs />
        ) : (
          <div className="flex flex-col items-center justify-center p-10 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md mx-auto max-w-4xl mt-10">
            <div className="flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full mb-6">
              <AiOutlineLock className="text-orange-500 dark:text-orange-300 text-4xl" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Login to View Exclusive Deals
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-xl">
              Our premium property listings are available only to registered users. 
              Sign in to browse our exclusive deals and find your dream property.
            </p>
            
            <button 
              onClick={handleLogin}
              className="flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              <AiOutlineUser className="mr-2" /> 
              Login / Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;
