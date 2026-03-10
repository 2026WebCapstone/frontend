import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import arrow from "../assets/arrow.png";
import medal1 from "../assets/1st.png";
import medal2 from "../assets/2nd.png";
import medal3 from "../assets/3rd.png";

interface Video {
  id: number;
  title: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  upload_date: string;
}

interface Category {
  name: string;
  description: string;
  videoCount: number;
  averageViews: number;
  averageLikes: number;
  videos: Video[];
}

export default function CategorySegmentation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rankParam = searchParams.get("rank");
  const rank = rankParam ? parseInt(rankParam) : 1;
  
  // rank가 유효하지 않으면 1로 설정
  const validRank = isNaN(rank) || rank < 1 ? 1 : rank;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryData();
  }, [validRank]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/videos/thumbnail-categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('카테고리 데이터를 가져오는데 실패했습니다.');
      }

      const result = await response.json();
      console.log('[DEBUG] CategorySegmentation - API 응답:', result);
      console.log('[DEBUG] CategorySegmentation - 데이터 길이:', result.data?.length);
      console.log('[DEBUG] CategorySegmentation - 요청한 rank:', validRank);
      
      if (result.success && result.data && result.data.length > 0) {
        // rank에 해당하는 카테고리 찾기 (1부터 시작하므로 -1)
        const selectedCategory = result.data[validRank - 1];
        console.log('[DEBUG] CategorySegmentation - 선택된 카테고리:', selectedCategory);
        
        if (selectedCategory) {
          setCategory(selectedCategory);
        } else {
          console.log('[DEBUG] CategorySegmentation - 해당 순위 카테고리 없음');
          setError('해당 순위의 카테고리를 찾을 수 없습니다.');
        }
      } else {
        console.log('[DEBUG] CategorySegmentation - 데이터 없음 또는 실패');
        setError('분류 데이터를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('카테고리 데이터 오류:', error);
      setError('카테고리 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) {
      return "0";
    }
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}천`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  const calculateCommentRate = (viewCount: number, commentCount: number = 0) => {
    if (viewCount === 0) return "0%";
    return `${((commentCount / viewCount) * 100).toFixed(1)}%`;
  };

  const calculateLikeRate = (viewCount: number, likeCount: number) => {
    if (viewCount === 0) return "0%";
    return `${((likeCount / viewCount) * 100).toFixed(1)}%`;
  };

  // rank에 따른 메달 결정
  const getMedal = (rank: number) => {
    if (rank === 1) return medal1;
    if (rank === 2) return medal2;
    if (rank === 3) return medal3;
    return null;
  };

  const medal = getMedal(validRank);

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-black text-white flex">
        <Sidebar />
        <div className="ml-[6vw] pr-8 py-8 flex gap-4 w-full overflow-x-hidden">
          <div
            className="rounded-2xl overflow-hidden h-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
            }}
          >
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">카테고리 데이터를 불러오는 중...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-black text-white flex">
        <Sidebar />
        <div className="ml-[6vw] pr-8 py-8 flex gap-4 w-full overflow-x-hidden">
          <div
            className="rounded-2xl overflow-hidden h-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
            }}
          >
            <div className="flex items-center justify-center h-64">
              <div className="text-red-400 text-xl">{error || '카테고리를 찾을 수 없습니다.'}</div>
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
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
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
      <div className="ml-[6vw] pr-8 py-8 flex gap-4 w-full overflow-x-hidden">
        <div
          className="rounded-2xl overflow-hidden h-full"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}
        >
          {/* 상단 큰 썸네일 섹션 */}
          <div className="m-10 bg-[#1c2023] rounded-2xl pl-6 pr-10 py-8 flex flex-row">
            {/* 뒤로가기 버튼 */}
            <div className="relative pr-8 pl-4">
              <button
                className="rounded-full items-center justify-center cursor-pointer"
                onClick={() => navigate("/category")}
                style={{ transform: "scaleX(-1)" }}
                aria-label="뒤로가기"
              >
                <img src={arrow} alt="뒤로가기" className="w-[36px] h-[28px]" />
              </button>
            </div>

            <div className="relative flex flex-col ml-2 mr-10 min-w-0 flex-shrink-0">
              {/* 메달 */}
              <div className="absolute left-4 z-20">
                {rank <= 3 ? (
                  <>
                    {medal && (
                      <img
                        src={medal}
                        alt={`medal${rank}`}
                        className="w-[5vw] h-[8vh] z-10"
                      />
                    )}
                  </>
                ) : (
                  <div className="w-[3vw] h-[5vh] rounded-full bg-[#e0e0e0] flex items-center justify-center text-[2rem] font-bold text-[#232325] border-3 border-[#2c2c2c]">
                    {rank}
                  </div>
                )}
              </div>
              {/* 썸네일 */}
              {category.videos[0] && (
                <img
                  src={category.videos[0].thumbnail_url}
                  alt="Featured thumbnail"
                  className="w-[25vw] min-w-[300px] h-[15vw] min-h-[200px] object-cover rounded-2xl"
                  style={{ maxWidth: "100%" }}
                />
              )}
            </div>

            {/* 제목과 설명 */}
            <div className="min-w-0 flex flex-col pr-10 ml-6 flex-1">
              <div className="text-[1.8rem] font-semibold text-white mt-1 mb-1 break-words">
                {category.name}
              </div>
              <div className="text-[1.5rem] font-thin text-white/60 break-words">
                {category.description}
              </div>
              <div className="flex flex-row gap-10 text-[#ffffff] text-[1.5rem] font-medium justify-between pr-8 mt-15">
                <div>
                  전체 영상 수 : <span>{category.videoCount}개</span>
                </div>
                <div>
                  평균 조회수 : <span>{formatNumber(category.averageViews)}회</span>
                </div>
                <div>
                  평균 좋아요 수 : <span>{category.averageLikes}개</span>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 카테고리 카드 섹션 */}
          <div className="mx-10 my-8 bg-[#1c2023] rounded-2xl p-8">
            {/* 가로 스크롤 컨테이너 */}
            <div
              className="relative overflow-x-auto scrollbar-hide"
              style={{ 
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth"
              }}
              onWheel={(e) => {
                // 부드러운 좌우 스크롤
                const container = e.currentTarget;
                if (e.deltaY !== 0) {
                  e.preventDefault();
                  container.scrollLeft += e.deltaY * 2; // 스크롤 속도 조정
                }
              }}
            >
              {/* 카드 컨테이너 */}
              <div className="flex gap-4 pb-4">
                {category.videos.map((video, _index) => (
                  <div
                    key={video.id}
                    className="bg-[#1c2023] rounded-2xl p-5 border-2 border-[rgba(255,255,255,0.3)]"
                  >
                    {/* 썸네일 */}
                    <img
                      src={video.thumbnail_url}
                      alt="Category thumbnail"
                      className="w-[25vw] min-w-[300px] h-[12vw] min-h-[200px] object-cover rounded-2xl"
                    />

                    {/* 정보 */}
                    <div className="flex flex-col">
                      <div className="text-[#848485] text-[1rem] font-regular mt-2">
                        {formatDate(video.upload_date)}
                      </div>
                      <div className="text-[1.3rem] font-regular text-white mb-2">
                        {video.title}
                      </div>
                      <div className="text-[#848485] text-[1rem] font-regular">
                        <div>조회수 {formatNumber(video.views)}</div>
                        <div>댓글 참여율 {calculateCommentRate(video.views, video.comments)}</div>
                        <div>좋아요 참여율 {calculateLikeRate(video.views, video.likes)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
