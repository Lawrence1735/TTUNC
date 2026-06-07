import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../services/authService";

interface AccountRecoveryProps {
  onBack?: () => void;
  onBackToLogin?: () => void;
}

type AccountType = "student" | "teacher" | "ups-employee";
type RecoveryAccountType = "admin" | "director" | "scholar" | "trainee";

export const AccountRecovery: React.FC<AccountRecoveryProps> = ({
  onBack,
  onBackToLogin,
}) => {
  const [selectedType, setSelectedType] = useState<RecoveryAccountType | "">("");
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const accountTypes: { key: RecoveryAccountType; label: string }[] = [
    { key: "admin", label: "Admin" },
    { key: "director", label: "Director" },
    { key: "scholar", label: "Scholar" },
    { key: "trainee", label: "Trainee" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!selectedType || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await authService.forgotPassword({
        email: email.trim(),
        role: selectedType,
      });
      setSubmitted(true);
      toast.success("If this account exists, a reset link has been sent.");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to send reset link. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9]">
      <button
        onClick={handleBackClick}
        className="absolute top-5 left-5 z-10 w-10 h-10 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-[#475569]" />
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
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
                  Forgot Password
                </h2>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Select your account type and enter your registered email to receive a password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {errorMessage && (
                  <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#991B1B]">
                    {errorMessage}
                  </div>
                )}

                {/* Account Type */}
                <div>
                  <label htmlFor="recovery-role" className="block text-xs font-semibold uppercase tracking-widest text-[#475569] mb-2">
                    Account Type
                  </label>
                  <div className="relative">
                    <select
                      id="recovery-role"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as RecoveryAccountType)}
                      onFocus={() => setFocusedField("role")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full h-11 px-4 bg-[#F8FAFC] border rounded-lg appearance-none transition-all duration-200 text-sm ${
                        focusedField === "role"
                          ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20"
                          : "border-[#CBD5E1] hover:border-[#94A3B8]"
                      } ${selectedType ? "text-[#0F172A]" : "text-[#94A3B8]"}`}
                      required
                    >
                      <option value="" disabled>
                        Select account type
                      </option>
                      {accountTypes.map(({ key, label }) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                  </div>
                </div>

                {/* Email input */}
                <div>
                  <label
                    htmlFor="recovery-email"
                    className="block text-xs font-semibold uppercase tracking-widest text-[#475569] mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="your.email@unc.edu.ph"
                    className={`w-full h-11 px-4 border rounded-lg text-sm transition-all duration-200 placeholder:text-[#CBD5E1] ${
                      focusedField === "email"
                        ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20 outline-none"
                        : "bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#94A3B8]"
                    }`}
                    required
                  />
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#7A1E1E] hover:bg-[#5C1616] text-white font-bold text-sm uppercase tracking-wide rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md mt-1"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
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
                A password reset link has been sent to the email associated with your selected account type.
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

      <footer className="border-t border-[#E2E8F0] bg-white" />
    </div>
  );
};
