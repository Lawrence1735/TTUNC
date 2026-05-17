import React, { useState } from "react";
import { ArrowLeft, User } from "lucide-react";

interface AccountRecoveryProps {
  onBack?: () => void;
  onBackToLogin?: () => void;
}

type AccountType = "student" | "teacher" | "ups-employee";

export const AccountRecovery: React.FC<AccountRecoveryProps> = ({
  onBack,
  onBackToLogin,
}) => {
  const [selectedType, setSelectedType] = useState<AccountType>("student");
  const [username, setUsername] = useState("");
  const [focusedField, setFocusedField] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const accountTypes: { key: AccountType; label: string }[] = [
    { key: "student", label: "Student" },
    { key: "teacher", label: "Teacher" },
    { key: "ups-employee", label: "UPS Employee" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setSubmitted(true);
    }
  };

  const handleBackClick = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) onBackToLogin();
    else if (onBack) onBack();
    else window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9]">
      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">

        {/* Back button — aligned to card width */}
        <div className="w-full max-w-[460px] mb-4">
          <button
            onClick={handleBackClick}
            className="w-10 h-10 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#475569]" />
          </button>
        </div>

        {/* Institutional branding header */}
        <div className="flex flex-col items-center mb-8">
          {/* UNC Crest placeholder — circular seal */}
          <div className="w-16 h-16 rounded-full border-2 border-[#7A1E1E] bg-white flex items-center justify-center mb-4 shadow-sm">
            <div className="w-12 h-12 rounded-full border border-[#E2E8F0] bg-gradient-to-br from-[#FEF2F2] to-[#F8FAFC] flex items-center justify-center">
              <span className="text-[#7A1E1E] text-xs font-bold tracking-tight leading-none text-center">
                UNC
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl mb-1">
            <span className="font-bold text-[#0F172A]">Talent</span>
            <span className="text-[#0F172A]">Track</span>
            <span className="font-bold text-[#7A1E1E]">UNC</span>
          </h1>
          <p className="text-sm text-[#64748B]">University of Nueva Caceres</p>
        </div>

        {/* Recovery card */}
        <div className="w-full max-w-[460px] bg-white rounded-xl border border-[#E2E8F0] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)] px-10 py-10">

          {!submitted ? (
            <>
              {/* Card header */}
              <div className="mb-7">
                <h2 className="text-[22px] font-bold text-[#0F172A] mb-2 leading-tight">
                  Account Recovery
                </h2>
                <p className="text-sm text-[#475569] leading-relaxed">
                  This will send a link to reset your account to the institutional
                  email address listed in your profile.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Account Type segmented control */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#475569] mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {accountTypes.map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedType(key)}
                        className={`h-[44px] rounded-md border text-[13px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1E1E]/30 ${
                          selectedType === key
                            ? "bg-white border-[#7A1E1E] text-[#0F172A] font-semibold shadow-sm"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:border-[#CBD5E1] hover:bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Username / Email input */}
                <div>
                  <label
                    htmlFor="recovery-username"
                    className="block text-xs font-semibold uppercase tracking-widest text-[#475569] mb-2"
                  >
                    Username or Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="w-4 h-4 text-[#94A3B8]" />
                    </div>
                    <input
                      id="recovery-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField(true)}
                      onBlur={() => setFocusedField(false)}
                      placeholder="Enter your username or email"
                      className={`w-full h-11 pl-10 pr-4 border rounded-lg text-sm transition-all duration-200 placeholder:text-[#CBD5E1] ${
                        focusedField
                          ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20 outline-none"
                          : "bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#94A3B8]"
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#7A1E1E] hover:bg-[#5C1616] text-white font-bold text-sm uppercase tracking-wide rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md mt-1"
                >
                  Send Reset Link
                </button>
              </form>

              {/* Back to Login secondary action */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm font-medium text-[#0052CC] hover:text-[#7A1E1E] hover:underline transition-colors duration-200"
                >
                  ← Back to Login
                </button>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mb-5">
                <svg
                  className="w-7 h-7 text-[#7A1E1E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-[22px] font-bold text-[#0F172A] mb-2">
                Check Your Email
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed mb-1">
                A password reset link has been sent to the institutional email
                address associated with your account.
              </p>
              <p className="text-xs text-[#94A3B8] mb-7">
                If you don't see it, check your spam folder.
              </p>
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm font-medium text-[#0052CC] hover:text-[#7A1E1E] hover:underline transition-colors duration-200"
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Micro-footer */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[70px] py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <span className="text-xs text-[#475569]">
              TalentTrackUNC &copy; 2026 University of Nueva Caceres
            </span>
            <div className="flex items-center gap-4">
              <a
                href="#status"
                className="text-xs text-[#0052CC] hover:text-[#7A1E1E] hover:underline transition-colors duration-200"
              >
                System Status
              </a>
              <span className="text-[#CBD5E1] hidden md:inline">|</span>
              <a
                href="#privacy"
                className="text-xs text-[#0052CC] hover:text-[#7A1E1E] hover:underline transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <span className="text-[#CBD5E1] hidden md:inline">|</span>
              <a
                href="#support"
                className="text-xs text-[#0052CC] hover:text-[#7A1E1E] hover:underline transition-colors duration-200"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
