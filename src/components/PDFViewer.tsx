import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ESGInitiative } from '@/pages/Index';

// Set up PDF.js worker - try local first, fallback to CDN
try {
  // Try to use local worker first
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).toString();
  console.log('Using local PDF.js worker');
} catch (error) {
  // Fallback to CDN
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  console.log('Using CDN PDF.js worker');
}

// Log worker setup for debugging
console.log('PDF.js worker configured:', {
  version: pdfjs.version,
  workerSrc: pdfjs.GlobalWorkerOptions.workerSrc
});

interface PDFViewerProps {
  documentId: string;
  documentName: string;
  highlightedInitiative?: ESGInitiative;
  onClose: () => void;
  initiatives: ESGInitiative[];
}

interface HighlightBox {
  x: number;
  y: number;
  width: number;
  height: number;
  initiative: ESGInitiative;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  documentId,
  documentName,
  highlightedInitiative,
  onClose,
  initiatives
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const pdfUrl = `http://localhost:8000/api/pdf/${documentId}`;
  
  // Debug logging
  console.log('PDFViewer props:', { documentId, documentName, pdfUrl });

  // Add timeout for loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setError('PDF loading timed out. Please check if the backend server is running.');
        setIsLoading(false);
      }
    }, 30000); // 30 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Test PDF URL accessibility
  React.useEffect(() => {
    console.log('Testing PDF URL accessibility:', pdfUrl);
    fetch(pdfUrl, { method: 'GET', headers: { 'Range': 'bytes=0-1' } })
      .then(response => {
        console.log('PDF URL test response:', response.status, response.statusText);
        if (!response.ok) {
          console.error('PDF URL not accessible:', response.status);
        } else {
          console.log('PDF URL is accessible');
        }
      })
      .catch(error => {
        console.error('PDF URL test failed:', error);
      });
  }, [pdfUrl]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully!', { numPages, documentName });
    setNumPages(numPages);
    setIsLoading(false);
    
    // Navigate to highlighted initiative's page if provided
    if (highlightedInitiative) {
      console.log('Navigating to highlighted initiative page:', highlightedInitiative.pageNumber);
      setCurrentPage(highlightedInitiative.pageNumber);
    }
  }, [highlightedInitiative, documentName]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.error('PDF URL:', pdfUrl);
    console.error('Document ID:', documentId);
    
    // More specific error messages
    let errorMessage = 'Failed to load PDF document';
    if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
      errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on port 8000.';
    } else if (error.message.includes('404')) {
      errorMessage = 'PDF document not found. The document may have been deleted or moved.';
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Network error: Unable to reach backend server at localhost:8000.';
    } else if (error.message.includes('worker')) {
      errorMessage = 'PDF.js worker failed to load. This might be a network issue or CDN problem.';
    } else {
      errorMessage = `PDF loading failed: ${error.message}`;
    }
    
    setError(errorMessage);
    setIsLoading(false);
  }, [pdfUrl, documentId]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(Math.min(scale * 1.2, 3.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.5));
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goToInitiative = (initiative: ESGInitiative) => {
    setCurrentPage(initiative.pageNumber);
  };

  // Get highlights for current page
  const currentPageInitiatives = initiatives.filter(initiative => 
    initiative.pageNumber === currentPage
  );

  // Convert bounding box percentages to pixel coordinates
  const getHighlightBoxes = (pageWidth: number, pageHeight: number): HighlightBox[] => {
    return currentPageInitiatives.map(initiative => {
      const [x1, y1, x2, y2] = initiative.bbox;
      return {
        x: (x1 / 100) * pageWidth,
        y: (y1 / 100) * pageHeight,
        width: ((x2 - x1) / 100) * pageWidth,
        height: ((y2 - y1) / 100) * pageHeight,
        initiative
      };
    });
  };

  const categoryColors = {
    Environmental: 'bg-green-500/20 border-green-500',
    Social: 'bg-blue-500/20 border-blue-500',
    Governance: 'bg-purple-500/20 border-purple-500'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl h-full max-h-[90vh] flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {documentName}
            </h2>
            {highlightedInitiative && (
              <Badge variant="outline" className="text-xs">
                Viewing: {highlightedInitiative.framework}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Navigation controls */}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="px-2">
                {currentPage} / {numPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Download */}
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="w-4 h-4" />
            </Button>

            {/* Close */}
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with initiatives */}
          <div className="w-80 border-r bg-muted/30 overflow-y-auto" aria-label="Evidence list">
            <div className="p-4">
              <h3 className="font-medium text-foreground mb-3">
                Initiatives in Document ({initiatives.length})
              </h3>
              
              <div className="space-y-2">
                {initiatives.map((initiative) => (
                  <div
                    key={initiative.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors text-left",
                      currentPage === initiative.pageNumber
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border hover:bg-muted/50",
                      highlightedInitiative?.id === initiative.id && "ring-2 ring-primary"
                    )}
                    onClick={() => goToInitiative(initiative)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          initiative.category === 'Environmental' && "border-green-500 text-green-700",
                          initiative.category === 'Social' && "border-blue-500 text-blue-700",
                          initiative.category === 'Governance' && "border-purple-500 text-purple-700"
                        )}
                      >
                        {initiative.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Page {initiative.pageNumber}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-sm text-foreground mb-1">
                      {initiative.framework}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {initiative.evidence}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(initiative.confidence)}% confidence
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PDF content */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-auto bg-gray-100" role="dialog" aria-modal="true">
            {isLoading && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading PDF...</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Document: {documentName}
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: {documentId}
                </p>
              </div>
            )}

            {error && (
              <div className="text-center max-w-md mx-auto">
                <p className="text-destructive mb-2">⚠️ {error}</p>
                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                  <p>Document ID: {documentId}</p>
                  <p>PDF URL: {pdfUrl}</p>
                  <p>Try:</p>
                  <ul className="text-left list-disc list-inside">
                    <li>Check if backend is running on port 8000</li>
                    <li>Open {pdfUrl} directly in browser</li>
                    <li>Check browser console for errors</li>
                  </ul>
                </div>
                
                {/* Fallback iframe viewer */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Try fallback PDF viewer:</p>
                  <iframe 
                    src={pdfUrl} 
                    className="w-full h-96 border rounded" 
                    title="PDF Fallback Viewer"
                  />
                </div>
                
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => window.open(pdfUrl, '_blank')}>
                    Open PDF Directly
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}

            {!error && (
              <div className="relative">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  onLoadProgress={({ loaded, total }) => {
                    console.log('PDF loading progress:', { loaded, total, percentage: Math.round((loaded / total) * 100) });
                  }}
                  className="flex justify-center"
                  options={{
                    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                    cMapPacked: true,
                  }}
                >
                  <div className="relative">
                    <Page
                      pageNumber={currentPage}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg"
                      onRenderSuccess={(page) => {
                        // Add highlight overlays after page renders
                        const pageWidth = page.width;
                        const pageHeight = page.height;
                        const highlightBoxes = getHighlightBoxes(pageWidth, pageHeight);
                        
                        // Note: In a full implementation, you'd create overlay divs here
                        // For now, we'll use CSS to style the highlights
                      }}
                    />
                    
                    {/* Highlight overlays */}
                    {currentPageInitiatives.map((initiative) => {
                      const [x1, y1, x2, y2] = initiative.bbox;
                      return (
                        <div
                          key={`highlight-${initiative.id}`}
                          className={cn(
                            "absolute border-2 rounded transition-all bg-yellow-300/30",
                            categoryColors[initiative.category],
                            highlightedInitiative?.id === initiative.id && "ring-2 ring-primary ring-offset-2"
                          )}
                          style={{
                            left: `${x1}%`,
                            top: `${y1}%`,
                            width: `${x2 - x1}%`,
                            height: `${y2 - y1}%`,
                            pointerEvents: 'none'
                          }}
                          title={`${initiative.framework} - ${Math.round(initiative.confidence)}% confidence`}
                          aria-label={`Evidence highlight for ${initiative.framework}`}
                        />
                      );
                    })}
                  </div>
                </Document>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
