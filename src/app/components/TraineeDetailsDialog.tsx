import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { User, X } from './ui/icons';
import { User as UserType, Application } from '../App';

interface AttendanceRecord {
  date: string;
  attendees: { [userId: string]: boolean | 'present' | 'excused' | 'absent' | { status: boolean; timestamp?: string } };
  noPractice?: boolean;
}

interface TraineeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainee: UserType | null;
  applications: Application[];
  trainingAttendance: AttendanceRecord[];
  traineeInstruments: { [id: string]: string };
  isMarchingBand: boolean;
  onDeactivateClick: () => void;
  onClose: () => void;
  closeButtonStyle?: 'default' | 'icon';
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

export function TraineeDetailsDialog({
  open,
  onOpenChange,
  trainee,
  applications,
  trainingAttendance: _trainingAttendance,
  traineeInstruments,
  isMarchingBand,
  onDeactivateClick,
  onClose,
  closeButtonStyle: _closeButtonStyle = 'default',
}: TraineeDetailsDialogProps) {
  if (!trainee) return null;

  const traineeApplication = (applications || []).find((app) => {
    const appStudentId = app.applicant_student_id ?? app.personalInfo?.studentId;
    const appGroup = app.talent_group ?? app.talentGroup;
    const sameStudent = String(appStudentId || '') === String(trainee.studentId || '');
    if (!sameStudent) return false;

    // Prefer same-group match when both sides have values, but do not block fallback.
    if (!appGroup || !trainee.talentGroup) return true;
    return String(appGroup) === String(trainee.talentGroup);
  });

  const p = traineeApplication?.personalInfo ?? {};
  const name = trainee.name ?? traineeApplication?.applicant_name ?? p.name ?? '—';
  const studentId = trainee.studentId ?? traineeApplication?.applicant_student_id ?? p.studentId ?? '—';
  const email = trainee.email ?? traineeApplication?.applicant_email ?? p.email ?? '—';
  const phone = trainee.phone ?? traineeApplication?.applicant_phone ?? p.phone ?? '—';
  const gender = trainee.gender ?? traineeApplication?.applicant_gender ?? p.gender ?? '—';
  const birthdate = trainee.birthdate ?? trainee.dateOfBirth ?? traineeApplication?.applicant_birthdate ?? p.birthdate ?? '—';
  const age = trainee.age ?? traineeApplication?.applicant_age ?? p.age ?? '—';
  const address = trainee.address ?? traineeApplication?.applicant_address ?? p.address ?? '—';
  const yearLevel = trainee.yearLevel ?? traineeApplication?.applicant_year_level ?? p.yearLevel ?? '—';
  const course = trainee.course ?? traineeApplication?.applicant_course ?? p.course ?? '—';
  const department = trainee.department ?? traineeApplication?.applicant_department ?? p.department ?? '—';
  const guardian = trainee.guardianName ?? trainee.emergencyContact ?? traineeApplication?.guardian_name ?? p.guardianName ?? '—';
  const guardianNo = trainee.guardianContact ?? trainee.emergencyPhone ?? traineeApplication?.guardian_phone ?? p.guardianContactNo ?? '—';
  const guardianRel = trainee.emergencyContactRelationship ?? traineeApplication?.guardian_relationship ?? p.guardianRelationship ?? '—';
  const photoPath = traineeApplication?.photo_path ?? null;
  const photoUrl = photoPath
    ? `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/storage/${photoPath}`
    : null;
  const assignedInstrument = traineeInstruments[trainee.id!] || trainee.assignedInstrument || trainee.assignedVoice || 'Not Assigned';

  const formatBirthdate = (value: string) => {
    if (!value || value === '—') return '—';
    const parsed = new Date(value.includes('T') ? value : `${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[680px] max-h-[90vh] flex flex-col overflow-hidden" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-[#7A1E1E] text-[18px] font-bold">Trainee Profile</DialogTitle>
          <DialogDescription className="text-[#6C757D] text-[13px]">Complete trainee information</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-3">
          <div className="space-y-6 pb-4">
            <div className="flex items-center gap-4 pb-4 border-b border-[#E0E0E0]">
              <div className="w-16 h-16 rounded-lg bg-[#7A1E1E]/10 border-2 border-[#7A1E1E]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {photoUrl
                  ? <img src={photoUrl} alt="Trainee photo" className="w-full h-full object-cover" />
                  : <User className="w-8 h-8 text-[#7A1E1E]" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[#1A1A1A] text-[18px] font-bold truncate">{name}</h3>
                <p className="text-[#6C757D] text-[13px] mt-0.5">{studentId}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white text-xs sm:text-sm"
                onClick={onDeactivateClick}
              >
                Deactivate Trainee
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-transparent text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              <div className="space-y-6">
                <Section title="Personal Information">
                  <Field label="Full Name" value={name} />
                  <Field label="Gender" value={gender} />
                  <Field label="Birthdate" value={formatBirthdate(String(birthdate))} />
                  <Field label="Age" value={age && age !== '—' ? `${age} years old` : '—'} />
                  <Field label="Address" value={address} />
                </Section>

                <Section title="Contact Information">
                  <Field label="Phone Number" value={phone} />
                  <Field label="Email Address" value={email} />
                </Section>

                <Section title="In Case of Emergency">
                  <Field label="Parent / Guardian Name" value={guardian} />
                  <Field label="Relationship" value={guardianRel} />
                  <Field label="Contact Number" value={guardianNo} />
                </Section>
              </div>

              <div className="space-y-6">
                <Section title="Academic Information">
                  <Field label="Student ID" value={studentId} />
                  <Field label="Year Level" value={yearLevel} />
                  <Field label="Course / Strand" value={course} />
                  <Field label="Department / School" value={department} />
                </Section>

                <Section title="Training Assignment">
                  {isMarchingBand && (
                    <Field label="Assigned Instrument" value={assignedInstrument} />
                  )}
                </Section>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
