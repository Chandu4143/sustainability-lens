import { useState } from "react";
import { 
  FileText, 
  ExternalLink, 
  RefreshCw, 
  Filter, 
  Download,
  Shield,
  Leaf,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnalysisResult, ESGInitiative } from "@/pages/Index";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const categoryIcons = {
  Environmental: Leaf,
  Social: Users,
  Governance: Shield
};

const categoryColors = {
  Environmental: "text-secondary",
  Social: "text-accent-foreground", 
  Governance: "text-primary"
};

export const AnalysisResults = ({ result, onReset }: AnalysisResultsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("confidence");

  const filteredInitiatives = result.initiatives.filter(initiative => 
    selectedCategory === "all" || initiative.category === selectedCategory
  );

  const sortedInitiatives = [...filteredInitiatives].sort((a, b) => {
    if (sortBy === "confidence") return b.confidence - a.confidence;
    if (sortBy === "category") return a.category.localeCompare(b.category);
    if (sortBy === "framework") return a.framework.localeCompare(b.framework);
    return 0;
  });

  const categoryStats = {
    Environmental: result.initiatives.filter(i => i.category === "Environmental").length,
    Social: result.initiatives.filter(i => i.category === "Social").length,
    Governance: result.initiatives.filter(i => i.category === "Governance").length,
  };

  const handleViewInDocument = (initiative: ESGInitiative) => {
    // In a real app, this would open the PDF viewer and highlight the specific text
    console.log(`Navigate to page ${initiative.pageNumber} and highlight: "${initiative.evidence}"`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl shadow-large border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analysis Complete</h1>
              <p className="text-muted-foreground">
                Found <span className="font-semibold text-foreground">{result.initiatives.length} ESG initiatives</span> in {result.documentName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{result.initiatives.length}</div>
            <div className="text-sm text-muted-foreground">Total Initiatives</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{result.totalPages}</div>
            <div className="text-sm text-muted-foreground">Pages Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{result.processingTime}s</div>
            <div className="text-sm text-muted-foreground">Processing Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(result.initiatives.reduce((sum, i) => sum + i.confidence, 0) / result.initiatives.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(categoryStats).map(([category, count]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const colorClass = categoryColors[category as keyof typeof categoryColors];
          
          return (
            <Card key={category} className="p-6 hover:shadow-medium transition-smooth">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", 
                    category === "Environmental" && "bg-secondary/10",
                    category === "Social" && "bg-accent/10", 
                    category === "Governance" && "bg-primary/10"
                  )}>
                    <Icon className={cn("w-5 h-5", colorClass)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{category}</h3>
                    <p className="text-sm text-muted-foreground">{count} initiatives</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters and Results */}
      <div className="bg-card rounded-2xl shadow-large border">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              ESG Initiatives
            </h2>
            <div className="flex items-center space-x-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Governance">Governance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="framework">Framework</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {sortedInitiatives.map((initiative) => {
              const Icon = categoryIcons[initiative.category];
              const colorClass = categoryColors[initiative.category];
              
              return (
                <Card key={initiative.id} className="p-6 hover:shadow-medium transition-smooth border-l-4 border-l-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Icon className={cn("w-5 h-5", colorClass)} />
                        <Badge variant="outline" className="text-xs">
                          {initiative.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {initiative.confidence}% confidence
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {initiative.framework}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4">
                        {initiative.description}
                      </p>
                      
                      <div className="bg-muted/50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">Evidence from document:</p>
                        <p className="text-sm text-muted-foreground italic">
                          "{initiative.evidence}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            Page {initiative.pageNumber}
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {initiative.confidence}% match
                          </span>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewInDocument(initiative)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View in Document
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {sortedInitiatives.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No initiatives found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};