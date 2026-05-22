import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { Target, CheckCircle, AlertCircle, Trash2, Plus } from './ui/icons';
import { toast } from 'sonner';
import type { MicroTarget } from './types';

interface DirectorMicroTaskUtilityProps {
  traineeId: string;
  traineeName: string;
  directorId: string;
  directorName: string;
  microTargets: MicroTarget[];
  onAddTarget: (target: MicroTarget) => void;
  onUpdateTarget: (target: MicroTarget) => void;
  onDeleteTarget: (targetId: string) => void;
  onMarkTargetComplete: (targetId: string) => void;
}

export function DirectorMicroTaskUtility({
  traineeId,
  traineeName,
  directorId,
  directorName,
  microTargets,
  onAddTarget,
  onUpdateTarget,
  onDeleteTarget,
  onMarkTargetComplete
}: DirectorMicroTaskUtilityProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');
  const [targetDate, setTargetDate] = useState('');

  const handleAddTarget = () => {
    if (!goalText.trim() || !targetDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const newTarget: MicroTarget = {
      id: `target_${Date.now()}`,
      traineeId,
      createdBy: directorId,
      goalText: goalText.trim(),
      timeframe,
      targetDate: new Date(targetDate),
      createdDate: new Date(),
      status: 'active'
    };

    onAddTarget(newTarget);
    
    // Reset form
    setGoalText('');
    setTimeframe('daily');
    setTargetDate('');
    setShowAddDialog(false);
    
    toast.success('Micro-target assigned successfully');
  };

  const handleDeleteTarget = (targetId: string) => {
    onDeleteTarget(targetId);
    toast.success('Micro-target removed');
  };

  const handleCompleteTarget = (targetId: string) => {
    onMarkTargetComplete(targetId);
    toast.success('Micro-target marked as completed');
  };

  // Filter targets by status
  const activeTargets = microTargets.filter(t => t.status === 'active');
  const completedTargets = microTargets.filter(t => t.status === 'completed');
  const missedTargets = microTargets.filter(t => t.status === 'missed');

  // Check if any targets are overdue
  const today = new Date().toISOString().split('T')[0];
  const overdueTargets = activeTargets.filter(t => 
    new Date(t.targetDate).toISOString().split('T')[0] < today
  );

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-[1.6px] border-[#7A1E1E]/20 bg-gradient-to-br from-[#7A1E1E]/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#7A1E1E]" />
              <div>
                <CardTitle>Micro-Target Task Manager</CardTitle>
                <CardDescription>Set daily or weekly goals for {traineeName}</CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-[#7A1E1E] hover:bg-[#6A1919] gap-2"
            >
              <Plus className="w-4 h-4" />
              Assign Target
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add Target Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Micro-Target</DialogTitle>
            <DialogDescription>
              Create a micro-target for {traineeName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Goal Text */}
            <div className="space-y-2">
              <Label htmlFor="goal-text">Goal</Label>
              <Textarea
                id="goal-text"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="e.g., Master the drum corps march routine, Practice scales for 30 minutes..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Timeframe */}
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <RadioGroup value={timeframe} onValueChange={(v) => setTimeframe(v as 'daily' | 'weekly')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="timeframe-daily" />
                  <Label htmlFor="timeframe-daily" className="cursor-pointer font-normal">Daily Goal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="timeframe-weekly" />
                  <Label htmlFor="timeframe-weekly" className="cursor-pointer font-normal">Weekly Goal</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label htmlFor="target-date">Target Date</Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            {/* Creator Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              Assigned by: <span className="font-semibold">{directorName}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTarget}
              className="bg-[#7A1E1E] hover:bg-[#6A1919]"
            >
              Assign Target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 font-medium">Active Targets</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{activeTargets.length}</p>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{completedTargets.length}</p>
        </div>
        {overdueTargets.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium">Overdue</p>
            <p className="text-2xl font-bold text-red-900 mt-1">{overdueTargets.length}</p>
          </div>
        )}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-700 font-medium">Missed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{missedTargets.length}</p>
        </div>
      </div>

      {/* Active Targets */}
      {activeTargets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTargets.map((target) => {
                const targetDateObj = new Date(target.targetDate);
                const isOverdue = targetDateObj < new Date() && targetDateObj.toISOString().split('T')[0] < new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={target.id}
                    className={`p-4 border rounded-lg ${
                      isOverdue
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-[#1a1a1a]">{target.goalText}</h4>
                          <Badge
                            className={`${
                              target.timeframe === 'daily'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {target.timeframe === 'daily' ? 'Daily' : 'Weekly'}
                          </Badge>
                          {isOverdue && (
                            <Badge className="bg-red-100 text-red-800">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#6c757d]">
                          Target: {targetDateObj.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteTarget(target.id)}
                          className="gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Done
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTarget(target.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Targets */}
      {completedTargets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Completed Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedTargets.map((target) => (
                <div
                  key={target.id}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-900 line-through opacity-75">{target.goalText}</p>
                      <p className="text-xs text-green-700 mt-1">
                        Completed: {target.completedDate?.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTarget(target.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {microTargets.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Target className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[#6c757d]">No micro-targets assigned yet</p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Create targets to help {traineeName} stay on track
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
