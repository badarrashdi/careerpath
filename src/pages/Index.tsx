import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { 
  GraduationCap, 
  Target, 
  Brain, 
  Award, 
  Users, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";

const Index = () => {
  const features = [
    {
      icon: Target,
      title: "Personalized Assessment",
      description: "15 carefully curated questions designed specifically for Indian students to identify your true career aptitude.",
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced Gemini AI analyzes your responses to provide deep insights and personalized career recommendations.",
    },
    {
      icon: Award,
      title: "Expert-Designed Questions",
      description: "Questions aligned with NCERT curriculum and Indian career landscape, covering STEM, Commerce, and Humanities.",
    },
    {
      icon: TrendingUp,
      title: "Career Pathways",
      description: "Discover detailed career paths including IIT/IIM routes, medical fields, civil services, and creative industries.",
    },
  ];

  const stats = [
    { number: "50,000+", label: "Students Assessed" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "200+", label: "Career Paths" },
    { number: "4.8★", label: "User Rating" },
  ];

  const careerStreams = [
    { name: "Engineering & Technology", icon: "🔬", color: "bg-blue-100 text-blue-700" },
    { name: "Medical & Healthcare", icon: "⚕️", color: "bg-red-100 text-red-700" },
    { name: "Commerce & Finance", icon: "📊", color: "bg-green-100 text-green-700" },
    { name: "Civil Services", icon: "🏛️", color: "bg-yellow-100 text-yellow-700" },
    { name: "Arts & Design", icon: "🎨", color: "bg-purple-100 text-purple-700" },
    { name: "Law & Humanities", icon: "⚖️", color: "bg-orange-100 text-orange-700" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center hero-gradient hero-pattern overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span>Trusted by 50,000+ Students Across India</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Discover Your{" "}
                <span className="text-gradient">Perfect Career</span>{" "}
                Path Today
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 max-w-xl">
                India's most trusted AI-powered career assessment for students. 
                Get personalized recommendations aligned with your interests, aptitude, and the Indian education system.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="xl" className="gap-2">
                    Start Free Assessment
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="heroOutline" size="xl">
                    Sign In
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent border-2 border-white flex items-center justify-center text-sm font-bold text-white"
                    >
                      {["A", "S", "R", "P"][i - 1]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-white/80">
                  <span className="font-semibold text-white">4.8/5</span> rating from 10,000+ reviews
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block animate-slide-up stagger-2">
              <div className="relative">
                <img
                  src={heroImage}
                  alt="Indian students studying together"
                  className="rounded-2xl shadow-elevated object-cover w-full h-[500px]"
                />
                <div className="absolute -bottom-6 -left-6 glass-card rounded-xl p-4 animate-bounce-soft">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-success flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Assessment Complete!</p>
                      <p className="text-sm text-muted-foreground">Your results are ready</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">AI Analysis</p>
                      <p className="text-sm text-muted-foreground">Powered by Gemini</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {stat.number}
                </div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-secondary">CareerPath India</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Our comprehensive assessment is designed specifically for Indian students, 
              considering local career options and educational pathways.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Streams Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore Career Streams
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover which stream aligns best with your personality and interests
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {careerStreams.map((stream, index) => (
              <div
                key={stream.name}
                className={`p-4 rounded-xl text-center ${stream.color} hover:scale-105 transition-transform cursor-pointer animate-scale-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-3xl mb-2">{stream.icon}</div>
                <p className="font-medium text-sm">{stream.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient hero-pattern relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Ready to Discover Your Career Path?
            </h2>
            <p className="text-lg text-white/80">
              Take our free 10-minute assessment and get personalized career recommendations 
              powered by advanced AI technology.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="gap-2">
                  Start Assessment Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 pt-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-primary">
                CareerPath<span className="text-secondary">India</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 CareerPath India. Helping students find their perfect career path.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
