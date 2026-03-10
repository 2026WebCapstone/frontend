import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // URL에서 토큰과 YouTube 액세스 토큰 추출
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const youtubeAccessToken = params.get("youtube_token");

    console.log("OAuth 콜백 URL 파라미터:", {
      token: token ? "있음" : "없음",
      youtube_access_token: youtubeAccessToken ? "있음" : "없음",
      fullUrl: window.location.href,
    });

    if (token) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("token", token);

      // YouTube 액세스 토큰도 저장
      if (youtubeAccessToken) {
        localStorage.setItem("youtube_access_token", youtubeAccessToken);
        console.log("YouTube 액세스 토큰 저장됨");
      } else {
        console.log("YouTube 액세스 토큰이 URL에 없음");
      }

      navigate("/main", { replace: true });
    } else {
      // 토큰이 없으면 로그인 페이지로
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
}
