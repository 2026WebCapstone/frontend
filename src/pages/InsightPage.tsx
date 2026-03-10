import React, { useState, useEffect } from "react";
import ViewsPage from "../components/ViewsPage";
import UploadPage from "../components/Upload";
import LikesPage from "../components/Likes";
import InsightPage from "../components/Dislikes";
import Sidebar from "../components/Sidebar";

interface CompetitorChannel {
  id: number;
  channel_id: number;
  channel_name: string;
  youtube_channel_id: string;
}

const CompetitorInsightPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("views");
  const [newChannelUrl, setNewChannelUrl] = useState("");
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorChannel[]>([]);

  // 경쟁 채널 목록 가져오기
  const fetchCompetitors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("인증 토큰이 없습니다.");
        return;
      }

      console.log("Fetching competitors...");
      const response = await fetch("http://localhost:8000/api/others", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Competitors data:", data);
        setCompetitors(data.data || []);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error fetching competitors:", error);
    }
  };

  // 데이터 새로고침 함수
  const refreshData = () => {
    fetchCompetitors();
  };

  // 컴포넌트 마운트 시 경쟁 채널 목록 가져오기
  useEffect(() => {
    fetchCompetitors();
  }, []);



  const handleAddChannel = async () => {
    if (!newChannelUrl.trim()) {
      alert("채널 URL을 입력해주세요.");
      return;
    }

    setIsAddingChannel(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      console.log("Adding competitor channel:", newChannelUrl);

      const response = await fetch("http://localhost:8000/api/others", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelUrl: newChannelUrl
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        setNewChannelUrl("");
        alert("경쟁 채널이 성공적으로 등록되었습니다!");
        console.log("Competitor channel added successfully");
        
        // 모든 탭 데이터 새로고침
        refreshData();
      } else {
        alert(data.message || "채널 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error adding competitor channel:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsAddingChannel(false);
    }
  };

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
      <div className="ml-[6vw] flex-1 pr-8 py-8 relative">
        <div className="flex flex-col gap-[21.68px] h-full">
                     {/* 상단 박스 */}
           <div
             className="rounded-2xl overflow-visible relative z-10"
             style={{
               backgroundColor: "rgba(255, 255, 255, 0.15)",
               border: "1px solid rgba(255, 255, 255, 0.3)",
               height: "100px",
             }}
           >
             <div
               style={{
                 paddingTop: "10px",
                 paddingBottom: "10px",
                 paddingLeft: "30px",
                 paddingRight: "30px",
                 height: "100%",
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "space-between",
               }}
             >
                               <div className="flex items-center gap-2">
                  <img src="/insight.png" alt="Insight" className="w-8 h-8" />
                  <span className="text-gray-200 text-[1.7rem]">
                    Competitor Insight
                  </span>
                </div>

                              {/* 채널 입력 컨테이너 */}
                <div className="flex items-center ml-auto mr-2 flex-1" style={{ marginLeft: "30px" }}>
                  <div className="relative flex items-center w-full">
                                                                               <input
                        type="text"
                        placeholder="비교하고 싶은 채널의 주소를 입력하세요 (예: https://www.youtube.com/@username)"
                        className="bg-[#1a1b1c] border border-gray-600 rounded-l-lg px-4 py-4 text-white focus:outline-none focus:border-red-500 transition pr-12 border-r-0 w-full placeholder-gray-500"
                        style={{ height: "60px", fontSize: "20px" }}
                        value={newChannelUrl}
                        onChange={(e) => setNewChannelUrl(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddChannel();
                          }
                        }}
                      />
                    <button
                      onClick={handleAddChannel}
                      disabled={isAddingChannel}
                      className="absolute -right-2 top-0 h-full px-4 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition flex items-center justify-center border-0"
                      style={{ height: "60px", fontSize: "20px" }}
                    >
                      {isAddingChannel ? "등록 중..." : "경쟁 채널 등록"}
                    </button>
                 </div>
               </div>

                  
            </div>
          </div>

          {/* 하단 컨텐츠 */}
          <div
            className="rounded-2xl overflow-visible relative z-10 flex-1"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <div
              style={{
                paddingTop: "32px",
                paddingBottom: "24px",
                paddingLeft: "89.76px",
                paddingRight: "89.76px",
                height: "100%",
              }}
            >
              <div className="text-gray-200 text-[1.5rem] mb-8">
              각 채널이 어떻게 운영되었는지 비교해보았어요!
            </div>

              {/* 탭 버튼들 */}
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("views")}
                  className={`text-[1.5rem] font-medium transition-colors ${
                    activeTab === "views"
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  조회수
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`text-[1.5rem] font-medium transition-colors ${
                    activeTab === "upload"
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  업로드 주기
                </button>
                <button
                  onClick={() => {
                    console.log("좋아요 탭 클릭됨");
                    setActiveTab("likes");
                  }}
                  className={`text-[1.5rem] font-medium transition-colors ${
                    activeTab === "likes"
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  좋아요
                </button>
                <button
                  onClick={() => setActiveTab("dislikes")}
                  className={`text-[1.5rem] font-medium transition-colors ${
                    activeTab === "dislikes"
                      ? "text-red-500 border-b-2 border-red-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  싫어요
                </button>
            </div>

              {/* 탭 컨텐츠 */}
              <div className="flex-1">
                {activeTab === "views" && <ViewsPage onDataRefresh={refreshData} competitors={competitors} />}
                {activeTab === "upload" && <UploadPage onDataRefresh={refreshData} competitors={competitors} />}
                {activeTab === "likes" && (() => {
                  console.log("LikesPage 렌더링 시도");
                  return <LikesPage onDataRefresh={refreshData} competitors={competitors} />;
                })()}
                {activeTab === "dislikes" && <InsightPage onDataRefresh={refreshData} competitors={competitors} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorInsightPage;
