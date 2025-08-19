import { useState, useEffect } from "react";
import { FileText, Brain, Search, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  fileName: string;
}

const steps = [
  { id: 1, label: "Processing document", icon: FileText },
  { id: 2, label: "Extracting text content", icon: Search },
  { id: 3, label: "Analyzing ESG frameworks", icon: Brain },
  { id: 4, label: "Generating results", icon: CheckCircle },
];

export const LoadingState = ({ fileName }: LoadingStateProps) => {
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
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Analyzing Your Document</h2>
          <p className="text-muted-foreground">
            Processing <span className="font-medium text-foreground">{fileName}</span> for ESG initiatives
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
                <span
                  className={cn(
                    "text-sm font-medium transition-smooth",
                    isActive && "text-primary",
                    isCompleted && "text-success",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                  {isActive && "..."}
                </span>
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