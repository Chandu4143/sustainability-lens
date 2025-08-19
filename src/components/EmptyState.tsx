import { FileText, Upload, Shield, Leaf, Users, Clock, Lock } from "lucide-react";
import { FileUpload } from "./FileUpload";

interface EmptyStateProps {
  onFileUpload: (file: File) => void;
}

export const EmptyState = ({ onFileUpload }: EmptyStateProps) => {
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

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload a sustainability report — we highlight frameworks and link you to exact evidence inside the PDF. Works with scanned & text PDFs.
        </p>

        {/* Micro-strap badges */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <Shield className="w-4 h-4" /> Governance
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm">
            <Leaf className="w-4 h-4" /> Environmental
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-sm">
            <Users className="w-4 h-4" /> Social
          </span>
        </div>

        {/* Trust row */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Lock className="w-4 h-4" /> Processed securely</span>
          <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4" /> Typical analysis 30–60s</span>
          <span>No docs stored by default</span>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-card rounded-2xl shadow-large border p-8">
        <div className="text-center mb-6">
          <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Upload your sustainability report</h2>
          <p className="text-muted-foreground">PDF up to 50MB. We’ll extract frameworks and link you directly to the evidence.</p>
        </div>
        
        <FileUpload onFileUpload={onFileUpload} />
        
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Processed securely • Typical analysis 30–60s • No docs stored by default
          </p>
        </div>
      </div>
    </div>
  );
};