import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { firestore } from "@/integrations/firebase/client";
import { assessmentQuestions, calculateScores } from "@/data/assessmentQuestions";
import { parentAssessmentQuestions } from "@/data/parentAssessmentQuestions";
import { buildCareerAnalysis } from "@/lib/analysis";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Info } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Assessment = () => {
  const [currentTab, setCurrentTab] = useState("student");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentParentQuestion, setCurrentParentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [parentAnswers, setParentAnswers] = useState<Record<number, string>>({});
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
  const parentQuestion = parentAssessmentQuestions[currentParentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  const parentProgress = ((currentParentQuestion + 1) / parentAssessmentQuestions.length) * 100;
  const isLastQuestion = currentQuestion === assessmentQuestions.length - 1;
  const isLastParentQuestion = currentParentQuestion === parentAssessmentQuestions.length - 1;
  const hasCurrentAnswer = answers[question?.id] !== undefined;
  const hasCurrentParentAnswer = parentAnswers[parentQuestion?.id] !== undefined;
  
  // Check if both assessments are complete
  const isStudentComplete = Object.keys(answers).length === assessmentQuestions.length;
  const isParentComplete = Object.keys(parentAnswers).length === parentAssessmentQuestions.length;
  const canSubmit = isStudentComplete && isParentComplete;

  const handleSelectOption = (value: string) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleSelectParentOption = (value: string) => {
    setParentAnswers({ ...parentAnswers, [parentQuestion.id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleParentNext = () => {
    if (currentParentQuestion < parentAssessmentQuestions.length - 1) {
      setCurrentParentQuestion(currentParentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleParentPrevious = () => {
    if (currentParentQuestion > 0) {
      setCurrentParentQuestion(currentParentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate both assessments are complete
    if (!canSubmit) {
      toast({
        variant: "destructive",
        title: "Incomplete Assessments",
        description: "Please complete both Student and Parent assessments before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const scores = calculateScores(answers);
      const aiAnalysis = buildCareerAnalysis(scores);

      const docRef = await addDoc(collection(firestore, "assessment_results"), {
        userId: user.uid,
        answers,
        parentAnswers,
        scores,
        aiAnalysis,
        completedAt: serverTimestamp(),
      });

      const emailFunctionUrl = import.meta.env.VITE_EMAIL_FUNCTION_URL;
      const userEmail = user.email;

      if (emailFunctionUrl && userEmail) {
        const answerDetails = assessmentQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          section: q.section,
          selected: answers[q.id] || "",
        }));

        const parentAnswerDetails = parentAssessmentQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          section: q.section,
          selected: parentAnswers[q.id] || "",
        }));

        try {
          await fetch(emailFunctionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail,
              adminEmail: "rashdibadar@gmail.com",
              aiAnalysis,
              answers,
              parentAnswers,
              answerDetails,
              parentAnswerDetails,
              scores,
              resultId: docRef.id,
              userId: user.uid,
            }),
          });
        } catch (emailError) {
          console.error("Email dispatch failed", emailError);
          toast({
            variant: "destructive",
            title: "Could not send email copy",
            description: "Your results are saved. We will email them soon.",
          });
        }
      }

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

  if (!question || !parentQuestion) return null;

  const sectionColors: Record<string, string> = {
    // Student Assessment Sections
    "Thinking & Personality": "bg-blue-100 text-blue-700",
    "Learning Style": "bg-purple-100 text-purple-700",
    "Creativity & Structure": "bg-green-100 text-green-700",
    "Work Style & Future": "bg-orange-100 text-orange-700",
    "Emotional Signals & Motivation": "bg-pink-100 text-pink-700",
    // Parent Assessment Sections
    "Beliefs About Career & Success": "bg-indigo-100 text-indigo-700",
    "Financial Realities & Responsibilities": "bg-teal-100 text-teal-700",
    "Dreams, Fears & Projections": "bg-rose-100 text-rose-700",
    "Communication & Support Style": "bg-amber-100 text-amber-700",
    "Readiness for Exploration & Change": "bg-cyan-100 text-cyan-700",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Info Banner */}
          {!canSubmit && (
            <Alert className="mb-6" variant="default">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Complete both Student and Parent assessments to receive your comprehensive career analysis.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="gap-2">
                Student Assessment
                {isStudentComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger value="parent" className="gap-2">
                Parent Assessment
                {isParentComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-6">
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
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${sectionColors[question.section] || "bg-muted text-foreground"}`}>
                {question.section}
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
                disabled={!canSubmit || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : !isParentComplete ? (
                  <>
                    Complete Parent Assessment
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Submit Both Assessments
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
            </TabsContent>

            <TabsContent value="parent" className="mt-6">
              {/* Progress Section */}
              <div className="mb-8 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Question {currentParentQuestion + 1} of {parentAssessmentQuestions.length}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {Math.round(parentProgress)}% Complete
                  </span>
                </div>
                <Progress value={parentProgress} className="h-2" />
              </div>

              {/* Question Card */}
              <div className="question-card animate-scale-in" key={parentQuestion.id}>
                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${sectionColors[parentQuestion.section] || "bg-muted text-foreground"}`}>
                    {parentQuestion.section}
                  </span>
                </div>

                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                  {parentQuestion.question}
                </h2>

                <div className="space-y-3">
                  {parentQuestion.options.map((option, index) => {
                    const isSelected = parentAnswers[parentQuestion.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelectParentOption(option.value)}
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
                  onClick={handleParentPrevious}
                  disabled={currentParentQuestion === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {isLastParentQuestion ? (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : !isStudentComplete ? (
                      <>
                        Complete Student Assessment
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Submit Both Assessments
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleParentNext}
                    disabled={!hasCurrentParentAnswer}
                    className="gap-2"
                  >
                    Next Question
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Question Indicators */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {parentAssessmentQuestions.map((q, index) => {
                  const isAnswered = parentAnswers[q.id] !== undefined;
                  const isCurrent = index === currentParentQuestion;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentParentQuestion(index)}
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Assessment;
