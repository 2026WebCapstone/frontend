import React, { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import VideoPage from "../components/VideoPage";
import OverviewPage from "../components/OverviewPage";

interface ChannelData {
  channel: {
    id: number;
    channel_name: string;
    profile_image_url: string;
    channel_intro: string;
    youtube_channel_id: string;
    created_at: string;
  };
  snapshot: {
    subscriber: number;
    total_videos: number;
    total_view: number;
    channel_created: string;
    nation: string;
    daily_view: number;
    average_view: number;
  };
}

const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("video");
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showSearchField, setShowSearchField] = useState(false);

  const handleSearchTitle = () => {
    console.log("Search title:", searchTitle);
    // 검색어가 변경되면 Video 탭으로 자동 이동
    setActiveTab("video");
  };

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        console.log("Fetching channel data from:", "http://localhost:8000/api/channel/my");
        console.log("Token:", token.substring(0, 20) + "...");

        const response = await fetch("http://localhost:8000/api/channel/my", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log("Channel data received:", data);
          setChannelData(data);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch channel data. Status:", response.status);
          console.error("Error response:", errorText);
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error("Network error - 백엔드 서버가 실행 중인지 확인하세요");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          ::-webkit-scrollbar {
            display: none;
          }
          html, body {
            overflow-y: scroll;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `,
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="ml-[6vw] flex-1 pr-8 py-8">
        <div
          className="rounded-2xl overflow-hidden h-full"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          {/* Header */}
          <div
            style={{
              height: "300px",
              paddingTop: "32px",
              paddingBottom: "24px",
              paddingLeft: "89.76px",
              paddingRight: "89.76px",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <img src="/mypagelogo.png" alt="My Page" className="w-6 h-6" />
              <span className="text-gray-200 text-[1.7rem]">My Channel</span>
            </div>

            {/* Profile Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    {channelData?.channel.profile_image_url ? (
                      <img 
                        src={channelData.channel.profile_image_url} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                    <span className="text-5xl">🐵</span>
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="font-bold mb-2 text-4xl sm:text-5xl leading-[1.2]">
                    {channelData?.channel.channel_name || "Channel Name"}
                  </h1>
                  <p className="text-gray-400 text-xl sm:text-2xl">
                    {channelData?.channel.channel_intro || ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-4 mr-8">
                <div className="text-left">
                  <p className="text-gray-500 mb-1 text-xl sm:text-2xl">
                    구독자 수
                  </p>
                  <p className="text-xl sm:text-2xl">
                    {channelData?.snapshot.subscriber ? 
                      `${(channelData.snapshot.subscriber / 10000).toFixed(1)}만` : 
                      "N/A"
                    }
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500 mb-1 text-xl sm:text-2xl">
                    총 영상 수
                  </p>
                  <p className="text-xl sm:text-2xl">
                    {channelData?.snapshot.total_videos || "N/A"}개
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500 mb-1 text-xl sm:text-2xl">
                    채널 가입일
                  </p>
                  <p className="text-xl sm:text-2xl">
                    {channelData?.snapshot.channel_created ? 
                      new Date(channelData.snapshot.channel_created).toLocaleDateString() : 
                      "N/A"
                    }
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500 mb-1 text-xl sm:text-2xl">국가</p>
                  <p className="text-xl sm:text-2xl">
                    {channelData?.snapshot.nation || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
                     <div
             style={{ paddingLeft: "89.76px", paddingRight: "89.76px" }}
             className="flex gap-8 items-center"
           >
             <div className="flex gap-8 items-center" style={{ marginLeft: "10px" }}>
             <button
               className={`pb-3 hover:text-white transition-colors text-2xl ${
                 activeTab === "overview"
                   ? "text-white border-b-2 border-red-500"
                   : "text-gray-400"
               }`}
               onClick={() => setActiveTab("overview")}
             >
               개요
             </button>
             <button
               className={`pb-3 hover:text-white transition-colors text-2xl ${
                 activeTab === "video"
                   ? "text-white border-b-2 border-red-500"
                   : "text-gray-400"
               }`}
               onClick={() => setActiveTab("video")}
             >
               동영상
             </button>
             
                           {/* 검색 아이콘 - Video 탭에서만 표시 */}
              {activeTab === "video" && (
                <div className="flex items-center gap-4">
                                     {/* 돋보기 버튼 - 항상 표시 */}
                   <button
                     className="w-12 h-12 rounded-full hover:bg-gray-700 transition-colors flex items-center justify-center group"
                     onClick={() => {
                       if (!showSearchField) {
                         setShowSearchField(true);
                         setTimeout(() => setIsSearchActive(true), 50);
                       } else {
                         setSearchTitle("");
                         setIsSearchActive(false);
                         setShowSearchField(false);
                       }
                     }}
                   >
                     <svg className="w-7 h-7 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                     </svg>
                   </button>
                   
                   {/* 검색 필드 */}
                   {showSearchField && (
                     <div className="relative">
                       <input
                         type="text"
                         placeholder="검색"
                         className="bg-transparent text-white text-xl focus:outline-none w-64 pr-8 py-2"
                         value={searchTitle || ""}
                         onChange={e => setSearchTitle(e.target.value)}
                         onKeyPress={(e) => {
                           if (e.key === 'Enter') {
                             handleSearchTitle();
                           }
                         }}
                         onBlur={() => {
                           if (!searchTitle) {
                             setIsSearchActive(false);
                             setTimeout(() => setShowSearchField(false), 200);
                           }
                         }}
                         autoFocus
                       />
                       <div className="absolute bottom-0 left-0 w-full h-0.5">
                         <div 
                           className={`h-full bg-red-500 transition-all duration-200 ease-out ${
                             isSearchActive ? 'w-full' : 'w-0'
                           }`}
                           style={{
                             transformOrigin: 'center'
                           }}
                         />
                       </div>
                     </div>
                   )}
                </div>
              )}
             </div>
           </div>



          {/* Content */}
          <div
            className="rounded-[13px] overflow-x-auto"
            style={{
              backgroundColor: "#1C2023",
              marginLeft: "89.76px",
              marginRight: "89.76px",
            }}
          >
            {activeTab === "video" && <VideoPage searchTitle={searchTitle} />}
            {activeTab === "overview" && (
              <OverviewPage
                dailyView={channelData?.snapshot.daily_view}
                averageView={channelData?.snapshot.average_view}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
