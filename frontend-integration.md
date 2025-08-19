# Frontend Integration Guide

## Connecting React Frontend to FastAPI Backend

### 1. Update Frontend API Calls

Replace the mock API calls in your React components:

```typescript
// src/lib/api.ts
const API_BASE_URL = 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function uploadPDF(file: File): Promise<ApiResponse<{id: string, status: string}>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

export async function getResults(docId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/results/${docId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get results: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to get results' };
  }
}

export function getPDFUrl(docId: string): string {
  return `${API_BASE_URL}/api/pdf/${docId}`;
}
```

### 2. Update Index.tsx

```typescript
// src/pages/Index.tsx - Update handleFileUpload function
const handleFileUpload = async (file: File) => {
  setUploadedFile(file);
  setIsAnalyzing(true);
  
  try {
    // Real API call instead of mock
    const uploadResult = await uploadPDF(file);
    
    if (uploadResult.error) {
      throw new Error(uploadResult.error);
    }
    
    const docId = uploadResult.data!.id;
    
    // Get results
    const resultsResponse = await getResults(docId);
    
    if (resultsResponse.error) {
      throw new Error(resultsResponse.error);
    }
    
    const results = resultsResponse.data!;
    
    if (results.status === 'ready' && results.results) {
      setAnalysisResult({
        initiatives: results.results,
        documentName: file.name,
        totalPages: results.metadata?.total_pages || 1,
        processingTime: results.metadata?.processing_time || 0
      });
      
      toast({
        title: "Analysis Complete",
        description: `Found ${results.results.length} ESG initiatives in ${file.name}`,
      });
    } else if (results.status === 'failed') {
      throw new Error(results.error || 'Analysis failed');
    }
    
  } catch (error) {
    toast({
      title: "Analysis Failed", 
      description: error instanceof Error ? error.message : "Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsAnalyzing(false);
  }
};
```

### 3. Add PDF Viewer Integration

```typescript
// src/components/PDFViewer.tsx
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  highlightPage?: number;
  highlightBbox?: number[];
}

export const PDFViewer = ({ pdfUrl, highlightPage, highlightBbox }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(highlightPage || 1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="pdf-viewer">
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page 
          pageNumber={pageNumber} 
          renderAnnotationLayer={false}
          renderTextLayer={true}
        />
      </Document>
      
      {/* Page navigation */}
      <div className="flex items-center justify-center mt-4 space-x-4">
        <button 
          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
        >
          Previous
        </button>
        <span>Page {pageNumber} of {numPages}</span>
        <button 
          onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
          disabled={pageNumber >= numPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

### 4. Update AnalysisResults Component

```typescript
// In AnalysisResults.tsx - Update handleViewInDocument
const handleViewInDocument = (initiative: ESGInitiative) => {
  // Store current document ID and initiative for PDF viewer
  setSelectedInitiative(initiative);
  setShowPDFViewer(true);
  
  // In a real implementation, you could:
  // 1. Open a modal with embedded PDF viewer
  // 2. Navigate to a dedicated PDF view page
  // 3. Scroll to the specific page and highlight the text
};
```

### 5. Environment Configuration

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 seconds for PDF processing
};
```

### 6. Add Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PDF Processing Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            There was an error processing your document.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7. Development Setup

```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend  
npm run dev
```

### 8. Production Deployment

```bash
# Backend (using Docker)
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend (build for production)
npm run build
# Deploy dist/ folder to your hosting service
```

This integration provides a seamless connection between your React frontend and FastAPI backend, handling real PDF processing with proper error handling and user feedback.