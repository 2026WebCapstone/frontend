import React, { useState, useEffect } from "react";

interface CompetitorChannel {
  id: number; // other_channel 테이블의 id
  channel_id: number; // channel 테이블의 id
  channel_name: string;
  youtube_channel_id: string;
}

interface IndividualView {
  views: number;
  rate: number;
}

interface ChartDataItem {
  period: string;
  my: number;
  competitor1: number;
  competitor2: number;
  myViews: number;
  competitor1Views: number;
  competitor2Views: number;
  myRate: number;
  competitor1Rate: number;
  competitor2Rate: number;
}

interface ChannelViews {
  channel_id: number;
  channel_name: string;
  totalViews: number;
  individualViews?: IndividualView[];
}

interface ViewsPageProps {
  onDataRefresh?: () => void;
  competitors?: CompetitorChannel[];
}

const ViewsPage: React.FC<ViewsPageProps> = ({ onDataRefresh, competitors: propCompetitors }) => {
  const [competitors, setCompetitors] = useState<CompetitorChannel[]>([]);
  const [channelViews, setChannelViews] = useState<{
    myChannel: ChannelViews;
    competitors: ChannelViews[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animationValues, setAnimationValues] = useState<{ [key: string]: number }>({});

  // 경쟁 채널 목록 가져오기
  const fetchCompetitors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("로그인이 필요합니다.");
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
        setError("경쟁 채널 목록을 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error fetching competitors:", error);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  // 채널별 조회수 합계 가져오기
  const fetchChannelViews = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      console.log("Fetching channel views...");
      const response = await fetch("http://localhost:8000/api/others/videos/views", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Channel views data:", data);
        setChannelViews(data.data);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        setError("조회수 데이터를 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error fetching channel views:", error);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  // 경쟁 채널 삭제
  const handleDeleteCompetitor = async (otherChannelId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      console.log("Deleting competitor with other_channel id:", otherChannelId);

      const response = await fetch(`http://localhost:8000/api/others/${otherChannelId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("Competitor deleted successfully");
        // 삭제 성공 시 목록 새로고침
        await fetchCompetitors();
        await fetchChannelViews();
        // 부모 컴포넌트에 새로고침 알림
        if (onDataRefresh) {
          onDataRefresh();
        }
      } else {
        const errorData = await response.json();
        console.error("Delete error:", errorData);
        setError("채널 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting competitor:", error);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  // 데이터 새로고침 함수 (외부에서 호출 가능)
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchCompetitors(), fetchChannelViews()]);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (propCompetitors) {
        setCompetitors(propCompetitors);
      } else {
        await fetchCompetitors();
      }
      await fetchChannelViews();
      setLoading(false);
    };
    loadData();
  }, [propCompetitors]);

  // propCompetitors가 변경될 때마다 데이터 새로고침
  useEffect(() => {
    if (propCompetitors && propCompetitors.length > 0) {
      fetchChannelViews();
    }
  }, [propCompetitors]);

  // 애니메이션 효과
  useEffect(() => {
    if (channelViews) {
      const animationData: { [key: string]: number } = {};
      
              // 내 채널 데이터
        if (channelViews.myChannel.individualViews) {
          channelViews.myChannel.individualViews.forEach((_, index) => {
            animationData[`my-${index}`] = 0;
          });
        }
      
              // 경쟁 채널 데이터
        if (channelViews.competitors) {
          channelViews.competitors.forEach((competitor, compIndex) => {
            if (competitor.individualViews) {
              competitor.individualViews.forEach((_, index) => {
                animationData[`competitor${compIndex}-${index}`] = 0;
              });
            }
          });
        }
      
      setAnimationValues(animationData);
      
      // 애니메이션 시작
      const startTime = Date.now();
      const duration = 700; // 1초
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // ease out 함수
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const newAnimationValues: { [key: string]: number } = {};
        
        // 내 채널 애니메이션
        if (channelViews.myChannel.individualViews) {
          channelViews.myChannel.individualViews.forEach((view, index) => {
            newAnimationValues[`my-${index}`] = view.views * easeOut;
          });
        }
        
        // 경쟁 채널 애니메이션
        if (channelViews.competitors) {
          channelViews.competitors.forEach((competitor, compIndex) => {
            if (competitor.individualViews) {
              competitor.individualViews.forEach((view, index) => {
                newAnimationValues[`competitor${compIndex}-${index}`] = view.views * easeOut;
              });
            }
          });
        }
        
        setAnimationValues(newAnimationValues);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [channelViews]);

  // refreshData 함수를 window 객체에 등록 (외부에서 호출 가능하도록)
  useEffect(() => {
    (window as any).refreshViewsPageData = refreshData;
    return () => {
      delete (window as any).refreshViewsPageData;
    };
  }, []);

  // 차트 데이터 (개별 영상 조회수 기반)
  const getChartData = (): ChartDataItem[] => {
    if (!channelViews) {
      return [
        { period: "최신-2", my: 0, competitor1: 0, competitor2: 0, myViews: 0, competitor1Views: 0, competitor2Views: 0, myRate: 0, competitor1Rate: 0, competitor2Rate: 0 },
        { period: "최신-1", my: 0, competitor1: 0, competitor2: 0, myViews: 0, competitor1Views: 0, competitor2Views: 0, myRate: 0, competitor1Rate: 0, competitor2Rate: 0 },
        { period: "최신", my: 0, competitor1: 0, competitor2: 0, myViews: 0, competitor1Views: 0, competitor2Views: 0, myRate: 0, competitor1Rate: 0, competitor2Rate: 0 },
  ];
    }

    // 내 채널 개별 영상 조회수 (최신순: 0=최신, 1=최신-1, 2=최신-2)
    const myViews = channelViews.myChannel.individualViews || [
      { views: 0, rate: 0 },
      { views: 0, rate: 0 },
      { views: 0, rate: 0 }
    ];

    // 경쟁 채널 개별 영상 조회수
    const competitor1Views = channelViews.competitors[0]?.individualViews || [
      { views: 0, rate: 0 },
      { views: 0, rate: 0 },
      { views: 0, rate: 0 }
    ];
    const competitor2Views = channelViews.competitors[1]?.individualViews || [
      { views: 0, rate: 0 },
      { views: 0, rate: 0 },
      { views: 0, rate: 0 }
    ];

    return [
      { 
        period: "최신-2", 
        my: myViews[2]?.views || 0, 
        competitor1: competitor1Views[2]?.views || 0, 
        competitor2: competitor2Views[2]?.views || 0,
        myViews: myViews[2]?.views || 0,
        competitor1Views: competitor1Views[2]?.views || 0,
        competitor2Views: competitor2Views[2]?.views || 0,
        myRate: myViews[2]?.rate || 0,
        competitor1Rate: competitor1Views[2]?.rate || 0,
        competitor2Rate: competitor2Views[2]?.rate || 0
      },
      { 
        period: "최신-1", 
        my: myViews[1]?.views || 0, 
        competitor1: competitor1Views[1]?.views || 0, 
        competitor2: competitor2Views[1]?.views || 0,
        myViews: myViews[1]?.views || 0,
        competitor1Views: competitor1Views[1]?.views || 0,
        competitor2Views: competitor2Views[1]?.views || 0,
        myRate: myViews[1]?.rate || 0,
        competitor1Rate: competitor1Views[1]?.rate || 0,
        competitor2Rate: competitor1Views[1]?.rate || 0
      },
      { 
        period: "최신", 
        my: myViews[0]?.views || 0, 
        competitor1: competitor1Views[0]?.views || 0, 
        competitor2: competitor2Views[0]?.views || 0,
        myViews: myViews[0]?.views || 0,
        competitor1Views: competitor1Views[0]?.views || 0,
        competitor2Views: competitor2Views[0]?.views || 0,
        myRate: myViews[0]?.rate || 0,
        competitor1Rate: competitor1Views[0]?.rate || 0,
        competitor2Rate: competitor2Views[0]?.rate || 0
      },
    ];
  };

  const data = getChartData();
  const colors = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

  // 디버깅용 로그
  console.log("Chart data:", data);
  console.log("Channel views:", channelViews);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          backgroundColor: "#1C2023",
          minHeight: "600px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          backgroundColor: "#1C2023",
          minHeight: "600px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-red-400">{error}</div>
      </div>
    );
  }



  // 실제 데이터의 최대값 계산
  const allIndividualViews = [];
  if (channelViews && channelViews.myChannel && channelViews.myChannel.individualViews) {
    allIndividualViews.push(...channelViews.myChannel.individualViews.map(v => v.views));
  }
  if (channelViews && channelViews.competitors) {
    channelViews.competitors.forEach(comp => {
      if (comp && comp.individualViews) {
        allIndividualViews.push(...comp.individualViews.map(v => v.views));
      }
    });
  }
  const maxViews = allIndividualViews.length > 0 ? Math.max(...allIndividualViews) : 0;
  const effectiveMaxViews = maxViews > 0 ? maxViews : 1000;

     return (
     <div
       style={{
         padding: "40px",
         backgroundColor: "#1a1b1c",
         border: "1px solid #000000",
         borderRadius: "12px",
         minHeight: "600px",
         width: "100%",
       }}
     >
      <h2 className="text-gray-400 mb-8" style={{ fontSize: "20px" }}>
        최신 영상 3개 기준
      </h2>

      {/* 차트 영역 */}
      <div
        style={{
          position: "relative",
          marginBottom: "80px",
          width: "100%",
          paddingTop: "35%",
        }}
      >
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <svg
            viewBox="0 0 1200 400"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
          >
                         {/* Y축 눈금과 라벨 */}
             {(() => {
               // 실제 최대값에 맞춰 Y축 계산
               const maxValue = Math.max(effectiveMaxViews, 100);
               const yStep = maxValue <= 100 ? 20 : 
                            maxValue <= 500 ? 100 : 
                            maxValue <= 2000 ? 500 : 
                            maxValue <= 10000 ? 2000 : 5000;
               
               const maxLabel = Math.ceil(maxValue / yStep) * yStep;
               const labels = [];
               
               // 6개의 라벨 생성 (0, 20%, 40%, 60%, 80%, 100%)
               for (let i = 0; i < 6; i++) {
                 const value = Math.round((i / 5) * maxLabel);
                 labels.push(value);
               }
               
                               return labels.map((viewCount, i) => {
                  const y = 350 - i * 60; // 순서를 거꾸로 (위에서 아래로)
                 
                 return (
                   <g key={i}>
                     <line
                       x1="100"
                       y1={y}
                       x2="1100"
                       y2={y}
                       stroke="rgba(255,255,255,0.15)"
                       strokeWidth="1"
                     />
                     {/* Y축 라벨 */}
                     <text
                       x="90"
                       y={y + 5}
                       textAnchor="end"
                       fill="#666"
                       fontSize="12"
                       fontFamily="sans-serif"
                     >
                       {formatNumber(viewCount)}
                     </text>
                   </g>
                 );
               });
             })()}

            {/* 막대 그래프 */}
            {data.map((item, idx) => {
              const groupX = 300 + idx * 300;
              const barWidth = 35; // 막대 두께를 60에서 35로 줄임
              const gap = 8; // 간격을 20에서 8로 줄임

              // 애니메이션 값 가져오기
              const myAnimatedValue = animationValues[`my-${2-idx}`] || 0; // 최신-2, 최신-1, 최신 순서
              const competitor1AnimatedValue = animationValues[`competitor0-${2-idx}`] || 0;
              const competitor2AnimatedValue = animationValues[`competitor1-${2-idx}`] || 0;

              return (
                <g key={idx}>
                  {/* Y축 최대값 계산 */}
                  {(() => {
                    const maxValue = Math.max(effectiveMaxViews, 100);
                    const yStep = maxValue <= 100 ? 20 : 
                                 maxValue <= 500 ? 100 : 
                                 maxValue <= 2000 ? 500 : 
                                 maxValue <= 10000 ? 2000 : 5000;
                    const maxLabel = Math.ceil(maxValue / yStep) * yStep;
                    const actualMaxValue = maxLabel;
                    
                    return (
                      <>
                        {/* 내 채널 막대 */}
                        <rect
                          x={groupX - barWidth - gap}
                          y={350 - (myAnimatedValue / actualMaxValue) * 300}
                          width={barWidth}
                          height={(myAnimatedValue / actualMaxValue) * 300}
                          fill="#ef4444"
                          rx="4" // 상단을 둥근 사각형으로 만듦
                        />

                        {/* 내 채널 조회수 텍스트 */}
                        <text
                          x={groupX - barWidth - gap + barWidth / 2}
                          y={350 - (myAnimatedValue / actualMaxValue) * 300 - 10}
                          textAnchor="middle"
                          fill="#ef4444"
                          fontSize="14"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                        >
                          {formatNumber(Math.round(myAnimatedValue))}
                        </text>
                        
                        {/* 내 채널 변화율 텍스트 */}
                        <text
                          x={groupX - barWidth - gap + barWidth / 2}
                          y={350 - (myAnimatedValue / actualMaxValue) * 300 - 25}
                          textAnchor="middle"
                          fill="#ef4444"
                          fontSize="12"
                          fontFamily="sans-serif"
                        >
                          {item.myRate > 0 ? '+' : ''}{item.myRate.toFixed(1)}%
                        </text>
                      </>
                    );
                  })()}

                  {/* 경쟁 채널 막대들 */}
                  {competitors.map((_, channelIdx) => {
                    const animatedValue = channelIdx === 0 ? competitor1AnimatedValue : competitor2AnimatedValue;
                    
                    return (
                      <g key={channelIdx}>
                        {(() => {
                          const maxValue = Math.max(effectiveMaxViews, 100);
                          const yStep = maxValue <= 100 ? 20 : 
                                       maxValue <= 500 ? 100 : 
                                       maxValue <= 2000 ? 500 : 
                                       maxValue <= 10000 ? 2000 : 5000;
                          const maxLabel = Math.ceil(maxValue / yStep) * yStep;
                          const actualMaxValue = maxLabel;
                          
                          return (
                            <>
                              <rect
                                x={groupX + (channelIdx * (barWidth + gap))}
                                y={350 - (animatedValue / actualMaxValue) * 300}
                                width={barWidth}
                                height={(animatedValue / actualMaxValue) * 300}
                                fill={colors[channelIdx + 1] || colors[0]}
                                rx="4" // 상단을 둥근 사각형으로 만듦
                              />

                              {/* 경쟁 채널 조회수 텍스트 */}
                              <text
                                x={groupX + (channelIdx * (barWidth + gap)) + barWidth / 2}
                                y={350 - (animatedValue / actualMaxValue) * 300 - 10}
                                textAnchor="middle"
                                fill={colors[channelIdx + 1] || colors[0]}
                                fontSize="14"
                                fontFamily="sans-serif"
                                fontWeight="bold"
                              >
                                {formatNumber(Math.round(animatedValue))}
                              </text>
                              
                              {/* 경쟁 채널 변화율 텍스트 */}
                              <text
                                x={groupX + (channelIdx * (barWidth + gap)) + barWidth / 2}
                                y={350 - (animatedValue / actualMaxValue) * 300 - 25}
                                textAnchor="middle"
                                fill={colors[channelIdx + 1] || colors[0]}
                                fontSize="12"
                                fontFamily="sans-serif"
                              >
                                {channelIdx === 0 
                                  ? (item.competitor1Rate > 0 ? '+' : '') + item.competitor1Rate.toFixed(1) + '%'
                                  : (item.competitor2Rate > 0 ? '+' : '') + item.competitor2Rate.toFixed(1) + '%'
                                }
                              </text>
                            </>
                          );
                        })()}
                      </g>
                    );
                  })}

                  {/* X축 레이블 */}
                  <text
                    x={groupX + barWidth / 2}
                    y={380}
                    textAnchor="middle"
                    fill="#666"
                    fontSize="18"
                    fontFamily="sans-serif"
                  >
                    {item.period}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex justify-center flex-wrap" style={{ gap: "100px" }}>
        {/* 내 채널 */}
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full"
                style={{
                backgroundColor: colors[0],
                  width: "14px",
                  height: "14px",
                }}
              />
              <span className="text-white" style={{ fontSize: "20px" }}>
              내 채널
            </span>
          </div>
          <div>
            <div
              className="text-white font-bold"
              style={{ fontSize: "32px", lineHeight: "32px" }}
            >
              {channelViews?.myChannel?.individualViews && channelViews.myChannel.individualViews.length > 0 
                ? formatNumber(channelViews.myChannel.individualViews[0].views) 
                : "0"}
            </div>
            <div
              className="text-gray-400"
              style={{ fontSize: "15px", marginTop: "4px" }}
            >
              최신 영상 조회수
            </div>
            <div
              className="flex items-center gap-1"
              style={{ marginTop: "2px" }}
            >
              <span style={{ color: colors[0], fontSize: "16px" }}>
                {channelViews?.myChannel?.individualViews && channelViews.myChannel.individualViews.length > 0 
                  ? `${channelViews.myChannel.individualViews[0].rate.toFixed(2)}%` 
                  : "0.00%"}
              </span>
              <span style={{ color: colors[0], fontSize: "12px" }}>
                {channelViews?.myChannel?.individualViews && channelViews.myChannel.individualViews.length > 0 && channelViews.myChannel.individualViews[0].rate > 0 ? "▲" : "▼"}
              </span>
            </div>
          </div>
        </div>

                {/* 경쟁 채널들 */}
        {competitors.map((competitor, idx) => {
          // 해당 경쟁 채널의 조회수 데이터 찾기
          const competitorViews = channelViews?.competitors.find(
            c => c.channel_id === competitor.channel_id
          );
          
          return (
            <div key={competitor.id} className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-full"
                  style={{
                    backgroundColor: colors[idx + 1] || colors[0],
                    width: "14px",
                    height: "14px",
                  }}
                />
                <span className="text-white" style={{ fontSize: "20px" }}>
                  {competitor.channel_name}
                </span>
                {/* 삭제 버튼 */}
                <button
                  onClick={() => handleDeleteCompetitor(competitor.id)}
                  className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="경쟁 채널에서 제거"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            <div>
              <div
                className="text-white font-bold"
                style={{ fontSize: "32px", lineHeight: "32px" }}
              >
                  {competitorViews?.individualViews && competitorViews.individualViews.length > 0 
                    ? formatNumber(competitorViews.individualViews[0].views) 
                    : "0"}
              </div>
              <div
                className="text-gray-400"
                style={{ fontSize: "15px", marginTop: "4px" }}
              >
                  최신 영상 조회수
              </div>
              <div
                className="flex items-center gap-1"
                style={{ marginTop: "2px" }}
              >
                  <span style={{ color: colors[idx + 1] || colors[0], fontSize: "16px" }}>
                    {competitorViews?.individualViews && competitorViews.individualViews.length > 0 
                      ? `${competitorViews.individualViews[0].rate.toFixed(2)}%` 
                      : "0.00%"}
                </span>
                  <span style={{ color: colors[idx + 1] || colors[0], fontSize: "12px" }}>
                    {competitorViews?.individualViews && competitorViews.individualViews.length > 0 && competitorViews.individualViews[0].rate > 0 ? "▲" : "▼"}
                </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewsPage;
