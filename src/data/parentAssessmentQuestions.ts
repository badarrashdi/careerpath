export type LikertValue = "strongly_agree" | "agree" | "neutral" | "disagree" | "strongly_disagree";

export interface ParentQuestion {
  id: number;
  question: string;
  section: string;
  options: {
    text: string;
    value: LikertValue;
  }[];
}

const likertOptions = [
  { text: "Strongly Agree", value: "strongly_agree" as LikertValue },
  { text: "Agree", value: "agree" as LikertValue },
  { text: "Neutral", value: "neutral" as LikertValue },
  { text: "Disagree", value: "disagree" as LikertValue },
  { text: "Strongly Disagree", value: "strongly_disagree" as LikertValue },
];

export const parentAssessmentQuestions: ParentQuestion[] = [
  // SECTION 1: BELIEFS ABOUT CAREER & SUCCESS
  {
    id: 1,
    question: "A stable career is more important than a passion-driven career.",
    section: "Beliefs About Career & Success",
    options: likertOptions,
  },
  {
    id: 2,
    question: "Financial security should be the top priority when choosing a career.",
    section: "Beliefs About Career & Success",
    options: likertOptions,
  },
  {
    id: 3,
    question: "Certain careers guarantee long-term success in life.",
    section: "Beliefs About Career & Success",
    options: likertOptions,
  },
  {
    id: 4,
    question: "Society's respect and status matter when choosing a career.",
    section: "Beliefs About Career & Success",
    options: likertOptions,
  },
  {
    id: 5,
    question: "I believe practical careers are safer than creative careers.",
    section: "Beliefs About Career & Success",
    options: likertOptions,
  },
  {
    id: 6,
    question: "I worry that choosing the wrong career can ruin my child's future.",
    section: "Beliefs About Career & Success",
    options: likertOptions,
  },

  // SECTION 2: FINANCIAL REALITIES & RESPONSIBILITIES
  {
    id: 7,
    question: "My family's financial situation influences my child's career options.",
    section: "Financial Realities & Responsibilities",
    options: likertOptions,
  },
  {
    id: 8,
    question: "I prefer my child to choose a career with predictable income.",
    section: "Financial Realities & Responsibilities",
    options: likertOptions,
  },
  {
    id: 9,
    question: "I worry about the return on investment of my child's education.",
    section: "Financial Realities & Responsibilities",
    options: likertOptions,
  },
  {
    id: 10,
    question: "I feel responsible for ensuring my child becomes financially secure.",
    section: "Financial Realities & Responsibilities",
    options: likertOptions,
  },
  {
    id: 11,
    question: "I expect my child to become financially independent at a young age.",
    section: "Financial Realities & Responsibilities",
    options: likertOptions,
  },

  // SECTION 3: DREAMS, FEARS & PROJECTIONS
  {
    id: 12,
    question: "I see some of my own unfulfilled dreams in my child.",
    section: "Dreams, Fears & Projections",
    options: likertOptions,
  },
  {
    id: 13,
    question: "I feel disappointed when my child rejects certain career options.",
    section: "Dreams, Fears & Projections",
    options: likertOptions,
  },
  {
    id: 14,
    question: "I fear my child may struggle if they choose an unconventional path.",
    section: "Dreams, Fears & Projections",
    options: likertOptions,
  },
  {
    id: 15,
    question: "I often compare my child's future with other children.",
    section: "Dreams, Fears & Projections",
    options: likertOptions,
  },
  {
    id: 16,
    question: "I believe following a proven path reduces life risks.",
    section: "Dreams, Fears & Projections",
    options: likertOptions,
  },
  {
    id: 17,
    question: "I worry my child may regret their career decisions later in life.",
    section: "Dreams, Fears & Projections",
    options: likertOptions,
  },

  // SECTION 4: COMMUNICATION & SUPPORT STYLE
  {
    id: 18,
    question: "I openly discuss career choices with my child.",
    section: "Communication & Support Style",
    options: likertOptions,
  },
  {
    id: 19,
    question: "I try to listen more than advise when my child shares thoughts.",
    section: "Communication & Support Style",
    options: likertOptions,
  },
  {
    id: 20,
    question: "I may unintentionally pressure my child while trying to help.",
    section: "Communication & Support Style",
    options: likertOptions,
  },
  {
    id: 21,
    question: "I trust my child to make responsible decisions about their future.",
    section: "Communication & Support Style",
    options: likertOptions,
  },

  // SECTION 5: READINESS FOR EXPLORATION & CHANGE
  {
    id: 22,
    question: "I am comfortable if my child takes time to explore career options.",
    section: "Readiness for Exploration & Change",
    options: likertOptions,
  },
  {
    id: 23,
    question: "I am open to careers that I do not fully understand.",
    section: "Readiness for Exploration & Change",
    options: likertOptions,
  },
  {
    id: 24,
    question: "I believe career paths can change over time.",
    section: "Readiness for Exploration & Change",
    options: likertOptions,
  },
  {
    id: 25,
    question: "I am willing to support my child even if the path feels uncertain.",
    section: "Readiness for Exploration & Change",
    options: likertOptions,
  },
];
