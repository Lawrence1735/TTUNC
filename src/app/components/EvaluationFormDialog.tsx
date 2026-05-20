import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { GraduationCap } from './ui/icons';
import type { User } from '../App';
import type { Evaluation } from './types';

interface EvaluationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTrainee?: User | null;
  evaluationForm: Evaluation;
  setEvaluationForm: (form: React.SetStateAction<Evaluation>) => void;
}

export function EvaluationFormDialog({
  open,
  onOpenChange,
  selectedTrainee,
  evaluationForm,
  setEvaluationForm,
}: EvaluationFormDialogProps) {
  // Return null if required data is not loaded yet
  if (!open || !selectedTrainee || !evaluationForm) {
    return null;
  }

  const updateSectionA = (field: string, value: number) => {
    setEvaluationForm(prev => ({
      ...prev,
      sectionA: { ...prev.sectionA, [field]: value }
    }));
  };

  const updateSectionB = (field: string, value: number) => {
    setEvaluationForm(prev => ({
      ...prev,
      sectionB: { ...prev.sectionB, [field]: value }
    }));
  };

  const updateSectionC = (field: string, value: number) => {
    setEvaluationForm(prev => ({
      ...prev,
      sectionC: { ...prev.sectionC, [field]: value }
    }));
  };

  // Helper functions for calculations
  const calculateSectionATotal = (): number => {
    const section = evaluationForm.sectionA;
    if (!section) return 0;
    return (section.reportsOnTime || 0) + (section.reportsRegularly || 0) + (section.practicesOnTime || 0) 
      + (section.practicesRegularly || 0) + (section.noUnnecessaryAbsence || 0) + (section.mastersyTasks || 0) + (section.maintainsCleanliness || 0);
  };

  const calculateSectionAAverage = (): string => {
    const total = calculateSectionATotal();
    return total > 0 ? (total / 7).toFixed(2) : '0.00';
  };

  const calculateSectionBTotal = (): number => {
    const section = evaluationForm.sectionB;
    if (!section) return 0;
    return (section.improvementInterest || 0) + (section.performanceInterest || 0) + (section.workEthic || 0) 
      + (section.initiative || 0) + (section.efficiency || 0);
  };

  const calculateSectionBAverage = (): string => {
    const total = calculateSectionBTotal();
    return total > 0 ? (total / 5).toFixed(2) : '0.00';
  };

  const calculateSectionCTotal = (): number => {
    const section = evaluationForm.sectionC;
    if (!section) return 0;
    return (section.teamwork || 0) + (section.tact || 0) + (section.courtesy || 0) + (section.disposition || 0);
  };

  const calculateSectionCAverage = (): string => {
    const total = calculateSectionCTotal();
    return total > 0 ? (total / 4).toFixed(2) : '0.00';
  };

  const calculateOverallRating = (): string => {
    const totals = [calculateSectionATotal(), calculateSectionBTotal(), calculateSectionCTotal()];
    const grandTotal = totals.reduce((a, b) => a + b, 0);
    const maxPossible = (7 + 5 + 4) * 5; // 16 criteria * 5 points max
    return maxPossible > 0 ? ((grandTotal / maxPossible) * 5).toFixed(2) : '0.00';
  };

  const getAdjectivalRating = (): string => {
    const rating = parseFloat(calculateOverallRating());
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Very Good';
    if (rating >= 2.5) return 'Good';
    if (rating >= 1.5) return 'Fair';
    return 'Poor';
  };

  React.useEffect(() => {
    if (selectedTrainee && open) {
      // Initialize evaluation with selected trainee data
      // scholarName, talentUnit, ratingPeriod will be filled via component props
    }
  }, [selectedTrainee, open]);

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
                    <p className="mt-1 text-sm text-[#1a1a1a] py-2">{selectedTrainee?.name || 'Loading...'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-[#6c757d]">Talent Unit</Label>
                    <p className="mt-1 text-sm text-[#1a1a1a] py-2">{selectedTrainee?.talentGroup || 'Loading...'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-[#6c757d]">Rating Period</Label>
                    <p className="mt-1 text-sm text-[#1a1a1a] py-2">2nd Semester, SY 2024-2025</p>
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
                            <RatingButton value={val} currentValue={evaluationForm.sectionA?.reportsOnTime || 0} onClick={() => updateSectionA('reportsOnTime', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Reports to engagements regularly</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA?.reportsRegularly || 0} onClick={() => updateSectionA('reportsRegularly', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Reports to practices/rehearsals on time</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA?.practicesOnTime || 0} onClick={() => updateSectionA('practicesOnTime', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Reports to practices/rehearsals regularly</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA?.practicesRegularly || 0} onClick={() => updateSectionA('practicesRegularly', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Spends no time away from duties unnecessarily</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA?.noUnnecessaryAbsence || 0} onClick={() => updateSectionA('noUnnecessaryAbsence', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Exhibits mastery of assigned tasks/routines</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA?.mastersyTasks || 0} onClick={() => updateSectionA('mastersyTasks', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Helps maintain cleanliness and orderliness of venue/office</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionA?.maintainsCleanliness || 0} onClick={() => updateSectionA('maintainsCleanliness', val)} />
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
                            <RatingButton value={val} currentValue={evaluationForm.sectionB?.improvementInterest || 0} onClick={() => updateSectionB('improvementInterest', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Shows interest in doing a good performance</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionB?.performanceInterest || 0} onClick={() => updateSectionB('performanceInterest', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Demonstrates strong work ethic</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionB?.workEthic || 0} onClick={() => updateSectionB('workEthic', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Exhibits initiative and resourcefulness</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionB?.initiative || 0} onClick={() => updateSectionB('initiative', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Uses time and resources efficiently</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionB?.efficiency || 0} onClick={() => updateSectionB('efficiency', val)} />
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
                            <RatingButton value={val} currentValue={evaluationForm.sectionC?.teamwork || 0} onClick={() => updateSectionC('teamwork', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Demonstrates tact in dealing with others</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionC?.tact || 0} onClick={() => updateSectionC('tact', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Treats everyone with courtesy and respect</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionC?.courtesy || 0} onClick={() => updateSectionC('courtesy', val)} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50/50">
                        <TableCell>Exhibits a pleasant disposition</TableCell>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TableCell key={val} className="text-center">
                            <RatingButton value={val} currentValue={evaluationForm.sectionC?.disposition || 0} onClick={() => updateSectionC('disposition', val)} />
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

            {/* Scholarship Percentage */}
            <Card className="border-2 border-[#7A1E1E]/20 bg-gradient-to-br from-[#7A1E1E]/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#7A1E1E]" />
                  Scholarship Percentage
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm text-[#6c757d]">Select the scholarship grant percentage</Label>
                  <Select
                    value={evaluationForm.scholarshipPercentage?.toString() || ''}
                    onValueChange={(value) => setEvaluationForm({ ...evaluationForm, scholarshipPercentage: parseInt(value) })}
                  >
                    <SelectTrigger className="h-12 text-lg border-2 hover:border-[#7A1E1E]/50 transition-colors">
                      <SelectValue placeholder="Select scholarship percentage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25" className="text-lg py-3">
                        <div className="flex items-center justify-between w-full">
                          <span>25%</span>
                          <span className="text-sm text-[#6c757d] ml-4">Quarter Scholarship</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="50" className="text-lg py-3">
                        <div className="flex items-center justify-between w-full">
                          <span>50%</span>
                          <span className="text-sm text-[#6c757d] ml-4">Half Scholarship</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="75" className="text-lg py-3">
                        <div className="flex items-center justify-between w-full">
                          <span>75%</span>
                          <span className="text-sm text-[#6c757d] ml-4">Three-Quarter Scholarship</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="100" className="text-lg py-3">
                        <div className="flex items-center justify-between w-full">
                          <span>100%</span>
                          <span className="text-sm text-[#6c757d] ml-4">Full Scholarship</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {evaluationForm.scholarshipPercentage && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-[#7A1E1E]/20 text-center">
                      <p className="text-sm text-[#6B7280]">Recommended Scholarship</p>
                      <p className="text-2xl font-bold text-[#7A1E1E] mt-1">{evaluationForm.scholarshipPercentage}% Scholarship</p>
                    </div>
                  )}
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
          <Button onClick={() => onOpenChange(false)} variant="outline" className="mr-2">Cancel</Button>
          <Button className="bg-[#7A1E1E] hover:bg-[#6A1919]">Submit Evaluation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}