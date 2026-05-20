import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { AlertCircle } from './ui/icons';

interface EvaluationConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traineeName: string;
  overallRating: string;
  adjectivalRating: string;
  scholarshipTier: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EvaluationConfirmationDialog({
  open,
  onOpenChange,
  traineeName,
  overallRating,
  adjectivalRating,
  scholarshipTier,
  onConfirm,
  onCancel
}: EvaluationConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#7A1E1E]" />
            Confirm Evaluation Submission
          </DialogTitle>
          <DialogDescription>
            Please review the evaluation summary before finalizing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="border-[#E5E7EB]">
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-[#6c757d]">Talent Scholar</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">{traineeName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#6c757d]">Overall Rating</p>
                  <p className="text-2xl font-bold text-[#7A1E1E]">{overallRating}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6c757d]">Performance Level</p>
                  <p className="text-lg font-semibold text-[#7A1E1E]">{adjectivalRating}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-[#6c757d]">Assigned Scholarship Reward</p>
                <p className="text-xl font-bold text-blue-900 mt-1">{scholarshipTier}% Scholarship</p>
              </div>

              <p className="text-xs text-[#6c757d]">
                This evaluation will be finalized and cannot be edited after submission.
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-[#E5E7EB] text-[#6c757d]"
          >
            Edit Evaluation
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#7A1E1E] hover:bg-[#6A1919]"
          >
            Confirm & Finalize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
