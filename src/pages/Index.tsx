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
const heroImage = "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80";

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
      description: "Our CareerPath AI analyzes your responses to provide deep insights and personalized career recommendations.",
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

  const pricingPlans = [
    {
      name: "Standard Assessment",
      price: "₹499",
      cadence: "one-time",
      description: "Full 40-question assessment with instant AI report and top career clusters.",
      features: [
        "Personalized PATHORA report",
        "Top 3 career clusters with guidance",
        "Actionable next steps and skills",
        "Email copy of your results",
      ],
      highlight: false,
    },
    {
      name: "Premium Guidance",
      price: "₹899",
      cadence: "one-time",
      description: "Everything in Standard plus deeper recommendations and interview-ready talking points.",
      features: [
        "Expanded career pathways",
        "Skill gaps with learning plan",
        "Suggested projects to showcase",
        "Parent/mentor summary",
      ],
      highlight: true,
    },
    {
      name: "Counselor Review",
      price: "₹1,499",
      cadence: "one-time",
      description: "Premium report plus an optional counselor review (payment activation coming soon).",
      features: [
        "Everything in Premium",
        "Human review signal for your report",
        "Priority support when payments go live",
        "Early-access pricing locked in",
      ],
      highlight: false,
    },
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
        {/* Dark overlay to keep hero copy legible on bright backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/75 to-slate-800/65" aria-hidden="true" />
        
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
                India's trusted AI-powered career assessment for students. 
                Get personalized recommendations aligned with your interests, aptitude, and the Indian education system.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="xl" className="gap-2">
                    Start Assessment
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
              <img
                src={heroImage}
                alt="Students collaborating in a study space"
                className="rounded-2xl shadow-elevated object-cover w-full h-[500px]"
              />
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
              Why Choose <span className="text-secondary">CareerPath</span>?
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

      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
              Payment activation coming soon
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Simple pricing built for students
            </h2>
            <p className="text-lg text-muted-foreground">
              Transparent, one-time pricing. Payments will be enabled soon—your plan and pricing will be honored when checkout goes live.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`p-6 rounded-2xl border bg-card shadow-card animate-fade-in ${plan.highlight ? "border-primary/60 ring-2 ring-primary/10" : "border-border"}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-semibold text-foreground">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-2 mb-6 text-sm text-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                    Continue to Assessment
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  Checkout will be enabled soon. Your selection will reserve this price.
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
        <div className="absolute inset-0 bg-slate-900/70" aria-hidden="true" />
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Ready to Discover Your Career Path?
            </h2>
            <p className="text-lg text-white/80">
              Take our 10-minute assessment and get personalized career recommendations 
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
                <span>Transparent pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Instant results</span>
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
              © 2026 CareerPath. Helping students find their perfect career path.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
