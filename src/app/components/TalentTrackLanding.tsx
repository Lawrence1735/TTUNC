import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MicroFooter } from "./MicroFooter";
import heroBg from "../../assets/686764cd777b2009c4d97b10b8115da2020adac8.png";

interface TalentTrackLandingProps {
  onNavigate?: (page: string) => void;
}

export const TalentTrackLanding: React.FC<
  TalentTrackLandingProps
> = ({ onNavigate }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(
    0,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handlePortalLogin = () => {
    if (onNavigate) {
      onNavigate("login");
    }
  };

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate("requirements");
    }
  };

  const faqs = [
    {
      question: "Who is eligible to apply through TalentTrack?",
      answer:
        "All enrolled students at the University of Nueva Caceres who demonstrate talent in Majorette, Band, Glee, or Dance are eligible to apply. Both incoming freshmen and current students can submit applications through the portal.",
    },
    {
      question:
        "What types of talent scholarships are supported?",
      answer:
        "TalentTrackUNC caters to Majorette, Band, Glee, and Dance. Each program has specific requirements and evaluation criteria.",
    },
    {
      question:
        "Can I apply for multiple talent programs simultaneously?",
      answer:
        "Yes, students may apply to multiple talent programs. However, each application will be evaluated independently, and scholars must be able to commit to the training and performance requirements of all programs they're accepted into.",
    },
    {
      question: "How often are performance reviews updated?",
      answer:
        "Performance evaluations are conducted every semester. Scholars receive comprehensive assessments covering skill demonstration, attendance, event participation, and teamwork. Real-time progress tracking is available through the student portal.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Global Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-[#E2E8F0] z-50">
        <div className="max-w-[1440px] mx-auto h-full px-4 md:px-[70px] flex items-center justify-between">
          {/* Logo */}
          <div className="text-xl md:text-2xl">
            <span className="font-bold text-[#1E293B]">
              Talent
            </span>
            <span className="text-[#1E293B]">Track</span>
            <span className="font-bold text-[#7A1E1E]">
              UNC
            </span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8 p-[0px] ml-auto ml-[620px] mr-[0px] my-[0px]">
            <a
              href="#guidelines"
              className="text-sm font-medium text-[#334155] hover:text-[#7A1E1E] transition-colors"
            >
              Guidelines
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-[#334155] hover:text-[#7A1E1E] transition-colors"
            >
              About
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-[#334155] hover:text-[#7A1E1E] transition-colors"
            >
              FAQ
            </a>
            <button
              onClick={handlePortalLogin}
              className="text-sm font-medium text-[#7A1E1E] border border-[#7A1E1E] rounded py-1.5 hover:text-[#1E293B] hover:border-[#1E293B] transition-colors px-[10px] py-[6px]"
            >
              Portal Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#334155]"
          ></button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E2E8F0]">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#guidelines"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-[#334155] hover:text-[#7A1E1E] transition-colors"
              >
                Guidelines
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-[#334155] hover:text-[#7A1E1E] transition-colors"
              >
                About
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-[#334155] hover:text-[#7A1E1E] transition-colors"
              >
                FAQ
              </a>
              <button
                onClick={() => {
                  handlePortalLogin();
                  setMobileMenuOpen(false);
                }}
                className="block text-sm font-medium text-[#7A1E1E] hover:text-[#1E293B] transition-colors"
              >
                Portal Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center pt-20">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              `url('${heroBg}')`,

          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B]/85 to-[#0F172A]/80" />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-[70px] py-12 md:py-20 w-full">
          <div className="max-w-[700px]">
            <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight mb-4 md:mb-6">
              Cultivating Skills. Connecting Talent. Championing
              Excellence.
            </h1>

            <div className="border-t border-white/40 my-4 md:my-6" />

            <p className="text-base md:text-lg text-[#F1F5F9] mb-6 md:mb-8 leading-relaxed">
              Streamline recruitment, training, and engagement
              for our prestigious talent-based scholarship
              programs at the University of Nueva Caceres.
            </p>

            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-[#7A1E1E] font-bold rounded-full hover:bg-[#F1F5F9] transition-colors text-sm md:text-base"
            >
              Be One of Us! →
            </button>
          </div>
        </div>
      </section>

      {/* How to Join Section */}
      <section
        id="guidelines"
        className="py-12 md:py-20 bg-white"
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-[70px]">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-3 md:mb-4">
              How to be a Scholar
            </h2>
            <p className="text-base md:text-lg text-[#475569] px-4">
              Follow these 3 simple steps to jumpstart your
              scholarship journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="bg-[#F8FAFC] rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[#7A1E1E]">
                  01
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">
                Create Account
              </h3>
              <p className="text-[#475569] leading-relaxed">
                Register on the portal using your institutional
                student credentials.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FAFC] rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[#7A1E1E]">
                  02
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">
                Submit Profile & Portfolio
              </h3>
              <p className="text-[#475569] leading-relaxed">
                Upload your skill assessment metrics, talent
                portfolio, or audition videos.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FAFC] rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-[#7A1E1E]">
                  03
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-3">
                Track Application
              </h3>
              <p className="text-[#475569] leading-relaxed">
                Monitor your status in real-time, get scheduled
                for evaluations, and view results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-12 md:py-20 bg-[#F8FAFC]"
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-[70px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Column - Placeholder Image */}
            <div className="bg-gradient-to-br from-[#7A1E1E] to-[#5C1616] rounded-lg aspect-square flex items-center justify-center">
              <div className="text-center text-white p-6 md:p-8">
                <svg
                  className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-lg md:text-xl font-semibold">
                  UNC Student Life & Group Collaboration
                </p>
              </div>
            </div>

            {/* Right Column - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4 md:mb-6">
                About the Program
              </h2>
              <p className="text-base md:text-lg text-[#475569] leading-relaxed mb-6 md:mb-8">
                TalentTrackUNC is the central engine for
                discovering and nurturing extraordinary talent
                at the University of Nueva Caceres. Built
                specifically for Majorette, Band, Glee, and
                Dance scholars, our digital
                platform connects skilled scholars with elite
                mentorship, optimized training schedules, and
                complete performance evaluations to ensure
                continuous academic and extra-curricular
                excellence.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[#7A1E1E] mb-1">
                    120+
                  </div>
                  <div className="text-xs md:text-sm text-[#475569]">
                    Active Scholars
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[#7A1E1E] mb-1">
                    4
                  </div>
                  <div className="text-xs md:text-sm text-[#475569]">
                    Core Talent Groups
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[#7A1E1E] mb-1">
                    100%
                  </div>
                  <div className="text-xs md:text-sm text-[#475569]">
                    Digital Tracking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="py-12 md:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[70px]">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-[800px] mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-[#E2E8F0] last:border-b-0"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full py-4 md:py-6 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors px-2 md:px-4"
                >
                  <span className="text-base md:text-lg font-semibold text-[#1E293B] pl-[0px] pr-[16px] py-[0px] text-left">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#475569] flex-shrink-0 transition-transform ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-2 md:px-4 pb-4 md:pb-6">
                    <p className="text-sm md:text-base text-[#475569] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};