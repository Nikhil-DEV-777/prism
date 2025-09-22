import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import samsungLogo from "../assets/prism_logo.png";
import ThemeToggleButton from '../components/ThemeToggleButton';
import Statistics from "../layouts/Statistics";
import {SAMPLE_WORKLETS} from "../components/data";


import {
  Home, BarChart, GraduationCap, MessageSquare, Bell, Calendar, Folder,
  MessageCircle, Zap, Rocket, Key, Crown, BookOpen, Users as UsersIcon,
  RefreshCcw, Lightbulb, Briefcase, PlusCircle, Bot, Users, LayoutGrid, Columns, X, ClipboardCheck
} from "lucide-react";

import SidebarItem from "../components/SidebarItem";
import LevelBadge from "../components/LevelBadge";
import StatCard from "../components/StatCard";
import ActivityButton from "../components/ActivityButton";
import LeftSidebar from "../components/Left";
import RightSidebar from "../components/Right";

const LEVEL_COUNTS = { spark: 5, lead: 10, core: 15, master: 30 };
const STATS = { worklets: 7, mentees: 35, badges: 2 };

const levels = [
  { name: 'SPARK', Icon: Zap, color: 'text-yellow-600' },
  { name: 'LEAD', Icon: Rocket, color: 'text-blue-700' },
  { name: 'CORE', Icon: Key, color: 'text-green-700' },
  { name: 'MASTER', Icon: Crown, color: 'text-purple-700' },
];

// Helper functions for the initials-based avatar
const getInitials = (name) => {
  if (!name) return '';
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
};

const generateColorFromName = (name) => {
  const colors = ['#0077b6', '#0096c7', '#48cae4', '#90e0ef', '#ade8f4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash % colors.length)];
};

// ++ 1. Accept 'userData' as a prop
export default function Dashboard({ userData }) {
  // Get user email from localStorage
  const userEmail = localStorage.getItem("user_email") || "User";
  const [userName, setUserName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [nameError, setNameError] = useState(false);
  React.useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    setLoadingName(true);
    setNameError(false);
    if (accessToken) {
      axios.get("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(res => {
        if (res.data && res.data.name) {
          setUserName(res.data.name);
        } else {
          setNameError(true);
        }
        setLoadingName(false);
      })
      .catch(() => {
        setNameError(true);
        setLoadingName(false);
      });
    } else {
      setNameError(true);
      setLoadingName(false);
    }
  }, []);
  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  const navigate = useNavigate();
  const [currentUserLevel, setCurrentUserLevel] = useState(1);
  const [layout, setLayout] = useState('grid');

  const workletsData = SAMPLE_WORKLETS.filter(w => w.status === 'Ongoing');

  const LevelMilestone = ({ level, index }) => {
    const levelsToGo = index - currentUserLevel;
    let tooltipText = '';

    if (levelsToGo > 0) {
      tooltipText = `${levelsToGo} level${levelsToGo > 1 ? 's' : ''} to reach ${level.name}`;
    } else if (levelsToGo === 0) {
      tooltipText = index === levels.length - 1 ? 'Highest level achieved! ✨' : 'You are here';
    } else {
      tooltipText = 'Milestone achieved ✔️';
    }

    return (
      <div className="relative group">
        <span className="flex items-center gap-1 cursor-pointer">
          <level.Icon className={`w-4 h-4 ${level.color}`} /> {level.name}
        </span>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs bg-slate-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {tooltipText}
        </span>
      </div>
    );
  };

  const progressPercentage = (currentUserLevel / (levels.length - 1)) * 100;

  return (
    <div className={`flex h-screen w-full bg-slate-50 text-gray-800 overflow-hidden dark:bg-slate-900 dark:text-slate-200 `}>
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <main className="flex-1 px-8 py-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-blue-900 dark:text-white">
              {loadingName ? "Loading..." : nameError ? "Unknown User" : userName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              PRISM / {userData.qualification}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggleButton />
            <img src={samsungLogo} alt="PRISM" className="h-20 opacity-90" />
          </div>
        </div>

        {/* Profile box */}
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-4 max-w-xl dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-4">
            {/* Add a wrapping div with the 'group' class */}
            <div className="relative group">
              <Link to="/profile">
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt="Author"
                    className="w-24 h-24 rounded-xl object-cover transition-all duration-300 shadow-md cursor-pointer hover:scale-110 hover:shadow-2xl hover:ring-4 hover:ring-blue-400 dark:bg-slate-800 dark:border-slate-700"
                    tabIndex={0}
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-xl flex items-center justify-center text-white font-bold text-4xl cursor-pointer transition-all duration-300 shadow-md hover:scale-110 hover:shadow-2xl hover:ring-4 hover:ring-blue-400"
                    style={{ backgroundColor: generateColorFromName(userData.name) }}
                  >
                    <span>{getInitials(userData.name)}</span>
                  </div>
                )}
              </Link>
              {/* This is the tooltip span that appears on hover */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2
                   bg-gray-700 text-gray-100 text-xs font-medium
                   rounded-md px-3 py-1.5 whitespace-nowrap
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   dark:bg-slate-600 dark:text-slate-50
                   border border-gray-600 dark:border-slate-500 shadow-md">
                Click to update profile
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userEmail}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {userData.bio}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <LevelBadge
                  icon={<Rocket className="w-4 h-4 " />}
                  label="Lead"
                  value={LEVEL_COUNTS.lead}
                  color="text-purple-700 bg-purple-50 dark:bg-slate-900/30"
                />
              </div>
            </div>
          </div>
        </div>


        {/* Level Progress Bar */}
        <div className="relative mt-6 w-full max-w-2xl">
          <div className="h-2 w-full bg-gray-200 rounded-full shadow-inner dark:bg-slate-700">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[13px] mt-2 text-gray-600 font-medium dark:text-slate-400">
            {levels.map((level, index) => (
              <LevelMilestone key={level.name} level={level} index={index} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-4 flex-wrap">
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div
              className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
              onClick={() => navigate('/worklets')}>
              <StatCard
                value={STATS.worklets}
                label="Worklets"
                icon={<BookOpen className="w-5 h-5" />}
                accent="from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 dark:from-gray-800 dark:to-gray-800/50 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              />
            </div>
          </div>
          <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <StatCard
              value={STATS.mentees}
              label="Mentees"
              icon={<UsersIcon className="w-5 h-5" />}
              accent="from-indigo-50 to-white hover:from-indigo-100 hover:to-indigo-50 dark:from-gray-800 dark:to-gray-800/50 dark:hover:from-gray-700 dark:hover:to-gray-700/50"
            />
          </div>
        </div>

        {/* My Worklets */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-blue-900 animate-shimmer">Ongoing Worklets</h2>
            <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-lg dark:bg-slate-900">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-md transition-colors ${layout === 'grid' ? ' text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                aria-label="Grid View">
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setLayout('horizontal')}
                className={`p-1.5 rounded-md transition-colors ${layout === 'horizontal' ? ' text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                aria-label="Horizontal View">
                <Columns size={20} />
              </button>
            </div>
          </div>

          <div
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                : 'flex overflow-x-auto gap-8 pb-4 overflow-y-hidden [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-400/50 [&::-webkit-scrollbar-thumb]:rounded-full'
            }>
            {workletsData.map((worklet) => (
              <WorkletCard key={worklet.id} worklet={worklet} layout={layout} navigate={navigate} />
            ))}
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}


// --- CORRECTED WORKLET CARD COMPONENT ---
function WorkletCard({ worklet, layout, navigate }) {
  const containerClasses = layout === 'grid'
    ? 'w-full'
    : 'w-80 flex-shrink-0';

  const calculateRemainingDays = (endDateStr) => {
    const endDate = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate - today;
    if (diffTime < 0) {
      return { days: 0, label: "Past Due" };
    }
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days: diffDays, label: `${diffDays} days left` };
  };

  const remaining = calculateRemainingDays(worklet.endDate);

  const qualityStyles = {
    Excellence: 'bg-green-500/80',
    Good: 'bg-blue-500/80',
    'Needs Attention': 'bg-red-500/80',
    Default: 'bg-gray-500/80',
  };

  const handleCardClick = () => {
    navigate(`/worklet/${worklet.id}`);
  };

  const handleNotificationClick = (event) => {
    event.stopPropagation();
    navigate(`/worklet/${worklet.id}/notifications`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative aspect-video cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ease-in-out hover:scale-105 ${containerClasses}`}>

      <img
        src={worklet.imageUrl}
        alt={worklet.title}
        className="h-full w-full object-cover transition-all duration-500"
      />

      <div className="absolute inset-0 bg-black/50"></div>

      {worklet.notificationCount > 0 && (
        <div
          onClick={handleNotificationClick}
          className="absolute top-3 right-3 group/bell z-20"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white">
            <Bell size={14} />
          </span>
          <div className="absolute top-full right-0 mt-1 w-max px-2 py-1 text-xs bg-slate-800 text-white rounded opacity-0 group-hover/bell:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {worklet.notificationCount} new update{worklet.notificationCount > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Normal State Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white transition-opacity duration-300 group-hover:opacity-0">
        <h3 className="text-lg font-bold">{worklet.title}</h3>
        <p className="text-sm text-gray-300 line-clamp-2">{worklet.description}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium text-cyan-200">
            <span>Progress</span>
            <span>{worklet.progress}%</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
              style={{ width: `${worklet.progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Hover State Content */}
      <div className="absolute inset-0 flex text-white opacity-0 transition-opacity duration-300 delay-150 group-hover:opacity-100 pointer-events-none">

        {/* SCROLLABLE AREA - ADDED pointer-events-auto */}
        <div className="flex-grow p-4 overflow-y-auto pointer-events-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-cyan-400/50 [&::-webkit-scrollbar-thumb]:rounded-full">
          <h3 className="text-lg font-bold">{worklet.title}</h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-300">
            <Calendar size={14} />
            <span>
              {worklet.startDate} - {worklet.endDate}
            </span>
          </div>
          <div className="mt-4 flex-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Users size={16} />
              <h4>Assigned Students</h4>
            </div>
            <ul className="mt-1 list-disc list-inside text-xs text-gray-200 space-y-1">
              {worklet.students.map((student) => (
                <li key={student}>{student}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right side panel */}
        <div className="w-28 flex-shrink-0 bg-black/40 flex flex-col items-center justify-center text-center p-2 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out">
          <span className={`px-2 py-1 rounded-md text-xs font-bold text-white ${qualityStyles[worklet.quality] || qualityStyles.Default}`}>
            {worklet.quality}
          </span>
          <div className="mt-4">
            <p className="text-3xl font-bold">{remaining.days}</p>
            <p className="text-xs text-gray-300">{remaining.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}