import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import thumbnail from "../assets/thumbnail1.png";
import arrow from "../assets/arrow.png";
import VideoInfoBox from "../components/VideoInfoBox";
import CommentTable from "../components/CommentTable";

// 댓글 요약 데이터 타입 정의
interface CommentSummary {
  id: number;
  video_id: string;
  summary: string;
  summary_title: string;
  positive_ratio: number;
  is_deleted: boolean;
  created_at: string;
  upload_date?: string; // ← 추가
  title?: string; // ← 추가
}

// API 응답 타입 정의
interface SummaryResponse {
  success: boolean;
  data: CommentSummary[];
}

// 영상 정보 타입 정의
interface VideoInfo {
  thumbnail: string;
  date: string;
  title: string;
  views: string;
  commentRate: string;
  likeRate: string;
  commentCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  dislikeRate?: string;
}

// Reaction 문구 및 색상 함수
const getReactionLabel = (ratio: number) => {
  if (ratio >= 80) return { label: '매우 긍정적', color: '#278eff' };
  if (ratio >= 60) return { label: '긍정적', color: '#278eff' };
  if (ratio >= 40) return { label: '복합적', color: '#ffd600' };
  if (ratio >= 20) return { label: '부정적', color: '#ff0000' };
  return { label: '매우 부정적', color: '#ff0000' };
};

// 댓글 관리 페이지 컴포넌트
export default function ReplyManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 페이지네이션 상태 - 1페이지로 시작
  const [currentPage, setCurrentPage] = useState(1);
  const COMMENTS_PER_PAGE = 13;
  
  // API 데이터 상태
  const [summaryData, setSummaryData] = useState<CommentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  
  // 현재 페이지의 요약 데이터들
  const pagedSummaries = summaryData.slice(
    (currentPage - 1) * COMMENTS_PER_PAGE,
    currentPage * COMMENTS_PER_PAGE
  );

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(summaryData.length / COMMENTS_PER_PAGE);

  // 체크박스 상태 관리
  const [checkedComments, setCheckedComments] = useState<Set<number>>(new Set());

  // API 데이터 로딩
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // video_id는 location.state에서 가져와야 함
        const videoId = location.state?.videoId;
        
        console.log('[DEBUG] location.state:', location.state);
        
        console.log('[DEBUG] 사용할 video_id:', videoId);
        
        if (!videoId) {
          setError('영상 정보가 없습니다.');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`http://localhost:8000/api/videos/${videoId}/comments/summary`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('API 요청 실패');
        }
        
        const result: SummaryResponse = await response.json();
        
        if (result.success) {
          console.log('[DEBUG] API 응답 데이터:', result.data);
          setSummaryData(result.data);
        } else {
          throw new Error('데이터 로딩 실패');
        }
      } catch (err) {
        console.error('요약 데이터 로딩 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummaryData();
  }, [location.state?.videoId]);

  // 분석 작업 상태 폴링
  useEffect(() => {
    if (!analysisJobId || !location.state?.videoId) return;

    const pollAnalysisStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/videos/${location.state.videoId}/comments/analysis/status/${analysisJobId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('분석 상태 확인 실패');
        }

        const result = await response.json();
        console.log('[DEBUG] 분석 상태:', result);

        if (result.success) {
          if (result.status === 'completed') {
            console.log('[DEBUG] 분석 완료!');
            setIsAnalyzing(false);
            setAnalysisJobId(null);
            // 분석 완료 후 데이터 새로고침
            window.location.reload();
          } else if (result.status === 'failed') {
            console.log('[DEBUG] 분석 실패!');
            setIsAnalyzing(false);
            setAnalysisJobId(null);
            alert('댓글 분석이 실패했습니다.');
          }
          // waiting, active 상태는 계속 폴링
        }
      } catch (err) {
        console.error('분석 상태 확인 실패:', err);
      }
    };

    // 3초마다 상태 확인
    const interval = setInterval(pollAnalysisStatus, 3000);
    
    // 즉시 첫 번째 확인 실행
    pollAnalysisStatus();

    return () => clearInterval(interval);
  }, [analysisJobId, location.state?.videoId]);

  // 개별 체크박스 토글
  const handleCheck = (commentId: number) => {
    const newChecked = new Set(checkedComments);
    if (newChecked.has(commentId)) {
      newChecked.delete(commentId);
    } else {
      newChecked.add(commentId);
    }
    setCheckedComments(newChecked);
  };

  // 전체 체크박스 토글
  const handleCheckAll = () => {
    if (checkedComments.size === pagedSummaries.length) {
      setCheckedComments(new Set());
    } else {
      setCheckedComments(new Set(pagedSummaries.map(s => s.id)));
    }
  };

  // 전체 체크 상태 확인
  const allChecked = pagedSummaries.length > 0 && checkedComments.size === pagedSummaries.length;

  // 전달받은 영상 정보 또는 기본값 사용
  const videoInfo: VideoInfo = location.state?.videoInfo || {
    thumbnail: thumbnail,
    date: summaryData[0]?.upload_date || location.state?.upload_date || "",
    title: summaryData[0]?.title || "",
    views: "",
    commentRate: "",
    likeRate: ""
  };

  // 디버깅: 전달받은 데이터 확인
  console.log('[DEBUG] Reply_AnalysisList - location.state:', location.state);
  console.log('[DEBUG] Reply_AnalysisList - videoInfo:', videoInfo);
  console.log('[DEBUG] Reply_AnalysisList - videoId:', location.state?.videoId);

  // 댓글 분석 요약 삭제 함수
  // const handleDeleteSummary = async (summaryId: number) => {
  //   if (!confirm('이 분석 결과를 삭제하시겠습니까?')) {
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem("token");
  //     const videoId = location.state?.videoId;
  //     if (!videoId) {
  //       alert('영상 정보가 없습니다.');
  //       return;
  //     }

  //     const response = await fetch(
  //       `http://localhost:8000/api/videos/${videoId}/comments/summary/${summaryId}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: token ? `Bearer ${token}` : "",
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       // 성공적으로 삭제되면 목록에서 제거
  //       setSummaryData(prev => prev.filter(summary => summary.id !== summaryId));
  //       alert("분석 결과가 삭제되었습니다.");
  //     } else {
  //       const errorData = await response.json();
  //       alert(`삭제 실패: ${errorData.message || "알 수 없는 오류"}`);
  //     }
  //   } catch (error) {
  //     console.error("분석 결과 삭제 중 오류:", error);
  //     alert("분석 결과 삭제 중 오류가 발생했습니다.");
  //   }
  // };

  // 선택된 항목들 일괄 삭제 함수
  const handleDeleteSelected = async () => {
    const selectedIds = Array.from(checkedComments);
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedIds.length}개의 분석 결과를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const videoId = location.state?.videoId;
      if (!videoId) {
        alert('영상 정보가 없습니다.');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      // 각 선택된 항목을 순차적으로 삭제
      for (const summaryId of selectedIds) {
        try {
          const response = await fetch(
            `http://localhost:8000/api/videos/${videoId}/comments/summary/${summaryId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
              },
            }
          );

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`분석 결과 ${summaryId} 삭제 중 오류:`, error);
          failCount++;
        }
      }

      // 성공적으로 삭제된 항목들을 목록에서 제거
      setSummaryData(prev => prev.filter(summary => !selectedIds.includes(summary.id)));
      setCheckedComments(new Set());

      if (failCount === 0) {
        alert(`${successCount}개의 분석 결과가 삭제되었습니다.`);
      } else {
        alert(`${successCount}개 삭제 성공, ${failCount}개 삭제 실패`);
      }
    } catch (error) {
      console.error("일괄 삭제 중 오류:", error);
      alert("일괄 삭제 중 오류가 발생했습니다.");
    }
  };

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
        `,
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* 메인 컨텐츠 영역 */}
      <div className="ml-[6vw] pr-8 py-8 flex gap-4 w-full">
        {/* 왼쪽 컨테이너 - 영상 정보 및 탭 */}
        <div
          className="
            flex flex-col flex-3 w-full rounded-2xl
            bg-[rgba(255,255,255,0.15)] border border-white/30
            p-10
            "
        >
          {/* 영상 썸네일 및 정보 - VideoInfoBox 컴포넌트로 대체 */}
          <div className="relative flex flex-col ">
            {/* 뒤로가기 버튼을 썸네일 위가 아닌 바깥쪽에 배치 */}
            <div>
              <button
                className="rounded-full items-center justify-center cursor-pointer"
                onClick={() => navigate("/my")}
                style={{ transform: "scaleX(-1)" }}
                aria-label="뒤로가기"
              >
                <img src={arrow} alt="뒤로가기" className="w-[36px] h-[28px]" />
              </button>
            </div>
            <VideoInfoBox
              thumbnail={videoInfo.thumbnail}
              date={videoInfo.date}
              title={videoInfo.title}
              views={videoInfo.views}
              commentRate={videoInfo.commentRate}
              likeRate={videoInfo.likeRate}
              dislikeRate={videoInfo.dislikeRate}
              commentCount={videoInfo.commentCount}
              likeCount={videoInfo.likeCount}
              dislikeCount={videoInfo.dislikeCount}
              showEngagementRates={true}
              className=""
            />
            {/* 댓글 분석하기 버튼 */}
            <div className="flex flex-1 items-end mt-auto">
              <button
                onClick={async () => {
                  try {
                    // AI 분석 요청
                    const videoId = location.state?.videoId;
                    console.log('[DEBUG] AI 분석 요청 video_id:', videoId);
                    
                    if (!videoId) {
                      alert('영상 정보가 없습니다.');
                      return;
                    }
                    
                    setIsAnalyzing(true);
                    
                    const response = await fetch(`http://localhost:8000/api/videos/${videoId}/comments/analysis`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      }
                    });
                    
                    if (!response.ok) {
                      throw new Error('AI 분석 요청 실패');
                    }
                    
                    const result = await response.json();
                    console.log('[DEBUG] AI 분석 요청 결과:', result);
                    
                    if (result.success) {
                      setAnalysisJobId(result.job_id);
                      console.log('[DEBUG] 분석 작업 ID:', result.job_id);
                    } else {
                      throw new Error('AI 분석 요청 실패');
                    }
                  } catch (err) {
                    console.error('AI 분석 요청 실패:', err);
                    alert('댓글 분석 요청 중 오류가 발생했습니다.');
                    setIsAnalyzing(false);
                  }
                }}
                disabled={isAnalyzing}
                className={`w-full rounded-xl text-white text-[20px] font-semibold my-5 py-6 transition-colors ${
                  isAnalyzing 
                    ? 'bg-[#8B0000] cursor-not-allowed' 
                    : 'bg-[#ff0000] hover:bg-[#b31217]'
                }`}
                type="button"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    분석중...
                  </div>
                ) : (
                  '댓글 분석하기'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽 컨테이너 - 댓글 목록 */}
        <div
          className="
            flex flex-col flex-7 w-full rounded-2xl 
            bg-[rgba(255,255,255,0.15)] border border-white/30
            h-full min-h-0
          "
        >
          <div className="p-8 flex flex-col">
            {/* 헤더 영역 */}
            <div className="flex flex-row justify-between items-center mb-6">
              <div>
                <div className="text-[22px] font-semibold text-[#ff0000] mb-2">
                  댓글 분석 이력
                </div>
                <div className="text-[#d9d9d9] text-[15px] font-extralight">
                  해당 페이지에서는 이전에 분석한 댓글 요약들을 확인할 수 있으며,<br />
                  각 요약을 클릭하여 상세한 분석 결과를 볼 수 있습니다.<br />
                  분석 이력을 통해 댓글 트렌드 변화를 파악할 수 있습니다.
                </div>
              </div>
              
              {/* 액션 버튼들 */}
              <div className="flex">
                <button 
                  onClick={handleDeleteSelected}
                  disabled={checkedComments.size === 0}
                  className="w-[120px] h-[55px] px-6 py-3 bg-[#555] text-white rounded-[10px] text-[18px] font-semibold hover:bg-[#333] transition-colors flex justify-center items-center gap-2 disabled:bg-[#333] disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  삭제
                </button>
              </div>
            </div>

            {/* 로딩 상태 */}
            {loading && (
              <div className="flex justify-center items-center h-32">
                <div className="text-[#d9d9d9] text-[18px]">데이터를 불러오는 중...</div>
              </div>
            )}

            {/* 에러 상태 */}
            {error && (
              <div className="flex justify-center items-center h-32">
                <div className="text-[#ff0000] text-[18px]">오류: {error}</div>
              </div>
            )}

            {/* 데이터가 있을 때만 테이블 표시 */}
            {!loading && !error && summaryData.length > 0 && (
              <CommentTable
                comments={pagedSummaries}
                checkedComments={checkedComments}
                onCheck={handleCheck}
                allChecked={allChecked}
                onCheckAll={handleCheckAll}
                avatar={thumbnail}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                renderHeader={() => (
                  <>
                    <div className="flex-1 flex justify-center items-center">Reaction</div>
                    <div className="flex-3 flex justify-center items-center">Title</div>
                    <div className="flex-1 flex justify-center items-center">Date</div>
                  </>
                )}
                renderRow={(summary, checked, onCheck) => {
                  const { label, color } = getReactionLabel(summary.positive_ratio);
                  return (
                    <div
                      key={summary.id}
                      className="flex flex-row items-center py-2 border-b border-[#606265] min-w-0 hover:bg-[#232335] transition cursor-pointer"
                      onClick={() => navigate('/reply_analysis', { state: { videoInfo, summaryData: summary } })}
                    >
                      <div className="w-[60px] flex-shrink-0 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-[#ff0000]"
                          checked={checked}
                          onChange={() => onCheck(summary.id)}
                        />
                      </div>
                      <div className="flex-1 flex justify-center items-center min-w-0">
                        <span style={{ color, fontWeight: 600 }}>{label}</span>
                      </div>
                      <div className="flex-3 flex justify-start items-center ml-16 min-w-0">
                        <span className="text-[#d9d9d9] text-[15px] block min-w-0 w-full comment-text" title={summary.summary_title}>
                          {summary.summary_title}
                        </span>
                      </div>
                      <div className="flex-1 flex justify-center items-center min-w-0">
                        <span className="text-[#d9d9d9] text-[15px]">
                          {summary.created_at ? summary.created_at.slice(0, 10) : ''}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            )}

            {/* 데이터가 없을 때 */}
            {!loading && !error && summaryData.length === 0 && (
              <div className="flex justify-center items-center h-32">
                <div className="text-[#d9d9d9] text-[18px]">댓글 분석 목록이 존재하지 않습니다.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
