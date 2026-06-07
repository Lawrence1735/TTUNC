import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

interface LoginFormData {
  role: string;
  email: string;
  password: string;
}

interface TalentTrackLoginProps {
  onLogin?: (
    email: string,
    password: string,
    role: string,
  ) => Promise<{ success: boolean; error?: string }> | void;
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

export const TalentTrackLogin: React.FC<
  TalentTrackLoginProps
> = ({ onLogin, onBack, onNavigate }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    role: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    role?: string;
    email?: string;
    password?: string;
  }>({});
  const [focusedField, setFocusedField] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!formError) return;

    const timer = window.setTimeout(() => {
      setFormError("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [formError]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormError("");
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: {
      role?: string;
      email?: string;
      password?: string;
    } = {};

    if (!formData.role) nextErrors.role = "Login As is required";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    if (!formData.password.trim()) nextErrors.password = "Password is required";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError("Please fill in all required fields.");
      return;
    }

    if (onLogin) {
      setIsSubmitting(true);
      try {
        const result = await onLogin(formData.email, formData.password, formData.role);
        if (result && typeof result === "object" && "success" in result && !result.success) {
          setFormError(result.error ?? "Invalid email, password, or Login As selection.");
        }
      } catch {
        setFormError("Unable to sign in right now. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="relative min-h-dvh bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9] overflow-y-auto">
      {/* Back Button - Top Left */}
      <button
        onClick={handleBackClick}
        className="fixed top-5 left-5 z-20 w-10 h-10 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-[#475569]" />
      </button>

      {/* Main Content Container */}
      <div className="min-h-dvh flex flex-col items-center justify-start md:justify-center px-[16px] pt-20 pb-8 md:py-10">
        {/* Central Institutional Branding */}
        <div className="flex flex-col items-center mb-8 md:mb-10">
          {/* UNC Institutional Crest/Seal */}

          {/* Brand Typography */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl mb-2">
              <span className="font-bold text-[#0F172A]">
                Talent
              </span>
              <span className="text-[#0F172A]">Track</span>
              <span className="font-bold text-[#7A1E1E]">
                UNC
              </span>
            </h1>
            <p className="text-sm text-[#64748B]">
              University of Nueva Caceres
            </p>
          </div>
        </div>

        {/* Central Login Card Container */}
        <div className="w-full max-w-[440px] bg-white rounded-xl border border-[#E2E8F0] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] px-[24px] md:px-[40px] py-[15px]">
          {/* Card Header */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mx-[0px] mt-[20px] mb-[8px]">
              Welcome Back
            </h2>
            <p className="text-sm text-[#64748B]">
              Sign in with your UNC credentials
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div
                className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]"
                role="alert"
                aria-live="assertive"
              >
                {formError}
              </div>
            )}

            {/* Role Selector */}
            <div>
              <label
                htmlFor="role"
                className="block text-xs font-semibold uppercase tracking-wide text-[#475569] mb-2"
              >
                Login As:{" "}
                <span className="text-[#7A1E1E]">*</span>
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("role")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-11 px-4 bg-[#F8FAFC] border rounded-lg appearance-none transition-all duration-200 text-sm ${
                    fieldErrors.role
                      ? "border-[#DC2626] ring-2 ring-[#DC2626]/20"
                      :
                    focusedField === "role"
                      ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20"
                      : "border-[#CBD5E1] hover:border-[#94A3B8]"
                  } ${formData.role ? "text-[#0F172A]" : "text-[#94A3B8]"}`}
                  required
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="director">Director</option>
                  <option value="admin">Admin</option>
                  <option value="scholar">
                    Scholar
                  </option>
                  <option value="trainee">Trainee</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
              </div>
              {fieldErrors.role && (
                <p className="mt-1 text-xs text-[#DC2626]" role="alert">{fieldErrors.role}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wide text-[#475569] mb-2"
              >
                Email <span className="text-[#7A1E1E]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="your.email@unc.edu.ph"
                className={`w-full h-11 px-4 bg-[#F8FAFC] border rounded-lg transition-all duration-200 text-sm placeholder:italic placeholder:text-[#CBD5E1] ${
                  fieldErrors.email
                    ? "border-[#DC2626] ring-2 ring-[#DC2626]/20"
                    :
                  focusedField === "email"
                    ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20"
                    : "border-[#CBD5E1] hover:border-[#94A3B8]"
                }`}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-[#DC2626]" role="alert">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wide text-[#475569] mb-2"
              >
                Password{" "}
                <span className="text-[#7A1E1E]">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full h-11 px-4 pr-12 bg-[#F8FAFC] border rounded-lg transition-all duration-200 text-sm placeholder:text-[#CBD5E1] ${
                    fieldErrors.password
                      ? "border-[#DC2626] ring-2 ring-[#DC2626]/20"
                      :
                    focusedField === "password"
                      ? "bg-white border-[#7A1E1E] ring-2 ring-[#7A1E1E]/20"
                      : "border-[#CBD5E1] hover:border-[#94A3B8]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#475569] transition-colors duration-200"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-[#DC2626]" role="alert">{fieldErrors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("forgot-password");
                  }
                }}
                className="text-sm text-[#0052CC] hover:text-[#7A1E1E] hover:underline transition-colors duration-200 bg-transparent border-0 p-0 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#7A1E1E] hover:bg-[#5C1616] text-white font-bold text-sm uppercase rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"></div>
            <div className="relative flex justify-center text-xs uppercase"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center"></div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-8 text-center"></div>
      </div>

      {/* Atlassian-Style Minimal Micro-Footer */}
      <div className="mt-auto">
        <footer className="border-t border-[#E2E8F0] bg-white"></footer>
      </div>
    </div>
  );
};