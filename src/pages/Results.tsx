import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { careerCategories } from "@/data/assessmentQuestions";
import { firestore } from "@/integrations/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { 
  Loader2, 
  RefreshCw, 
  Download,
  Sparkles,
  GraduationCap,
  CheckCircle2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AssessmentResult {
  id: string;
  scores: Record<string, number>;
  aiAnalysis: string | null;
  completedAt: string;
}

interface RawAssessmentResult {
  id: string;
  scores: unknown;
  answers?: Record<number, string>;
  parentAnswers?: Record<number, string>;
  aiAnalysis: string | null;
  completedAt: Timestamp | string | undefined;
}

type UserProfile = {
  fullName?: string;
  parentName?: string;
};

const sanitizeName = (value?: string | null) => value?.trim() || "";

const filteredCategories = careerCategories.filter((c) => c.id !== "creative");

const removeCreativeCategory = (scores: Record<string, number>) =>
  Object.fromEntries(Object.entries(scores).filter(([id]) => id !== "creative"));

const parentAssessmentForm = [
  "# CAREERPATH - PARENT DISCOVERY ASSESSMENT",
  "(Standard Version | For All Parents)",
  "",
  "Parent Name: ___________________________",
  "Child Name: ___________________________",
  "Date: ___________________",
  "",
  "## Instructions for Parents",
  "Please read each statement carefully and select the option that best reflects your thinking.",
  "There are no right or wrong answers.",
  "Your honest responses will help us guide your child without creating pressure.",
  "",
  "### Answer Options (for every statement)",
  "- Strongly Agree",
  "- Agree",
  "- Neutral",
  "- Disagree",
  "- Strongly Disagree",
  "",
  "## SECTION 1: BELIEFS ABOUT CAREER & SUCCESS",
  "1. A stable career is more important than a passion-driven career.",
  "2. Financial security should be the top priority when choosing a career.",
  "3. Certain careers guarantee long-term success in life.",
  "4. Society's respect and status matter when choosing a career.",
  "5. I believe practical careers are safer than creative careers.",
  "6. I worry that choosing the wrong career can ruin my child's future.",
  "",
  "## SECTION 2: FINANCIAL REALITIES & RESPONSIBILITIES",
  "7. My family's financial situation influences my child's career options.",
  "8. I prefer my child to choose a career with predictable income.",
  "9. I worry about the return on investment of my child's education.",
  "10. I feel responsible for ensuring my child becomes financially secure.",
  "11. I expect my child to become financially independent at a young age.",
  "",
  "## SECTION 3: DREAMS, FEARS & PROJECTIONS",
  "12. I see some of my own unfulfilled dreams in my child.",
  "13. I feel disappointed when my child rejects certain career options.",
  "14. I fear my child may struggle if they choose an unconventional path.",
  "15. I often compare my child's future with other children.",
  "16. I believe following a proven path reduces life risks.",
  "17. I worry my child may regret their career decisions later in life.",
  "",
  "## SECTION 4: COMMUNICATION & SUPPORT STYLE",
  "18. I openly discuss career choices with my child.",
  "19. I try to listen more than advise when my child shares thoughts.",
  "20. I may unintentionally pressure my child while trying to help.",
  "21. I trust my child to make responsible decisions about their future.",
  "",
  "## SECTION 5: READINESS FOR EXPLORATION & CHANGE",
  "22. I am comfortable if my child takes time to explore career options.",
  "23. I am open to careers that I do not fully understand.",
  "24. I believe career paths can change over time.",
  "25. I am willing to support my child even if the path feels uncertain.",
].join("\n");

const deriveNames = (profile: UserProfile | null, userEmail?: string | null, userDisplayName?: string | null) => {
  const emailName = userEmail ? userEmail.split("@")[0] : "";
  const studentName = sanitizeName(profile?.fullName) || sanitizeName(userDisplayName) || emailName || "Student";
  const parentName = sanitizeName(profile?.parentName) || "Parent/Guardian";
  return { studentName, parentName };
};

const buildPathoraReport = (
  scores: Record<string, number>,
  studentName: string,
  parentName: string,
  studentAnswers?: Record<number, string>,
  parentAnswers?: Record<number, string>
) => {
  const filteredScores = removeCreativeCategory(scores);
  const sorted = Object.entries(filteredScores)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => ({ id, score: filteredScores[id] }));
  const topCategories = sorted
    .slice(0, 3)
    .map(({ id }) => filteredCategories.find((c) => c.id === id))
    .filter(Boolean) as typeof filteredCategories;

  const primary = topCategories[0]?.name || "Exploration";
  const secondaryNames = topCategories.slice(1).map((c) => c.name).join(", ") || "Secondary options to explore";

  const ranked = filteredCategories
    .map((c) => ({ name: c.name, score: filteredScores[c.id] || 0 }))
    .sort((a, b) => a.score - b.score);
  const lowEnergy = ranked.slice(0, 2).map((c) => c.name).join(", ") || "Rote-heavy paths";

  // Analyze student responses for personalized insights
  const analyzeStudentProfile = () => {
    if (!studentAnswers) return { thinkingStyle: 'exploratory', learningStyle: 'visual', decisionStyle: 'reflective' };
    
    const responses = Object.values(studentAnswers);
    const stronglyAgree = responses.filter(r => r.includes('Strongly Agree')).length;
    const agree = responses.filter(r => r.includes('Agree') && !r.includes('Strongly')).length;
    const disagree = responses.filter(r => r.includes('Disagree')).length;
    
    // Determine thinking style based on response patterns
    const thinkingStyle = stronglyAgree > 8 ? 'decisive and confident' : 
                         stronglyAgree < 3 ? 'exploratory and reflective' :
                         'balanced and analytical';
    
    const learningStyle = scores['technology'] > 60 ? 'logical and systematic' :
                         scores['healthcare'] > 60 ? 'empathetic and practical' :
                         scores['business'] > 60 ? 'strategic and goal-oriented' :
                         'visual and experiential';
    
    const decisionStyle = disagree > 10 ? 'independent and questioning' :
                         agree > 15 ? 'collaborative and cautious' :
                         'moderate and thoughtful';
    
    return { thinkingStyle, learningStyle, decisionStyle };
  };

  // Analyze parent responses for pressure indicators
  const analyzeParentProfile = () => {
    if (!parentAnswers) return { pressureLevel: 'moderate', concernAreas: ['stability'], supportStyle: 'involved' };
    
    const responses = Object.values(parentAnswers);
    const stronglyAgree = responses.filter(r => r.includes('Strongly Agree')).length;
    const concerns = [];
    
    // Questions 1-6: Career beliefs
    if (parentAnswers[1]?.includes('Strongly Agree') || parentAnswers[2]?.includes('Strongly Agree')) {
      concerns.push('financial stability');
    }
    if (parentAnswers[6]?.includes('Strongly Agree')) {
      concerns.push('future regret');
    }
    
    // Questions 7-11: Financial concerns
    const financialWorry = [7,8,9,10,11].filter(q => parentAnswers[q]?.includes('Agree')).length;
    if (financialWorry >= 3) concerns.push('economic security');
    
    // Questions 12-17: Fears and projections
    const fearCount = [14,15,16,17].filter(q => parentAnswers[q]?.includes('Agree')).length;
    
    const pressureLevel = stronglyAgree > 10 ? 'high' : stronglyAgree > 5 ? 'moderate' : 'low';
    const supportStyle = parentAnswers[18]?.includes('Agree') && parentAnswers[19]?.includes('Agree') ? 
                        'communicative and trusting' : 'protective and directive';
    
    return { 
      pressureLevel, 
      concernAreas: concerns.length > 0 ? concerns : ['child\'s wellbeing'],
      supportStyle,
      fearCount
    };
  };

  const studentProfile = analyzeStudentProfile();
  const parentProfile = analyzeParentProfile();

  const lines: string[] = [];

  lines.push(`# CAREERPATH - STUDENT DEEP INSIGHT REPORT`);
  lines.push(`\n(Student-Facing | Simple Language | Deep Guidance)`);
  lines.push(`\nStudent Name: ${studentName}`);
  lines.push(`\nAssessment Type: CareerPath Student Discovery Assessment`);
  lines.push(`\nPurpose: Self-understanding, not career decision`);

  lines.push(`\n## 1. WHY THIS REPORT EXISTS`);
  lines.push(`This report is not here to decide your future or label you.`);
  lines.push(``);
  lines.push(`Based on your actual responses, this report helps you understand:`);
  lines.push(`- How your mind naturally works (${studentProfile.thinkingStyle})`);
  lines.push(`- How you learn best (${studentProfile.learningStyle})`);
  lines.push(`- Why certain career paths feel exciting while others feel draining`);
  lines.push(``);
  lines.push(`**You are not expected to have everything figured out right now.**`);
  lines.push(``);
  lines.push(`This report exists to:`);
  lines.push(`1. Validate your natural thinking style instead of forcing you to be someone else`);
  lines.push(`2. Show you that confusion or clarity are both normal depending on your personality`);
  lines.push(`3. Give you permission to explore at your own pace`);
  lines.push(``);
  lines.push(`Every insight here comes from analyzing your specific responses—not generic advice.`);

  lines.push(`\n## 2. WHO YOU ARE - HOW YOUR MIND WORKS`);
  lines.push(`Your responses show that you are a **${studentProfile.thinkingStyle} thinker**.`);
  
  if (studentProfile.thinkingStyle.includes('exploratory')) {
    lines.push(`This means:`);
    lines.push(`- You like to understand deeply before deciding`);
    lines.push(`- You think in ideas, images, and possibilities`);
    lines.push(`- You do not feel comfortable rushing into choices`);
    lines.push(`This is not confusion—this is thoughtful wisdom.`);
  } else if (studentProfile.thinkingStyle.includes('decisive')) {
    lines.push(`This means:`);
    lines.push(`- You make decisions relatively quickly once you have clarity`);
    lines.push(`- You prefer clear direction and actionable steps`);
    lines.push(`- You thrive when given structure and goals`);
    lines.push(`This decisiveness is a strength when paired with good information.`);
  } else {
    lines.push(`This means:`);
    lines.push(`- You balance careful thought with timely action`);
    lines.push(`- You weigh multiple perspectives before deciding`);
    lines.push(`- You adapt your approach based on the situation`);
    lines.push(`This balanced approach helps you make sound decisions.`);
  }
  
  lines.push(`People with your mindset often succeed when their natural style is supported, not forced to change.`);

  lines.push(`\n## 3. WHY YOU SOMETIMES FEEL CONFUSED`);
  
  if (studentProfile.thinkingStyle.includes('exploratory')) {
    lines.push(`You may sometimes feel unsure when others around you seem very certain.`);
    lines.push(`This happens because:`);
    lines.push(`- You want meaning and purpose, not just stability`);
    lines.push(`- You resist choosing something purely because it feels "safe"`);
    lines.push(`- You need to feel genuine connection to your path`);
    lines.push(`This thoughtful hesitation is wisdom, not weakness—it's your mind protecting you from wrong fits.`);
  } else if (studentProfile.thinkingStyle.includes('decisive')) {
    lines.push(`You may sometimes feel frustrated when exploration takes too long.`);
    lines.push(`This happens because:`);
    lines.push(`- You prefer clarity and forward movement`);
    lines.push(`- Prolonged uncertainty feels uncomfortable`);
    lines.push(`- You want to take action once you have enough information`);
    lines.push(`Your desire for momentum is valuable—channel it into structured exploration rather than rushed decisions.`);
  } else {
    lines.push(`You may sometimes feel torn between moving forward and gathering more information.`);
    lines.push(`This happens because:`);
    lines.push(`- You want to be thorough but also timely`);
    lines.push(`- You see value in both caution and action`);
    lines.push(`- You're balancing multiple voices and perspectives`);
    lines.push(`This balanced struggle is normal—you're learning to trust your judgment.`);
  }

  lines.push(`\n## 4. HOW YOU LEARN BEST`);
  lines.push(`Based on your responses, your learning style is **${studentProfile.learningStyle}**.`);
  
  if (studentProfile.learningStyle.includes('logical')) {
    lines.push(`You learn best when:`);
    lines.push(`- Concepts follow clear logic and systems`);
    lines.push(`- You can break down problems step-by-step`);
    lines.push(`- There's structure and clear objectives`);
    lines.push(`You feel drained when learning is vague, unstructured, or illogical.`);
  } else if (studentProfile.learningStyle.includes('empathetic')) {
    lines.push(`You learn best when:`);
    lines.push(`- Content connects to real human experiences`);
    lines.push(`- Learning involves interaction and observation`);
    lines.push(`- You can see practical application to helping others`);
    lines.push(`You feel drained when learning is purely theoretical with no human element.`);
  } else if (studentProfile.learningStyle.includes('strategic')) {
    lines.push(`You learn best when:`);
    lines.push(`- You understand the practical outcomes and goals`);
    lines.push(`- Learning leads to tangible results`);
    lines.push(`- You can apply knowledge to real situations`);
    lines.push(`You feel drained when learning lacks clear purpose or application.`);
  } else {
    lines.push(`You learn best when:`);
    lines.push(`- Learning is visual and experiential`);
    lines.push(`- Ideas are connected to real life`);
    lines.push(`- You can explore and discover through projects`);
    lines.push(`You feel drained when learning is repetitive with heavy memorization.`);
  }
  
  lines.push(`This is your natural learning strength—not a limitation.`);

  lines.push(`\n## 5. YOUR INTEREST PATTERNS (NO LABELS)`);
  lines.push(`Your energy is strongest when:`);
  lines.push(`- You can imagine and create`);
  lines.push(`- You can work with ideas, visuals, or space`);
  lines.push(`- You can see or build something meaningful`);
  lines.push(`Right now, your strongest pull is toward ${primary}.`);
  lines.push(`Secondary interests worth exploring: ${secondaryNames}.`);

  lines.push(`\n## 6. CAREER DIRECTION ZONES`);
  lines.push(`- **Primary Exploration Zone:** ${primary}`);
  lines.push(`- **Secondary Exploration Zone:** ${secondaryNames}`);
  lines.push(`- **Low-Energy Zone:** ${lowEnergy}`);
  lines.push(`Exploration is not delay.`);
  lines.push(`Exploration is wisdom.`);

  lines.push(`\n## 7. WHAT THIS REPORT DOES NOT SAY`);
  lines.push(`This report does NOT say:`);
  lines.push(`- You cannot do science`);
  lines.push(`- You are not capable`);
  lines.push(`- You must choose a creative career`);
  lines.push(`It says:`);
  lines.push(`"Take time to explore before committing."`);

  lines.push(`\n## 8. YOUR 12-18 MONTH PLAN`);
  
  if (studentProfile.thinkingStyle.includes('exploratory')) {
    lines.push(`**For exploratory thinkers like you, patience is key:**`);
    lines.push(`- **Next 3 months:** Observe and reflect—no pressure to decide anything`);
    lines.push(`- **Months 4-6:** Try 2-3 short exposure experiences in your interest areas`);
    lines.push(`- **Months 7-12:** Deep dive into 1-2 paths that felt right during exposure`);
    lines.push(`- **Months 13-18:** Make informed decision with confidence, not pressure`);
  } else if (studentProfile.thinkingStyle.includes('decisive')) {
    lines.push(`**For decisive thinkers like you, structured exploration works:**`);
    lines.push(`- **Next 2 months:** Research your top 3 interest areas systematically`);
    lines.push(`- **Months 3-4:** Do focused exposure in each area (short internships, projects)`);
    lines.push(`- **Months 5-8:** Choose primary path and create detailed action plan`);
    lines.push(`- **Months 9-12:** Begin skill-building and validation before full commitment`);
  } else {
    lines.push(`**For balanced thinkers like you, flexible structure helps:**`);
    lines.push(`- **Next 3 months:** List options and research broadly without commitment`);
    lines.push(`- **Months 4-8:** Try diverse experiences to test your interests`);
    lines.push(`- **Months 9-12:** Narrow to 2-3 strong possibilities`);
    lines.push(`- **Months 13-18:** Make thoughtful choice with room for adjustment`);
  }

  lines.push(`\n## 9. MESSAGE FOR YOU`);
  
  if (studentProfile.thinkingStyle.includes('exploratory')) {
    lines.push(`You are not behind. You are not lost.`);
    lines.push(`You are **thoughtfully preparing** for a decision that matters.`);
    lines.push(`Your cautious approach will lead to better long-term fit than rushed choices.`);
    lines.push(``);
    lines.push(`Give yourself permission to explore without guilt.`);
  } else if (studentProfile.thinkingStyle.includes('decisive')) {
    lines.push(`You have natural clarity and direction.`);
    lines.push(`Your ability to decide confidently is a strength—not recklessness.`);
    lines.push(`Trust your judgment, but validate it with real experience before fully committing.`);
    lines.push(``);
    lines.push(`Your decisiveness will serve you well when paired with good information.`);
  } else {
    lines.push(`You are finding your own rhythm between thought and action.`);
    lines.push(`Your balanced approach means you'll make sound, tested decisions.`);
    lines.push(`You're learning to trust yourself—and that is your greatest strength.`);
    lines.push(``);
    lines.push(`Keep listening to your own voice amidst all the external opinions.`);
  }

  lines.push(`\n# CAREERPATH - PARENT DEEP GUIDANCE REPORT`);
  lines.push(`(Parent-Facing | Simple Language | Deep Reflection)`);
  lines.push(`Parent Name: ${parentName}`);
  lines.push(`Student Name: ${studentName}`);

  lines.push(`\n## 1. WHY THIS REPORT EXISTS`);
  lines.push(`This report is not about judging parenting.`);
  lines.push(`It is about helping you support your child without creating pressure.`);
  lines.push(`Every caring parent worries about stability, security, and future success.`);
  lines.push(`These concerns come from love.`);

  lines.push(`\n## 2. YOUR PARENTING MINDSET`);
  lines.push(`Your responses indicate a **${parentProfile.supportStyle}** parenting approach.`);
  lines.push(`Your primary concerns center around: ${parentProfile.concernAreas.join(', ')}.`);
  lines.push(``);
  
  if (parentProfile.pressureLevel === 'high') {
    lines.push(`Current pressure level: **High**`);
    lines.push(`Your strong involvement comes from deep care, but ${studentName} may experience this as significant pressure.`);
    lines.push(`High concern can inadvertently reduce a child's confidence in their own judgment.`);
  } else if (parentProfile.pressureLevel === 'moderate') {
    lines.push(`Current pressure level: **Moderate**`);
    lines.push(`You maintain healthy involvement while giving ${studentName} room to think.`);
    lines.push(`This balanced approach supports without overwhelming.`);
  } else {
    lines.push(`Current pressure level: **Low to Moderate**`);
    lines.push(`You demonstrate trust and openness in your approach.`);
    lines.push(`This creates space for ${studentName} to develop confidence in their own decisions.`);
  }

  lines.push(`\n## 3. YOUR FEARS ARE HUMAN`);
  lines.push(`Your specific concerns include: ${parentProfile.concernAreas.join(', ')}.`);
  
  if (parentProfile.concernAreas.includes('financial stability')) {
    lines.push(`Your focus on financial security is completely understandable.`);
    lines.push(`However, excessive financial fear can be transmitted to ${studentName}, creating anxiety rather than motivation.`);
  }
  
  if (parentProfile.concernAreas.includes('future regret')) {
    lines.push(`Your worry about ${studentName} making regrettable choices is normal.`);
    lines.push(`But oversharing this fear can paralyze rather than guide them.`);
  }
  
  if (parentProfile.fearCount && parentProfile.fearCount > 2) {
    lines.push(``);
    lines.push(`You carry multiple significant worries about ${studentName}'s future.`);
    lines.push(`While natural, when children sense this level of concern, it often increases their self-doubt.`);
    lines.push(`Your job is not to remove all risk—it's to help ${studentName} develop the confidence to handle challenges.`);
  } else {
    lines.push(``);
    lines.push(`Your concerns are measured and thoughtful.`);
    lines.push(`You're successfully balancing care with trust.`);
  }

  lines.push(`\n## 4. UNDERSTANDING ${studentName.toUpperCase()}'S MINDSET`);
  lines.push(`${studentName} has an exploratory and reflective mind.`);
  lines.push(`They need:`);
  lines.push(`- Time`);
  lines.push(`- Reassurance`);
  lines.push(`- Trust`);
  lines.push(`Pressure, even unintentional, can reduce confidence.`);

  lines.push(`\n## 5. THE GAP BETWEEN YOU (NORMAL AND HEALTHY)`);
  
  const gapDescription = studentProfile.thinkingStyle.includes('exploratory') && parentProfile.pressureLevel === 'high' ?
    'significant but bridgeable' : 
    studentProfile.thinkingStyle.includes('decisive') && parentProfile.pressureLevel === 'low' ?
    'minimal - you are well-aligned' :
    'moderate and manageable';
  
  lines.push(`The gap between you is **${gapDescription}**.`);
  
  if (gapDescription.includes('significant')) {
    lines.push(`You prioritize security and certainty.`);
    lines.push(`${studentName} needs exploration and meaning.`);
    lines.push(`Both are valid—but the mismatch can create tension.`);
    lines.push(`Understanding this gap is the first step to bridging it.`);
  } else if (gapDescription.includes('minimal')) {
    lines.push(`Your values and ${studentName}'s natural style align well.`);
    lines.push(`This harmony creates a supportive environment for career exploration.`);
    lines.push(`Continue maintaining this trust-based approach.`);
  } else {
    lines.push(`You value ${parentProfile.concernAreas[0]}.`);
    lines.push(`${studentName} is ${studentProfile.thinkingStyle}.`);
    lines.push(`These differences are normal and can coexist with understanding.`);
  }

  lines.push(`\n## 6. HOW PRESSURE IS CREATED WITHOUT INTENTION`);
  
  if (parentProfile.pressureLevel === 'high') {
    lines.push(`Based on your responses, pressure is likely being created through:`);
    lines.push(`- Frequent conversations about career and future`);
    lines.push(`- Expressing worries about uncertainty or unconventional choices`);
    lines.push(`- Making comparisons with peers who seem more decided`);
    lines.push(`- Repeated emphasis on financial security`);
    lines.push(``);
    lines.push(`Even when delivered gently, these messages accumulate and create emotional weight.`);
  } else if (parentProfile.pressureLevel === 'low') {
    lines.push(`Your approach minimizes unintentional pressure:`);
    lines.push(`- You give ${studentName} space to think without constant questioning`);
    lines.push(`- You express trust in their judgment`);
    lines.push(`- You avoid comparisons and urgent timelines`);
    lines.push(``);
    lines.push(`Continue this trust-based approach—it builds healthy confidence.`);
  } else {
    lines.push(`Pressure can be created through:`);
    lines.push(`- Repeated future-focused questions (even gentle ones)`);
    lines.push(`- Subtle comparisons with other students`);
    lines.push(`- Conversations that emphasize risk over opportunity`);
    lines.push(``);
    lines.push(`Monitor the frequency and tone of career discussions to prevent accumulation.`);
  }

  lines.push(`\n## 7. HOW TO SUPPORT WITHOUT PRESSURE`);
  lines.push(`Say more of:`);
  lines.push(`- "You do not need to decide now"`);
  lines.push(`- "I trust you"`);
  lines.push(`- "Let us explore together"`);
  lines.push(`Avoid:`);
  lines.push(`- "Time is running out"`);
  lines.push(`- "This is risky"`);
  lines.push(`- "Others already know"`);

  lines.push(`\n## 8. YOUR ROLE GOING FORWARD`);
  
  if (parentProfile.pressureLevel === 'high') {
    lines.push(`**Critical shift needed:** Move from director to consultant.`);
    lines.push(`Your current role: Decision-influencer (high involvement)`);
    lines.push(`Better role: Trusted advisor (available when asked)`);
    lines.push(``);
    lines.push(`This means:`);
    lines.push(`- Reduce frequency of career conversations`);
    lines.push(`- Ask "What do you need from me?" instead of offering unsolicited advice`);
    lines.push(`- Share information, not opinions`);
    lines.push(`- Trust that ${studentName}'s uncertainty is part of their process`);
  } else if (parentProfile.pressureLevel === 'low') {
    lines.push(`**Maintain current approach:** You've found a healthy balance.`);
    lines.push(`Your role: Supportive guide (present but not controlling)`);
    lines.push(``);
    lines.push(`Continue:`);
    lines.push(`- Being available when ${studentName} seeks input`);
    lines.push(`- Asking questions that facilitate their thinking`);
    lines.push(`- Expressing confidence in their ability to figure things out`);
    lines.push(`- Supporting exploration without pushing timelines`);
  } else {
    lines.push(`**Refine your balance:** You're close to ideal support.`);
    lines.push(`Your role: Engaged partner (involved but not overwhelming)`);
    lines.push(``);
    lines.push(`Adjust by:`);
    lines.push(`- Letting ${studentName} initiate most career conversations`);
    lines.push(`- Focusing on their feelings and thoughts, not outcomes`);
    lines.push(`- Providing resources rather than directions`);
    lines.push(`- Trusting their timeline while offering gentle structure`);
  }
  
  lines.push(``);
  lines.push(`Remember: Trust builds confidence. Control builds fear.`);

  lines.push(`\n## 9. MESSAGE FOR PARENTS`);
  
  if (parentProfile.pressureLevel === 'high') {
    lines.push(`Your intense involvement shows how much you care.`);
    lines.push(`Now channel that care into trust rather than control.`);
    lines.push(``);
    lines.push(`The greatest gift you can give ${studentName} is confidence in their own judgment.`);
    lines.push(`That confidence grows through your trust, not through your worry.`);
  } else if (parentProfile.pressureLevel === 'low') {
    lines.push(`Your trust-based approach is a tremendous strength.`);
    lines.push(`${studentName} is fortunate to have parents who support without smothering.`);
    lines.push(``);
    lines.push(`Continue being available without being intrusive.`);
    lines.push(`Your balanced involvement is exactly what they need.`);
  } else {
    lines.push(`Your caring involvement is a strength.`);
    lines.push(`Your growing awareness of pressure dynamics makes it even stronger.`);
    lines.push(``);
    lines.push(`The best parents aren't perfect—they're thoughtful and willing to adjust.`);
    lines.push(`You're on the right path.`);
  }

  lines.push(`\n# CAREERPATH - FAMILY ALIGNMENT REPORT`);
  lines.push(`(Shared Report | Student and Parent Together)`);

  lines.push(`\n## 1. WHY THIS REPORT IS SHARED`);
  lines.push(`This report is meant to be read together.`);
  lines.push(`It helps both sides understand each other and move forward as a team.`);

  lines.push(`\n## 2. WHAT THE ASSESSMENTS SHOW`);
  lines.push(`- ${studentName} is a **${studentProfile.thinkingStyle} thinker** with **${studentProfile.learningStyle}** learning style`);
  lines.push(`- Parents show **${parentProfile.pressureLevel} concern level** with **${parentProfile.supportStyle}** approach`);
  
  if (parentProfile.pressureLevel === 'high' && studentProfile.thinkingStyle.includes('exploratory')) {
    lines.push(``);
    lines.push(`**Critical insight:** There is a mismatch between parental urgency and student readiness.`);
    lines.push(`This creates internal conflict for ${studentName}.`);
  } else if (parentProfile.pressureLevel === 'low' && studentProfile.thinkingStyle.includes('decisive')) {
    lines.push(``);
    lines.push(`**Positive alignment:** Parental trust matches student readiness to move forward.`);
    lines.push(`This is an ideal environment for confident decision-making.`);
  } else {
    lines.push(``);
    lines.push(`**Moderate alignment:** Both perspectives have merit and can be bridged with communication.`);
  }

  lines.push(`\n## 3. UNDERSTANDING EACH OTHER`);
  lines.push(`- **For Parents:** ${studentName}'s hesitation is not avoidance. It is careful thinking.`);
  lines.push(`- **For ${studentName}:** Parental concern comes from love, not doubt.`);

  lines.push(`\n## 4. WHERE YOU AGREE`);
  lines.push(`- Both want a meaningful life`);
  lines.push(`- Both want long-term success`);
  lines.push(`- Both want confidence, not fear`);
  lines.push(`Values are aligned.`);
  lines.push(`Approach is different.`);

  lines.push(`\n## 5. HOW TO TALK ABOUT CAREERS TOGETHER`);
  lines.push(`- Talk less often, but more calmly`);
  lines.push(`- Focus on experiences, not outcomes`);
  lines.push(`- Treat this as a shared journey`);

  lines.push(`\n## 6. SHARED 12-18 MONTH PLAN`);
  
  if (parentProfile.pressureLevel === 'high' && studentProfile.thinkingStyle.includes('exploratory')) {
    lines.push(`**For your specific dynamic:**`);
    lines.push(`- **Months 1-3:** Parents: Practice restraint. ${studentName}: Observe freely without reporting back constantly.`);
    lines.push(`- **Months 4-6:** Together: Discuss observations calmly, without judgment or urgency.`);
    lines.push(`- **Months 7-12:** ${studentName} leads exploration. Parents support resources without directing.`);
    lines.push(`- **Months 13-18:** Final decision made by ${studentName} with parental input welcomed but not decisive.`);
  } else if (parentProfile.pressureLevel === 'low') {
    lines.push(`**For your well-aligned dynamic:**`);
    lines.push(`- **Months 1-6:** ${studentName} explores at their own pace with occasional check-ins`);
    lines.push(`- **Months 7-12:** Deeper investigation into promising paths`);
    lines.push(`- **Months 13-18:** Decision emerges naturally through experience and reflection`);
    lines.push(`Your existing trust allows organic discovery—maintain it.`);
  } else {
    lines.push(`**For your moderately aligned dynamic:**`);
    lines.push(`- **Months 1-3:** Set clear expectations together—what support looks like, what pressure doesn't`);
    lines.push(`- **Months 4-6:** Scheduled exploration with monthly (not daily) family discussions`);
    lines.push(`- **Months 7-12:** ${studentName} narrows options; parents provide feedback when asked`);
    lines.push(`- **Months 13-18:** Collaborative decision-making with ${studentName} having final say`);
  }

  lines.push(`\n## 7. FINAL MESSAGE TO BOTH`);
  
  const dynamicMessage = parentProfile.pressureLevel === 'high' && studentProfile.thinkingStyle.includes('exploratory') ?
    'You need each other, but you\'re currently working against each other. Trust is the bridge.' :
    parentProfile.pressureLevel === 'low' ?
    'You have a healthy, trusting dynamic. Protect it as ${studentName} navigates decisions.' :
    'You\'re close to ideal alignment. Small adjustments in communication will get you there.';
  
  lines.push(`**${dynamicMessage}**`);
  lines.push(``);
  lines.push(`- **To Parents:** ${parentProfile.pressureLevel === 'high' ? 'Loosen your grip. Trust strengthens children.' : 'Your trust is working. Keep believing in ' + studentName + '.'}`);
  lines.push(`- **To ${studentName}:** ${studentProfile.thinkingStyle.includes('exploratory') ? 'Exploration is allowed. Take the time you need.' : 'Your natural clarity is a gift. Use it wisely with good information.'}`);
  lines.push(`- **To Both:** You are on the same team. Act like it.`);
  lines.push(``);
  lines.push(`Every successful career begins not with a perfect plan, but with healthy family dynamics.`);

  lines.push(`\n## CLOSING THOUGHT`);
  lines.push(`Careers are not built in one decision.`);
  lines.push(`They are built through trust, patience, and understanding.`);

  return lines.join("\n");
};

const Results = () => {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentName, setStudentName] = useState("Student");
  const [parentName, setParentName] = useState("Parent/Guardian");
  const reportRef = useRef<HTMLDivElement>(null);
  
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
      let loadedProfile: UserProfile | null = null;
      if (user?.uid) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          loadedProfile = userDoc.data() as UserProfile;
          setProfile(loadedProfile);
        }
      }

      const { studentName: derivedStudent, parentName: derivedParent } = deriveNames(
        loadedProfile,
        user?.email || null,
        user?.displayName || null
      );
      setStudentName(derivedStudent);
      setParentName(derivedParent);

      const resultsRef = collection(firestore, "assessment_results");
      const resultsQuery = query(
        resultsRef,
        where("userId", "==", user?.uid),
        orderBy("completedAt", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(resultsQuery);

      if (snapshot.empty) {
        navigate("/assessment");
        return;
      }

      const docSnapshot = snapshot.docs[0];
      const data = docSnapshot.data() as RawAssessmentResult;
      const completedAtValue = data.completedAt instanceof Timestamp
        ? data.completedAt.toDate().toISOString()
        : typeof data.completedAt === "string"
          ? data.completedAt
          : new Date().toISOString();

      const analysisFromDb = (data as any).ai_analysis || data.aiAnalysis || null;
      const needsPersonalized =
        !analysisFromDb ||
        analysisFromDb.includes("Asher Alice Mathew") ||
        analysisFromDb.includes("Jegu Mathew") ||
        (derivedStudent && !analysisFromDb.includes(derivedStudent)) ||
        (analysisFromDb && analysisFromDb.includes("Creative & Design"));

      const filteredScores = removeCreativeCategory((data.scores || {}) as Record<string, number>);
      const studentAnswers = data.answers || {};
      const parentAnswers = data.parentAnswers || {};

      const generatedAnalysis = needsPersonalized
        ? await generateAIAnalysis(docSnapshot.id, filteredScores, derivedStudent, derivedParent, studentAnswers, parentAnswers)
        : analysisFromDb;
      const finalAnalysis = generatedAnalysis || analysisFromDb || null;

      const typedResult: AssessmentResult = {
        id: docSnapshot.id,
        scores: filteredScores,
        aiAnalysis: finalAnalysis,
        completedAt: completedAtValue,
      };

      setResult(typedResult);
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

  const generateAIAnalysis = async (
    resultId: string,
    scores: Record<string, number>,
    currentStudentName: string,
    currentParentName: string,
    studentAnswers?: Record<number, string>,
    parentAnswers?: Record<number, string>
  ) => {
    setIsAnalyzing(true);
    try {
      const analysis = buildPathoraReport(scores, currentStudentName, currentParentName, studentAnswers, parentAnswers);

      await updateDoc(doc(firestore, "assessment_results", resultId), {
        aiAnalysis: analysis,
      });

      setResult((prev) => prev ? { ...prev, aiAnalysis: analysis } : null);

      toast({
        title: "Analysis Complete!",
        description: "Your personalized career insights are ready.",
      });

      return analysis;
    } catch (error: any) {
      console.error("AI analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message || "Please try again later.",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !result?.aiAnalysis) return;

    setIsDownloadingPDF(true);
    try {
      const element = reportRef.current;
      
      // Clone the element for PDF generation with enhanced styling
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '170mm';
      clone.style.minWidth = '170mm';
      clone.style.maxWidth = '170mm';
      clone.style.padding = '25mm 20mm';
      clone.style.margin = '0';
      clone.style.backgroundColor = '#ffffff';
      clone.style.fontSize = '11pt';
      clone.style.lineHeight = '1.6';
      clone.style.boxSizing = 'border-box';
      
      // Remove download button from PDF
      const downloadButton = clone.querySelector('button');
      if (downloadButton) {
        downloadButton.remove();
      }
      
      // Add CSS for better page breaks
      const style = document.createElement('style');
      style.textContent = `
        h1, h2, h3 { page-break-after: avoid; page-break-inside: avoid; }
        p { page-break-inside: avoid; orphans: 3; widows: 3; }
        ul { page-break-inside: avoid; }
      `;
      clone.appendChild(style);
      
      // Append clone temporarily off-screen
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: clone.scrollHeight,
      });

      // Remove clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png', 0.92);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate dimensions - center content on page
      const imgWidthMM = pdfWidth;
      const imgHeightMM = (imgHeight * pdfWidth) / imgWidth;
      
      // Calculate pages needed
      const totalPages = Math.ceil(imgHeightMM / pdfHeight);
      
      // Add pages with proper positioning
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const yOffset = -(i * pdfHeight);
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidthMM, imgHeightMM, undefined, 'FAST');
      }

      pdf.save(`CareerPath-Report-${studentName.replace(/\s+/g, '-')}.pdf`);

      toast({
        title: "PDF Downloaded!",
        description: "Your career report has been saved successfully.",
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not generate PDF. Please try again.",
      });
    } finally {
      setIsDownloadingPDF(false);
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

  const filteredScoresForView = removeCreativeCategory(result.scores);
  const topCategories = Object.entries(filteredScoresForView)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => filteredCategories.find((c) => c.id === id))
    .filter(Boolean) as typeof filteredCategories;

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

        <div className="max-w-5xl mx-auto">
          {/* AI Analysis */}
          <div className="w-full">
            <div ref={reportRef} data-pdf-clone className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-gray-900">AI-Powered Career Analysis</h3>
                    <p className="text-sm text-gray-600">Personalized insights from CareerPath AI</p>
                  </div>
                </div>
                {result.aiAnalysis && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPDF}
                    className="gap-2"
                  >
                    {isDownloadingPDF ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                )}
              </div>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">Analyzing your responses...</p>
                  <p className="text-sm text-gray-600">
                    Our AI is generating personalized career insights
                  </p>
                </div>
              ) : result.aiAnalysis ? (
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-primary/20">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="font-display text-xl md:text-2xl font-semibold text-gray-800 mt-6 mb-3">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="font-display text-lg md:text-xl font-semibold text-gray-700 mt-5 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-gray-700 text-[15px] leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 mb-5 ml-1">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-700 text-[15px] leading-relaxed flex items-start">
                          <span className="text-primary mr-3 mt-1 flex-shrink-0">•</span>
                          <span>{children}</span>
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                      ),
                    }}
                  >
                    {result.aiAnalysis}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex h-16 w-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-gray-600 mb-6 text-base">
                    AI analysis not available. Click to generate your personalized report.
                  </p>
                  <Button
                    onClick={() => generateAIAnalysis(result.id, removeCreativeCategory(result.scores), studentName, parentName)}
                    size="lg"
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
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10">
                <h3 className="font-display font-semibold text-xl text-gray-900 mb-6 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  Recommended Career Paths
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {topCategories.slice(0, 2).map((category) => (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-semibold text-gray-900 text-lg">{category.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.careers.slice(0, 4).map((career) => (
                          <span
                            key={career}
                            className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg"
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

            {/* Retake Assessment Action */}
            <div className="mt-8 flex justify-center">
              <Button variant="outline" size="lg" className="gap-2 shadow-sm" onClick={() => navigate("/assessment")}>
                <RefreshCw className="h-4 w-4" />
                Retake Assessment
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
