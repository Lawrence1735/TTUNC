import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Shirt, Music, Package, TrendingUp, Users, Eye, CheckCircle, FileText, Search, ChevronRight } from './ui/icons';
import { DashboardQuickStatCard } from './ui/DashboardQuickStatCard';

interface DirectorMemberProfileTabProps {
  activeScholars: number;
  renewalRate: number;
  isDanceClub: boolean;
  isMarchingBand: boolean;
  isGleeClub: boolean;
  scholars: any[];
  scholarAssignments: Record<string, any>;
  traineeVoices: Record<string, string>;
  evaluations: any[];
  isReadyForEvaluation: (id: string) => boolean;
  setSelectedScholar: (s: any) => void;
  setShowScholarDialog: (v: boolean) => void;
  setSelectedScholarForPerformance: (s: any) => void;
  setShowPerformanceDialog: (v: boolean) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  scholarSearchTerm: string;
  setScholarSearchTerm: (v: string) => void;
  inventoryTab: string;
  setInventoryTab: (v: string) => void;
  uniformFilters: any;
  setUniformFilters: (v: any) => void;
  uniformSets: string[];
  filteredUniforms: any[];
  setShowAssignUniformDialog: (v: boolean) => void;
  setSelectedUniform: (u: any) => void;
  setAssignScholarId: (v: string) => void;
  setShowViewUniformDialog: (v: boolean) => void;
  instrumentFilters: any;
  setInstrumentFilters: (v: any) => void;
  instrumentTypes: string[];
  filteredInstruments: any[];
  setShowAssignInstrumentDialog: (v: boolean) => void;
  setSelectedInstrument: (i: any) => void;
  setShowViewInstrumentDialog: (v: boolean) => void;
  accessoryFilters: any;
  setAccessoryFilters: (v: any) => void;
  accessoryTypes: string[];
  filteredAccessories: any[];
  setShowAssignAccessoryDialog: (v: boolean) => void;
  setSelectedAccessory: (a: any) => void;
  setShowViewAccessoryDialog: (v: boolean) => void;
}

export function DirectorMemberProfileTab({
  activeScholars,
  renewalRate,
  isDanceClub,
  isMarchingBand,
  isGleeClub,
  scholars,
  scholarAssignments,
  traineeVoices,
  evaluations,
  isReadyForEvaluation,
  setSelectedScholar,
  setShowScholarDialog,
  setSelectedScholarForPerformance,
  setShowPerformanceDialog,
  statusFilter,
  setStatusFilter,
  scholarSearchTerm,
  setScholarSearchTerm,
  inventoryTab,
  setInventoryTab,
  uniformFilters,
  setUniformFilters,
  uniformSets,
  filteredUniforms,
  setShowAssignUniformDialog,
  setSelectedUniform,
  setAssignScholarId,
  setShowViewUniformDialog,
  instrumentFilters,
  setInstrumentFilters,
  instrumentTypes,
  filteredInstruments,
  setShowAssignInstrumentDialog,
  setSelectedInstrument,
  setShowViewInstrumentDialog,
  accessoryFilters,
  setAccessoryFilters,
  accessoryTypes,
  filteredAccessories,
  setShowAssignAccessoryDialog,
  setSelectedAccessory,
  setShowViewAccessoryDialog,
}: DirectorMemberProfileTabProps) {
  const getScholarshipPercentage = (scholar: any): number => {
    const directValue = Number(scholar?.scholarshipPercentage ?? scholar?.scholarship_percentage);
    if (Number.isFinite(directValue)) return directValue;

    const latestEvaluation = [...evaluations]
      .filter((evaluation: any) => String(evaluation?.traineeId) === String(scholar?.id))
      .sort((a: any, b: any) => {
        const dateA = new Date(a?.date || a?.evaluation_date || a?.evaluationDate || 0).getTime();
        const dateB = new Date(b?.date || b?.evaluation_date || b?.evaluationDate || 0).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return Number(b?.id || 0) - Number(a?.id || 0);
      })[0];

    const evaluationValue = Number(
      latestEvaluation?.scholarshipPercentage ?? latestEvaluation?.scholarship_percentage
    );
    return Number.isFinite(evaluationValue) ? evaluationValue : 0;
  };

  return (
          <TabsContent value="member-profile" id="tab-panel-member-profile" role="tabpanel" aria-label="Member Profile" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DashboardQuickStatCard
                label="Active Scholars"
                value={activeScholars}
                onClick={() => setStatusFilter('active')}
              />

              <DashboardQuickStatCard
                label="Renewal Rate"
                value={`${renewalRate}%`}
                onClick={() => setStatusFilter('all')}
              />

              {!isDanceClub && (
                <DashboardQuickStatCard
                  label="Assigned Uniforms"
                  value={24}
                  onClick={() => setInventoryTab('uniforms')}
                />
              )}

              {isMarchingBand && (
                <DashboardQuickStatCard
                  label="Assigned Instruments"
                  value={18}
                  onClick={() => setInventoryTab('instruments')}
                />
              )}
            </div>

            {/* Merged Scholar Directory & Evaluation */}
            <Card className="border-[1.6px] border-[#e0e0e0] shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Scholar Directory & Evaluation
                    </CardTitle>
                    <CardDescription>Manage scholar profiles, contact information, and evaluations</CardDescription>
                  </div>
                  <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scholars</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6c757d]" />
                    <Input
                      type="text"
                      placeholder="Search by name or student ID..."
                      value={scholarSearchTerm}
                      onChange={(e) => setScholarSearchTerm(e.target.value)}
                      className="pl-11 pr-4 py-[12px]"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                </div>

                {scholars.length === 0 ? (
                  <p className="text-center text-[#6c757d] py-8">
                    {scholarSearchTerm ? 'No scholars match your search' : statusFilter === 'all' ? 'No scholars found' : `No ${statusFilter} scholars found`}
                  </p>
                ) : (
                  <>
                    {/* Mobile: tappable card list */}
                    <div className="md:hidden space-y-2 overflow-y-auto max-h-[640px]">
                      {scholars.map((scholar) => {
                        const scholarStatus = scholarAssignments[scholar.id!]?.status || 'active';
                        const scholarshipPercentage = getScholarshipPercentage(scholar);
                        const readyForEval = isReadyForEvaluation(scholar.id!);
                        return (
                          <div key={scholar.id} className="border border-[#e0e0e0] rounded-lg overflow-hidden">
                            <div
                              className="p-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                              onClick={() => { setSelectedScholar(scholar); setShowScholarDialog(true); }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-[#1a1a1a] truncate">{scholar.name}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge className={scholarStatus === 'active' ? 'bg-green-600 text-[10px]' : 'bg-gray-500 text-[10px]'}>
                                    {scholarStatus === 'active' ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <ChevronRight className="w-4 h-4 text-[#6c757d]" />
                                </div>
                              </div>
                              <p className="text-xs text-[#6c757d] mt-1">{scholar.studentId} · {scholarshipPercentage}% scholarship</p>
                            </div>
                            <div
                              className="px-3 py-2 bg-gray-50 border-t border-[#e0e0e0] flex items-center justify-between cursor-pointer hover:bg-[#7A1E1E]/5 active:bg-[#7A1E1E]/10 transition-colors"
                              onClick={() => {
                                const resolvedScholarship = getScholarshipPercentage(scholar);
                                setSelectedScholarForPerformance({
                                  ...scholar,
                                  scholarshipPercentage: resolvedScholarship,
                                });
                                setShowPerformanceDialog(true);
                              }}
                            >
                              <span className="text-xs text-[#7A1E1E]">View Performance & Evaluate</span>
                              <TrendingUp className="w-3 h-3 text-[#7A1E1E]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop: clickable table */}
                    <div className="hidden md:block border border-[#e0e0e0] rounded-lg overflow-auto max-h-[420px]">
                      <Table className="min-w-max">
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Instrument</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Scholarship</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scholars.map((scholar) => {
                            const scholarStatus = scholarAssignments[scholar.id!]?.status || 'active';
                            const scholarshipPercentage = getScholarshipPercentage(scholar);
                            const readyForEval = isReadyForEvaluation(scholar.id!);
                            const instrument = scholar.assignedInstrument || traineeVoices[scholar.id!] || '—';
                            return (
                              <TableRow key={scholar.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium cursor-pointer" onClick={() => { setSelectedScholar(scholar); setShowScholarDialog(true); }}>{scholar.name}</TableCell>
                                <TableCell>{instrument}</TableCell>
                                <TableCell>
                                  <Badge className={scholarStatus === 'active' ? 'bg-green-600' : 'bg-gray-500'}>
                                    {scholarStatus === 'active' ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{scholarshipPercentage}%</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const resolvedScholarship = getScholarshipPercentage(scholar);
                                      setSelectedScholarForPerformance({
                                        ...scholar,
                                        scholarshipPercentage: resolvedScholarship,
                                      });
                                      setShowPerformanceDialog(true);
                                    }}
                                    className="border-[#7A1E1E] text-[#7A1E1E] hover:bg-[#7A1E1E] hover:text-white"
                                  >
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Evaluate
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Evaluation Requirements */}
            <Card className="border-[1.6px] border-[#e0e0e0] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Scholarship Renewal Evaluation Criteria
                </CardTitle>
                <CardDescription>Performance evaluation sections and rating structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 bg-[#EEF2F7]">
                          <th className="text-left px-4 py-3 text-slate-800 font-medium">Section</th>
                          <th className="text-left px-4 py-3 text-slate-800 font-medium">Criteria Items</th>
                          <th className="text-center px-4 py-3 text-slate-800 font-medium">Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-slate-800">Section A: Attendance & Punctuality</td>
                          <td className="px-4 py-3.5 text-sm text-slate-600">
                            Reports on time, reports regularly, practices on time/regularly, no unnecessary absence, mastery of tasks, maintains cleanliness
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge className="bg-[#7A1E1E]">7 items</Badge>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-slate-800">Section B: Commitment & Dedication</td>
                          <td className="px-4 py-3.5 text-sm text-slate-600">
                            Improvement interest, performance interest, work ethic, initiative, resource efficiency
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge className="bg-[#7A1E1E]">5 items</Badge>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-slate-800">Section C: Interpersonal Skills</td>
                          <td className="px-4 py-3.5 text-sm text-slate-600">
                            Teamwork, tact, courtesy and respect, pleasant disposition
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge className="bg-[#7A1E1E]">4 items</Badge>
                          </td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td colSpan={2} className="px-4 py-3.5 font-medium text-right text-slate-800">TOTAL EVALUATION ITEMS</td>
                          <td className="px-4 py-3.5 text-center">
                            <Badge className="bg-green-600">16 items</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded">
                      <p className="text-sm font-medium">Rating Scale for Each Criterion:</p>
                      <p className="text-sm text-[#6c757d] mt-2">
                        Each item uses the current evaluation scale values:
                      </p>
                      <ul className="text-sm text-[#6c757d] mt-2 space-y-1 ml-4">
                        <li>• <span className="font-medium">5</span> - Outstanding</li>
                        <li>• <span className="font-medium">4</span> - Very Satisfactory</li>
                        <li>• <span className="font-medium">2</span> - Fair</li>
                        <li>• <span className="font-medium">1</span> - Needs Improvement</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50 border-l-4 border-amber-600 rounded">
                      <p className="text-sm font-medium">Scholarship Percentage Options:</p>
                      <ul className="text-sm text-[#6c757d] mt-2 space-y-1 ml-4">
                        <li>• <span className="font-medium">100%</span> - Full scholarship grant</li>
                        <li>• <span className="font-medium">50%</span> - Half scholarship grant</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-[#7A1E1E]">
                      <p className="font-medium text-center mb-2">Overall Rating Calculation</p>
                      <p className="text-sm text-[#6c757d] text-center">
                        Final rating is the average of all section averages, resulting in an overall score out of 5.00
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Management - Uniforms, Instruments, and Accessories */}
            {!isDanceClub && (
            <Card className="border-[1.6px] border-[#e0e0e0] shadow-md">
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  {isDanceClub || isGleeClub 
                    ? 'Create and manage uniform templates' 
                    : 'Create and manage uniform, instrument, and accessory templates'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Inventory Tabs */}
                <Tabs value={inventoryTab} onValueChange={setInventoryTab} className="mb-6">
                  <TabsList className="bg-white border border-[#E0E0E0] p-1 gap-1 overflow-x-auto scrollbar-hide h-auto w-full justify-start">
                    <TabsTrigger
                      value="uniforms"
                      className="data-[state=active]:bg-[#7A1E1E] data-[state=active]:text-white px-3 sm:px-4 py-2 shrink-0 whitespace-nowrap"
                    >
                      <Shirt className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Uniforms</span>
                    </TabsTrigger>
                    {isMarchingBand && (
                      <TabsTrigger
                        value="instruments"
                        className="data-[state=active]:bg-[#7A1E1E] data-[state=active]:text-white px-3 sm:px-4 py-2 shrink-0 whitespace-nowrap"
                      >
                        <Music className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Instruments</span>
                      </TabsTrigger>
                    )}
                    {!isDanceClub && !isGleeClub && (
                      <TabsTrigger
                        value="accessories"
                        className="data-[state=active]:bg-[#7A1E1E] data-[state=active]:text-white px-3 sm:px-4 py-2 shrink-0 whitespace-nowrap"
                      >
                        <Package className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Accessories</span>
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>

                {/* Uniforms Tab */}
                {inventoryTab === 'uniforms' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2">
                        <Select value={uniformFilters.uniformSet} onValueChange={(val) => setUniformFilters({ ...uniformFilters, uniformSet: val })}>
                          <SelectTrigger className="w-full sm:w-[200px] text-xs sm:text-sm">
                            <SelectValue placeholder="Uniform Set" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniformSets.map(set => (
                              <SelectItem key={set} value={set}>
                                {set === 'all' ? 'All Uniform Sets' : set}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={uniformFilters.condition} onValueChange={(val) => setUniformFilters({ ...uniformFilters, condition: val })}>
                          <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                            <SelectValue placeholder="Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Conditions</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="bad">Bad</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={uniformFilters.status} onValueChange={(val) => setUniformFilters({ ...uniformFilters, status: val })}>
                          <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => setShowAssignUniformDialog(true)}
                        className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full sm:w-auto"
                      >
                        Add New Uniform Set
                      </Button>
                    </div>
                    {filteredUniforms.length === 0 ? (
                      <p className="text-center text-[#6c757d] py-8 text-sm">No uniform sets found matching the selected filters</p>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-2 overflow-y-auto max-h-[640px]">
                          {filteredUniforms.map(uniform => (
                            <div key={uniform.id} className="p-3 border border-[#e0e0e0] rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                              onClick={() => { setSelectedUniform(uniform); if (uniform.status === 'assigned') { const s = scholars.find(x => x.name === uniform.assignedTo); setAssignScholarId(s?.id || ''); } else { setAssignScholarId(''); } setShowViewUniformDialog(true); }}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-[#1a1a1a] truncate">{uniform.serialNumber}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Badge className={uniform.condition === 'good' ? 'bg-[rgb(22,163,74)] text-white text-[10px]' : 'bg-[rgb(192,59,59)] text-white text-[10px]'}>{uniform.condition === 'good' ? 'Good' : 'Bad'}</Badge>
                                  {uniform.status === 'assigned' ? <Badge className="bg-[rgb(0,71,181)] text-white text-[10px]">Assigned</Badge> : <Badge variant="outline" className="border-[#6c757d] text-[#6c757d] text-[10px]">Available</Badge>}
                                  <ChevronRight className="w-4 h-4 text-[#6c757d]" />
                                </div>
                              </div>
                              <p className="text-xs text-[#6c757d] mt-1">{uniform.uniformSet}{uniform.assignedTo ? ` · ${uniform.assignedTo}` : ''}</p>
                            </div>
                          ))}
                        </div>
                        {/* Desktop table */}
                        <div className="hidden md:block border rounded-lg overflow-auto max-h-[420px]">
                          <Table className="min-w-max">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Uniform Set</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUniforms.map(uniform => (
                                <TableRow key={uniform.id} className="cursor-pointer hover:bg-gray-50"
                                  onClick={() => { setSelectedUniform(uniform); if (uniform.status === 'assigned') { const s = scholars.find(x => x.name === uniform.assignedTo); setAssignScholarId(s?.id || ''); } else { setAssignScholarId(''); } setShowViewUniformDialog(true); }}>
                                  <TableCell className="text-sm">{uniform.serialNumber}</TableCell>
                                  <TableCell>{uniform.uniformSet}</TableCell>
                                  <TableCell><Badge className={uniform.condition === 'good' ? 'bg-[rgb(22,163,74)] text-white' : 'bg-[rgb(192,59,59)] text-white'}>{uniform.condition === 'good' ? 'Good' : 'Bad'}</Badge></TableCell>
                                  <TableCell>{uniform.status === 'assigned' ? <Badge className="bg-[rgb(0,71,181)] text-white">Assigned</Badge> : <Badge variant="outline" className="border-[#6c757d] text-[#6c757d]">Available</Badge>}</TableCell>
                                  <TableCell>{uniform.assignedTo || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Instruments Tab */}
                {inventoryTab === 'instruments' && isMarchingBand && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                        <Select value={instrumentFilters.instrumentType} onValueChange={(val) => setInstrumentFilters({ ...instrumentFilters, instrumentType: val })}>
                          <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                            <SelectValue placeholder="Instrument Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {instrumentTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type === 'all' ? 'All Instruments' : type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={instrumentFilters.condition} onValueChange={(val) => setInstrumentFilters({ ...instrumentFilters, condition: val })}>
                          <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                            <SelectValue placeholder="Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Conditions</SelectItem>
                            <SelectItem value="good">Good Condition</SelectItem>
                            <SelectItem value="bad">Bad Condition</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={instrumentFilters.propertyType} onValueChange={(val) => setInstrumentFilters({ ...instrumentFilters, propertyType: val })}>
                          <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                            <SelectValue placeholder="Property Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            <SelectItem value="unc-property">UNC Property</SelectItem>
                            <SelectItem value="own-property">Own Property</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={instrumentFilters.status} onValueChange={(val) => setInstrumentFilters({ ...instrumentFilters, status: val })}>
                          <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => setShowAssignInstrumentDialog(true)}
                        className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full sm:w-auto"
                      >
                        Add New Instrument
                      </Button>
                    </div>
                    {filteredInstruments.length === 0 ? (
                      <p className="text-center text-[#6c757d] py-8 text-sm">No instruments found matching the selected filters</p>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-2 overflow-y-auto max-h-[640px]">
                          {filteredInstruments.map(instrument => (
                            <div key={instrument.id} className="p-3 border border-[#e0e0e0] rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                              onClick={() => { setSelectedInstrument(instrument); if (instrument.status === 'assigned') { const s = scholars.find(x => x.name === instrument.assignedTo); setAssignScholarId(s?.id || ''); } else { setAssignScholarId(''); } setShowViewInstrumentDialog(true); }}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-[#1a1a1a] truncate">{instrument.serialNumber}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Badge className={instrument.condition === 'good' ? 'bg-[rgb(22,163,74)] text-white text-[10px]' : 'bg-[rgb(192,59,59)] text-white text-[10px]'}>{instrument.condition === 'good' ? 'Good' : 'Bad'}</Badge>
                                  {instrument.status === 'assigned' ? <Badge className="bg-[rgb(0,71,181)] text-white text-[10px]">Assigned</Badge> : <Badge variant="outline" className="border-[#6c757d] text-[#6c757d] text-[10px]">Available</Badge>}
                                  <ChevronRight className="w-4 h-4 text-[#6c757d]" />
                                </div>
                              </div>
                              <p className="text-xs text-[#6c757d] mt-1">{instrument.instrumentType} · {instrument.brand} {instrument.model}{instrument.assignedTo ? ` · ${instrument.assignedTo}` : ''}</p>
                            </div>
                          ))}
                        </div>
                        {/* Desktop table */}
                        <div className="hidden md:block border rounded-lg overflow-auto max-h-[420px]">
                          <Table className="min-w-max">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Instrument Type</TableHead>
                                <TableHead>Brand/Model</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Property Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredInstruments.map(instrument => (
                                <TableRow key={instrument.id} className="cursor-pointer hover:bg-gray-50"
                                  onClick={() => { setSelectedInstrument(instrument); if (instrument.status === 'assigned') { const s = scholars.find(x => x.name === instrument.assignedTo); setAssignScholarId(s?.id || ''); } else { setAssignScholarId(''); } setShowViewInstrumentDialog(true); }}>
                                  <TableCell className="text-sm">{instrument.serialNumber}</TableCell>
                                  <TableCell>{instrument.instrumentType}</TableCell>
                                  <TableCell>{instrument.brand} {instrument.model}</TableCell>
                                  <TableCell><Badge className={instrument.condition === 'good' ? 'bg-[rgb(22,163,74)] text-white' : 'bg-[rgb(192,59,59)] text-white'}>{instrument.condition === 'good' ? 'Good' : 'Bad'}</Badge></TableCell>
                                  <TableCell>{instrument.propertyType === 'unc-property' ? <Badge variant="outline" className="border-[#7A1E1E] text-[#7A1E1E]">UNC Property</Badge> : <Badge variant="secondary" className="bg-gray-100 text-[#6c757d] border border-gray-300">Own Property</Badge>}</TableCell>
                                  <TableCell>{instrument.status === 'assigned' ? <Badge className="bg-[rgb(0,71,181)] text-white">Assigned</Badge> : <Badge variant="outline" className="border-[#6c757d] text-[#6c757d]">Available</Badge>}</TableCell>
                                  <TableCell>{instrument.assignedTo || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Accessories Tab */}
                {inventoryTab === 'accessories' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <Select value={accessoryFilters.accessoryType} onValueChange={(val) => setAccessoryFilters({ ...accessoryFilters, accessoryType: val })}>
                        <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                          <SelectValue placeholder="Accessory Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {accessoryTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type === 'all' ? 'All Accessories' : type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => setShowAssignAccessoryDialog(true)}
                        className="bg-[#7A1E1E] hover:bg-[#6A1919] w-full sm:w-auto"
                      >
                        Add New Accessory
                      </Button>
                    </div>
                    {filteredAccessories.length === 0 ? (
                      <p className="text-center text-[#6c757d] py-8 text-sm">No accessories found matching the selected filters</p>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="md:hidden space-y-2 overflow-y-auto max-h-[640px]">
                          {filteredAccessories.map(accessory => (
                            <div key={accessory.id} className="p-3 border border-[#e0e0e0] rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                              onClick={() => { setSelectedAccessory(accessory); setShowViewAccessoryDialog(true); }}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-[#1a1a1a] truncate">{accessory.accessoryName || accessory.description}</span>
                                <ChevronRight className="w-4 h-4 text-[#6c757d] shrink-0" />
                              </div>
                              <p className="text-xs text-[#6c757d] mt-1">{accessory.accessoryType} · Qty: {accessory.quantity}</p>
                            </div>
                          ))}
                        </div>
                        {/* Desktop table */}
                        <div className="hidden md:block border rounded-lg overflow-auto max-h-[420px]">
                          <Table className="min-w-max">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Accessory Name</TableHead>
                                <TableHead>Accessory Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Quantity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredAccessories.map(accessory => (
                                <TableRow key={accessory.id} className="cursor-pointer hover:bg-gray-50"
                                  onClick={() => { setSelectedAccessory(accessory); setShowViewAccessoryDialog(true); }}>
                                  <TableCell className="font-medium">{accessory.accessoryName || accessory.description}</TableCell>
                                  <TableCell>{accessory.accessoryType}</TableCell>
                                  <TableCell className="text-[#6c757d]">{accessory.description}</TableCell>
                                  <TableCell>{accessory.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </TabsContent>
  );
}
