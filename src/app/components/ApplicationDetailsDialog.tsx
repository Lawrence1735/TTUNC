import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { User } from './ui/icons';

interface ApplicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any | null;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[#6C757D] text-[12px] font-medium">{label}</p>
      <p className="text-[#1A1A1A] text-[14px] break-words">{value || '—'}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[#7A1E1E] text-[15px] font-bold mb-3 pb-1 border-b border-[#F0E0E0]">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function ApplicationDetailsDialog({ open, onOpenChange, application }: ApplicationDetailsDialogProps) {
  if (!application) return null;

  // Resolve flat API fields (backend) with fallback to legacy nested personalInfo shape
  const p = application.personalInfo ?? {};
  const name        = application.applicant_name       ?? p.name        ?? '—';
  const studentId   = application.applicant_student_id  ?? p.studentId   ?? '—';
  const email       = application.applicant_email      ?? p.email       ?? '—';
  const phone       = application.applicant_phone      ?? p.phone       ?? '—';
  const gender      = application.applicant_gender     ?? p.gender      ?? '—';
  const rawBdate    = application.applicant_birthdate  ?? p.birthdate   ?? null;
  const birthdate   = rawBdate
    ? new Date(rawBdate + (rawBdate.includes('T') ? '' : 'T00:00:00'))
        .toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const age         = application.applicant_age        ?? p.age         ?? '—';
  const address     = application.applicant_address    ?? p.address     ?? '—';
  const socialMedia = application.social_media         ?? p.socialMedia ?? '—';
  const yearLevel   = application.applicant_year_level ?? p.yearLevel   ?? '—';
  const course      = application.applicant_course     ?? p.course      ?? '—';
  const department  = application.applicant_department ?? p.department  ?? '—';
  const guardian    = application.guardian_name        ?? p.guardianName ?? '—';
  const guardianNo  = application.guardian_phone       ?? p.guardianContactNo ?? '—';
  const guardianRel = application.guardian_relationship ?? p.guardianRelationship ?? '—';
  const talentGroup = application.talent_group         ?? application.talentGroup ?? '';
  const photoPath   = application.photo_path           ?? null;
  const photoUrl    = photoPath
    ? `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/storage/${photoPath}`
    : null;
  const appliedAt   = application.applied_at ?? application.appliedAt;
  const appliedDate = appliedAt
    ? new Date(appliedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  // Talent-group specific (flat API keys)
  const hasBandExp          = application.has_band_experience    ?? p.hasBandExperience;
  const vocalRange          = application.vocal_range            ?? p.vocalRange;
  const prevSinging         = application.previous_singing_experience ?? p.previousSingingExperience;
  const musicalBg           = application.musical_background     ?? p.musicalBackground;
  const danceGenre          = application.primary_dance_genre    ?? p.primaryDanceGenre;
  const danceYears          = application.years_of_experience    ?? p.yearsOfExperience;
  const performedOnStage    = application.performed_on_stage     ?? p.performedOnStage;
  const willingRehearsals   = application.willing_to_attend_rehearsals ?? p.willingToAttendRehearsals;
  const prevMajorette       = application.previous_majorette_team ?? p.previousMajoretteTeam;
  const prevOrg             = application.previous_organization  ?? p.previousOrganization;
  const basicRoutines       = application.can_perform_basic_routines ?? p.canPerformBasicRoutines;
  const willingMajorettes   = application.willing_to_attend_rehearsals_majorettes ?? p.willingToAttendRehearsalsMajorettes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[680px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[#7A1E1E] text-[18px] font-bold">Application Details</DialogTitle>
          <DialogDescription className="text-[#6C757D] text-[13px]">
            Complete applicant information
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-3">
          <div className="space-y-6 pb-4">

            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-[#E0E0E0]">
              <div className="w-16 h-16 rounded-lg bg-[#7A1E1E]/10 border-2 border-[#7A1E1E]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {photoUrl
                  ? <img src={photoUrl} alt="Applicant photo" className="w-full h-full object-cover" />
                  : <User className="w-8 h-8 text-[#7A1E1E]" />
                }
              </div>
              <div className="min-w-0">
                <h3 className="text-[#1A1A1A] text-[18px] font-bold truncate">{name}</h3>
                <p className="text-[#6C757D] text-[13px] mt-0.5">{studentId}</p>
                <p className="text-[#7A1E1E] text-[12px] font-medium mt-0.5 capitalize">{talentGroup.replace(/-/g, ' ')}</p>
              </div>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">

              {/* Left */}
              <div className="space-y-6">
                <Section title="Personal Information">
                  <Field label="Full Name" value={name} />
                  <Field label="Gender" value={gender} />
                  <Field label="Birthdate" value={birthdate} />
                  <Field label="Age" value={age ? `${age} years old` : undefined} />
                  <Field label="Address" value={address} />
                </Section>

                <Section title="Contact Information">
                  <Field label="Phone Number" value={phone} />
                  <Field label="Email Address" value={email} />
                  <Field label="Social Media / Messenger" value={socialMedia} />
                </Section>

                <Section title="In Case of Emergency">
                  <Field label="Parent / Guardian Name" value={guardian} />
                  <Field label="Relationship" value={guardianRel} />
                  <Field label="Contact Number" value={guardianNo} />
                </Section>
              </div>

              {/* Right */}
              <div className="space-y-6">
                <Section title="Academic Information">
                  <Field label="Student ID" value={studentId} />
                  <Field label="Year Level" value={yearLevel} />
                  <Field label="Course / Strand" value={course} />
                  <Field label="Department / School" value={department} />
                </Section>

                {/* Talent-group specific */}
                {talentGroup === 'marching-band' && (
                  <Section title="Marching Band">
                    <Field
                      label="Previous Band Experience"
                      value={hasBandExp !== undefined && hasBandExp !== null ? (hasBandExp ? 'Yes' : 'No') : undefined}
                    />
                  </Section>
                )}

                {talentGroup === 'glee-club' && (
                  <Section title="Glee Club">
                    <Field label="Vocal Range / Voice Type" value={vocalRange} />
                    <Field label="Previous Singing Experience" value={prevSinging} />
                    <Field label="Musical Background" value={musicalBg} />
                  </Section>
                )}

                {talentGroup === 'dance-club' && (
                  <Section title="Dance Club">
                    <Field label="Primary Dance Genre / Style" value={danceGenre} />
                    <Field label="Years of Experience" value={danceYears} />
                    <Field label="Performed on Stage Before" value={performedOnStage} />
                    <Field label="Willing to Attend All Rehearsals" value={willingRehearsals} />
                  </Section>
                )}

                {talentGroup === 'majorettes' && (
                  <Section title="Majorettes">
                    <Field label="Previously Part of Majorette/Baton Team" value={prevMajorette} />
                    <Field label="Previous Organization" value={prevOrg} />
                    <Field label="Can Perform Basic Baton/Flag Routines" value={basicRoutines} />
                    <Field label="Willing to Attend All Rehearsals" value={willingMajorettes} />
                  </Section>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-3 text-sm">
              <span className="text-[#6C757D] text-[12px] font-medium">Applied On: </span>
              <span className="text-[#1A1A1A] text-[13px] font-medium">{appliedDate}</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
