import React from "react";

interface VideoInfoBoxProps {
  thumbnail: string;
  date: string;
  title: string;
  views: string;
  commentRate: string;
  likeRate: string;
  dislikeRate?: string;
  commentCount?: number; // 댓글 수 추가
  likeCount?: number;
  dislikeCount?: number;
  showEngagementRates?: boolean; // 참여율 표시 여부
  hideViews?: boolean; // 조회수 숨김 여부
  className?: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.split("T")[0].split("-");
    return `${y}. ${m}. ${d}`;
  }
  return dateStr;
};

const VideoInfoBox: React.FC<VideoInfoBoxProps> = ({
  thumbnail,
  date,
  title,
  views,
  commentRate,
  likeRate,
  dislikeRate,
  commentCount,
  likeCount,
  dislikeCount,
  showEngagementRates = false,
  hideViews = false,
  className = ""
}) => (
  <div className={className}>
    <div className="flex justify-center items-center w-full">
      <img
        src={thumbnail}
        alt="Video thumbnail"
        className="rounded-xl mt-6 w-full object-contain"
        style={{ maxHeight: 250, minHeight: 200 }}
      />
    </div>
    <div className="text-white mt-2 mb-10 pt-3 w-full">
      <div className="text-[#848485] text-[20px] font-regular">
        <span className="font-bold">{formatDate(date)}</span>
      </div>
      <div className="text-[26px] font-bold mb-2">{title}</div>
      {!hideViews && (
        <div className="text-[#848485] text-[20px] font-regular">
          조회수 {views}
        </div>
      )}
      {commentCount !== undefined && (
        <div className="text-[#848485] text-[20px] font-regular flex justify-between">
          <span>댓글 {commentCount.toLocaleString()}개</span>
          {showEngagementRates && <span>댓글 참여율 {commentRate}</span>}
        </div>
      )}
      {likeCount !== undefined && (
        <div className="text-[#848485] text-[20px] font-regular flex justify-between">
          <span>좋아요 {likeCount.toLocaleString()}개</span>
          {showEngagementRates && <span>좋아요 참여율 {likeRate}</span>}
        </div>
      )}
      {dislikeCount !== undefined && (
        <div className="text-[#848485] text-[20px] font-regular flex justify-between">
          <span>싫어요 {dislikeCount.toLocaleString()}개</span>
          {showEngagementRates && dislikeRate && <span>싫어요 참여율 {dislikeRate}</span>}
        </div>
      )}
    </div>
  </div>
);

export default VideoInfoBox; 