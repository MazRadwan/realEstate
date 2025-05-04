import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import searchIcon from '../../src/assets/icons/search.png';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

import { AiOutlineMenu, AiOutlineClose, AiOutlineUser, AiOutlineLogout } from 'react-icons/ai';
import ThemeChanger from './themeChanger';

const Header = () => {
  const [header, setHeader] = useState(false);
  const [headerColor, setHeaderColor] = useState('linear-gradient(to right, #8e2de2, #4a00e0)');
  const [headerText, setHeaderText] = useState('white');
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleHeader = () => {
    setHeader(!header);
  };

  const handleMobileHeader = () => {
    setHeader(false);
  };

  const handleLogin = () => {
    router.push('/auth');
    handleMobileHeader();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleMobileHeader();
  };

  useEffect(() => {
    // Empty cleanup function to avoid memory leaks
    return () => {};
  }, []);

  return (
    <div
      style={{ background: `${headerColor}` }}
      className="fixed top-0 left-0 w-full h-20 shadow-xl flex justify-between items-center z-40 ease-in duration-300"
    >
      {/* Menu + Name */}

      <div className="max-w-[1240px] m-5 flex justify-between items-center p-4">
        <Link href="/">
          <h1
            style={{ color: `${headerText}` }}
            className="py-2 text-2xl font-bold hover:text-orange-500"
          >
            Constructor
          </h1>
        </Link>
      </div>

      {/* Search */}

      <div className=" hidden sm:flex">
        <Image src={searchIcon} alt="Menu" className="w-4 h-4 self-center" />
        <input
          type="text"
          placeholder="Search"
          maxLength="20"
          className="w-40 bg-transparent outline-none placeholder-gray-300 mx-4 py-2 text-white capitalize"
        />
      </div>

      {/* navbar Links */}

      <ul
        style={{ color: `${headerText}` }}
        className="text-sm font-bold hidden sm:flex
      "
      >
        <li className=" p-4 hover:text-orange-500">
          <Link href="#about-container">About</Link>
        </li>
        <li className=" p-4 hover:text-orange-500">
          <Link href="#services">Services</Link>
        </li>
        <li className=" p-4 hover:text-orange-500">
          <Link href="#reviews">Reviews</Link>
        </li>
        <li className=" p-4 hover:text-orange-500">
          <Link href="#contact">Contact</Link>
        </li>
      </ul>

      {/* Auth buttons */}
      {currentUser ? (
        <div className="hidden sm:flex items-center mr-4">
          <span className="text-sm font-bold mr-4" style={{ color: `${headerText}` }}>
            {currentUser.displayName || currentUser.email}
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            <AiOutlineLogout className="mr-1" /> Logout
          </button>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          className="hidden sm:flex items-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded mr-4"
        >
          <AiOutlineUser className="mr-1" /> Login
        </button>
      )}

      <div className="mr-10">
        <ThemeChanger />
      </div>

      {/* Mobile hamburgerMenu */}

      <div onClick={handleHeader} className="block sm:hidden p-4 z-10">
        {header ? (
          <AiOutlineClose size={30} style={{ color: `${headerText}` }} />
        ) : (
          <AiOutlineMenu size={30} style={{ color: `${headerText}` }} />
        )}
      </div>
      <div
        className={
          header
            ? 'sm:hidden absolute top-0 right-0 bottom-0 left-0 flex justify-center items-center w-full h-screen bg-[#020308ea] text-center ease-in duration-300'
            : 'sm:hidden absolute top-0 right-0 bottom-0 left-[-100%] flex justify-center items-center w-full h-screen bg-[#020308ea] text-center ease-in duration-300'
        }
      >
        <ul
          style={{ color: `${headerText}` }}
          className="text-sm font-bold 
      "
        >
          <li className="mx-7 py-4 text-4xl hover:text-orange-500">
            <Link href="#about-container" onClick={handleMobileHeader}>
              About
            </Link>
          </li>
          <li className="mx-7 py-4 text-4xl hover:text-orange-500">
            <Link href="#services" onClick={handleMobileHeader}>
              Services
            </Link>
          </li>
          <li className="mx-7 py-4 text-4xl hover:text-orange-500">
            <Link href="#deals" onClick={handleMobileHeader}>
              Deals
            </Link>
          </li>
          <li className="mx-7 py-4 text-4xl hover:text-orange-500">
            <Link href="#reviews" onClick={handleMobileHeader}>
              Reviews
            </Link>
          </li>
          <li className="mx-7 py-4 text-4xl hover:text-orange-500">
            <Link href="#contact" onClick={handleMobileHeader}>
              Contact
            </Link>
          </li>
          
          {/* Mobile Auth */}
          <li className="mx-7 py-4 text-4xl hover:text-orange-500">
            {currentUser ? (
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center w-full"
              >
                <AiOutlineLogout className="mr-2" /> Logout
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center justify-center w-full"
              >
                <AiOutlineUser className="mr-2" /> Login
              </button>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
