import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, Shield, Clock, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [deleteAfter, setDeleteAfter] = useState<boolean>(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Please upload a PDF file only.";
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB
      return "File size must be less than 50MB.";
    }
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    
    setError("");
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const handleTrySample = async () => {
    try {
      const res = await fetch("/sample.pdf");
      if (!res.ok) throw new Error("Sample file not found");
      const blob = await res.blob();
      const file = new File([blob], "sample.pdf", { type: "application/pdf" });
      setSelectedFile(file);
      toast({ title: "Loaded sample report", description: "You can analyze it or switch files." });
    } catch (e) {
      toast({ title: "Sample not available", description: "Place a sample.pdf in the public folder to enable this.", variant: "destructive" });
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-smooth",
          dragActive 
            ? "border-primary bg-primary/5 shadow-glow" 
            : "border-border hover:border-primary/50",
          error && "border-destructive bg-destructive/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Screenreader live region for status updates */}
        <div className="sr-only" aria-live="polite">
          {selectedFile ? `Selected ${selectedFile.name}` : "No file selected"}
        </div>
        {!selectedFile && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        )}

        {!selectedFile ? (
          <div className="text-center">
            <div className={cn(
              "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-smooth",
              dragActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              <Upload className="w-8 h-8" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {dragActive ? "Drop your PDF here" : "Upload Sustainability Report"}
            </h3>
            
            <p className="text-muted-foreground mb-2">Drag and drop your PDF here, or click to browse.</p>
            <p className="text-xs text-muted-foreground mb-4 inline-flex items-center gap-2"><Clock className="w-4 h-4" /> Estimated: 30–60s (OCR may take longer)</p>
            
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            
            <p className="text-xs text-muted-foreground mt-3">
              PDF files only • Maximum 50MB
            </p>
            
            {/* Inline error under CTA */}
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}

            {/* What we look for */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">SBTi</span>
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">GRI</span>
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">SLCP</span>
            </div>

            {/* Try sample */}
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={handleTrySample} className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Try sample report
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Inline preview (first page) */}
            <div className="rounded-lg overflow-hidden border bg-card">
              <object data={selectedFile ? URL.createObjectURL(selectedFile) + "#page=1" : undefined} type="application/pdf" className="w-full h-40" aria-label="PDF preview (first page)"></object>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleAnalyze}
                variant="gradient"
                className="flex-1"
              >
                Analyze (30–60s)
              </Button>
              <Button 
                variant="outline" 
                onClick={clearFile}
              >
                Change File
              </Button>
            </div>

            {/* Privacy info and Advanced controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-2"><Shield className="w-4 h-4" /> Processed securely • No docs stored by default</div>
              </div>
              
              {/* Advanced collapsible section */}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 p-0 text-xs text-muted-foreground hover:text-foreground">
                    <span className="mr-1">Advanced</span>
                    <ChevronDown className={cn("w-3 h-3 transition-transform", advancedOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                      <input 
                        type="checkbox" 
                        checked={deleteAfter} 
                        onChange={(e) => setDeleteAfter(e.target.checked)}
                        className="w-3 h-3" 
                      />
                      Delete file after analysis
                    </label>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};