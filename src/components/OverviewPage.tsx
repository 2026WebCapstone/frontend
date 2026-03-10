import React, { useState, useEffect } from "react";

interface TopVideoData {
  rank: number;
  id: string;
  title: string;
  thumbnail_url: string;
  upload_date: string;
  views: number;
  likes: number;
  comments: number;
}

interface SubscriberChangeData {
  date: string;
  subscriber: number;
}

interface OverviewPageProps {
  dailyView?: number;
  averageView?: number;
}

const OverviewPage: React.FC<OverviewPageProps> = ({ dailyView, averageView }) => {
  const [topVideos, setTopVideos] = useState<TopVideoData[]>([]);
  const [subscriberData, setSubscriberData] = useState<SubscriberChangeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriberLoading, setSubscriberLoading] = useState(true);

  useEffect(() => {
    const fetchTopVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/api/videos/top-views", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTopVideos(data.data || []);
        } else {
          console.error("Failed to fetch top videos");
        }
      } catch (error) {
        console.error("Error fetching top videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopVideos();
  }, []);

  useEffect(() => {
    const fetchSubscriberData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setSubscriberLoading(false);
          return;
        }

        console.log("[DEBUG] 구독자 데이터 요청 시작");
        const response = await fetch("http://localhost:8000/api/channel/subscriber-change", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("[DEBUG] 구독자 데이터 응답 상태:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("[DEBUG] 구독자 데이터:", data);
          setSubscriberData(data.data || []);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch subscriber data:", errorData);
        }
      } catch (error) {
        console.error("Error fetching subscriber data:", error);
      } finally {
        setSubscriberLoading(false);
      }
    };

    fetchSubscriberData();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}천`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  const calculateEngagementRate = (likes: number, views: number): string => {
    if (views === 0) return "0%";
    return `${((likes / views) * 100).toFixed(1)}%`;
  };

  const formatSubscriberNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}천`;
    }
    return num.toString();
  };

  const formatWeekLabel = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const week = Math.ceil(date.getDate() / 7);
    return `${month}월 ${week}주차`;
  };

  return (
    <div className="w-full h-full" style={{ backgroundColor: "#1a1b1c", padding: "2.5%" }}>
      <div className="flex w-full h-full" style={{ gap: "2.5%" }}>
        {/* 왼쪽: 통계 카드 + 차트 - 50% */}
        <div className="flex flex-col" style={{ width: "48%" }}>
          {/* 통계 카드 */}
          <div
            className="grid grid-cols-2"
            style={{ gap: "3%", marginBottom: "3%" }}
          >
            <div
              className="rounded-xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "8%",
              }}
            >
              <h3
                className="text-gray-400"
                style={{ fontSize: "1.2vw", marginBottom: "5%" }}
              >
                일일 평균 조회수
              </h3>
              <p
                className="text-white font-bold leading-none"
                style={{ fontSize: "2vw" }}
              >
                {dailyView !== undefined && dailyView !== null ? dailyView.toLocaleString() : "-"}
              </p>
            </div>
            <div
              className="rounded-xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "8%",
              }}
            >
              <h3
                className="text-gray-400"
                style={{ fontSize: "1.2vw", marginBottom: "5%" }}
              >
                영상별 평균 조회수
              </h3>
              <p
                className="text-white font-bold leading-none"
                style={{ fontSize: "2vw" }}
              >
                {averageView !== undefined && averageView !== null ? averageView.toLocaleString() : "-"}
              </p>
            </div>
          </div>

          {/* 차트 */}
          <div className="flex flex-col flex-1">
            <h3
              className="text-white"
              style={{ fontSize: "1.2vw", marginLeft: "2%", marginBottom: "2%" }}
            >
              구독자 수 변화량
            </h3>
            <div
              className="relative rounded-xl flex-1"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              }}
            >
              {subscriberLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">로딩 중...</p>
                </div>
              ) : subscriberData.length > 0 ? (
                <svg
                  viewBox="0 0 840 402.51"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="lineGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                  
                  {/* Y축 라벨 */}
                  {(() => {
                    const maxSubscriber = Math.max(...subscriberData.map(d => d.subscriber));
                    const minSubscriber = Math.min(...subscriberData.map(d => d.subscriber));
                    const range = maxSubscriber - minSubscriber;
                    const padding = range * 0.1;
                    const yRange = 280; // 320 - 40 (위쪽 여백 줄임)
                    
                                         // Y축 값 계산 (5개 구간)
                     const yAxisValues = [];
                     for (let i = 0; i <= 4; i++) {
                       const value = Math.max(0, minSubscriber - padding) + ((range + padding * 2) * i / 4);
                       const y = 320 - (i * yRange / 4);
                       yAxisValues.push({ value: Math.round(value), y });
                     }
                    
                    return (
                      <>
                        {/* 그리드 라인과 Y축 라벨 */}
                        {yAxisValues.map((item, index) => (
                          <g key={index}>
                            <line 
                              x1="0" 
                              y1={item.y} 
                              x2="840" 
                              y2={item.y} 
                              stroke="rgba(255,255,255,0.1)" 
                              strokeWidth="1" 
                            />
                                                         <text
                               x="10"
                               y={item.y + 4}
                               fill="rgba(255,255,255,0.6)"
                               fontSize="18"
                               textAnchor="start"
                             >
                               {formatSubscriberNumber(item.value)}
                             </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                  
                  {/* 데이터 포인트 계산 */}
                  {(() => {
                    const maxSubscriber = Math.max(...subscriberData.map(d => d.subscriber));
                    const minSubscriber = Math.min(...subscriberData.map(d => d.subscriber));
                    const range = maxSubscriber - minSubscriber;
                    const padding = range * 0.1;
                    const yRange = 280; // 320 - 40 (위쪽 여백 줄임)
                    
                                         const points = subscriberData.map((data, index) => {
                       const x = 80 + (index * (680 / (subscriberData.length - 1)));
                       const y = 320 - ((data.subscriber - Math.max(0, minSubscriber - padding)) / (range + padding * 2)) * yRange;
                       return { x, y, data };
                     });
                    
                    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
                    
                    return (
                      <>
                        {/* 라인 */}
                        <polyline
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                          points={polylinePoints}
                        />
                        
                        {/* 데이터 포인트 */}
                        {points.map((point, index) => (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="5"
                              fill="#ef4444"
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={(e) => {
                                const tooltip = document.createElement('div');
                                tooltip.id = `tooltip-${index}`;
                                tooltip.className = 'fixed bg-black bg-opacity-90 text-white text-sm px-3 py-2 rounded-xl pointer-events-none z-10 text-center';
                                tooltip.style.left = `${e.clientX - 40}px`;
                                tooltip.style.top = `${e.clientY - 70}px`;
                                tooltip.innerHTML = `
                                  <div>${new Date(point.data.date).toLocaleDateString()}</div>
                                  <div class="font-bold">${formatSubscriberNumber(point.data.subscriber)}명</div>
                                `;
                                document.body.appendChild(tooltip);
                              }}
                              onMouseLeave={() => {
                                const tooltip = document.getElementById(`tooltip-${index}`);
                                if (tooltip) {
                                  tooltip.remove();
                                }
                              }}
                            />
                          </g>
                        ))}
                        
                                                 {/* X축 라벨 */}
                         {points.map((point, index) => (
                           <text
                             key={`label-${index}`}
                             x={point.x}
                             y="370"
                             fill="rgba(255,255,255,0.6)"
                             fontSize="18"
                             textAnchor="middle"
                           >
                             {formatWeekLabel(point.data.date)}
                           </text>
                         ))}
                        

                      </>
                    );
                  })()}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">구독자 데이터가 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 조회수 순위 1,2,3등 영상들 - 50% */}
        <div className="flex flex-col" style={{ width: "48%", gap: "2%" }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">로딩 중...</p>
            </div>
          ) : (
            topVideos.map((video, index) => (
              <div
                key={video.id}
                className="relative flex rounded-2xl"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "3%",
                  gap: "3%",
                  height: "32%",
                }}
              >
                {/* 메달 이미지 */}
                <img
                  src={`/${
                    index === 0 ? "first" : index === 1 ? "second" : "third"
                  }.png`}
                  alt={`${index + 1}st place medal`}
                  className="absolute z-10"
                  style={{
                    width: "3vw",
                    height: "3vw",
                    top: "1.1vw",
                    left: "4.2%",
                  }}
                />

                <img
                  src={video.thumbnail_url || "/thumbnail.png"}
                  alt="Video thumbnail"
                  className="rounded-xl object-cover"
                  style={{
                    width: "40%",
                    height: "100%",
                  }}
                />
                <div
                  className="flex-1 flex flex-col justify-between"
                  style={{ paddingTop: "1%" }}
                >
                  <div>
                    <h4
                      className="text-white font-medium truncate"
                      style={{ fontSize: "1.4vw" }}
                    >
                      {video.title}
                    </h4>
                    <p className="text-gray-500" style={{ fontSize: "1.3vw" }}>
                      {formatDate(video.upload_date)}
                    </p>
                  </div>
                  <div className="flex flex-col" style={{ gap: "5%" }}>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500" style={{ fontSize: "1.1vw" }}>
                        조회수
                      </p>
                      <p className="text-gray-300" style={{ fontSize: "1.1vw" }}>
                        {formatNumber(video.views)}회
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500" style={{ fontSize: "1.1vw" }}>
                        댓글 참여율
                      </p>
                      <p className="text-gray-300" style={{ fontSize: "1.1vw" }}>
                        {calculateEngagementRate(video.comments, video.views)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500" style={{ fontSize: "1.1vw" }}>
                        좋아요 참여율
                      </p>
                      <p className="text-gray-300" style={{ fontSize: "1.1vw" }}>
                        {calculateEngagementRate(video.likes, video.views)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
