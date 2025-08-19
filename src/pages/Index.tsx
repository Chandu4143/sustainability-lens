import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { mockAnalysisResults } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export interface ESGInitiative {
  id: string;
  framework: string;
  description: string;
  evidence: string;
  pageNumber: number;
  confidence: number;
  category: 'Environmental' | 'Social' | 'Governance';
}

export interface AnalysisResult {
  initiatives: ESGInitiative[];
  documentName: string;
  totalPages: number;
  processingTime: number;
}

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock successful analysis
      const mockResult = {
        ...mockAnalysisResults,
        documentName: file.name,
        totalPages: Math.floor(Math.random() * 50) + 20,
        processingTime: Math.floor(Math.random() * 30) + 15
      };
      
      setAnalysisResult(mockResult);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${mockResult.initiatives.length} ESG initiatives in ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error processing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {!uploadedFile && !isAnalyzing && !analysisResult && (
          <EmptyState onFileUpload={handleFileUpload} />
        )}
        
        {!isAnalyzing && !analysisResult && uploadedFile && (
          <FileUpload onFileUpload={handleFileUpload} />
        )}
        
        {isAnalyzing && (
          <LoadingState fileName={uploadedFile?.name || ""} />
        )}
        
        {analysisResult && (
          <AnalysisResults 
            result={analysisResult} 
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default Index;