import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { DashboardHeader } from './DashboardHeader';
import { Calendar, Award, CheckCircle, XCircle, Clock, Target, Trophy, ChevronRight } from './ui/icons';
import { QuickStatsCard } from './ui/QuickStatsCard';
import type { User, TrainingRecord } from '../App';

interface TrainingDashboardProps {
  user: User;
  onLogout: () => void;
  trainingRecord: TrainingRecord | null;
  unreadNotifications?: number;
  onNotificationsClick?: () => void;
  onNavigateToSettings?: (tab?: 'account' | 'security' | 'administration' | 'logout') => void;
}

// Helper function to get group-specific terminology
const getGroupTerminology = (talentGroup: string) => {
  switch (talentGroup) {
    case 'marching-band':
      return {
        moduleName: 'Module',
        sessionName: 'Training Session',
        description: 'Marching Band training covers instrument proficiency, marching techniques, formations, and performance skills.',
        focusAreas: ['Instrument Mastery', 'Marching Drills', 'Formation Precision', 'Musical Performance']
      };
    case 'majorettes':
      return {
        moduleName: 'Routine',
        sessionName: 'Practice Session',
        description: 'Majorettes training focuses on baton handling, flag work, choreographed routines, and synchronized performance.',
        focusAreas: ['Baton Techniques', 'Flag Work', 'Dance Integration', 'Synchronization']
      };
    case 'glee-club':
      return {
        moduleName: 'Routine',
        sessionName: 'Vocal Session',
        description: 'Glee Club training develops vocal techniques, harmony, music reading, and choral performance skills.',
        focusAreas: ['Vocal Techniques', 'Harmony', 'Music Theory', 'Performance']
      };
    case 'dance-club':
      return {
        moduleName: 'Routine',
        sessionName: 'Dance Session',
        description: 'Dance Club training encompasses various dance styles, choreography, technique refinement, and stage performance.',
        focusAreas: ['Dance Styles', 'Choreography', 'Technique', 'Performance']
      };
    default:
      return {
        moduleName: 'Module',
        sessionName: 'Training Session',
        description: 'Comprehensive training program designed to develop your skills and performance abilities.',
        focusAreas: ['Skills', 'Techniques', 'Performance', 'Evaluation']
      };
  }
};

export function TrainingDashboard({ 
  user, 
  onLogout, 
  trainingRecord,
  unreadNotifications,
  onNotificationsClick,
  onNavigateToSettings
}: TrainingDashboardProps) {
  const [selectedPractice, setSelectedPractice] = useState<any>(null);
  const [showPracticeDialog, setShowPracticeDialog] = useState(false);

  // Calculate training stats
  const totalPractices = trainingRecord?.practices.length || 0;
  const attendedPractices = trainingRecord?.practices.filter(p => p.attended).length || 0;
  const attendanceRate = totalPractices > 0 ? Math.round((attendedPractices / totalPractices) * 100) : 0;
  const progressPercentage = trainingRecord?.overallProgress || 0;
  
  // Calculate completed and remaining sessions
  const completedSessions = trainingRecord?.practices.filter(p => p.attended) || [];
  const remainingSessions = trainingRecord?.practices.filter(p => !p.attended) || [];
  const completionPercentage = totalPractices > 0 ? Math.round((attendedPractices / totalPractices) * 100) : 0;
  
  // Calculate latest chapter progress
  const latestPractice = trainingRecord?.practices[trainingRecord.practices.length - 1];
  const chaptersCompleted = latestPractice?.chaptersCompleted || 0;
  const totalChapters = latestPractice?.totalChapters || 0;

  // Get group-specific terminology
  const groupTerminology = getGroupTerminology(user.talentGroup);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader
        user={user}
        onLogout={onLogout}
        dashboardTitle="Trainee Dashboard"
        unreadNotifications={unreadNotifications}
        onNotificationsClick={onNotificationsClick}
        onNavigateToSettings={onNavigateToSettings}
        hideStudentId={true}
      />

      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-[#7A1E1E] mb-2">Training Progress</h2>
          <p className="text-muted-foreground">
            Track your training journey and performance evaluation.
          </p>
        </div>

        {/* Training Status Alert */}
        {trainingRecord?.evaluation !== 'pending' && (
          <Alert className={`mb-6 ${trainingRecord?.evaluation === 'qualified' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <Trophy className="w-4 h-4" />
            <AlertDescription>
              {trainingRecord?.evaluation === 'qualified' 
                ? 'Congratulations! You have successfully completed your training and are now an official scholar!'
                : 'Unfortunately, you did not qualify this round. Please contact your coach for feedback and next steps.'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats - More compact grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <QuickStatsCard
            icon={CheckCircle}
            label="Completed Sessions"
            value={completedSessions.length}
          />
          
          <QuickStatsCard
            icon={Clock}
            label="Remaining Sessions"
            value={remainingSessions.length}
          />
          
          <QuickStatsCard
            icon={Award}
            label="Progress"
            value={`${completionPercentage}%`}
          />
        </div>

        {/* Main content grid - Better layout for two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Practice Schedule Table - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card className="border-[#e0e0e0] h-full">
              <CardHeader>
                <CardTitle className="text-[#7A1E1E] flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Practice Schedule & Attendance
                </CardTitle>
                <CardDescription className="text-[#6c757d]">
                  Click on any practice date to view detailed activities and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trainingRecord && trainingRecord.practices.length > 0 ? (
                  <>
                    {/* Mobile: tappable card list */}
                    <div className="md:hidden space-y-2 overflow-y-auto max-h-[640px]">
                      {trainingRecord.practices.map((practice, index) => (
                        <div
                          key={index}
                          className="p-3 border border-[#e0e0e0] rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                          onClick={() => { setSelectedPractice(practice); setShowPracticeDialog(true); }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-[#1a1a1a]">
                              {practice.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-2">
                              {practice.attended ? (
                                <Badge className="bg-green-100 text-green-800 text-[10px]">Present</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 text-[10px]">Absent</Badge>
                              )}
                              <ChevronRight className="w-4 h-4 text-[#6c757d]" />
                            </div>
                          </div>
                          <p className="text-xs text-[#7A1E1E] mt-1">
                            Chapter {practice.chaptersCompleted} of {practice.totalChapters}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: clickable table */}
                    <div className="hidden md:block border border-[#e0e0e0] rounded-lg overflow-auto max-h-[420px]">
                      <Table className="min-w-max">
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-[#6c757d]">Date</TableHead>
                            <TableHead className="text-[#6c757d]">Chapter Completed</TableHead>
                            <TableHead className="text-[#6c757d]">Attendance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trainingRecord.practices.map((practice, index) => (
                            <TableRow
                              key={index}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => { setSelectedPractice(practice); setShowPracticeDialog(true); }}
                            >
                              <TableCell className="text-[#6c757d]">
                                {practice.date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                              </TableCell>
                              <TableCell>
                                <p className="text-[#7A1E1E]">Chapter {practice.chaptersCompleted} of {practice.totalChapters}</p>
                              </TableCell>
                              <TableCell>
                                {practice.attended ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <CheckCircle className="w-3 h-3 mr-1" />Present
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                    <XCircle className="w-3 h-3 mr-1" />Absent
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-[#6c757d]">No training sessions recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Practice Detail Dialog */}
      <Dialog open={showPracticeDialog} onOpenChange={setShowPracticeDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#7A1E1E]">
              Training Session - {selectedPractice?.date.toLocaleDateString()}
            </DialogTitle>
            <DialogDescription>Detailed breakdown of your training session</DialogDescription>
          </DialogHeader>
          {selectedPractice && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-[#e0e0e0]">
                  <h4 className="text-sm text-[#7A1E1E] mb-2">Attendance Status</h4>
                  <div className="flex items-center space-x-2">
                    {selectedPractice.attended ? (
                      <><CheckCircle className="w-5 h-5 text-green-600" /><span className="text-sm text-green-600">Present</span></>
                    ) : (
                      <><XCircle className="w-5 h-5 text-red-600" /><span className="text-sm text-red-600">Absent</span></>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-[#e0e0e0]">
                  <h4 className="text-sm text-[#7A1E1E] mb-2">{groupTerminology.moduleName} Progress</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg text-[#7A1E1E]">
                      {selectedPractice.chaptersCompleted}/{selectedPractice.totalChapters}
                    </span>
                    <span className="text-sm text-[#6c757d]">{groupTerminology.moduleName.toLowerCase()}s completed</span>
                  </div>
                  <Progress value={(selectedPractice.chaptersCompleted / selectedPractice.totalChapters) * 100} className="mt-2" />
                </div>
              </div>
              {selectedPractice.attended && selectedPractice.activities && selectedPractice.activities.length > 0 && (
                <div className="border border-[#e0e0e0] rounded-lg p-4 bg-white">
                  <h4 className="text-sm text-[#7A1E1E] mb-3">Activities Covered</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedPractice.activities.map((activity: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 bg-gray-50 p-2 rounded">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[#6c757d]">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}