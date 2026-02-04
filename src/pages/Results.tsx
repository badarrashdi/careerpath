import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { careerCategories, getTopCategories } from "@/data/assessmentQuestions";
import { 
  Loader2, 
  RefreshCw, 
  Download, 
  Share2, 
  TrendingUp,
  Sparkles,
  GraduationCap,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AssessmentResult {
  id: string;
  scores: Record<string, number>;
  ai_analysis: string | null;
  completed_at: string;
}

interface RawAssessmentResult {
  id: string;
  scores: unknown;
  ai_analysis: string | null;
  completed_at: string;
}

const Results = () => {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from("assessment_results")
        .select("*")
        .eq("user_id", user?.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No results found
          navigate("/assessment");
          return;
        }
        throw error;
      }

      // Type assertion for the scores field
      const typedResult: AssessmentResult = {
        id: data.id,
        scores: data.scores as Record<string, number>,
        ai_analysis: data.ai_analysis,
        completed_at: data.completed_at,
      };

      setResult(typedResult);

      // If no AI analysis yet, trigger it
      if (!typedResult.ai_analysis) {
        await generateAIAnalysis(typedResult.id, typedResult.scores);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading results",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIAnalysis = async (resultId: string, scores: Record<string, number>) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-career`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ scores, resultId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze");
      }

      const data = await response.json();
      
      setResult((prev) => prev ? { ...prev, ai_analysis: data.analysis } : null);

      toast({
        title: "Analysis Complete!",
        description: "Your personalized career insights are ready.",
      });
    } catch (error: any) {
      console.error("AI analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No results found.</p>
          <Link to="/assessment">
            <Button>Take Assessment</Button>
          </Link>
        </div>
      </div>
    );
  }

  const topCategories = getTopCategories(result.scores, 3);
  const maxScore = Math.max(...Object.values(result.scores));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-2 text-sm font-medium mb-4">
            <CheckCircle2 className="h-4 w-4" />
            Assessment Completed
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Your Career Assessment Results
          </h1>
          <p className="text-muted-foreground text-lg">
            Based on your responses, here are your personalized career recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Scores */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Categories Card */}
            <div className="bg-card rounded-xl border border-border p-6 animate-slide-up">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Career Matches
              </h3>
              
              <div className="space-y-4">
                {topCategories.map((category, index) => (
                  <div key={category.id} className="flex items-center gap-3">
                    <div className={`text-2xl ${index === 0 ? "animate-bounce-soft" : ""}`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-card rounded-xl border border-border p-6 animate-slide-up stagger-1">
              <h3 className="font-display font-semibold text-lg mb-4">Score Breakdown</h3>
              
              <div className="space-y-4">
                {careerCategories.map((category) => {
                  const score = result.scores[category.id] || 0;
                  const percentage = (score / maxScore) * 100;
                  
                  return (
                    <div key={category.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="text-muted-foreground">{category.name}</span>
                        </span>
                        <span className="text-sm font-medium">{score} pts</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="gap-2" onClick={() => navigate("/assessment")}>
                <RefreshCw className="h-4 w-4" />
                Retake Assessment
              </Button>
            </div>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6 md:p-8 animate-slide-up stagger-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">AI-Powered Career Analysis</h3>
                  <p className="text-sm text-muted-foreground">Personalized insights from Gemini AI</p>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <p className="mt-4 font-medium text-foreground">Analyzing your responses...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our AI is generating personalized career insights
                  </p>
                </div>
              ) : result.ai_analysis ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-display text-2xl font-bold text-foreground mt-6 mb-3">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-display text-xl font-semibold text-foreground mt-5 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-display text-lg font-semibold text-foreground mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground mb-4">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-muted-foreground">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                    }}
                  >
                    {result.ai_analysis}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    AI analysis not available. Click to generate.
                  </p>
                  <Button
                    onClick={() => generateAIAnalysis(result.id, result.scores)}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Analysis
                  </Button>
                </div>
              )}
            </div>

            {/* Recommended Careers */}
            {topCategories.length > 0 && (
              <div className="mt-6 bg-card rounded-xl border border-border p-6 md:p-8 animate-slide-up stagger-3">
                <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Recommended Career Paths
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {topCategories.slice(0, 2).map((category) => (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.careers.slice(0, 4).map((career) => (
                          <span
                            key={career}
                            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                          >
                            {career}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
