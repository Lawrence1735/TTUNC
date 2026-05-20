import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { User, X } from './ui/icons';
import { User as UserType, Application } from '../App';
import { getTalentGroupName } from './ui/unc-colors';

interface AttendanceRecord {
  date: string;
  attendees: { [userId: string]: boolean | { status: boolean; timestamp?: string } };
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

export function TraineeDetailsDialog({
  open,
  onOpenChange,
  trainee,
  applications,
  trainingAttendance,
  traineeInstruments,
  isMarchingBand,
  onDeactivateClick,
  onClose,
  closeButtonStyle = 'default',
}: TraineeDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[85vw] h-[90vh] max-h-[900px] flex flex-col p-0 overflow-hidden"
        hideCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Trainee Details - {trainee?.name}</DialogTitle>
          <DialogDescription>
            Complete profile information and academic records for {trainee?.name}
          </DialogDescription>
        </DialogHeader>

        {/* Sticky Header */}
        <div className="bg-white z-10 border-b border-[#E0E0E0] px-4 sm:px-6 py-4 sm:py-5 shrink-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#7A1E1E]/10 rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#7A1E1E]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[#7A1E1E] text-[16px] sm:text-[20px] font-bold truncate">{trainee?.name}</h3>
                <p className="text-[#6C757D] text-[12px] sm:text-[14px]">{trainee?.studentId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white text-xs sm:text-sm"
                onClick={onDeactivateClick}
              >
                <span className="hidden sm:inline">Deactivate Trainee</span>
                <span className="sm:hidden">Deactivate</span>
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
          </div>
          <p className="text-[#6C757D] text-[12px] sm:text-[13px] ml-13 sm:ml-16 hidden sm:block">
            Complete profile information, academic records, and emergency contact details
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {trainee && (() => {
              const traineeApplication = (applications || []).find(
                app =>
                  app.personalInfo.studentId === trainee.studentId &&
                  app.talentGroup === trainee.talentGroup,
              );

              const traineeMarchingBand = trainee.talentGroup === 'marching-band';

              return (
                <div className="space-y-6 py-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Personal Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Full Name</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.name || trainee.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Birthdate</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.birthdate || 'January 15, 2003'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Age</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.age || '21'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Gender</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.gender || 'Female'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Address</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.address ||
                                trainee.address ||
                                '123 Main Street, Naga City, Camarines Sur'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Contact Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Phone Number</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.phone || trainee.phone || '+63 912 345 6789'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Email Address</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.email || trainee.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Social Media / Messenger</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.socialMedia ||
                                `fb.com/${trainee.name.toLowerCase().replace(/\s+/g, '.')}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">In Case of Emergency</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Parent/Guardian Name</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.guardianName ||
                                trainee.emergencyContact ||
                                'Juan Dela Cruz Sr.'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Contact Number</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.guardianContactNo ||
                                trainee.emergencyPhone ||
                                '+63 917 123 4567'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Academic Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Student ID</p>
                            <p className="text-[#1A1A1A] text-[14px]">{trainee.studentId}</p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Course</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.course ||
                                trainee.course ||
                                'Bachelor of Science in Computer Science'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Year Level</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.yearLevel || trainee.yearLevel || '3rd Year'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Department</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {traineeApplication?.personalInfo.department || 'College of Computer Studies'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Talent Group</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[#6C757D] text-[12px] font-medium">Group</p>
                            <p className="text-[#1A1A1A] text-[14px]">
                              {getTalentGroupName(trainee.talentGroup || '')}
                            </p>
                          </div>
                          {traineeMarchingBand && (
                            <div>
                              <p className="text-[#6C757D] text-[12px] font-medium">Assigned Instrument</p>
                              <p className="text-[#1A1A1A] text-[14px]">
                                {traineeInstruments[trainee.id!] || 'Not Assigned'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
