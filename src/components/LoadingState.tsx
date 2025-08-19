import React, { useState, useEffect } from "react";
import { Upload, FileText, Search, CheckCircle, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  fileName: string;
  onCancel?: () => void;
}

const steps = [
  { id: 1, label: "Uploading", icon: Upload, description: "Transferring document to server" },
  { id: 2, label: "OCR/Parsing", icon: FileText, description: "Extracting text from PDF" },
  { id: 3, label: "Matching", icon: Search, description: "Finding ESG framework matches" },
  { id: 4, label: "Finalizing", icon: CheckCircle, description: "Preparing analysis results" },
];

export const LoadingState = ({ fileName, onCancel }: LoadingStateProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        
        // Update current step based on progress
        if (newProgress > 75 && currentStep < 4) {
          setCurrentStep(4);
        } else if (newProgress > 50 && currentStep < 3) {
          setCurrentStep(3);
        } else if (newProgress > 25 && currentStep < 2) {
          setCurrentStep(2);
        }
        
        return Math.min(newProgress, 95); // Don't reach 100% until analysis is complete
      });
    }, 300);

    return () => clearInterval(interval);
  }, [currentStep]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-large border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div> {/* Spacer */}
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse">
              {steps.find(step => step.id === currentStep)?.icon && 
                React.createElement(steps.find(step => step.id === currentStep)!.icon, { className: "w-8 h-8 text-primary-foreground" })
              }
            </div>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Analyzing Your Document</h2>
          <p className="text-muted-foreground mb-2">
            Processing <span className="font-medium text-foreground">{fileName}</span> for ESG initiatives
          </p>
          <p className="text-sm text-primary font-medium">
            {steps.find(step => step.id === currentStep)?.label}: {steps.find(step => step.id === currentStep)?.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Analysis Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            Estimated: 30–60s (OCR may take longer)
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center space-x-4 p-4 rounded-lg transition-smooth",
                  isActive && "bg-primary/5 border border-primary/20",
                  isCompleted && "bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-smooth",
                    isActive && "bg-primary text-primary-foreground animate-pulse",
                    isCompleted && "bg-success text-success-foreground",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span
                    className={cn(
                      "text-sm font-medium transition-smooth block",
                      isActive && "text-primary",
                      isCompleted && "text-success",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                    {isActive && "..."}
                  </span>
                  <span
                    className={cn(
                      "text-xs transition-smooth block mt-1",
                      isActive && "text-primary/70",
                      isCompleted && "text-success/70",
                      !isActive && !isCompleted && "text-muted-foreground/70"
                    )}
                  >
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            This usually takes 30-60 seconds depending on document size
          </p>
        </div>
      </div>
    </div>
  );
};