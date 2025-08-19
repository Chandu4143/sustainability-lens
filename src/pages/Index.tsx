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
  confidence: number; // This can stay as number (TypeScript number includes both int and float)
  category: 'Environmental' | 'Social' | 'Governance';
  bbox: [number, number, number, number]; // [x1, y1, x2, y2] as percentages
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
  const [documentId, setDocumentId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload file to backend
      const uploadResponse = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      const uploadResult = await uploadResponse.json();
      setDocumentId(uploadResult.id);
      
      // Get results from backend
      const resultsResponse = await fetch(`http://localhost:8000/api/results/${uploadResult.id}`);
      
      if (!resultsResponse.ok) {
        throw new Error('Failed to get analysis results');
      }
      
      const resultsData = await resultsResponse.json();
      
      if (resultsData.status === 'failed') {
        throw new Error(resultsData.error || 'Analysis failed');
      }
      
      // Convert backend results to frontend format
      const analysisResult: AnalysisResult = {
        initiatives: resultsData.results.map((match: any) => ({
          id: match.id,
          framework: match.framework,
          description: match.description,
          evidence: match.evidence,
          pageNumber: match.page_number,
          confidence: match.confidence,
          category: match.category as 'Environmental' | 'Social' | 'Governance',
          bbox: match.bbox || [10, 10, 90, 20] // Default bbox if not provided by backend
        })),
        documentName: resultsData.metadata.document_name,
        totalPages: resultsData.metadata.total_pages,
        processingTime: resultsData.metadata.processing_time
      };
      
      setAnalysisResult(analysisResult);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${analysisResult.initiatives.length} ESG initiatives in ${file.name}`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "There was an error processing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
    setDocumentId(null);
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
          <LoadingState 
            fileName={uploadedFile?.name || ""} 
            onCancel={handleReset}
          />
        )}
        
        {analysisResult && (
          <AnalysisResults 
            result={analysisResult} 
            onReset={handleReset}
            documentId={documentId}
          />
        )}
      </main>
    </div>
  );
};

export default Index;