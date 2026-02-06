export type LikertValue = "strongly_agree" | "agree" | "neutral" | "disagree" | "strongly_disagree";

export interface Question {
  id: number;
  question: string;
  section: string;
  weights: Record<string, number>; // Career cluster weights applied to the Likert score
  options: {
    text: string;
    value: LikertValue;
  }[];
}

export interface CareerCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  careers: string[];
}

export const careerCategories: CareerCategory[] = [
  {
    id: 'science_tech',
    name: 'Technology & Engineering',
    description: 'Building systems, solving logical problems, and applied science',
    icon: '🔬',
    careers: ['Software Engineer', 'Data Engineer', 'Systems Analyst', 'Research Engineer', 'Product Technologist', 'Robotics/Automation'],
  },
  {
    id: 'commerce_finance',
    name: 'Business, Finance & Analytics',
    description: 'Markets, numbers, strategy, and decision-making',
    icon: '📊',
    careers: ['Business Analyst', 'Financial Analyst', 'Growth/Strategy', 'Operations Analyst', 'Product Ops', 'Entrepreneurship'],
  },
  {
    id: 'arts_humanities',
    name: 'Arts, Humanities & Social Impact',
    description: 'Communication, culture, education, and community impact',
    icon: '📚',
    careers: ['Psychology/Education', 'Policy/Community Programs', 'Content/Communication', 'Researcher', 'Law/Advocacy'],
  },
  {
    id: 'creative',
    name: 'Creative & Design',
    description: 'Visual thinking, storytelling, and experience design',
    icon: '🎨',
    careers: ['UI/UX Designer', 'Product Designer', 'Visual/Brand Designer', 'Content/Media Design', 'Architecture/Spatial'],
  },
  {
    id: 'government',
    name: 'Leadership & Public Service',
    description: 'Decision-making, policy, operations, and leading teams',
    icon: '🏛️',
    careers: ['Program/Project Leadership', 'Policy/Administration', 'Defense/Services', 'Product/Operations Leadership', 'People & Culture'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    description: 'Care, precision, and applied life sciences',
    icon: '⚕️',
    careers: ['Healthcare Practitioner', 'Clinical Research', 'Public Health', 'Lab Technologist', 'Allied Health Services'],
  },
];

const likertOptions = [
  { text: "Strongly Agree", value: "strongly_agree" as LikertValue },
  { text: "Agree", value: "agree" as LikertValue },
  { text: "Neutral", value: "neutral" as LikertValue },
  { text: "Disagree", value: "disagree" as LikertValue },
  { text: "Strongly Disagree", value: "strongly_disagree" as LikertValue },
];

const scoreByResponse: Record<LikertValue, number> = {
  strongly_agree: 2,
  agree: 1,
  neutral: 0,
  disagree: -1,
  strongly_disagree: -2,
};

export const assessmentQuestions: Question[] = [
  // SECTION 1: THINKING & PERSONALITY
  {
    id: 1,
    question: "I enjoy solving problems that have clear, logical steps.",
    section: "Thinking & Personality",
    weights: { science_tech: 1, commerce_finance: 0.5 },
    options: likertOptions,
  },
  {
    id: 2,
    question: "I enjoy imagining new ideas or possibilities.",
    section: "Thinking & Personality",
    weights: { creative: 1, arts_humanities: 0.5 },
    options: likertOptions,
  },
  {
    id: 3,
    question: "I feel satisfied when I help someone else succeed.",
    section: "Thinking & Personality",
    weights: { healthcare: 1, arts_humanities: 0.5 },
    options: likertOptions,
  },
  {
    id: 4,
    question: "I like taking responsibility and leading others.",
    section: "Thinking & Personality",
    weights: { government: 1, commerce_finance: 0.5 },
    options: likertOptions,
  },
  {
    id: 5,
    question: "I prefer clear instructions rather than open-ended tasks.",
    section: "Thinking & Personality",
    weights: { science_tech: 0.5, commerce_finance: 0.5, government: 0.3 },
    options: likertOptions,
  },
  {
    id: 6,
    question: "I feel comfortable working independently for long periods.",
    section: "Thinking & Personality",
    weights: { science_tech: 0.5, creative: 0.5 },
    options: likertOptions,
  },
  {
    id: 7,
    question: "I get bored when tasks feel repetitive.",
    section: "Thinking & Personality",
    weights: { creative: 1, science_tech: 0.3 },
    options: likertOptions,
  },
  {
    id: 8,
    question: "I enjoy challenges that push me outside my comfort zone.",
    section: "Thinking & Personality",
    weights: { government: 0.5, creative: 0.5, science_tech: 0.3 },
    options: likertOptions,
  },

  // SECTION 2: LEARNING STYLE
  {
    id: 9,
    question: "I understand concepts better when I see visual examples or diagrams.",
    section: "Learning Style",
    weights: { creative: 0.7, science_tech: 0.5 },
    options: likertOptions,
  },
  {
    id: 10,
    question: "I enjoy learning by doing rather than reading.",
    section: "Learning Style",
    weights: { science_tech: 0.7, creative: 0.5 },
    options: likertOptions,
  },
  {
    id: 11,
    question: "I prefer subjects where there is one correct answer.",
    section: "Learning Style",
    weights: { science_tech: 0.8, commerce_finance: 0.4 },
    options: likertOptions,
  },
  {
    id: 12,
    question: "I enjoy subjects that allow multiple ways of thinking.",
    section: "Learning Style",
    weights: { creative: 0.7, arts_humanities: 0.7 },
    options: likertOptions,
  },
  {
    id: 13,
    question: "I feel stressed when a subject requires heavy memorization.",
    section: "Learning Style",
    weights: { creative: 0.6, science_tech: 0.4 },
    options: likertOptions,
  },
  {
    id: 14,
    question: "I like explaining what I learn to others.",
    section: "Learning Style",
    weights: { arts_humanities: 0.7, healthcare: 0.5, government: 0.3 },
    options: likertOptions,
  },
  {
    id: 15,
    question: "I enjoy working on projects more than preparing for exams.",
    section: "Learning Style",
    weights: { creative: 0.6, science_tech: 0.4 },
    options: likertOptions,
  },
  {
    id: 16,
    question: "I manage my time well during exams.",
    section: "Learning Style",
    weights: { commerce_finance: 0.6, science_tech: 0.5, government: 0.3 },
    options: likertOptions,
  },

  // SECTION 3: CREATIVITY & STRUCTURE
  {
    id: 17,
    question: "I enjoy creating or designing things from scratch.",
    section: "Creativity & Structure",
    weights: { creative: 1, arts_humanities: 0.5 },
    options: likertOptions,
  },
  {
    id: 18,
    question: "I often think about how things could be improved or redesigned.",
    section: "Creativity & Structure",
    weights: { creative: 0.8, science_tech: 0.5 },
    options: likertOptions,
  },
  {
    id: 19,
    question: "I enjoy working with shapes, space, or visual layouts.",
    section: "Creativity & Structure",
    weights: { creative: 0.8, science_tech: 0.4 },
    options: likertOptions,
  },
  {
    id: 20,
    question: "I enjoy working with numbers and calculations.",
    section: "Creativity & Structure",
    weights: { commerce_finance: 0.8, science_tech: 0.8 },
    options: likertOptions,
  },
  {
    id: 21,
    question: "I feel patient working on long projects.",
    section: "Creativity & Structure",
    weights: { science_tech: 0.6, healthcare: 0.4, government: 0.4 },
    options: likertOptions,
  },
  {
    id: 22,
    question: "I prefer structured tasks over flexible ones.",
    section: "Creativity & Structure",
    weights: { commerce_finance: 0.6, government: 0.6, science_tech: 0.4 },
    options: likertOptions,
  },
  {
    id: 23,
    question: "I enjoy learning new tools, skills, or software.",
    section: "Creativity & Structure",
    weights: { science_tech: 0.8, creative: 0.6 },
    options: likertOptions,
  },
  {
    id: 24,
    question: "I like tasks where the outcome is visible or tangible.",
    section: "Creativity & Structure",
    weights: { creative: 0.6, science_tech: 0.6, healthcare: 0.3 },
    options: likertOptions,
  },

  // SECTION 4: WORK STYLE & FUTURE
  {
    id: 25,
    question: "I prefer a predictable routine rather than changing tasks.",
    section: "Work Style & Future",
    weights: { government: 0.5, commerce_finance: 0.5, healthcare: 0.4 },
    options: likertOptions,
  },
  {
    id: 26,
    question: "I enjoy working in teams.",
    section: "Work Style & Future",
    weights: { commerce_finance: 0.6, healthcare: 0.6, government: 0.5 },
    options: likertOptions,
  },
  {
    id: 27,
    question: "I am comfortable with uncertainty about the future.",
    section: "Work Style & Future",
    weights: { creative: 0.5, science_tech: 0.4, commerce_finance: 0.4 },
    options: likertOptions,
  },
  {
    id: 28,
    question: "I value creativity more than stability.",
    section: "Work Style & Future",
    weights: { creative: 1, arts_humanities: 0.5 },
    options: likertOptions,
  },
  {
    id: 29,
    question: "I would enjoy a career that helps people directly.",
    section: "Work Style & Future",
    weights: { healthcare: 0.9, government: 0.5, arts_humanities: 0.4 },
    options: likertOptions,
  },
  {
    id: 30,
    question: "I would enjoy a career that involves analysis and logical thinking.",
    section: "Work Style & Future",
    weights: { science_tech: 0.8, commerce_finance: 0.6 },
    options: likertOptions,
  },
  {
    id: 31,
    question: "I would enjoy a career that involves creativity and design.",
    section: "Work Style & Future",
    weights: { creative: 1, arts_humanities: 0.5 },
    options: likertOptions,
  },
  {
    id: 32,
    question: "I would enjoy a career that involves leadership and decision-making.",
    section: "Work Style & Future",
    weights: { government: 0.9, commerce_finance: 0.6 },
    options: likertOptions,
  },

  // SECTION 5: EMOTIONAL SIGNALS & MOTIVATION
  {
    id: 33,
    question: "Thinking about my future career excites me.",
    section: "Emotional Signals & Motivation",
    weights: { science_tech: 0.3, creative: 0.3, commerce_finance: 0.3 },
    options: likertOptions,
  },
  {
    id: 34,
    question: "I feel pressure from others when thinking about my career.",
    section: "Emotional Signals & Motivation",
    weights: { arts_humanities: 0.2, commerce_finance: 0.2, government: 0.2 },
    options: likertOptions,
  },
  {
    id: 35,
    question: "I feel confident making long-term decisions.",
    section: "Emotional Signals & Motivation",
    weights: { government: 0.5, commerce_finance: 0.5, science_tech: 0.4 },
    options: likertOptions,
  },
  {
    id: 36,
    question: "I enjoy learning even when there is no exam or reward.",
    section: "Emotional Signals & Motivation",
    weights: { arts_humanities: 0.5, science_tech: 0.5, creative: 0.4 },
    options: likertOptions,
  },
  {
    id: 37,
    question: "I like exploring new interests even if I’m unsure.",
    section: "Emotional Signals & Motivation",
    weights: { creative: 0.6, arts_humanities: 0.4 },
    options: likertOptions,
  },
  {
    id: 38,
    question: "I worry about choosing the wrong career.",
    section: "Emotional Signals & Motivation",
    weights: { commerce_finance: 0.3, government: 0.3, healthcare: 0.3 },
    options: likertOptions,
  },
  {
    id: 39,
    question: "I feel motivated when my work has meaning.",
    section: "Emotional Signals & Motivation",
    weights: { healthcare: 0.7, arts_humanities: 0.6, government: 0.5 },
    options: likertOptions,
  },
  {
    id: 40,
    question: "I feel ready to explore my career options seriously.",
    section: "Emotional Signals & Motivation",
    weights: { science_tech: 0.4, commerce_finance: 0.4, arts_humanities: 0.4, creative: 0.4, government: 0.4, healthcare: 0.4 },
    options: likertOptions,
  },
];

export const calculateScores = (answers: Record<number, string>): Record<string, number> => {
  const scores: Record<string, number> = {
    science_tech: 0,
    commerce_finance: 0,
    arts_humanities: 0,
    creative: 0,
    government: 0,
    healthcare: 0,
  };

  Object.entries(answers).forEach(([questionId, selectedValue]) => {
    const question = assessmentQuestions.find((q) => q.id === parseInt(questionId));
    if (!question) return;

    const numericScore = scoreByResponse[selectedValue as LikertValue];
    if (numericScore === undefined) return;

    Object.entries(question.weights).forEach(([category, weight]) => {
      scores[category] = (scores[category] || 0) + numericScore * weight;
    });
  });

  return scores;
};

export const getTopCategories = (scores: Record<string, number>, count: number = 3): CareerCategory[] => {
  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([categoryId]) => careerCategories.find((c) => c.id === categoryId)!)
    .filter(Boolean);

  return sortedCategories;
};
