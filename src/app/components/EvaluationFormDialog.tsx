import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { GraduationCap } from './ui/icons';
import { EvaluationConfirmationDialog } from './EvaluationConfirmationDialog';
import type { User } from '../App';
import type { Evaluation } from './types';

interface EvaluationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTrainee: User;
  evaluationForm: Evaluation;
  setEvaluationForm: (form: Evaluation) => void;
  onSubmit: () => void;
  calculateSectionATotal: () => number;
  calculateSectionAAverage: () => string;
  calculateSectionBTotal: () => number;
  calculateSectionBAverage: () => string;
  calculateSectionCTotal: () => number;
  calculateSectionCAverage: () => string;
  calculateOverallRating: () => string;
  getAdjectivalRating: () => string;
  currentUser: User;
}

export function EvaluationFormDialog({
  open,
  onOpenChange,
  selectedTrainee,
  evaluationForm,
  setEvaluationForm,
  onSubmit,
  calculateSectionATotal,
  calculateSectionAAverage,
  calculateSectionBTotal,
  calculateSectionBAverage,
  calculateSectionCTotal,
  calculateSectionCAverage,
  calculateOverallRating,
  getAdjectivalRating,
  currentUser
}: EvaluationFormDialogProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);

        const updateSectionA = (field: string, value: number) => {
    setEvaluationForm({
      ...evaluationForm,
      sectionA: { ...(evaluationForm.sectionA || {}), [field]: value }
    });
  };

  const getRatingPeriodFromTimeline = (date: Date) => {
    // NOTE: timeline profile is not currently centralized in a separate file.
    // Default fallback matches the prior hardcoded behavior.
    // Future: replace with real timeline profile lookup.
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();
    if (month >= 1 && month <= 5) return `1st Semester, SY ${year}-${year + 1}`;
    return `2nd Semester, SY ${year}-${year + 1}`;
  };

  const getTalentUnitAuto = () => {
    // Removed manual Talent Unit selection. Use logged-in trainee context.
    return selectedTrainee?.talentGroup || '';
  };

  const computeScholarshipTierFromOverall = (overall: number) => {
    // Auto-assign reward tier based on final computed score.
    // Mapping (0-5 scale): >=4.5 => 100, >=3.75 => 75, >=3.0 => 50, else 25
    if (overall >= 4.5) return 100;
    if (overall >= 3.75) return 75;
    if (overall >= 3.0) return 50;
    return 25;
  };

  const handleSubmitClick = () => {
    // Show confirmation dialog before final submission
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    // Finalize and submit the evaluation
    onSubmit();
    onOpenChange(false);
  };

  const updateSectionB = (field: string, value: number) => {
    setEvaluationForm({
      ...evaluationForm,
      sectionB: { ...(evaluationForm.sectionB || {}), [field]: value }
    });
  };

  const updateSectionC = (field: string, value: number) => {
    setEvaluationForm({
      ...evaluationForm,
      sectionC: { ...(evaluationForm.sectionC || {}), [field]: value }
    });
  };

  React.useEffect(() => {
    if (selectedTrainee && open) {
      const todayObj = new Date();
      const today = todayObj.toISOString().split('T')[0];
      setEvaluationForm({
        ...evaluationForm,
        scholarName: selectedTrainee.name || '',
        ratingPeriod: getRatingPeriodFromTimeline(todayObj),
        talentUnit: getTalentUnitAuto(),
        ratedBy: currentUser?.name || '',
        ratedDate: today
      });
    }
  }, [selectedTrainee, open, currentUser?.name]);


  const RatingButton = ({ value, currentValue, onClick }: { value: number; currentValue: number; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-8 h-8 rounded border-2 transition-all ${
        currentValue === value 
          ? 'bg-blue-500 border-blue-500 text-white' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      {value}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-8 pt-4 sm:pt-6 pb-4 shrink-0 border-b">
          <DialogTitle className="text-2xl">Performance Appraisal of Talent Scholars</DialogTitle>
          <DialogDescription className="text-sm">
            University of Nueva Caceres – Office of the Dean of Student and Alumni Affairs
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="space-y-6 pb-6">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-[#6c757d]">Talent Scholar Name</Label>
                    <p className="mt-1 text-sm text-[#1a1a1a] py-2">{evaluationForm.scholarName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-[#6c757d]">Talent Unit</Label>
                    <p className="mt-1 text-sm text-[#1a1a1a] py-2">{getTalentUnitAuto()}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-[#6c757d]">Rating Period</Label>
                    <p className="mt-1 text-sm text-[#1a1a1a] py-2">{evaluationForm.ratingPeriod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section A - Attendance and Punctuality */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Section A – Attendance and Punctuality</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[60%]">Criteria</TableHead>
                        <TableHead className="text-center w-[8%]">1</TableHead>
                        <TableHead className="text-center w-[8%]">2</TableHead>
                        <TableHead className="text-center w-[8%]">3</TableHead>
                        <TableHead className="text-center w-[8%]">4</TableHead>
                        <TableHead className="text-center w-[8%]">5</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Reports to engagements (internal & external) on time</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA.reportsOnTime} onClick={() => updateSectionA('reportsOnTime', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Reports to engagements regularly</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA.reportsRegularly} onClick={() => updateSectionA('reportsRegularly', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Spends no time away from duties unnecessarily</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA?.noUnnecessaryAbsence ?? 0} onClick={() => updateSectionA('noUnnecessaryAbsence', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Exhibits mastery of assigned tasks/routines</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA.mastersyTasks} onClick={() => updateSectionA('mastersyTasks', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Helps maintain cleanliness and orderliness of venue/office</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA.maintainsCleanliness} onClick={() => updateSectionA('maintainsCleanliness', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-100 font-medium">
                        <TableCell>Total for Part A</TableCell>
                        <TableCell colSpan={5} className="text-center">{calculateSectionATotal()}</TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-100 font-medium">
                        <TableCell>Average</TableCell>
                        <TableCell colSpan={5} className="text-center">{calculateSectionAAverage()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Section B - Commitment & Dedication */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Section B – Commitment & Dedication</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[60%]">Criteria</TableHead>
                        <TableHead className="text-center w-[8%]">1</TableHead>
                        <TableHead className="text-center w-[8%]">2</TableHead>
                        <TableHead className="text-center w-[8%]">3</TableHead>
                        <TableHead className="text-center w-[8%]">4</TableHead>
                        <TableHead className="text-center w-[8%]">5</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Shows interest in improving skills and talents</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionB.improvementInterest ?? 0} onClick={() => updateSectionB('improvementInterest', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Shows interest in doing a good performance</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionB.performanceInterest ?? 0} onClick={() => updateSectionB('performanceInterest', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Exhibits initiative and resourcefulness</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionB.initiative ?? 0} onClick={() => updateSectionB('initiative', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Uses time and resources efficiently</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionB.efficiency ?? 0} onClick={() => updateSectionB('efficiency', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-100 font-medium">
                        <TableCell>Total for Part B</TableCell>
                        <TableCell colSpan={5} className="text-center">{calculateSectionBTotal()}</TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-100 font-medium">
                        <TableCell>Average</TableCell>
                        <TableCell colSpan={5} className="text-center">{calculateSectionBAverage()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Section C - Interpersonal Skills */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Section C – Interpersonal Skills</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[60%]">Criteria</TableHead>
                        <TableHead className="text-center w-[8%]">1</TableHead>
                        <TableHead className="text-center w-[8%]">2</TableHead>
                        <TableHead className="text-center w-[8%]">3</TableHead>
                        <TableHead className="text-center w-[8%]">4</TableHead>
                        <TableHead className="text-center w-[8%]">5</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Works effectively as a member of the talent group</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionC.teamwork} onClick={() => updateSectionC('teamwork', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Demonstrates tact in dealing with others</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionC.tact} onClick={() => updateSectionC('tact', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Exhibits a pleasant disposition</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionC.disposition} onClick={() => updateSectionC('disposition', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-100 font-medium">
                        <TableCell>Total for Part C</TableCell>
                        <TableCell colSpan={5} className="text-center">{calculateSectionCTotal()}</TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-100 font-medium">
                        <TableCell>Average</TableCell>
                        <TableCell colSpan={5} className="text-center">{calculateSectionCAverage()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Overall Rating */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                  <div>
                    <Label className="text-sm text-[#6c757d]">Overall Rating</Label>
                    <div className="text-4xl font-bold mt-2">{calculateOverallRating()}</div>
                    <p className="text-xs text-[#6c757d] mt-1">out of 5.00</p>
                  </div>
                  <div>
                    <Label className="text-sm text-[#6c757d]">Adjectival Rating</Label>
                    <div className="text-3xl font-bold mt-2">{getAdjectivalRating()}</div>
                    <p className="text-xs text-[#6c757d] mt-1">Performance Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scholarship Percentage (Auto-computed) */}
            <Card className="border-2 border-[#7A1E1E]/20 bg-gradient-to-br from-[#7A1E1E]/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#7A1E1E]" />
                  Scholarship Reward Tier
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-[#6c757d]">Automatically assigned based on final computed evaluation score.</p>

                  {(() => {
                    const overallStr = calculateOverallRating();
                    const overall = typeof overallStr === 'string' ? parseFloat(overallStr) : Number(overallStr);
                    const tier = Number.isFinite(overall) ? computeScholarshipTierFromOverall(overall) : 25;
                    return (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-[#7A1E1E]/20 text-center">
                        <p className="text-sm text-[#6B7280]">Assigned Scholarship</p>
                        <p className="text-2xl font-bold text-[#7A1E1E] mt-1">{tier}% Scholarship</p>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>


            {/* Open Text Fields */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Performance Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="strengths" className="text-sm text-[#6c757d]">Talent Scholar's Strengths</Label>
                  <Textarea
                    id="strengths"
                    value={evaluationForm.strengths}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, strengths: e.target.value })}
                    rows={3}
                    className="mt-1"
                    placeholder="Describe the scholar's key strengths and positive attributes..."
                  />
                </div>
                <div>
                  <Label htmlFor="improvements" className="text-sm text-[#6c757d]">Areas for Improvement</Label>
                  <Textarea
                    id="improvements"
                    value={evaluationForm.improvements}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, improvements: e.target.value })}
                    rows={3}
                    className="mt-1"
                    placeholder="Identify areas where the scholar can improve..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recommendation and Evaluation Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recommendation & Evaluation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm text-[#6c757d] mb-3 block">Recommended for renewal?</Label>
                  <RadioGroup
                    value={evaluationForm.recommendForRenewal ? 'yes' : 'no'}
                    onValueChange={(value) => setEvaluationForm({ ...evaluationForm, recommendForRenewal: value === 'yes' })}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="renewal-yes" />
                      <Label htmlFor="renewal-yes" className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="renewal-no" />
                      <Label htmlFor="renewal-no" className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-[#6c757d]">Rated By</Label>
                    <p className="mt-1 text-sm text-[#1a1a1a] py-2">{evaluationForm.ratedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-[#6c757d]">Date Rated</Label>
                    <p className="mt-1 text-sm text-[#1a1a1a] py-2">
                      {evaluationForm.ratedDate ? new Date(evaluationForm.ratedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-8 py-4 shrink-0 border-t border-[#E5E7EB]">
          <Button 
            onClick={handleSubmitClick} 
            className="bg-[#7A1E1E] hover:bg-[#6A1919]"
          >
            Submit Evaluation
          </Button>
        </DialogFooter>

        {/* Evaluation Confirmation Dialog */}
        <EvaluationConfirmationDialog
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          traineeName={selectedTrainee?.name || ''}
          overallRating={calculateOverallRating()}
          adjectivalRating={getAdjectivalRating()}
          scholarshipTier={
            (() => {
              const overallStr = calculateOverallRating();
              const overall = typeof overallStr === 'string' ? parseFloat(overallStr) : Number(overallStr);
              return Number.isFinite(overall) ? computeScholarshipTierFromOverall(overall) : 25;
            })()
          }
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirmation(false)}
        />
      </DialogContent>
    </Dialog>
  );
}