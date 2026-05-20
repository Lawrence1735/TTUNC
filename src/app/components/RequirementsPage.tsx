import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Calendar,
  BookOpen,
  CheckCircle,
  ChevronDown,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import uncLogo from 'figma:asset/eef587e99e62123e5e21920dbfa354179bbf6b55.png';
import marchingBandImage from 'figma:asset/b242c5c349e0b89983c68f7897a6a917cfadb783.png';
import majorettesImage from 'figma:asset/720c2c7918c80e99d38a856e37434c03a71dfb51.png';
import gleeClubImage from 'figma:asset/64360cbb01ae76c176fb14f1e5d341950738dfa7.png';
import danceClubImage from 'figma:asset/a2be20b0c6962239c4e654249dbc602dbc00c37e.png';

interface RequirementsPageProps {
  onBack: () => void;
  onApplyNow: (talentGroup: string) => void;
}

interface TalentGroup {
  id: string;
  name: string;
  description: string;
  image: string;
  requirements: string[];
  benefits: string[];
}

const TALENT_GROUPS: TalentGroup[] = [
  {
    id: 'glee-club',
    name: 'Glee Club',
    description:
      'Where diverse voices blend into perfect harmony. We are a premier vocal ensemble dedicated to uplifting spirits, inspiring massive crowds, and performing everything from classical choral masterpieces to modern pop arrangements across the region. Step into the spotlight and claim your place in our musical legacy!',
    image: gleeClubImage,
    requirements: [
      'Good vocal range and tone quality',
      'Ability to harmonize with others',
      'Ensemble experience preferred',
      'Commitment to regular vocal practice',
    ],
    benefits: [
      'Tuition scholarship coverage',
      'Concert performance opportunities',
      'Vocal training and coaching sessions',
      'Recording and studio opportunities',
    ],
  },
  {
    id: 'dance-club',
    name: 'Dance Club',
    description:
      "Where movement meets passion. Dance is so much more than just hitting the right steps—it's about showing up, standing out, and speaking loud without saying a single word. It's your raw story, told through rhythm, power, and movement. If you've got the hunger to perform, the drive to push your physical limits, and the bravery to command a crowd, this stage is yours.",
    image: danceClubImage,
    requirements: [
      'Dance experience in any style',
      'Physical fitness and flexibility',
      'Ability to learn choreography quickly',
      'Strong performance confidence',
    ],
    benefits: [
      'Financial scholarship support',
      'Dancewear and costumes provided',
      'Competition and showcase events',
      'Choreography workshops',
    ],
  },
  {
    id: 'marching-band',
    name: 'Marching Band',
    description:
      "The heartbeat of the university is looking for its next generation of sound! We don't just play music—we command the field, fuel the campus spirit, and march to the rhythm of absolute excellence. This is your chance to step into the world of brass and woodwind performance, dominate the halftime show, and create a legacy that resonates through the campus halls.",
    image: marchingBandImage,
    requirements: [
      'Basic music reading ability',
      'Instrument proficiency or willingness to learn',
      'Physical fitness for marching formations',
      'Commitment to regular rehearsals',
    ],
    benefits: [
      'Percentage scholarship coverage',
      'Instrument provided by the university',
      'Performance opportunities at major events',
      'Leadership development programs',
    ],
  },
  {
    id: 'majorettes',
    name: 'Majorettes',
    description:
      "This is the home of the most elite visual performers on campus, showcasing power, precision, and excellence. We don't look for robotic perfection; we demand raw passion, glowing self-confidence, and the undeniable joy of elite performance. We own the room, leave doubts behind, and let pure talent speak loud!",
    image: majorettesImage,
    requirements: [
      'Dance or movement experience',
      'Physical coordination and flexibility',
      'Ability to perform synchronized routines',
      'Team-oriented and disciplined mindset',
    ],
    benefits: [
      'Scholarship assistance',
      'Performance costumes provided',
      'Regional competition participation',
      'Skill development workshops',
    ],
  },
];

const JOURNEY_STEPS = [
  {
    icon: <FileText className="w-7 h-7" />,
    label: 'Submit Application',
    sub: 'Fill out the form with your details',
    gold: false,
  },
  {
    icon: <Calendar className="w-7 h-7" />,
    label: 'Audition',
    sub: 'Showcase your talent',
    gold: false,
  },
  {
    icon: <BookOpen className="w-7 h-7" />,
    label: 'Training',
    sub: 'Practice & develop skills',
    gold: false,
  },
  {
    icon: <CheckCircle className="w-7 h-7" />,
    label: 'Official Scholar',
    sub: "You're one of us!",
    gold: true,
  },
];

export function RequirementsPage({ onBack, onApplyNow }: RequirementsPageProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* ── Header ── */}
      <header className="h-20 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[70px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={uncLogo}
              alt="UNC Crest"
              className="w-11 h-11 object-contain"
              loading="eager"
            />
            <div>
              <div className="text-lg leading-tight">
                <span className="font-bold text-[#0F172A]">Talent</span>
                <span className="text-[#0F172A]">Track</span>
                <span className="font-bold text-[#7A1E1E]">UNC</span>
              </div>
              <p className="text-[12px] text-[#64748B] leading-none mt-0.5">
                Scholarship Application Portal
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 border border-[#94A3B8] rounded-lg px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#7A1E1E] hover:border-[#7A1E1E] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-[70px] py-10 space-y-8">

        {/* Page title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#7A1E1E] mb-3">
            Choose Your Talent Group
          </h1>
          <p className="text-[#475569] text-base max-w-2xl mx-auto leading-relaxed">
            Choose a talent group to apply for and start your journey as a UNC talent scholar.
          </p>
        </div>

        {/* ── Eligibility Warning Banner ── */}
        <div className="bg-[#FEF2F2] border-l-4 border-[#EF4444] rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-[#991B1B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[15px] font-bold text-[#991B1B] mb-1">
              Programmatic Eligibility Constraints
            </p>
            <ul className="text-sm text-[#7F1D1D] space-y-1 list-disc list-inside">
              <li>Nursing students are not eligible to participate due to clinical scheduling constraints.</li>
              <li>Applicants must be currently enrolled and in good academic standing (GPA ≥ 2.0).</li>
              <li>Students under academic probation are temporarily ineligible until cleared.</li>
            </ul>
          </div>
        </div>

        {/* ── Application Journey Tracker ── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">Your Application Journey</h2>
            <p className="text-sm text-[#64748B]">Follow these steps to become a UNC talent scholar</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-0">
            {JOURNEY_STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div
                      className={`absolute inset-0 rounded-full blur-md opacity-25 ${
                        step.gold ? 'bg-[#D97706]' : 'bg-[#7A1E1E]'
                      }`}
                    />
                    <div
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md ${
                        step.gold
                          ? 'bg-gradient-to-br from-[#D97706] to-[#B45309]'
                          : 'bg-gradient-to-br from-[#7A1E1E] to-[#5C1616]'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border-2 ${
                        step.gold ? 'border-[#D97706]' : 'border-[#7A1E1E]'
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${
                          step.gold ? 'text-[#D97706]' : 'text-[#7A1E1E]'
                        }`}
                      >
                        {i + 1}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#0F172A] mb-0.5">{step.label}</p>
                  <p className="text-xs text-[#64748B]">{step.sub}</p>
                </div>

                {i < JOURNEY_STEPS.length - 1 && (
                  <div className="hidden md:flex flex-1 max-w-[80px] items-center justify-center -mt-8 self-center">
                    <div className="w-full h-[2px] bg-gradient-to-r from-[#7A1E1E]/40 to-[#7A1E1E]/20 rounded-full" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Talent Group Cards ── */}
        <div className="space-y-6">
          {TALENT_GROUPS.map((group) => {
            const isExpanded = expandedGroups.includes(group.id);
            return (
              <div
                key={group.id}
                /* UPDATED: Added md:min-h-[480px] to make the cards significantly taller by default */
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-[0_4px_16px_-4px_rgba(0,0,0,0.07)] relative flex flex-col md:grid md:grid-cols-2 md:min-h-[480px]"
              >
                {/* Info Column (Left) */}
                <div className="p-10 flex flex-col justify-between h-full z-10 bg-white">
                  <div>
                    <h3 className="text-2xl font-semibold text-[#7A1E1E] mb-3">{group.name}</h3>
                    <p className="text-[15px] text-[#475569] leading-[1.6] mb-6">{group.description}</p>
                  </div>

                  <div className="space-y-3 mt-auto">
                    {/* View Requirements toggle */}
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between bg-[#F9EAEA] hover:bg-[#f3dada] text-[#7A1E1E] rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200"
                    >
                      <span>View Requirements</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Expanded requirements + benefits */}
                    {isExpanded && (
                      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 space-y-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-[#7A1E1E] mb-2">
                            Requirements
                          </p>
                          <ul className="space-y-1.5">
                            {group.requirements.map((r, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                                <span className="mt-0.5 w-4 h-4 flex-shrink-0 text-[#7A1E1E]">✓</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-[#7A1E1E] mb-2">
                            Benefits
                          </p>
                          <ul className="space-y-1.5">
                            {group.benefits.map((b, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-[#475569]">
                                <span className="mt-0.5 w-4 h-4 flex-shrink-0 text-[#D97706]">★</span>
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Apply Now CTA */}
                    <button
                      onClick={() => onApplyNow(group.id)}
                      className="w-full flex items-center justify-center gap-2 bg-[#7A1E1E] hover:bg-[#5C1616] text-white font-bold text-sm rounded-lg px-4 py-3 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Apply Now
                    </button>
                  </div>
                </div>

                {/* Image Column (Right) */}
                <div className="min-h-[260px] md:min-h-0 md:absolute md:top-0 md:bottom-0 md:right-0 md:w-1/2 overflow-hidden bg-gray-100">
                  <div className="w-full h-full [&_img]:!h-full [&_img]:!w-full [&_img]:!object-cover relative">
                    <ImageWithFallback
                      src={group.image}
                      alt={group.name}
                      className="w-full h-full object-cover min-h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(122,30,30,0.12)] to-transparent pointer-events-none" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}