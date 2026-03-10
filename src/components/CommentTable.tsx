import React from "react";

interface CommentTableProps {
  comments: any[];
  checkedComments: Set<number>;
  onCheck: (commentId: number) => void;
  allChecked: boolean;
  onCheckAll: () => void;
  avatar?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  renderRow?: (
    comment: any,
    checked: boolean,
    onCheck: (id: number) => void
  ) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
}

const CommentTable: React.FC<CommentTableProps> = ({
  comments,
  checkedComments,
  onCheck,
  allChecked,
  onCheckAll,
  //avatar
  currentPage,
  totalPages,
  onPageChange,
  renderRow,
  renderHeader
}) => (
  <div className="flex flex-col bg-[#171818] w-full h-full pt-4 pb-2 pr-2 pl-2 rounded-[10px] overflow-y-auto">
    <style dangerouslySetInnerHTML={{
      __html: `
        .comment-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
          max-height: 3em;
          line-height: 1.5em;
        }
      `
    }} />
    {/* 테이블 헤더 */}
    <div className="flex flex-row text-[#a3a3a3] text-[17px] font-medium border-b border-[#303235] pb-2 min-w-0">
      <div className="w-[60px] flex justify-center items-center">
        <input
          type="checkbox"
          className="w-5 h-5 accent-[#ff0000]"
          checked={allChecked}
          onChange={onCheckAll}
        />
      </div>
      {renderHeader ? renderHeader() : (
        <>
          <div className="flex-1 text-[#a3a3a3] text-[17px] font-medium flex justify-center items-center">
            Account
          </div>
          <div className="flex-3 text-[#a3a3a3] text-[17px] font-medium flex justify-center items-center">
            Comment
          </div>
          <div className="flex-1 text-[#a3a3a3] text-[17px] font-medium flex justify-center items-center">
            Date
          </div>
        </>
      )}
    </div>

    {/* 댓글 목록 */}
    <div className="w-full flex-1 overflow-y-auto">
      {comments.map((comment) =>
        renderRow ? (
          renderRow(comment, checkedComments.has(comment.id), onCheck)
        ) : (
          <div
            key={comment.id}
            className="flex flex-col border-b border-[#303235] min-w-0"
          >
            <div className="flex flex-row items-center py-2 hover:bg-gray-600 transition min-w-0">
              <div className="w-[60px] flex-shrink-0 flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#ff0000]"
                  checked={checkedComments.has(comment.id)}
                  onChange={() => onCheck(comment.id)}
                />
              </div>
              <div className="flex-1 flex justify-center items-center min-w-0">
                <span className="text-[#d9d9d9] text-[15px] truncate block min-w-0 w-full">
                  {comment.account}
                </span>
              </div>
              <div className="flex-[3] flex justify-start items-center ml-16 min-w-0">
                <span
                  className="text-[#d9d9d9] text-[15px] block min-w-0 w-full comment-text"
                  title={comment.comment}
                >
                  {comment.comment}
                </span>
              </div>
              <div className="flex-1 flex justify-center items-center text-[#d9d9d9] text-[15px] min-w-0">
                {comment.date}
              </div>
            </div>
          </div>
        )
      )}
    </div>

    {/* 페이지네이션 */}
    <div className="flex justify-center items-center mt-4 mb-3 gap-2.5">
      <button
        className="w-[24px] h-[24px] text-[#d9d9d9] rounded-full hover:text-[#a3a3a3] transition-colors flex items-center justify-center"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        <svg
          className="w-5 h-5 mx-auto rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          className={`w-[24px] h-[24px] rounded-full font-regular text-[13.5px] transition-colors flex items-center justify-center
            ${
              pageNum === currentPage
                ? "bg-[#ff0000] text-white"
                : "bg-[#d9d9d9] text-[#848485] hover:bg-[#a3a3a3]"
            }
          `}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}

      <button
        className="w-[24px] h-[24px] text-[#d9d9d9] rounded-full hover:text-[#a3a3a3] transition-colors flex items-center justify-center"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        <svg
          className="w-5 h-5 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
);

export default CommentTable;


