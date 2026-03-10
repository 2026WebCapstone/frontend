import React, { useState, useEffect } from "react";

interface CompetitorChannel {
  id: number; // other_channel 테이블의 id
  channel_id: number; // channel 테이블의 id
  channel_name: string;
  youtube_channel_id: string;
}

interface IndividualLike {
  likes: number;
  rate: number;
}

interface ChartDataItem {
  period: string;
  my: number;
  competitor1: number;
  competitor2: number;
  myLikes: number;
  competitor1Likes: number;
  competitor2Likes: number;
  myRate: number;
  competitor1Rate: number;
  competitor2Rate: number;
}

interface ChannelLikes {
  channel_id: number;
  channel_name: string;
  totalLikes: number;
  individualLikes?: IndividualLike[];
}

interface LikesPageProps {
  onDataRefresh?: () => void;
  competitors?: CompetitorChannel[];
}

const LikesPage: React.FC<LikesPageProps> = ({ onDataRefresh, competitors: propCompetitors }) => {
  console.log("=== LikesPage 컴포넌트 로드됨 ===");
  
  const [competitors, setCompetitors] = useState<CompetitorChannel[]>([]);
  const [channelLikes, setChannelLikes] = useState<{ myChannel: ChannelLikes; competitors: ChannelLikes[]; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animationValues, setAnimationValues] = useState<{ [key: string]: number }>({});

  const fetchCompetitors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/others", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      console.error("경쟁 채널 목록 조회 실패:", error);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const fetchChannelLikes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/others/videos/likes", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChannelLikes(data.data);
      } else {
        setError("좋아요 데이터를 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("좋아요 데이터 조회 실패:", error);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const handleDeleteCompetitor = async (otherChannelId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/others/${otherChannelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 데이터 새로고침
        await refreshData();
        if (onDataRefresh) {
          onDataRefresh();
        }
      } else {
        setError("경쟁 채널 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("경쟁 채널 삭제 실패:", error);
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError("");
    await Promise.all([fetchCompetitors(), fetchChannelLikes()]);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (propCompetitors) {
          setCompetitors(propCompetitors);
        } else {
          await fetchCompetitors();
        }
        await fetchChannelLikes();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [propCompetitors]);

  // propCompetitors가 변경될 때마다 데이터 새로고침
  useEffect(() => {
    if (propCompetitors && propCompetitors.length > 0) {
      fetchChannelLikes();
    }
  }, [propCompetitors]);

  // 애니메이션 효과
  useEffect(() => {
    if (channelLikes) {
      const animationData: { [key: string]: number } = {};
      
      // 내 채널 데이터
      if (channelLikes.myChannel.individualLikes) {
        channelLikes.myChannel.individualLikes.forEach((_, index) => {
          animationData[`my-${index}`] = 0;
        });
      }
      
      // 경쟁 채널 데이터
      if (channelLikes.competitors) {
        channelLikes.competitors.forEach((competitor, compIndex) => {
          if (competitor.individualLikes) {
            competitor.individualLikes.forEach((_, index) => {
              animationData[`competitor${compIndex}-${index}`] = 0;
            });
          }
        });
      }
      
      setAnimationValues(animationData);
      
      // 애니메이션 시작
      const startTime = Date.now();
      const duration = 1000; // 1초
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // ease out 함수
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const newAnimationValues: { [key: string]: number } = {};
        
        // 내 채널 애니메이션
        if (channelLikes.myChannel.individualLikes) {
          channelLikes.myChannel.individualLikes.forEach((like, index) => {
            newAnimationValues[`my-${index}`] = like.likes * easeOut;
          });
        }
        
        // 경쟁 채널 애니메이션
        if (channelLikes.competitors) {
          channelLikes.competitors.forEach((competitor, compIndex) => {
            if (competitor.individualLikes) {
              competitor.individualLikes.forEach((like, index) => {
                newAnimationValues[`competitor${compIndex}-${index}`] = like.likes * easeOut;
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
  }, [channelLikes]);

  // 차트 데이터 (개별 영상 좋아요 기반)
  const getChartData = (): ChartDataItem[] => {
    if (!channelLikes) {
      return [
        { period: "최신-2", my: 0, competitor1: 0, competitor2: 0, myLikes: 0, competitor1Likes: 0, competitor2Likes: 0, myRate: 0, competitor1Rate: 0, competitor2Rate: 0 },
        { period: "최신-1", my: 0, competitor1: 0, competitor2: 0, myLikes: 0, competitor1Likes: 0, competitor2Likes: 0, myRate: 0, competitor1Rate: 0, competitor2Rate: 0 },
        { period: "최신", my: 0, competitor1: 0, competitor2: 0, myLikes: 0, competitor1Likes: 0, competitor2Likes: 0, myRate: 0, competitor1Rate: 0, competitor2Rate: 0 },
      ];
    }

    // 내 채널 개별 영상 좋아요 (최신순: 0=최신, 1=최신-1, 2=최신-2)
    const myLikes = channelLikes.myChannel.individualLikes || [
      { likes: 0, rate: 0 },
      { likes: 0, rate: 0 },
      { likes: 0, rate: 0 }
    ];

    // 경쟁 채널 개별 영상 좋아요
    const competitor1Likes = channelLikes.competitors[0]?.individualLikes || [
      { likes: 0, rate: 0 },
      { likes: 0, rate: 0 },
      { likes: 0, rate: 0 }
    ];
    const competitor2Likes = channelLikes.competitors[1]?.individualLikes || [
      { likes: 0, rate: 0 },
      { likes: 0, rate: 0 },
      { likes: 0, rate: 0 }
    ];

    return [
      { 
        period: "최신-2", 
        my: myLikes[2]?.likes || 0, 
        competitor1: competitor1Likes[2]?.likes || 0, 
        competitor2: competitor2Likes[2]?.likes || 0,
        myLikes: myLikes[2]?.likes || 0,
        competitor1Likes: competitor1Likes[2]?.likes || 0,
        competitor2Likes: competitor2Likes[2]?.likes || 0,
        myRate: myLikes[2]?.rate || 0,
        competitor1Rate: competitor1Likes[2]?.rate || 0,
        competitor2Rate: competitor2Likes[2]?.rate || 0
      },
      { 
        period: "최신-1", 
        my: myLikes[1]?.likes || 0, 
        competitor1: competitor1Likes[1]?.likes || 0, 
        competitor2: competitor2Likes[1]?.likes || 0,
        myLikes: myLikes[1]?.likes || 0,
        competitor1Likes: competitor1Likes[1]?.likes || 0,
        competitor2Likes: competitor2Likes[1]?.likes || 0,
        myRate: myLikes[1]?.rate || 0,
        competitor1Rate: competitor1Likes[1]?.rate || 0,
        competitor2Rate: competitor1Likes[1]?.rate || 0
      },
      { 
        period: "최신", 
        my: myLikes[0]?.likes || 0, 
        competitor1: competitor1Likes[0]?.likes || 0, 
        competitor2: competitor2Likes[0]?.likes || 0,
        myLikes: myLikes[0]?.likes || 0,
        competitor1Likes: competitor1Likes[0]?.likes || 0,
        competitor2Likes: competitor2Likes[0]?.likes || 0,
        myRate: myLikes[0]?.rate || 0,
        competitor1Rate: competitor1Likes[0]?.rate || 0,
        competitor2Rate: competitor2Likes[0]?.rate || 0
      },
    ];
  };

  const data = getChartData();
  const colors = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

  // 디버깅용 로그
  console.log("=== 좋아요 컴포넌트 디버깅 ===");
  console.log("Chart data:", data);
  console.log("Channel likes:", channelLikes);
  console.log("Competitors:", competitors);
  console.log("Competitors type:", typeof competitors);
  console.log("Is competitors array?", Array.isArray(competitors));

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

  // 개별 영상 좋아요 중 최대값 찾기
  const allIndividualLikes = [];
  if (channelLikes && channelLikes.myChannel && channelLikes.myChannel.individualLikes) {
    allIndividualLikes.push(...channelLikes.myChannel.individualLikes.map(v => v.likes));
  }
  if (channelLikes && channelLikes.competitors) {
    channelLikes.competitors.forEach(comp => {
      if (comp && comp.individualLikes) {
        allIndividualLikes.push(...comp.individualLikes.map(v => v.likes));
      }
    });
  }
//  const maxLikes = allIndividualLikes.length > 0 ? Math.max(...allIndividualLikes) : 0;
  // 실제 최대값에 약간의 여유를 주어 Y축 설정 (최대값의 120%로 설정)
//  const maxValue = maxLikes > 0 ? Math.ceil(maxLikes * 1.2) : 1000;

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
              // 개별 영상 좋아요 중 최대값 찾기
              const allIndividualLikes = [];
              if (channelLikes && channelLikes.myChannel && channelLikes.myChannel.individualLikes) {
                allIndividualLikes.push(...channelLikes.myChannel.individualLikes.map(v => v.likes));
              }
              if (channelLikes && channelLikes.competitors) {
                channelLikes.competitors.forEach(comp => {
                  if (comp && comp.individualLikes) {
                    allIndividualLikes.push(...comp.individualLikes.map(v => v.likes));
                  }
                });
              }
              const maxLikes = allIndividualLikes.length > 0 ? Math.max(...allIndividualLikes) : 0;
              
              // 최대값이 0이면 기본값 설정 (업로드 주기 그래프와 동일한 방식)
              const effectiveMaxLikes = maxLikes > 0 ? maxLikes : 20;
              
              // Y축 간격을 동적으로 계산
              // let step = 500;
              
              // 최대값에 따라 간격 조정
              // if (effectiveMaxLikes <= 100) {
              //   step = 20;
              // } else if (effectiveMaxLikes <= 500) {
              //   step = 100;
              // } else if (effectiveMaxLikes <= 2000) {
              //   step = 500;
              // } else if (effectiveMaxLikes <= 10000) {
              //   step = 2000;
              // } else {
              //   step = 5000;
              // }
              
              // Y축 라벨 생성 (업로드 주기 그래프와 동일한 방식)
              const maxValue = Math.ceil(effectiveMaxLikes * 1.2); // 20% 여유 추가
              const labels = [];
              const labelStep = Math.ceil(maxValue / 5);
              for (let i = 0; i <= maxValue; i += labelStep) {
                labels.push(i);
              }
              
              console.log('Y축 계산:', { effectiveMaxLikes, labels });
              
              return labels.map((likeCount, i) => {
                const y = 300 - (likeCount / maxValue) * 250; // 업로드 주기 그래프와 동일한 방식
              
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
                      {formatNumber(likeCount)}
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

              // Y축의 실제 최대값 계산 (Y축 라벨의 최대값)
              const allIndividualLikes = [];
              if (channelLikes && channelLikes.myChannel && channelLikes.myChannel.individualLikes) {
                allIndividualLikes.push(...channelLikes.myChannel.individualLikes.map(v => v.likes));
              }
              if (channelLikes && channelLikes.competitors) {
                channelLikes.competitors.forEach(comp => {
                  if (comp && comp.individualLikes) {
                    allIndividualLikes.push(...comp.individualLikes.map(v => v.likes));
                  }
                });
              }
              const maxLikes = allIndividualLikes.length > 0 ? Math.max(...allIndividualLikes) : 0;
              const effectiveMaxLikes = maxLikes > 0 ? maxLikes : 1000;
              
              console.log('좋아요 데이터:', { allIndividualLikes, maxLikes, effectiveMaxLikes });
              
              // Y축의 실제 최대값 (업로드 주기 그래프와 동일한 방식)
              const actualMaxValue = Math.ceil(effectiveMaxLikes * 1.2); // 20% 여유 추가

              return (
                <g key={idx}>
                  {/* 내 채널 막대 */}
                  <rect
                    x={groupX - barWidth - gap}
                    y={300 - (myAnimatedValue / actualMaxValue) * 250}
                    width={barWidth}
                    height={(myAnimatedValue / actualMaxValue) * 250}
                    fill="#ef4444"
                    rx="4" // 상단을 둥근 사각형으로 만듦
                  />

                  {/* 내 채널 좋아요 텍스트 */}
                  <text
                    x={groupX - barWidth - gap + barWidth / 2}
                    y={300 - (myAnimatedValue / actualMaxValue) * 250 - 10}
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
                    y={300 - (myAnimatedValue / actualMaxValue) * 250 - 25}
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    {item.myRate > 0 ? '+' : ''}{item.myRate.toFixed(1)}%
                  </text>

                  {/* 경쟁 채널 막대들 */}
                  {Array.isArray(competitors) && competitors.map((_, channelIdx) => {
                    const animatedValue = channelIdx === 0 ? competitor1AnimatedValue : competitor2AnimatedValue;
                    
                    return (
                      <g key={channelIdx}>
                  <rect
                          x={groupX + (channelIdx * (barWidth + gap))}
                          y={300 - (animatedValue / actualMaxValue) * 250}
                    width={barWidth}
                          height={(animatedValue / actualMaxValue) * 250}
                          fill={colors[channelIdx + 1] || colors[0]}
                          rx="4" // 상단을 둥근 사각형으로 만듦
                  />

                        {/* 경쟁 채널 좋아요 텍스트 */}
                        <text
                          x={groupX + (channelIdx * (barWidth + gap)) + barWidth / 2}
                          y={300 - (animatedValue / actualMaxValue) * 250 - 10}
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
                          y={300 - (animatedValue / actualMaxValue) * 250 - 25}
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

            {/* 큰 숫자와 변화율 정보 */}
            <div>
              <div
                className="text-white font-bold"
                style={{ fontSize: "32px", lineHeight: "32px" }}
              >
              {formatNumber(channelLikes && channelLikes.myChannel && channelLikes.myChannel.individualLikes && channelLikes.myChannel.individualLikes[0] ? channelLikes.myChannel.individualLikes[0].likes : 0)}
              </div>
              <div
                className="text-gray-400"
                style={{ fontSize: "15px", marginTop: "4px" }}
              >
              최신 영상 좋아요
              </div>
              <div
                className="flex items-center gap-1"
                style={{ marginTop: "2px" }}
              >
              <span style={{ color: colors[0], fontSize: "16px" }}>
                {channelLikes && channelLikes.myChannel && channelLikes.myChannel.individualLikes && channelLikes.myChannel.individualLikes[0] && channelLikes.myChannel.individualLikes[0].rate > 0 ? '+' : ''}{channelLikes && channelLikes.myChannel && channelLikes.myChannel.individualLikes && channelLikes.myChannel.individualLikes[0] ? channelLikes.myChannel.individualLikes[0].rate.toFixed(2) : '0.00'}%
              </span>
              <span style={{ color: colors[0], fontSize: "12px" }}>
                {channelLikes && channelLikes.myChannel && channelLikes.myChannel.individualLikes && channelLikes.myChannel.individualLikes[0] && channelLikes.myChannel.individualLikes[0].rate > 0 ? '▲' : '▼'}
              </span>
            </div>
          </div>
        </div>

        {/* 경쟁 채널들 */}
        {Array.isArray(competitors) && competitors.map((competitor, idx) => {
          
          return (
            <div key={idx} className="flex items-center gap-6">
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

              {/* 큰 숫자와 변화율 정보 */}
              <div>
                <div
                  className="text-white font-bold"
                  style={{ fontSize: "32px", lineHeight: "32px" }}
                >
                  {formatNumber(channelLikes && channelLikes.competitors && channelLikes.competitors[idx] && channelLikes.competitors[idx].individualLikes && channelLikes.competitors[idx].individualLikes[0] ? channelLikes.competitors[idx].individualLikes[0].likes : 0)}
                </div>
                <div
                  className="text-gray-400"
                  style={{ fontSize: "15px", marginTop: "4px" }}
                >
                  최신 영상 좋아요
                </div>
                <div
                  className="flex items-center gap-1"
                  style={{ marginTop: "2px" }}
                >
                  <span style={{ color: colors[idx + 1] || colors[0], fontSize: "16px" }}>
                    {channelLikes && channelLikes.competitors && channelLikes.competitors[idx] && channelLikes.competitors[idx].individualLikes && channelLikes.competitors[idx].individualLikes[0] && channelLikes.competitors[idx].individualLikes[0].rate > 0 ? '+' : ''}{channelLikes && channelLikes.competitors && channelLikes.competitors[idx] && channelLikes.competitors[idx].individualLikes && channelLikes.competitors[idx].individualLikes[0] ? channelLikes.competitors[idx].individualLikes[0].rate.toFixed(2) : '0.00'}%
                  </span>
                  <span style={{ color: colors[idx + 1] || colors[0], fontSize: "12px" }}>
                    {channelLikes && channelLikes.competitors && channelLikes.competitors[idx] && channelLikes.competitors[idx].individualLikes && channelLikes.competitors[idx].individualLikes[0] && channelLikes.competitors[idx].individualLikes[0].rate > 0 ? '▲' : '▼'}
                </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* 경쟁 채널이 없을 때 메시지 */}
        {competitors.length === 0 && (
          <div className="text-gray-400 text-center flex-1">
            등록된 경쟁 채널이 없습니다. <br />
            <span className="text-sm">Insight 페이지에서 경쟁 채널을 등록해보세요.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikesPage;
