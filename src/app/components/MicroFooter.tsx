import React from "react";

interface MicroFooterProps {
  className?: string;
}

export const MicroFooter: React.FC<MicroFooterProps> = ({
  className = "",
}) => {
  return (
    <footer className={`bg-[#F8FAFC] border-t border-[#E2E8F0] ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-[70px] py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          {/* Left-Aligned Brand Block */}
          <div className="flex items-center">
            <div className="text-lg md:text-xl">
              <span className="font-bold text-[#1E293B]">Talent</span>
              <span className="text-[#1E293B]">Track</span>
              <span className="font-bold text-[#EA1D24]">UNC</span>
            </div>
          </div>

          {/* Right-Aligned Link & Compliance Array */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <a
              href="#changelog"
              className="text-sm text-[#0052CC] hover:text-[#EA1D24] hover:underline transition-colors duration-200"
            >
              Changelog
            </a>
            <span className="text-[#CBD5E1] hidden md:inline">|</span>
            <a
              href="#status"
              className="text-sm text-[#0052CC] hover:text-[#EA1D24] hover:underline transition-colors duration-200"
            >
              System Status
            </a>
            <span className="text-[#CBD5E1] hidden md:inline">|</span>
            <a
              href="#privacy"
              className="text-sm text-[#0052CC] hover:text-[#EA1D24] hover:underline transition-colors duration-200"
            >
              Privacy
            </a>
            <span className="text-[#CBD5E1] hidden md:inline">|</span>
            <a
              href="#terms"
              className="text-sm text-[#0052CC] hover:text-[#EA1D24] hover:underline transition-colors duration-200"
            >
              Terms of Service
            </a>
            <span className="text-[#CBD5E1] hidden md:inline">|</span>
            <a
              href="#support"
              className="text-sm text-[#0052CC] hover:text-[#EA1D24] hover:underline transition-colors duration-200"
            >
              Support Desk
            </a>
            <span className="text-[#CBD5E1] hidden md:inline">|</span>
            <span className="text-sm text-[#475569]">
              © 2026 TalentTrackUNC
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
