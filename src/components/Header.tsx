import { Activity } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b bg-card shadow-soft">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg shadow-glow">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sustainability Lens</h1>
            <p className="text-sm text-muted-foreground">AI-powered ESG initiative analysis</p>
          </div>
        </div>
      </div>
    </header>
  );
};