import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle } from './ui/icons';
import { getChapterRubric } from './chapterRubrics';

interface ChapterEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterNum: number;
  traineeName: string;
  talentGroup: string;
  onComplete: (chapterNum: number, scores: Record<string, number>, notes: string) => void;
}

const RATING_VALUES = [1, 2, 4, 5];
const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  4: 'Good',
  5: 'Excellent',
};

export function ChapterEvaluationDialog({
  open,
  onOpenChange,
  chapterNum,
  traineeName,
  talentGroup,
  onComplete,
}: ChapterEvaluationDialogProps) {
  const rubric = getChapterRubric(talentGroup, chapterNum);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!rubric) return null;

  const allRated = rubric.criteria.every(c => scores[c.key] !== undefined);
  const avgScore = allRated
    ? (Object.values(scores).reduce((a, b) => a + b, 0) / rubric.criteria.length).toFixed(2)
    : null;

  const handleSubmit = () => {
    if (!allRated) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onComplete(chapterNum, scores, notes);
    setShowConfirm(false);
    setScores({});
    setNotes('');
  };

  const RatingButton = ({ value, criterion }: { value: number; criterion: string }) => {
    const isSelected = scores[criterion] === value;
    return (
      <button
        type="button"
        onClick={() => setScores(prev => ({ ...prev, [criterion]: value }))}
        title={RATING_LABELS[value]}
        className={`w-9 h-9 rounded-lg border-2 transition-all text-sm font-medium ${
          isSelected
            ? 'bg-[#7A1E1E] border-[#7A1E1E] text-white shadow-sm'
            : 'border-gray-200 text-[#6c757d] hover:border-[#7A1E1E]/50 hover:text-[#7A1E1E]'
        }`}
      >
        {value}
      </button>
    );
  };

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={(v) => { if (!v) { setScores({}); setNotes(''); } onOpenChange(v); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-[#7A1E1E] text-white text-xs">Chapter {chapterNum}</Badge>
              <DialogTitle className="text-lg">{rubric.title}</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-[#6c757d] mt-1">
              <span className="font-medium text-[#1a1a1a]">Trainee:</span> {traineeName} &nbsp;·&nbsp;
              <span className="italic">{rubric.objective}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Rate each criterion using 1 (Poor), 2 (Fair), 4 (Good), or 5 (Excellent). All criteria must be rated before submitting.
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[55%]">Criterion</TableHead>
                    {RATING_VALUES.map(v => (
                      <TableHead key={v} className="text-center w-[10%] text-xs">
                        <div>{v}</div>
                        <div className="text-[10px] text-[#6c757d] font-normal">{RATING_LABELS[v]}</div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center w-[10%] text-xs">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rubric.criteria.map((criterion, idx) => (
                    <TableRow key={criterion.key} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <TableCell className="py-3 text-sm">
                        {criterion.label}
                      </TableCell>
                      {RATING_VALUES.map(v => (
                        <TableCell key={v} className="text-center py-2">
                          <div className="flex justify-center">
                            <RatingButton value={v} criterion={criterion.key} />
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-center py-2">
                        {scores[criterion.key] !== undefined ? (
                          <span className={`font-semibold ${
                            scores[criterion.key] >= 4 ? 'text-green-600' :
                            scores[criterion.key] >= 2 ? 'text-amber-600' :
                            'text-red-500'
                          }`}>{scores[criterion.key]}</span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {avgScore && (
                    <TableRow className="bg-gray-100 font-medium">
                      <TableCell className="py-2">Chapter Average</TableCell>
                      <TableCell colSpan={4} className="text-center py-2">
                        <span className={`text-lg font-bold ${
                          parseFloat(avgScore) >= 4 ? 'text-green-600' :
                          parseFloat(avgScore) >= 2 ? 'text-amber-600' :
                          'text-red-500'
                        }`}>{avgScore} / 5.00</span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <Label className="text-sm text-[#6c757d]">Chapter Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any observations or feedback specific to this chapter..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2 flex-row justify-between items-center">
            <p className="text-xs text-[#6c757d]">
              {allRated
                ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />All criteria rated</span>
                : `${rubric.criteria.length - Object.keys(scores).length} remaining`
              }
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setScores({}); setNotes(''); onOpenChange(false); }}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={!allRated}
                className="bg-[#7A1E1E] hover:bg-[#6A1919] disabled:opacity-40"
              >
                Submit & Complete Chapter
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#7A1E1E]">
              <AlertCircle className="w-5 h-5" />
              Confirm Chapter Completion
            </DialogTitle>
            <DialogDescription>
              Submit Chapter {chapterNum} evaluation for <strong>{traineeName}</strong>? This will mark the chapter as complete. <strong>This cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          {avgScore && (
            <div className="bg-[#7A1E1E]/5 border border-[#7A1E1E]/20 rounded-lg p-3 text-sm text-center">
              <p className="text-[#6c757d] text-xs mb-1">Chapter Average Score</p>
              <p className="text-2xl font-bold text-[#7A1E1E]">{avgScore} / 5.00</p>
            </div>
          )}
          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Go Back</Button>
            <Button onClick={handleConfirm} className="bg-[#7A1E1E] hover:bg-[#6A1919]">
              Confirm & Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
