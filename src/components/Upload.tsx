import React, { useState, useEffect } from "react";

interface CompetitorChannel {
  id: number; // other_channel 테이블의 id
  channel_id: number; // channel 테이블의 id
  channel_name: string;
  youtube_channel_id: string;
}

interface WeeklyUpload {
  week: string;
  count: number;
}

interface ChannelUploads {
  channel_id: number;
  channel_name: string;
  weeklyUploads: WeeklyUpload[];
}

interface UploadPageProps {
  onDataRefresh?: () => void;
  competitors?: CompetitorChannel[];
}

const UploadPage: React.FC<UploadPageProps> = ({ onDataRefresh, competitors: propCompetitors }) => {
  const [competitors, setCompetitors] = useState<CompetitorChannel[]>([]);
  const [channelUploads, setChannelUploads] = useState<{
    myChannel?: ChannelUploads;
    competitors: ChannelUploads[];
  }>({ competitors: [] });
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    value: number;
    x: number;
    y: number;
  }>({ show: false, value: 0, x: 0, y: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);

  const colors = ["#ef4444", "#22c55e", "#3b82f6"];

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

  const fetchUploadFrequency = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("인증 토큰이 없습니다.");
        return;
      }

      console.log("Fetching upload frequency...");
      const response = await fetch("http://localhost:8000/api/others/videos/upload-frequency", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Upload frequency data:", data);
        setChannelUploads(data.data || { competitors: [] });
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error fetching upload frequency:", error);
    }
  };

  const handleDeleteCompetitor = async (otherChannelId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("인증 토큰이 없습니다.");
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
        // 삭제 성공 후 데이터 새로고침
        await fetchCompetitors();
        await fetchUploadFrequency();
        // 부모 컴포넌트에 데이터 새로고침 알림
        if (onDataRefresh) {
          onDataRefresh();
        }
      } else {
        const errorData = await response.json();
        console.error("Delete error:", errorData);
      }
    } catch (error) {
      console.error("Error deleting competitor:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (propCompetitors) {
        setCompetitors(propCompetitors);
      } else {
        await fetchCompetitors();
      }
      await fetchUploadFrequency();
      setLoading(false);
    };

    loadData();
  }, [propCompetitors]);

  // 애니메이션 효과 - 아래에서 위로 올라가는 모션
  useEffect(() => {
    if (channelUploads && !loading) {
      setAnimationProgress(0);
      
      const startTime = Date.now();
      const duration = 1000; // 1초
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // ease out 함수
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimationProgress(easeOut);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [channelUploads, loading]);

  // propCompetitors가 변경될 때마다 데이터 새로고침
  useEffect(() => {
    if (propCompetitors && propCompetitors.length > 0) {
      fetchUploadFrequency();
    }
  }, [propCompetitors]);

  // 차트 데이터 생성
  const getChartData = () => {
    const allData = [];
    
    // 내 채널 데이터
    if (channelUploads.myChannel) {
      allData.push({
        name: "내 채널",
        color: colors[0],
        data: channelUploads.myChannel.weeklyUploads.map(item => item.count)
      });
    }
    
    // 경쟁 채널 데이터
    channelUploads.competitors.forEach((competitor, idx) => {
      allData.push({
        name: competitor.channel_name,
        color: colors[idx + 1] || colors[0],
        data: competitor.weeklyUploads.map(item => item.count)
      });
    });
    
    return allData;
  };

  // 최대값 계산
  const getMaxValue = () => {
    const allValues = [];
    
    if (channelUploads.myChannel) {
      allValues.push(...channelUploads.myChannel.weeklyUploads.map(item => item.count));
    }
    
    channelUploads.competitors.forEach(competitor => {
      allValues.push(...competitor.weeklyUploads.map(item => item.count));
    });
    
    const maxValue = Math.max(...allValues, 1); // 최소값 1로 설정
    return Math.ceil(maxValue * 1.2); // 20% 여유 추가
  };

  // X축 라벨을 실제 데이터의 week로 생성 (과거→최신)
  const xLabels = channelUploads.myChannel
    ? channelUploads.myChannel.weeklyUploads.map(item => {
        const date = new Date(item.week);
        const month = date.getMonth() + 1;
        const week = Math.ceil((date.getDate() + date.getDay()) / 7);
        return `${month}월 ${week}주차`;
      })
    : [];

  // '이번 주 업로드' 숫자 (최신 주)
  const myUploads = channelUploads.myChannel?.weeklyUploads[channelUploads.myChannel.weeklyUploads.length - 1]?.count || 0;

  const chartData = getChartData();
  const maxValue = getMaxValue();

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          backgroundColor: "#1C2023",
          minHeight: "600px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#1a1b1c",
        border: "1px solid #000000",
        borderRadius: "12px",
        minHeight: "500px",
        width: "100%",
      }}
    >
      {/* 차트 영역 */}
      <div
        className="chart-container"
        style={{
          position: "relative",
          marginBottom: "0px",
          width: "100%",
          paddingTop: "40%",
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
            {/* 그리드 라인 */}
            {(() => {
              const lines = [];
              const step = Math.ceil(maxValue / 5);
              for (let i = 0; i <= maxValue; i += step) {
                const y = 300 - (i / maxValue) * 250;
                lines.push(
              <line
                key={i}
                x1="100"
                    y1={y}
                x2="1100"
                    y2={y}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
                );
              }
              return lines;
            })()}

            {/* 데이터 라인 */}
            {chartData.map((channel, idx) => {
              const animatedPoints = channel.data
                .map((value, i) => {
                  const x = 100 + (i * 1000) / (channel.data.length - 1);
                  // 아래에서 위로 올라가는 애니메이션
                  const animatedValue = value * animationProgress;
                  const y = 300 - (animatedValue / maxValue) * 250;
                  return `${x},${y}`;
                })
                .join(" ");

              return (
                <polyline
                  key={idx}
                  fill="none"
                  stroke={channel.color}
                  strokeWidth="3"
                  points={animatedPoints}
                />
              );
            })}

            {/* 데이터 포인트 */}
            {chartData.map((channel, idx) => (
              <g key={`points-${idx}`}>
                {channel.data.map((value, i) => {
                  const x = 100 + (i * 1000) / (channel.data.length - 1);
                  // 아래에서 위로 올라가는 애니메이션
                  const animatedValue = value * animationProgress;
                  const y = 300 - (animatedValue / maxValue) * 250;
                  
                  return (
                    <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={channel.color}
                      stroke="#1a1b1c"
                      strokeWidth="3"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            show: true,
                            value: value,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10
                          });
                          const tooltip = document.createElement('div');
                          tooltip.id = `tooltip-${i}`;
                          tooltip.className = 'fixed bg-black bg-opacity-90 text-white text-ml px-3 py-2 rounded-xl pointer-events-none z-10 text-center';
                          tooltip.style.left = `${e.clientX - 40}px`;
                          tooltip.style.top = `${e.clientY - 80}px`;
                          tooltip.innerHTML = `
                            <div>${xLabels[i]}</div>
                            <div class="font-bold">${value}개</div>
                          `;
                          document.body.appendChild(tooltip);
                        }}
                        onMouseLeave={() => {
                          setTooltip({ show: false, value: 0, x: 0, y: 0 });
                          const tooltip = document.getElementById(`tooltip-${i}`);
                          if (tooltip) {
                            tooltip.remove();
                          }
                        }}
                    />
                    </g>
                  );
                })}
              </g>
            ))}

            {/* X축 레이블 */}
            {xLabels.map((label, i) => {
              const x = 100 + (i * 1000) / (xLabels.length - 1);
              return (
                <text
                  key={i}
                  x={x}
                  y={340}
                  textAnchor="middle"
                  fill="#666"
                  fontSize="18"
                  fontFamily="sans-serif"
                >
                  {label}
                </text>
              );
            })}

            {/* Y축 레이블 */}
            {(() => {
              const labels = [];
              const step = Math.ceil(maxValue / 5);
              for (let i = 0; i <= maxValue; i += step) {
                const y = 300 - (i / maxValue) * 250;
                labels.push(
                  <text
                    key={i}
                    x="80"
                    y={y + 5}
                    textAnchor="end"
                    fill="#666"
                    fontSize="14"
                    fontFamily="sans-serif"
                  >
                    {i}
                  </text>
                );
              }
              return labels;
            })()}
          </svg>
        </div>
      </div>

      {/* 툴팁 */}
      {tooltip.show && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 1000,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.value}개
        </div>
      )}

      {/* 범례 */}
      <div className="flex justify-center" style={{ gap: "100px" }}>
        {/* 내 채널 */}
        {channelUploads.myChannel && (
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
                {myUploads}
              </div>
              <div
                className="text-gray-400"
                style={{ fontSize: "15px", marginTop: "4px" }}
              >
                이번 주 업로드
              </div>
              <div
                className="flex items-center gap-1"
                style={{ marginTop: "2px" }}
              >
                <span style={{ color: colors[0], fontSize: "16px" }}>
                  {channelUploads.myChannel.weeklyUploads.reduce((sum, week) => sum + week.count, 0)}개
                </span>
                <span style={{ color: colors[0], fontSize: "12px" }}>
                  총 업로드
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 경쟁 채널들 */}
        {Array.isArray(competitors) && competitors.map((competitor, idx) => {
          const competitorData = channelUploads.competitors.find(
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
                  {competitorData?.weeklyUploads[competitorData.weeklyUploads.length - 1]?.count || 0}
                </div>
                <div
                  className="text-gray-400"
                  style={{ fontSize: "15px", marginTop: "4px" }}
                >
                  이번 주 업로드
                </div>
                <div
                  className="flex items-center gap-1"
                  style={{ marginTop: "2px" }}
                >
                  <span style={{ color: colors[idx + 1] || colors[0], fontSize: "16px" }}>
                    {competitorData?.weeklyUploads.reduce((sum, week) => sum + week.count, 0) || 0}개
                  </span>
                  <span style={{ color: colors[idx + 1] || colors[0], fontSize: "12px" }}>
                    총 업로드
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

export default UploadPage;
