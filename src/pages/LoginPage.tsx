import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/login_background.png";
import youtubeLogo from "../assets/youtool.png";
import arrow from "../assets/arrow.png";

export default function LoginPage() {
  const navigate = useNavigate();

  // 로그인 상태 감지: 이미 로그인되어 있으면 바로 메인페이지로 이동
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/main", { replace: true });
    }
  }, [navigate]);

  // 구글 로그인 버튼 클릭 시 실행
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center bg-black pl-6">
      {/* 왼쪽: 카드형 배경+텍스트 */}
      <div
        className="flex flex-col flex-1 h-full rounded-2xl justify-between relative"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* ← 버튼 (arrow.png) */}
        <div className="absolute top-14 left-8 z-10">
          <button
            className="rounded-full justify-center items-center cursor-pointer"
            onClick={() => navigate("/")}
            style={{ transform: "scaleX(-1)" }}
            aria-label="뒤로가기"
          >
          <img src={arrow} alt="뒤로가기" className="w-[36px] h-[28px]" />
          </button>
        </div>
        <div className="flex flex-col mt-28 ml-12">
          <div className="text-white text-[2rem] font-regular">You can easily</div>
          <div className="text-white text-[4rem] font-regular">Speed up your work<br/>with our service</div>
        </div>
        <div className="flex w-full justify-end pb-10">
          <img src={youtubeLogo} alt="YouTube" className="w-[20vw] h-[6vh] object-contain" />
        </div>
      </div>
      {/* 오른쪽: 로그인 폼 */}
      <div className="flex flex-col flex-1 justify-center ml-8 bg-none">
        <div className="text-white text-[4.2rem] font-regular">Get Started Now</div>
        <div className="text-[#a3a3a3] text-[1.5rem] font-regular mb-10">Please log in to your account to continue.</div>
        <div className="w-full">
          <div className="text-white text-[1.7rem] font-regular mb-3">YouTube Account</div>
          <button 
          onClick={handleGoogleLogin}
          className="w-auto h-auto bg-[#ff0000] text-white text-[1.5rem] font-semibold rounded-[13px] px-42 py-3 hover:bg-[#d90000] transition-all"
          >
            Continue with YouTube
            </button>
        </div>
      </div>
    </div>
  );
}
