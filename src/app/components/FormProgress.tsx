import React from 'react';
import { Check, Home, MapPin, Clock, Phone, Lock } from './ui/icons';

interface FormProgressProps {
  currentStep: number; // 1-5
  talentGroup: string;
}

const STEPS = [
  { num: 1, label: 'Personal Info', icon: Home },
  { num: 2, label: 'Address', icon: MapPin },
  { num: 3, label: 'Academic Info', icon: Clock },
  { num: 4, label: 'Emergency Contact', icon: Phone },
  { num: 5, label: 'Privacy & Consent', icon: Lock },
];

const getTalentGroupColor = (group: string): string => {
  switch (group) {
    case 'marching-band': return '#7A1E1E';
    case 'glee-club': return '#7A1E1E';
    case 'majorettes': return '#7A1E1E';
    case 'dance-club': return '#7A1E1E';
    default: return '#7A1E1E';
  }
};

export function FormProgress({ currentStep, talentGroup }: FormProgressProps) {
  const groupColor = getTalentGroupColor(talentGroup);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-6">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, idx) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.num}>
                {/* Step dot */}
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                      ${isCurrent ? 'ring-2 ring-offset-2' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'text-white' : 'bg-gray-200 text-gray-500'}
                    `}
                    style={{
                      backgroundColor: isCompleted ? '#10B981' : isCurrent ? groupColor : undefined,
                      ringColor: isCurrent ? groupColor : undefined,
                    }}
                    role="progressbar"
                    aria-valuenow={isCurrent ? 50 : isCompleted ? 100 : 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Step ${step.num}: ${step.label} ${isCompleted ? '(completed)' : isCurrent ? '(current)' : '(not started)'}`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    )}
                  </div>
                  <p className={`text-xs font-medium text-center leading-tight ${
                    isCurrent ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {step.label}
                  </p>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className="h-1 flex-1 mx-1 mb-8 transition-colors"
                    style={{
                      backgroundColor: isCompleted ? '#10B981' : '#E5E7EB',
                    }}
                    role="presentation"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Accessibility text */}
        <p className="sr-only">
          Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.label}
        </p>
      </div>
    </div>
  );
}
