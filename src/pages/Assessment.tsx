import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { assessmentQuestions, calculateScores } from "@/data/assessmentQuestions";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const Assessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const question = assessmentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  const isLastQuestion = currentQuestion === assessmentQuestions.length - 1;
  const hasCurrentAnswer = answers[question?.id] !== undefined;

  const handleSelectOption = (value: string) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const scores = calculateScores(answers);

      // Save to database
      const { error } = await supabase.from("assessment_results").insert({
        user_id: user.id,
        answers: answers,
        scores: scores,
      });

      if (error) throw error;

      toast({
        title: "Assessment Complete!",
        description: "Your results are being analyzed...",
      });

      navigate("/results");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!question) return null;

  const categoryColors = {
    interest: "bg-blue-100 text-blue-700",
    aptitude: "bg-purple-100 text-purple-700",
    personality: "bg-green-100 text-green-700",
    values: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {assessmentQuestions.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <div className="question-card animate-scale-in" key={question.id}>
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[question.category]}`}>
                {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
              </span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = answers[question.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelectOption(option.value)}
                    className={`option-btn flex items-center gap-4 ${isSelected ? "selected" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      isSelected 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-border text-muted-foreground"
                    }`}>
                      {isSelected ? <CheckCircle2 className="h-5 w-5" /> : String.fromCharCode(65 + index)}
                    </div>
                    <span className={`text-left flex-1 ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                variant="hero"
                size="lg"
                onClick={handleSubmit}
                disabled={!hasCurrentAnswer || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Assessment
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="hero"
                size="lg"
                onClick={handleNext}
                disabled={!hasCurrentAnswer}
                className="gap-2"
              >
                Next Question
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Question Indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {assessmentQuestions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = index === currentQuestion;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isAnswered
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Assessment;
