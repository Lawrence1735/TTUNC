import React, { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../services/authService";

interface ResetPasswordProps {
  onBackToLogin?: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onBackToLogin }) => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const tokenFromUrl = params.get("token") ?? "";
  const emailFromUrl = params.get("email") ?? "";

  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBack = () => {
    if (onBackToLogin) {
      onBackToLogin();
      return;
    }
    window.history.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !token.trim() || !password || !confirmPassword) {
      setErrorMessage("Email, token, and password fields are required.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        token: token.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess(true);
      toast.success("Password reset successful. You can now log in.");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Unable to reset password. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9]">
      <button
        onClick={handleBack}
        className="absolute top-5 left-5 z-10 w-10 h-10 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-[#475569]" />
      </button>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl md:text-3xl mb-1">
            <span className="font-bold text-[#0F172A]">Talent</span>
            <span className="text-[#0F172A]">Track</span>
            <span className="font-bold text-[#7A1E1E]">UNC</span>
          </h1>
          <p className="text-sm text-[#64748B]">University of Nueva Caceres</p>
        </div>

        <div className="w-full max-w-[460px] bg-white rounded-xl border border-[#E2E8F0] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)] px-10 py-10">
          {!success ? (
            <>
              <div className="mb-7">
                <h2 className="text-[22px] font-bold text-[#0F172A] mb-2 leading-tight">Reset Password</h2>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Enter your reset details and choose a new password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {errorMessage && (
                  <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#991B1B]">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label htmlFor="reset-email" className="block text-xs font-semibold uppercase tracking-widest text-[#475569] mb-2">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-4 border rounded-lg text-sm bg-[#F8FAFC] border-[#CBD5E1]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reset-token" className="block text-xs font-semibold uppercase tracking-widest text-[#475569] mb-2">
                    Reset Token
                  </label>
                  <input
                    id="reset-token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full h-11 px-4 border rounded-lg text-sm bg-[#F8FAFC] border-[#CBD5E1]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-widest text-[#475569] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 px-4 pr-12 border rounded-lg text-sm bg-[#F8FAFC] border-[#CBD5E1]"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-widest text-[#475569] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 px-4 pr-12 border rounded-lg text-sm bg-[#F8FAFC] border-[#CBD5E1]"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#7A1E1E] hover:bg-[#5C1616] text-white font-bold text-sm uppercase tracking-wide rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md mt-1"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <h2 className="text-[22px] font-bold text-[#0F172A] mb-2">Password Updated</h2>
              <p className="text-sm text-[#475569] mb-6">Your password has been reset successfully.</p>
              <button
                type="button"
                onClick={handleBack}
                className="text-sm font-medium text-[#0052CC] hover:text-[#7A1E1E] hover:underline"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
