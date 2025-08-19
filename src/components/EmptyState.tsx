import React from "react";
import { FileText, Upload, Shield, Leaf, Users, Clock, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onFileUpload: (file: File) => void;
}

const handleTrySample = async (onFileUpload: (file: File) => void) => {
  try {
    const res = await fetch("/sample.pdf");
    if (!res.ok) throw new Error("Sample file not found");
    const blob = await res.blob();
    const file = new File([blob], "sample.pdf", { type: "application/pdf" });
    onFileUpload(file);
  } catch (e) {
    alert("Sample not available. Place a sample.pdf in the public folder to enable this.");
  }
};

export const EmptyState = ({ onFileUpload }: EmptyStateProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <FileText className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Leaf className="w-4 h-4 text-secondary-foreground" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-3">
          Extract ESG initiatives in seconds
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
          Upload a sustainability report — we highlight frameworks and link you to exact evidence inside the PDF. Works with scanned & text PDFs.
        </p>

        {/* Primary CTA */}
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5 mr-3" />
            Upload PDF to Analyze
          </Button>
          
          <div className="text-sm text-muted-foreground">
            PDF only • up to 50MB • ~30–60s analysis
          </div>
          
          {/* Secondary CTA */}
          <div className="pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleTrySample(onFileUpload)}
              className="text-primary hover:text-primary/80"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try sample report
            </Button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Lock className="w-4 h-4" /> Secure processing</span>
          <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4" /> No storage by default</span>
        </div>

        {/* Framework badges */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">SBTi</span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">GRI</span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">SLCP</span>
        </div>
      </div>
    </div>
  );
};