import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    title: "더 많은 조회수,\n더 빠른 성장",
    description:
      "유튜버의 성장을 위해\n영상 운영을 더 쉽고 효과적으로 만들어드립니다.",
    align: "left",
  },
  {
    title: "매일 반복하던 3시간짜리\n작업이 단 5분으로.",
    description:
      "경쟁 채널 분석과 댓글 관리 등 운영 업무를 자동으로 처리합니다.\n당신은 컨텐츠에만 집중하세요.",
    align: "right",
  },
  {
    title: "운영을 똑똑하게, 성장을 빠르게",
    description:
      "반복적인 운영은 자동으로, 중요한 전략은 한눈에.\n유튜버를 위한 똑똑한 성장 도구를 지금 만나보세요.",
    align: "center",
    hasImage: true,
  },
  {
    title: "모든 준비가 끝났어요.\n이제 직접 시작해보세요.",
    isFinal: true,
    align: "center",
  },
];

const OnBoardingPage: React.FC = () => {
  const navigate = useNavigate();
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollLock, setScrollLock] = useState(false);

  const scrollToSection = (index: number) => {
    const section = sectionsRef.current[index];
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (event: WheelEvent) => {
    if (scrollLock) {
      event.preventDefault();
      return;
    }

    if (event.deltaY > 0 && currentSection < SECTIONS.length - 1) {
      setCurrentSection((prev) => prev + 1);
    } else if (event.deltaY < 0 && currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
    }

    setScrollLock(true);
    setTimeout(() => setScrollLock(false), 800);
  };

  useEffect(() => {
    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll);
  }, [currentSection, scrollLock]);

  useEffect(() => {
    scrollToSection(currentSection);
  }, [currentSection]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* 🔥 고정된 전체 배경 이미지 */}
      <img
        src="/gradi.png"
        alt="배경 이미지"
        className="fixed top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* 도트 네비게이션 */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        {SECTIONS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              currentSection === index ? "bg-red-600" : "bg-gray-500"
            }`}
          />
        ))}
      </div>

      {/* 섹션들 */}
      <div className="h-screen w-full snap-y snap-mandatory overflow-hidden relative z-10">
        {SECTIONS.map((section, index) => {
          const alignment =
            section.align === "left"
              ? "items-start text-left"
              : section.align === "right"
              ? "items-end text-right"
              : "items-center text-center";

          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;

          return (
            <section
              key={index}
              ref={(el) => {
                if (el) sectionsRef.current[index] = el;
              }}
              className="snap-start w-full h-screen flex justify-center items-center px-6 text-white"
            >
              {/* 두 번째만 예외 처리 */}
              {isSecond ? (
                <div className="flex flex-row justify-between items-center max-w-[1280px] w-full gap-10">
                  <div className="flex-[1] flex justify-start items-center">
                    <img
                      src="/time.png"
                      alt="시간 이미지"
                      className="max-w-[550px] w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-[1] items-end text-right">
                    <h1 className="text-[28px] md:text-[48px] font-bold whitespace-pre-line leading-snug mb-4">
                      {section.title}
                    </h1>
                    <p className="text-[16px] md:text-[18px] font-light whitespace-pre-line leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex ${
                    isFirst
                      ? "flex-row justify-between items-center"
                      : "flex-col justify-center"
                  } max-w-[1280px] w-full gap-10 ${!isFirst ? alignment : ""}`}
                >
                  {/* 텍스트 */}
                  <div
                    className={`flex flex-col justify-center ${
                      isFirst ? "flex-1" : ""
                    }`}
                  >
                    <h1 className="text-[28px] md:text-[48px] font-bold whitespace-pre-line leading-snug mb-4">
                      {section.title}
                    </h1>

                    {section.description && (
                      <p className="text-[16px] md:text-[18px] font-light whitespace-pre-line leading-relaxed">
                        {section.description}
                      </p>
                    )}

                    {section.isFinal && (
                      <button
                        onClick={() => navigate("/main")}
                        className="mt-10 px-10 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md transition"
                      >
                        🔥 당신의 계정을 관리해보세요
                      </button>
                    )}
                  </div>

                  {/* 첫 번째 섹션 이미지 */}
                  {isFirst && (
                    <div className="flex-[1.3] flex justify-end items-center">
                      <img
                        src="/fire.png"
                        alt="온보딩 이미지"
                        className="max-w-[800px] w-full object-contain"
                      />
                    </div>
                  )}

                  {/* 세 번째 섹션 이미지 */}
                  {isThird && (
                    <div className="w-full flex justify-center items-center mt-10">
                      <img
                        src="/desktop.png"
                        alt="데스크탑 이미지"
                        className="max-w-[720px] w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default OnBoardingPage;
