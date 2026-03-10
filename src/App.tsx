import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import OnBoardingPage from "./pages/OnBoardingPage";
import LoginPage from "./pages/LoginPage";
import MyPage from "./pages/MyPage";
import Reply_Analysis from "./pages/Reply_Analysis";
import CategoryPage from "./pages/CategoryPage";
import CategorySegmentation from "./pages/CategorySegmentation";
import ReplyManagement from "./pages/ReplyManagement";
import Reply_AnalysisList from "./pages/Reply_AnalysisList";
import CompetitorInsightPage from "./pages/InsightPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnBoardingPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/in" element={<CompetitorInsightPage />} />
        <Route path="/reply_analysis" element={<Reply_Analysis />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route
          path="/category_segmentation"
          element={<CategorySegmentation />}
        />
        <Route
          path="/reply_management/:videoId"
          element={<ReplyManagement />}
        />
        <Route path="/reply_analysis_list" element={<Reply_AnalysisList />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
