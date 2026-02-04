export interface Question {
  id: number;
  question: string;
  category: 'interest' | 'aptitude' | 'personality' | 'values';
  options: {
    text: string;
    value: string;
    scores: Record<string, number>;
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
    name: 'Science & Technology',
    description: 'Engineering, IT, Research, and Innovation',
    icon: '🔬',
    careers: ['Software Engineer', 'Data Scientist', 'Doctor', 'Research Scientist', 'Civil Engineer', 'Biotechnologist'],
  },
  {
    id: 'commerce_finance',
    name: 'Commerce & Finance',
    description: 'Business, Banking, and Financial Services',
    icon: '📊',
    careers: ['Chartered Accountant', 'Investment Banker', 'Business Analyst', 'Financial Advisor', 'Entrepreneur'],
  },
  {
    id: 'arts_humanities',
    name: 'Arts & Humanities',
    description: 'Literature, History, Languages, and Social Sciences',
    icon: '📚',
    careers: ['Journalist', 'Lawyer', 'Psychologist', 'Teacher', 'Social Worker', 'Content Writer'],
  },
  {
    id: 'creative',
    name: 'Creative & Design',
    description: 'Art, Design, Media, and Entertainment',
    icon: '🎨',
    careers: ['Graphic Designer', 'Architect', 'Film Director', 'Fashion Designer', 'UI/UX Designer', 'Animator'],
  },
  {
    id: 'government',
    name: 'Government & Public Service',
    description: 'Civil Services, Defense, and Public Administration',
    icon: '🏛️',
    careers: ['IAS Officer', 'IPS Officer', 'Defense Officer', 'Diplomat', 'Public Policy Analyst'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medicine',
    description: 'Medical, Nursing, and Allied Health Services',
    icon: '⚕️',
    careers: ['Doctor', 'Surgeon', 'Nurse', 'Pharmacist', 'Physiotherapist', 'Medical Researcher'],
  },
];

export const assessmentQuestions: Question[] = [
  // Interest-based questions
  {
    id: 1,
    question: 'Which activity do you enjoy the most during your free time?',
    category: 'interest',
    options: [
      { text: 'Solving puzzles or playing strategy games', value: 'puzzle', scores: { science_tech: 3, commerce_finance: 2 } },
      { text: 'Reading books or writing stories', value: 'reading', scores: { arts_humanities: 3, creative: 2 } },
      { text: 'Drawing, painting, or crafting', value: 'art', scores: { creative: 3, arts_humanities: 1 } },
      { text: 'Participating in debates or discussions', value: 'debate', scores: { government: 3, arts_humanities: 2 } },
    ],
  },
  {
    id: 2,
    question: 'Which subject do you find most interesting in school?',
    category: 'interest',
    options: [
      { text: 'Mathematics and Physics', value: 'math_physics', scores: { science_tech: 3, commerce_finance: 1 } },
      { text: 'Biology and Chemistry', value: 'biology', scores: { healthcare: 3, science_tech: 2 } },
      { text: 'Economics and Business Studies', value: 'commerce', scores: { commerce_finance: 3, government: 1 } },
      { text: 'History, Geography, or Political Science', value: 'humanities', scores: { government: 3, arts_humanities: 2 } },
    ],
  },
  {
    id: 3,
    question: 'What kind of problems do you prefer solving?',
    category: 'aptitude',
    options: [
      { text: 'Technical problems involving calculations', value: 'technical', scores: { science_tech: 3, commerce_finance: 2 } },
      { text: 'Understanding human behavior and emotions', value: 'human', scores: { healthcare: 2, arts_humanities: 3 } },
      { text: 'Designing creative solutions', value: 'creative', scores: { creative: 3, science_tech: 1 } },
      { text: 'Managing resources and planning', value: 'management', scores: { commerce_finance: 3, government: 2 } },
    ],
  },
  {
    id: 4,
    question: 'How do you prefer to work?',
    category: 'personality',
    options: [
      { text: 'Independently with minimal supervision', value: 'independent', scores: { science_tech: 2, creative: 3 } },
      { text: 'In a team with collaborative efforts', value: 'team', scores: { commerce_finance: 2, government: 2, healthcare: 2 } },
      { text: 'Leading and guiding others', value: 'leader', scores: { government: 3, commerce_finance: 2 } },
      { text: 'Supporting and helping people directly', value: 'support', scores: { healthcare: 3, arts_humanities: 2 } },
    ],
  },
  {
    id: 5,
    question: 'What motivates you the most in your studies?',
    category: 'values',
    options: [
      { text: 'Achieving high marks and academic excellence', value: 'achievement', scores: { science_tech: 2, commerce_finance: 2 } },
      { text: 'Learning new skills and gaining knowledge', value: 'learning', scores: { arts_humanities: 2, science_tech: 2 } },
      { text: 'Preparing for competitive exams like JEE/NEET/UPSC', value: 'competitive', scores: { science_tech: 2, healthcare: 2, government: 3 } },
      { text: 'Building something of my own someday', value: 'entrepreneurship', scores: { commerce_finance: 3, creative: 2 } },
    ],
  },
  {
    id: 6,
    question: 'Which environment would you prefer working in?',
    category: 'personality',
    options: [
      { text: 'A laboratory or research center', value: 'lab', scores: { science_tech: 3, healthcare: 2 } },
      { text: 'A corporate office or business setup', value: 'corporate', scores: { commerce_finance: 3, government: 1 } },
      { text: 'Outdoors or in the field', value: 'field', scores: { government: 2, healthcare: 1, creative: 1 } },
      { text: 'A creative studio or workspace', value: 'studio', scores: { creative: 3, arts_humanities: 1 } },
    ],
  },
  {
    id: 7,
    question: 'How do you handle stressful situations?',
    category: 'personality',
    options: [
      { text: 'I stay calm and analyze the situation logically', value: 'calm', scores: { science_tech: 2, healthcare: 2, government: 2 } },
      { text: 'I seek help from friends or mentors', value: 'seek_help', scores: { arts_humanities: 2, healthcare: 2 } },
      { text: 'I find creative ways to deal with stress', value: 'creative_cope', scores: { creative: 3, arts_humanities: 1 } },
      { text: 'I focus on the goal and push through', value: 'push', scores: { commerce_finance: 2, government: 3 } },
    ],
  },
  {
    id: 8,
    question: 'Which of these roles appeals to you the most?',
    category: 'interest',
    options: [
      { text: 'A scientist developing new technologies', value: 'scientist', scores: { science_tech: 3 } },
      { text: 'A doctor saving lives in a hospital', value: 'doctor', scores: { healthcare: 3 } },
      { text: 'A CEO running a successful company', value: 'ceo', scores: { commerce_finance: 3 } },
      { text: 'An IAS officer serving the nation', value: 'ias', scores: { government: 3 } },
    ],
  },
  {
    id: 9,
    question: 'What kind of impact do you want to make?',
    category: 'values',
    options: [
      { text: 'Innovating and advancing technology', value: 'innovation', scores: { science_tech: 3, creative: 1 } },
      { text: 'Improving people\'s health and wellbeing', value: 'health', scores: { healthcare: 3 } },
      { text: 'Creating wealth and economic growth', value: 'wealth', scores: { commerce_finance: 3 } },
      { text: 'Shaping policies and serving society', value: 'society', scores: { government: 3, arts_humanities: 2 } },
    ],
  },
  {
    id: 10,
    question: 'How important is financial stability to you?',
    category: 'values',
    options: [
      { text: 'Very important - it\'s my top priority', value: 'high', scores: { commerce_finance: 3, science_tech: 1 } },
      { text: 'Important, but not at the cost of passion', value: 'balanced', scores: { creative: 2, arts_humanities: 2 } },
      { text: 'I prefer job security over high salary', value: 'security', scores: { government: 3, healthcare: 1 } },
      { text: 'I want to make a difference, money is secondary', value: 'purpose', scores: { arts_humanities: 3, healthcare: 2 } },
    ],
  },
  {
    id: 11,
    question: 'Which skill do you want to develop the most?',
    category: 'aptitude',
    options: [
      { text: 'Coding and technical skills', value: 'coding', scores: { science_tech: 3 } },
      { text: 'Communication and public speaking', value: 'communication', scores: { government: 2, arts_humanities: 2, commerce_finance: 2 } },
      { text: 'Creative and artistic abilities', value: 'creative', scores: { creative: 3 } },
      { text: 'Medical and healthcare knowledge', value: 'medical', scores: { healthcare: 3 } },
    ],
  },
  {
    id: 12,
    question: 'What type of challenges excite you?',
    category: 'aptitude',
    options: [
      { text: 'Building apps or machines', value: 'building', scores: { science_tech: 3, creative: 1 } },
      { text: 'Understanding complex business strategies', value: 'business', scores: { commerce_finance: 3 } },
      { text: 'Diagnosing and treating health issues', value: 'diagnosis', scores: { healthcare: 3 } },
      { text: 'Solving social and political issues', value: 'social', scores: { government: 3, arts_humanities: 2 } },
    ],
  },
  {
    id: 13,
    question: 'How do you prefer to learn new things?',
    category: 'personality',
    options: [
      { text: 'Through experiments and hands-on practice', value: 'hands_on', scores: { science_tech: 2, healthcare: 2, creative: 2 } },
      { text: 'By reading books and research papers', value: 'reading', scores: { arts_humanities: 3, government: 1 } },
      { text: 'Through discussions and debates', value: 'discussion', scores: { government: 2, commerce_finance: 2 } },
      { text: 'By observing and analyzing patterns', value: 'observe', scores: { science_tech: 2, commerce_finance: 2 } },
    ],
  },
  {
    id: 14,
    question: 'Which of these would you find most rewarding?',
    category: 'values',
    options: [
      { text: 'Getting a patent for an invention', value: 'patent', scores: { science_tech: 3 } },
      { text: 'Saving a patient\'s life', value: 'save_life', scores: { healthcare: 3 } },
      { text: 'Building a successful startup', value: 'startup', scores: { commerce_finance: 3, creative: 1 } },
      { text: 'Implementing a policy that helps millions', value: 'policy', scores: { government: 3 } },
    ],
  },
  {
    id: 15,
    question: 'Where do you see yourself in 10 years?',
    category: 'interest',
    options: [
      { text: 'Leading a tech team at a top company', value: 'tech_lead', scores: { science_tech: 3 } },
      { text: 'Running my own successful business', value: 'business_owner', scores: { commerce_finance: 3, creative: 1 } },
      { text: 'Working in a reputed hospital or clinic', value: 'hospital', scores: { healthcare: 3 } },
      { text: 'Serving in a prestigious government position', value: 'govt_position', scores: { government: 3 } },
    ],
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
    const question = assessmentQuestions.find(q => q.id === parseInt(questionId));
    if (question) {
      const selectedOption = question.options.find(opt => opt.value === selectedValue);
      if (selectedOption) {
        Object.entries(selectedOption.scores).forEach(([category, score]) => {
          scores[category] = (scores[category] || 0) + score;
        });
      }
    }
  });

  return scores;
};

export const getTopCategories = (scores: Record<string, number>, count: number = 3): CareerCategory[] => {
  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([categoryId]) => careerCategories.find(c => c.id === categoryId)!)
    .filter(Boolean);

  return sortedCategories;
};
