// src/pages/ReplyAnalysis.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import thumbnail from "../assets/thumbnail1.png";
import arrow from "../assets/arrow.png";
import VideoInfoBox from "../components/VideoInfoBox";

// 영상 정보 타입
interface VideoInfo {
  thumbnail: string;
  date: string;
  title: string;
  views: string;
  commentRate: string;
  likeRate: string;
}

// AI 분석 결과 타입
interface AnalysisResult {
  summary_title: string;
  overall_summary_one_line: string;
  positive_summary_one_line: string;
  positive_keywords: Array<{ keyword: string; description: string }>;
  negative_summary_one_line: string;
  negative_keywords: Array<{ keyword: string; description: string }>;
}

export default function ReplyAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [showHeader, setShowHeader] = useState(false);
  const [showPositive, setShowPositive] = useState(false);
  const [showNegative, setShowNegative] = useState(false);

  // 비디오 정보
  const videoInfo: VideoInfo = location.state?.videoInfo || {
    thumbnail: thumbnail,


    date: location.state?.videoInfo?.upload_date || location.state?.summaryData?.upload_date || "",
    title: "",
    views: "",
    commentRate: "",
    likeRate: ""

  };

  // 분석 데이터 로딩
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        setError(null);
        const summaryData = location.state?.summaryData;
        if (summaryData && summaryData.summary) {
          const parsedResult = JSON.parse(summaryData.summary);
          setAnalysisData(parsedResult);
        } else {
          setError("분석 데이터가 없습니다.");
        }
      } catch (err) {
        console.error("분석 데이터 로딩 실패:", err);
        setError("분석 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysisData();
  }, [location.state?.summaryData]);

  // 긍정/부정 비율 계산
  const getSentimentPercentages = () => {
    if (!analysisData) {
      return { positive: 84, negative: 16 };
    }
    const summaryData = location.state?.summaryData;
    if (summaryData && summaryData.positive_ratio !== undefined) {
      const positive = summaryData.positive_ratio;
      const negative = 100 - positive;
      return { positive, negative };
    }
    const positiveCount = analysisData.positive_keywords.length;
    const negativeCount = analysisData.negative_keywords.length;
    const total = positiveCount + negativeCount;
    if (total === 0) return { positive: 50, negative: 50 };
    const positive = Math.round((positiveCount / total) * 100);
    const negative = 100 - positive;
    return { positive, negative };
  };

  const { positive: positivePercentage, negative: negativePercentage } =
    getSentimentPercentages();
  const isPositiveDominant = positivePercentage > negativePercentage;

  // 애니메이션 효과 (ease-out)
  useEffect(() => {
    if (!loading && analysisData) {
      const duration = 600; // 2초
      const startTime = performance.now();
      const startValue = 0;
      const endValue = positivePercentage;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 더 부드러운 ease-out 함수: 처음에 빠르게 시작해서 점점 느려짐
        const easeOut = 1 - Math.pow(1 - progress, 1.6);
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        setAnimatedPercentage(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [loading, analysisData, positivePercentage]);

  // 오른쪽 컨텐츠 페이드 인 애니메이션
  useEffect(() => {
    if (!loading && analysisData) {
      // 헤더 먼저 나타남
      setTimeout(() => setShowHeader(true), 10);
      // 긍정 섹션
      setTimeout(() => setShowPositive(true), 110);
      // 부정 섹션
      setTimeout(() => setShowNegative(true), 220);
    }
  }, [loading, analysisData]);

  // 도넛 차트 렌더링
  const renderDonutChart = () => {
    const radius = 80;
    const strokeWidth = 20;
    const circumference = 2 * Math.PI * radius;
    const positiveOffset =
      circumference - (animatedPercentage / 100) * circumference;
    return (
             <div className="flex flex-col justify-center items-center w-full h-[330px]">
                 <div className="z-0 w-full h-full rounded-2xl bg-[#1a1b1c] p-8 flex flex-col items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              {/* 부정(배경) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#ff0000"
                strokeWidth={strokeWidth}
              />
              {/* 긍정 */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#278eff"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={positiveOffset}
                strokeLinecap="round"
              />
            </svg>
                         {/* 퍼센트 */}
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <div className="text-[32px] font-bold text-white">
                 {Math.round(animatedPercentage)}%
               </div>
               <div className="text-[16px] text-gray-400">긍정</div>
             </div>
          </div>
                     {/* 범례 */}
           <div className="flex gap-6 mt-6">
             <div className="flex items-center">
               <div className="w-4 h-4 bg-[#278eff] rounded-full mr-1"></div>
               <span className="text-white">긍정 ({Math.round(animatedPercentage * 100) / 100}%)</span>
             </div>
             <div className="flex items-center">
               <div className="w-4 h-4 bg-[#ff0000] rounded-full mr-1"></div>
               <span className="text-white">부정 ({Math.round((100 - animatedPercentage) * 100) / 100}%)</span>
             </div>
           </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-black text-white flex">
        <Sidebar />
        <div className="ml-[6vw] pr-8 py-8 flex gap-4 w-full">
          <div className="flex items-center justify-center w-full">
            <div className="text-[24px] text-white">
              분석 데이터를 불러오는 중...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-black text-white flex">
        <Sidebar />
        <div className="ml-[6vw] pr-8 py-8 flex gap-4 w-full">
          <div className="flex items-center justify-center w-full">
            <div className="text-[24px] text-red-500">오류: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  // 안전하게 키워드 접근 (에러 없애기)
  const positiveKeywords = analysisData?.positive_keywords ?? [];
  const negativeKeywords = analysisData?.negative_keywords ?? [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white flex">
      {/* 스크롤바 숨김 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ::-webkit-scrollbar { display: none; }
            html, body { overflow-y: scroll; scrollbar-width: none; -ms-overflow-style: none; }
          `,
        }}
      />
      <Sidebar />
      <div className="ml-[6vw] pr-8 py-8 flex gap-4 w-full">



        {/* 왼쪽 컨테이너 - 영상 정보 및 탭 */}
        <div
          className="
            flex flex-col flex-3 w-full rounded-2xl
            bg-[rgba(255,255,255,0.15)] border border-white/30
            p-10
            "
        >
          <div>
            {/* 영상 썸네일 및 정보 - VideoInfoBox 컴포넌트로 대체 */}
            <div className="relative flex flex-col ">
              {/* 뒤로가기 버튼을 썸네일 위가 아닌 바깥쪽에 배치 */}
              <div>
                <button
                  className="rounded-full items-center justify-center cursor-pointer"
                  onClick={() => {
                    // 현재 영상 정보를 Reply_AnalysisList로 전달
                    const currentVideoInfo = location.state?.videoInfo || videoInfo;
                    const videoId = location.state?.videoId || location.state?.summaryData?.video_id;
                    
                    navigate("/reply_analysis_list", {
                      state: {
                        videoId: videoId,
                        videoInfo: currentVideoInfo
                      }
                    });
                  }}
                  style={{ transform: "scaleX(-1)" }}
                  aria-label="뒤로가기"
                >
                  <img src={arrow} alt="뒤로가기" className="w-[36px] h-[28px]" />
                </button>
              </div>
            </div>
                         <VideoInfoBox
               thumbnail={videoInfo.thumbnail}
               date={videoInfo.date}
               title={videoInfo.title}
               views={videoInfo.views}
               commentRate={videoInfo.commentRate}
               likeRate={videoInfo.likeRate}
               hideViews={true}
               className=""
             />
          </div>
          {renderDonutChart()}
        </div>

                 {/* 오른쪽 (댓글 분석) */}
         <div className="flex flex-col flex-7 w-full rounded-2xl bg-[rgba(255,255,255,0.15)] border border-white/30 h-full min-h-0">
           <div className="p-8 flex flex-col">
             {/* 헤더 */}
             <div 
               className={`transition-all duration-1000 ease-out transform ${
                 showHeader 
                   ? 'opacity-100 translate-y-0' 
                   : 'opacity-0 translate-y-8'
               }`}
             >
               <div className="mt-14 text-[24px] font-bold text-[#ffffff]">
                 해당 영상 댓글에 대한 분석
               </div>
               <div
                 className={`text-[20px] px-3 py-3 font-semibold ${
                   isPositiveDominant ? "text-[#278eff]" : "text-[#ff0000]"
                 }`}
               >
                 →{" "}
                 {analysisData?.overall_summary_one_line ||
                   "분석 데이터가 없습니다."}
               </div>
             </div>
                          {/* 긍정 파트 */}
              <div 
                className={`bg-[#1a1b1c] rounded-2xl p-8 pt-4 pb-8 border-l-8 border-blue-500 mt-6 w-full transition-all duration-1000 ease-out transform ${
                  showPositive 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
                             <div className="flex items-center text-[28px]  text-[#d9d9d9] mb-6">
                 <span className="w-[15px] h-[15px] rounded-full bg-[#278eff] mr-4"></span>
                 긍정적인 반응
               </div>
                             {/* 키워드 첫 줄 */}
               {positiveKeywords.length > 0 && (
                 <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-4">
                                         {/* 왼쪽 설명 */}
                     <span className="text-[#d9d9d9] text-[15px]">
                       {positiveKeywords[0]?.description || ""}
                     </span>
                    <div className="relative flex items-center w-[60px] h-[2px]">
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#278eff] rounded-full shadow-lg"></span>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#60a5fa] rounded-full opacity-80"></span>
                      <span className="absolute left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#93c5fd] rounded-full opacity-60"></span>
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#bae6fd] rounded-full opacity-40"></span>
                    </div>
                    <span className="bg-[#278eff] text-[#ffffff] rounded-xl px-4 py-1 text-[14px] font-regular whitespace-nowrap">
                      #{positiveKeywords[0]?.keyword || ""}
                    </span>
                    {positiveKeywords[1] && (
                      <>
                        <span className="bg-[#278eff] text-[#ffffff] rounded-xl px-4 py-1 text-[14px] font-regular whitespace-nowrap mx-2">
                          #{positiveKeywords[1]?.keyword || ""}
                        </span>
                        <div
                          className="relative flex items-center w-[60px] h-[2px]"
                          style={{ transform: "scaleX(-1)" }}
                        >
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#278eff] rounded-full shadow-lg"></span>
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#60a5fa] rounded-full opacity-80"></span>
                          <span className="absolute left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#93c5fd] rounded-full opacity-60"></span>
                          <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#bae6fd] rounded-full opacity-40"></span>
                        </div>
                                                 <span className="text-[#d9d9d9] text-[15px]">
                           {positiveKeywords[1]?.description || ""}
                         </span>
                      </>
                    )}
                  </div>
                </div>
              )}
                             {/* 키워드 둘째줄 */}
               {positiveKeywords.length > 2 && (
                 <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-4">
                    <span className="text-[#d9d9d9] text-[15px] ">
                      {positiveKeywords[2]?.description || ""}
                    </span>
                    <div className="relative flex items-center w-[60px] h-[2px]">
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#278eff] rounded-full shadow-lg"></span>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#60a5fa] rounded-full opacity-80"></span>
                      <span className="absolute left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#93c5fd] rounded-full opacity-60"></span>
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#bae6fd] rounded-full opacity-40"></span>
                    </div>
                    <span className="bg-[#278eff] text-[#ffffff] rounded-xl px-4 py-1 text-[14px] font-regular whitespace-nowrap">
                      #{positiveKeywords[2]?.keyword || ""}
                    </span>
                    {positiveKeywords[3] && (
                      <>
                        <span className="bg-[#278eff] text-[#ffffff] rounded-xl px-4 py-1 text-[14px] font-regular whitespace-nowrap mx-2">
                          #{positiveKeywords[3]?.keyword || ""}
                        </span>
                        <div
                          className="relative flex items-center w-[60px] h-[2px]"
                          style={{ transform: "scaleX(-1)" }}
                        >
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#278eff] rounded-full shadow-lg"></span>
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#60a5fa] rounded-full opacity-80"></span>
                          <span className="absolute left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#93c5fd] rounded-full opacity-60"></span>
                          <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#bae6fd] rounded-full opacity-40"></span>
                        </div>
                                                 <span className="text-[#d9d9d9] text-[15px]">
                           {positiveKeywords[3]?.description || ""}
                         </span>
                      </>
                    )}
                  </div>
                </div>
              )}
                             {/* 긍정 요약 */}
               <div className="text-[#d9d9d9] text-[20px] font-medium mt-8 text-right">
                 {analysisData?.positive_summary_one_line ||
                   "긍정적 반응에 대한 요약이 없습니다."}
               </div>
                         </div>
                          {/* 부정 파트 */}
              <div 
                className={`bg-[#1a1b1c] rounded-2xl p-8 pt-4 pb-8 border-l-8 border-red-500 mt-6 w-full transition-all duration-1000 ease-out transform ${
                  showNegative 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
                             <div className="flex items-center text-[28px] text-[#d9d9d9] mb-6">
                 <span className="w-[15px] h-[15px] rounded-full bg-[#ff0000] mr-4"></span>
                 부정적인 반응
               </div>
                             {/* 키워드 첫 줄 */}
               {negativeKeywords.length > 0 && (
                 <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-4">
                                         <span className="text-[#d9d9d9] text-[15px]">
                       {negativeKeywords[0]?.description || ""}
                     </span>
                    <div className="relative flex items-center w-[60px] h-[2px]">
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff0000] rounded-full shadow-lg"></span>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff4d4d] rounded-full opacity-80"></span>
                      <span className="absolute left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff9999] rounded-full opacity-60"></span>
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ffcfcf] rounded-full opacity-40"></span>
                    </div>
                    <span className="bg-[#ff0000] text-[#ffffff] rounded-xl px-4 py-1 text-[14px] font-regular whitespace-nowrap">
                      #{negativeKeywords[0]?.keyword || ""}
                    </span>
                    {negativeKeywords[1] && (
                      <>
                        <span className="bg-[#ff0000] text-[#ffffff] rounded-xl px-4 py-1 text-[14px] font-regular whitespace-nowrap mx-2">
                          #{negativeKeywords[1]?.keyword || ""}
                        </span>
                        <div
                          className="relative flex items-center w-[60px] h-[2px]"
                          style={{ transform: "scaleX(-1)" }}
                        >
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff0000] rounded-full shadow-lg"></span>
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff4d4d] rounded-full opacity-80"></span>
                          <span className="absolute left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff9999] rounded-full opacity-60"></span>
                          <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ffcfcf] rounded-full opacity-40"></span>
                        </div>
                                                 <span className="text-[#d9d9d9] text-[15px]">
                           {negativeKeywords[1]?.description || ""}
                         </span>
                      </>
                    )}
                  </div>
                </div>
              )}
                             {/* 키워드 둘째줄 */}
               {negativeKeywords.length > 2 && (
                 <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-4">
                                         <span className="text-[#d9d9d9] text-[15px]">
                       {negativeKeywords[2]?.description || ""}
                     </span>
                    <div className="relative flex items-center w-[60px] h-[2px]">
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff0000] rounded-full shadow-lg"></span>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff4d4d] rounded-full opacity-80"></span>
                      <span className="absolute left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff9999] rounded-full opacity-60"></span>
                      <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ffcfcf] rounded-full opacity-40"></span>
                    </div>
                    <span className="bg-[#ff0000] text-[#ffffff] rounded-xl px-4 py-1 text-[14px] font-regular whitespace-nowrap">
                      #{negativeKeywords[2]?.keyword || ""}
                    </span>
                    {negativeKeywords[3] && (
                      <>
                        <span className="bg-[#ff0000] text-[#ffffff] rounded-xl px-4 py-1 text-[14px] font-regular whitespace-nowrap mx-2">
                          #{negativeKeywords[3]?.keyword || ""}
                        </span>
                        <div
                          className="relative flex items-center w-[60px] h-[2px]"
                          style={{ transform: "scaleX(-1)" }}
                        >
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff0000] rounded-full shadow-lg"></span>
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff4d4d] rounded-full opacity-80"></span>
                          <span className="absolute left-7 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ff9999] rounded-full opacity-60"></span>
                          <span className="absolute left-10 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#ffcfcf] rounded-full opacity-40"></span>
                        </div>
                                                 <span className="text-[#d9d9d9] text-[15px]">
                           {negativeKeywords[3]?.description || ""}
                         </span>
                      </>
                    )}
                  </div>
                </div>
              )}
                             {/* 부정 요약 */}
               <div className="text-[#d9d9d9] text-[20px] font-medium mt-8 text-right">
                 {analysisData?.negative_summary_one_line ||
                   "부정적 반응에 대한 요약이 없습니다."}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
