import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 페이지 경로 확인
  const currentPath = location.pathname;

  return (
    <div
      className="fixed left-0 top-0 h-full flex flex-col items-center z-50 bg-black"
      style={{ width: "6vw" }}
    >
      <div style={{ marginTop: "2.94vh", marginBottom: "24px" }}>
        <img
          src="/logo.png"
          alt="Logo"
          className="w-12 h-12 cursor-pointer" // 크기를 48px x 48px로 설정
          onClick={() => navigate("/main")}
        />
      </div>
      <button className="p-3 rounded-lg transition-all mb-4 group">
        <img
          src="/mypagelogo.png"
          alt="My Page"
          className={`w-7 h-7 transition-all ${
            currentPath === "/my" || currentPath.startsWith("/my")
              ? "opacity-100 brightness-150"
              : "opacity-60 group-hover:opacity-100 group-hover:brightness-200"
          }`}
          onClick={() => navigate("/my")}
        />
      </button>
      <button className="p-3 rounded-lg transition-all mb-4 group">
        <img
          src="/insight.png"
          alt="Insight"
          className={`w-7 h-7 transition-all ${
            currentPath === "/in" || currentPath.startsWith("/in")
              ? "opacity-100 brightness-150"
              : "opacity-60 group-hover:opacity-100 group-hover:brightness-200"
          }`}
          onClick={() => navigate("/in")}
        />
      </button>
      <button onClick={(e) => e.preventDefault()} className="p-3 rounded-lg transition-all group">
        <img
          src="/analysis.png"
          alt="Analysis"
          className={`w-7 h-7 transition-all ${
            currentPath === "/category" || currentPath.startsWith("/category")
              ? "opacity-100 brightness-150"
              : "opacity-60 group-hover:opacity-100 group-hover:brightness-200"
          }`}
        />
      </button>
    </div>
  );
};

export default Sidebar;
