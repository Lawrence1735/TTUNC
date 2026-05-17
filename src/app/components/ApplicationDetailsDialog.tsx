import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { User } from './ui/icons';
import { Application } from '../App';

interface ApplicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
}

export function ApplicationDetailsDialog({ open, onOpenChange, application }: ApplicationDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#7A1E1E] text-[20px] font-bold">Application Details</DialogTitle>
          <DialogDescription className="text-[#6C757D] text-[14px]">
            Complete applicant information and responses
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(80vh-150px)] pr-4">
          {application && (
            <div className="space-y-6 pb-4">
              {/* Applicant Header */}
              <div className="flex items-center space-x-4 pb-4 border-b border-[#E0E0E0]">
                <div className="w-20 h-20 bg-[#7A1E1E]/10 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-[#7A1E1E]" />
                </div>
                <div>
                  <h3 className="text-[#1A1A1A] text-[20px] font-bold">
                    {application.personalInfo.name || 'Dela Cruz, Juan Santos'}
                  </h3>
                  <p className="text-[#6C757D] text-[14px] mt-1">
                    {application.personalInfo.studentId || '2024-123456'}
                  </p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Personal Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#6B7280] text-[12px] font-medium">Full Name</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.name || 'Dela Cruz, Juan Santos'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Birthdate</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.birthdate || '01/15/2005'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Age</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.age || '19'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Gender</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.gender || 'Male'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Address</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.address || '123 Main Street, Sta. Cruz, Naga City, Camarines Sur'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#6B7280] text-[12px] font-medium">Phone Number</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.phone || '0917-123-4567'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Email Address</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.email || 'juan.delacruz@unc.edu.ph'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Social Media / Messenger</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.socialMedia || 'https://facebook.com/juan.delacruz'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">In Case of Emergency</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#6B7280] text-[12px] font-medium">Parent/Guardian Name</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.guardianName || 'Maria Dela Cruz'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Contact Number</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.guardianContactNo || '0918-765-4321'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Academic Information */}
                  <div>
                    <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Academic Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#6B7280] text-[12px] font-medium">Course</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.course || 'Bachelor of Science in Computer Science'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Year Level</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.yearLevel || '2nd Year'}</p>
                      </div>
                      <div>
                        <p className="text-[#6C757D] text-[12px] font-medium">Department</p>
                        <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.department || 'College of Engineering and Computer Studies'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Talent Group Specific Information */}
                  {application.talentGroup === 'marching-band' && (
                    <div>
                      <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Marching Band Information</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Previous Band Experience</p>
                          <p className="text-[#1A1A1A] text-[14px]">
                            {application.personalInfo.hasBandExperience !== undefined
                              ? (application.personalInfo.hasBandExperience ? 'Yes' : 'No')
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.talentGroup === 'glee-club' && (
                    <div>
                      <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Glee Club Information</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Vocal Range / Voice Type</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.vocalRange || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Previous Singing Experience</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.previousSingingExperience || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Musical Background</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.musicalBackground || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.talentGroup === 'dance-club' && (
                    <div>
                      <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Dance Club Information</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Primary Dance Genre / Style</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.primaryDanceGenre || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Years of Experience</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.yearsOfExperience || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Performed on Stage Before</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.performedOnStage || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Willing to Attend All Rehearsals &amp; Performances</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.willingToAttendRehearsals || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {application.talentGroup === 'majorettes' && (
                    <div>
                      <h4 className="text-[#7A1E1E] text-[16px] font-bold mb-3">Majorettes Information</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Previously Part of Majorette/Baton Team</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.previousMajoretteTeam || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Previous Organization</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.previousOrganization || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Can Perform Basic Baton/Flag Routines</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.canPerformBasicRoutines || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[#6C757D] text-[12px] font-medium">Willing to Attend All Rehearsals &amp; Performances</p>
                          <p className="text-[#1A1A1A] text-[14px]">{application.personalInfo.willingToAttendRehearsalsMajorettes || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Info Footer */}
              <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-4 mt-6">
                <div>
                  <p className="text-[#6C757D] text-[12px] font-medium">Applied On</p>
                  <p className="text-[#1A1A1A] text-[14px] font-medium">
                    {new Date(application.appliedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
