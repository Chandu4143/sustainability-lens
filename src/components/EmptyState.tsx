import { FileText, Upload, Shield, Leaf, Users } from "lucide-react";
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
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Extract ESG Initiatives with <span className="bg-gradient-primary bg-clip-text text-transparent">AI Precision</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload any sustainability report and instantly identify all ESG frameworks, regulations, 
          and industry initiatives with direct links to evidence in the document.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card p-6 rounded-xl shadow-soft border hover:shadow-medium transition-smooth">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Governance Frameworks</h3>
          <p className="text-muted-foreground">Identify compliance with governance standards, board structures, and risk management frameworks.</p>
        </div>
        
        <div className="bg-card p-6 rounded-xl shadow-soft border hover:shadow-medium transition-smooth">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Environmental Initiatives</h3>
          <p className="text-muted-foreground">Extract carbon targets, environmental certifications, and sustainability commitments.</p>
        </div>
        
        <div className="bg-card p-6 rounded-xl shadow-soft border hover:shadow-medium transition-smooth">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Social Programs</h3>
          <p className="text-muted-foreground">Discover diversity initiatives, labor standards, and community engagement programs.</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-card rounded-2xl shadow-large border p-8">
        <div className="text-center mb-6">
          <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Upload Your Sustainability Report</h2>
          <p className="text-muted-foreground">Supports PDF files up to 50MB. Works with both text and scanned documents.</p>
        </div>
        
        <FileUpload onFileUpload={onFileUpload} />
        
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Your documents are processed securely and never stored permanently. 
            <br />Analysis typically completes in 30-60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
};