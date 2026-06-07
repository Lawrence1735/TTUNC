import { useState, useEffect } from 'react';
import { CheckCircle, Download, Home } from './ui/icons';
import { Button } from './ui/button';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';

interface SuccessConfirmationProps {
  applicantName: string;
  talentGroup: string;
  applicationId: string;
  email: string;
  onClose: () => void;
}

const getTalentGroupLabel = (group: string): string => {
  const labels: Record<string, string> = {
    'marching-band': 'Marching Band',
    'glee-club': 'Glee Club',
    'majorettes': 'Majorettes',
    'dance-club': 'Dance Club',
  };
  return labels[group] || group;
};

export function SuccessConfirmation({
  applicantName,
  talentGroup,
  applicationId,
  email,
  onClose,
}: SuccessConfirmationProps) {
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    // Simulate preparation of certificate/receipt
    const timer = setTimeout(() => setCanDownload(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    // Generate and download receipt PDF
    const text = `
TALENTTRACKUNC - APPLICATION RECEIPT
=====================================
Application Received Successfully
Submission Date: ${new Date().toLocaleString()}

APPLICANT DETAILS:
Name: ${applicantName}
Talent Group: ${getTalentGroupLabel(talentGroup)}
Application ID: ${applicationId}
Email: ${email}

This receipt serves as proof of your application submission.
You will receive further updates via email.

For inquiries, contact: talenttrack@unc.edu.ph
=====================================
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `TalentTrackUNC_${applicationId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <img src={uncLogo} alt="UNC Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-[#7A1E1E] font-bold">TalentTrackUNC</h1>
            <p className="text-sm text-gray-600">Scholarship Application Portal</p>
          </div>
        </div>
      </header>

      {/* Success Content */}
      <div className="flex-1 container mx-auto px-4 py-12 max-w-2xl flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-green-200 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for applying to UNC TalentTrack
            </p>
          </div>

          {/* Application Details Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
            <div className="space-y-6">
              {/* Applicant Name */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Applicant Name</p>
                <p className="text-2xl font-bold text-gray-900">{applicantName}</p>
              </div>

              {/* Talent Group */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Talent Group Applied For</p>
                  <p className="text-lg font-semibold text-[#7A1E1E]">
                    {getTalentGroupLabel(talentGroup)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Application Reference ID</p>
                  <p className="text-lg font-bold text-blue-600">{applicationId}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Email */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Confirmation Email Sent To</p>
                <p className="text-gray-900 break-all">{email}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Check your email (including spam folder) for further updates on your application status.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What Happens Next?</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
                <span>We will review your application within 5-7 business days</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
                <span>Shortlisted candidates will be invited for auditions</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
                <span>You will receive all updates via email and the TalentTrack portal</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
                <span>Training begins for successful scholars</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={handleDownload}
              disabled={!canDownload}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 min-h-[48px] px-6"
              aria-label="Download application receipt"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 min-h-[48px] px-6"
              aria-label="Return to home page"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Support Info */}
          <p className="text-xs text-gray-500 pt-4">
            For technical support or inquiries, contact <strong>talenttrack@unc.edu.ph</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
