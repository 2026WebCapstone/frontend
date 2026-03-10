import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import medal1 from "../assets/1st.png";
import medal2 from "../assets/2nd.png";
import medal3 from "../assets/3rd.png";
import arrow from "../assets/arrow.png";

interface Video {
  id: number;
  title: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
}

interface Category {
  name: string;
  description: string;
  videoCount: number;
  averageViews: number;
  averageLikes: number;
  videos: Video[];
}

export default function CategoryPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('[DEBUG] CategoryPage - API 호출 시작');
      console.log('[DEBUG] CategoryPage - Token:', token ? '존재' : '없음');
      
      if (!token) {
        setError('로그인이 필요합니다.');
        return;
      }

      console.log('[DEBUG] CategoryPage - API URL:', 'http://localhost:8000/api/videos/thumbnail-categories');

      const response = await fetch('http://localhost:8000/api/videos/thumbnail-categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[DEBUG] CategoryPage - Response status:', response.status);
      console.log('[DEBUG] CategoryPage - Response ok:', response.ok);

      if (!response.ok) {
        throw new Error('썸네일 분류 데이터를 가져오는데 실패했습니다.');
      }

      const result = await response.json();
      console.log('[DEBUG] CategoryPage - Response data:', result);
      console.log('[DEBUG] CategoryPage - result.data 타입:', typeof result.data);
      console.log('[DEBUG] CategoryPage - result.data 내용:', result.data);
      
      if (result.success) {
        console.log('[DEBUG] CategoryPage - result.data 상세:', {
          type: typeof result.data,
          isArray: Array.isArray(result.data),
          length: result.data?.length,
          content: result.data
        });
        setCategories(result.data);
        console.log('[DEBUG] CategoryPage - 카테고리 설정 완료, 개수:', result.data?.length || 'undefined');
      } else {
        setError(result.message || '분류 데이터를 가져오는데 실패했습니다.');
        console.log('[DEBUG] CategoryPage - API 응답 실패:', result.message);
      }
    } catch (error) {
      console.error('[DEBUG] CategoryPage - 썸네일 분류 오류:', error);
      setError('썸네일 분류 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      console.log('[DEBUG] CategoryPage - 로딩 완료');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}천`;
    }
    return num.toString();
  };

  const getMedalImage = (rank: number) => {
    switch (rank) {
      case 1: return medal1;
      case 2: return medal2;
      case 3: return medal3;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-black text-white flex">
        <Sidebar />
        <div className="ml-[6vw] pr-8 py-8 flex gap-4 w-full">
                     <div
             className="rounded-2xl w-full h-full px-8"
             style={{
               backgroundColor: "rgba(255, 255, 255, 0.15)",
               border: "1px solid rgba(255, 255, 255, 0.3)",
             }}
           >
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                {/* 도넛형식 로딩 애니메이션 */}
                <div className="w-[100px] h-[100px] relative donut-container">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                  >
                    {/* 배경 원 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#303235"
                      strokeWidth="8"
                    />
                    {/* 애니메이션 원 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#f0f0f0"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="donut-loading"
                      strokeDasharray="283"
                      strokeDashoffset="0"
                    />
                  </svg>
                </div>
                <div className="text-white text-2xl">AI가 썸네일을 분류하고 있습니다...</div>
              </div>
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
          <div
            className="rounded-2xl overflow-hidden h-full px-8"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
            }}
          >
            <div className="flex items-center justify-center h-64">
              <div className="text-red-400 text-xl">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white flex">
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
          
          @keyframes donut-loading {
            0% {
              stroke-dasharray: 0 283 !important;
              stroke-dashoffset: 0 !important;
            }
            50% {
              stroke-dasharray: 283 0 !important;
              stroke-dashoffset: 0 !important;
            }
            100% {
              stroke-dasharray: 0 283 !important;
              stroke-dashoffset: 0 !important;
            }
          }
          
          .donut-loading {
            animation: donut-loading 2s ease-out infinite !important;
            transform-origin: center !important;
          }
          
          .donut-container {
            animation: spin-reverse 3s linear infinite !important;
          }
          
          @keyframes spin-reverse {
            from {
              transform: rotate(0deg) !important;
            }
            to {
              transform: rotate(-360deg) !important;
            }
          }
        `,
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="ml-[6vw] flex-1 pr-8 py-8">
        <div
          className="rounded-2xl overflow-hidden h-full px-8"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          
          {/* 상단 제목/설명 */}
          <div className="mt-4 mb-8 relative">
            {/* 뒤로가기 버튼 */}
            <div className="relative p-8 pb-4">
                <button
                    className="rounded-full items-center justify-center cursor-pointer"
                    onClick={() => navigate("/main")}
                    style={{ transform: "scaleX(-1)" }}
                    aria-label="뒤로가기"
                >
                <img src={arrow} alt="뒤로가기" className="w-[36px] h-[28px]" />
                </button>
            </div>

            <div className="text-[1.8rem] text-[#ff0000] font-semibold mb-2 ml-10">썸네일 유형별 인기 콘텐츠 분석</div>
            <div className="text-[1.3rem] text-[#d9d9d9] font-light ml-10">
              영상의 썸네일을 분류하고, 각 카테고리별로 조회수가 높은 콘텐츠를 순위별로 정리하여 보여주는 공간입니다.<br />
              썸네일 스타일과 조회수 간의 상관관계를 분석하거나, 어떤 유형이 더 효과적인지 파악할 수 있습니다.
            </div>
          </div>

          {/* 인기 썸네일 카드 리스트 */}
          <div className="flex flex-col gap-6 mb-10">
            {categories.map((category, idx) => {
              const rank = idx + 1;
              const medalImg = getMedalImage(rank);
              const topVideo = category.videos[0]; // 가장 조회수가 높은 영상

              return (
                <div 
                  key={idx} 
                  className="flex flex-row items-center bg-[#1c2023] rounded-2xl mx-8 px-12 py-8 cursor-pointer hover:bg-[#2a2e31] transition-colors"
                  onClick={() => navigate(`/category_segmentation?rank=${rank}`)}
                >
                  {/* 순위 뱃지 */}
                  <div className="flex flex-col items-center mr-10 flex-shrink-0" style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}>
                    {medalImg ? (
                      <img
                        src={medalImg}
                        alt={`${rank}st medal`}
                        className="w-[8vw] h-[6vh] -mb-4 z-10"
                        style={{ width: '60px', height: '60px', minWidth: '60px', maxWidth: '60px', minHeight: '60px', maxHeight: '60px' }}
                      />
                    ) : (
                      <div className="w-[3vw] h-[5vh] mx-1 rounded-full bg-transparent flex justify-center items-center text-[2rem] font-bold text-white/80"
                           style={{ width: '60px', height: '60px', minWidth: '60px', maxWidth: '60px', minHeight: '60px', maxHeight: '60px' }}>
                        {rank}
                      </div>
                    )}
                  </div>

                  {/* 썸네일 */}
                  {topVideo && (
                    <div 
                      className="mr-6 flex-shrink-0 rounded-2xl overflow-hidden" 
                      style={{ 
                        width: '340px', 
                        height: '200px',
                        minWidth: '340px',
                        maxWidth: '340px',
                        minHeight: '200px',
                        maxHeight: '200px',
                        flexShrink: 0,
                        flexGrow: 0
                      }}
                    >
                      <img 
                        src={topVideo.thumbnail_url} 
                        alt="썸네일" 
                        className="w-full h-full object-cover" 
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block'
                        }}
                      />
                    </div>
                  )}

                  {/* 텍스트/설명 */}
                  <div className="flex flex-col ml-4">
                    <div className="text-[1.8rem] text-white font-semibold mb-2">{category.name}</div>
                    <div className="text-[1.3rem] text-rgba(255,255,255,0.6) font-thin mb-4">{category.description}</div>
                    <div className="flex flex-row justify-between text-[#ffffff] text-[1.5rem] font-medium pr-2 mt-10">
                        <div>전체 영상 수 : <span>{category.videoCount}개</span></div>
                        <div>평균 조회수 : <span>{formatNumber(category.averageViews)}회</span></div>
                        <div>평균 좋아요 수 : <span>{category.averageLikes}개</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 
