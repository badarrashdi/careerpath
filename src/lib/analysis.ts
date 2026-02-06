import { careerCategories } from "@/data/assessmentQuestions";

type ClusterKey =
  | "tech_engineering"
  | "creative_design"
  | "business_analytics"
  | "health_life"
  | "social_impact"
  | "entrepreneurship";

interface ClusterMeta {
  name: string;
  description: string;
  sampleRoles: string[];
  strengths: string[];
}

const clusterMeta: Record<ClusterKey, ClusterMeta> = {
  tech_engineering: {
    name: "Technology & Engineering",
    description: "Building, problem-solving, and system design",
    sampleRoles: ["Software Engineer", "Data Engineer", "Product Technologist", "Systems Analyst"],
    strengths: ["logical analysis", "structured problem-solving", "tool adoption", "iterative building"],
  },
  creative_design: {
    name: "Creative & Design Fields",
    description: "Visual thinking, storytelling, and experience design",
    sampleRoles: ["UI/UX Designer", "Visual Designer", "Product Designer", "Content/Brand Designer"],
    strengths: ["idea generation", "visual communication", "user empathy", "prototyping"],
  },
  business_analytics: {
    name: "Business, Finance & Analytics",
    description: "Decision-making, market sense, and numbers",
    sampleRoles: ["Business Analyst", "Financial Analyst", "Growth Strategist", "Operations Analyst"],
    strengths: ["data-driven decisions", "structured planning", "market awareness", "risk sense"],
  },
  health_life: {
    name: "Healthcare & Life Sciences",
    description: "Care, precision, and applied science",
    sampleRoles: ["Healthcare Practitioner", "Clinical Research Associate", "Public Health Analyst", "Lab Technologist"],
    strengths: ["empathy", "patience", "protocol discipline", "scientific curiosity"],
  },
  social_impact: {
    name: "Social Impact, Psychology & Education",
    description: "People development, guidance, and community impact",
    sampleRoles: ["Psychology/Education Track", "Counseling", "Policy/Community Programs", "L&D Specialist"],
    strengths: ["listening", "mentoring", "communication", "systems thinking for people"],
  },
  entrepreneurship: {
    name: "Entrepreneurship & Leadership Roles",
    description: "Ownership, vision, and team orchestration",
    sampleRoles: ["Founder/Co-founder", "Product Leadership", "Operations Leadership", "Program Manager"],
    strengths: ["initiative", "decision-making", "resilience", "stakeholder alignment"],
  },
};

const clusterWeights: Record<ClusterKey, Record<string, number>> = {
  tech_engineering: { science_tech: 1, creative: 0.2, commerce_finance: 0.2 },
  creative_design: { creative: 1, arts_humanities: 0.6, science_tech: 0.2 },
  business_analytics: { commerce_finance: 1, science_tech: 0.3, government: 0.2 },
  health_life: { healthcare: 1, science_tech: 0.3, arts_humanities: 0.1 },
  social_impact: { arts_humanities: 0.7, healthcare: 0.3, government: 0.3 },
  entrepreneurship: { commerce_finance: 0.8, government: 0.6, creative: 0.3, science_tech: 0.3 },
};

const likertPhrase = (score: number) => {
  if (score >= 1) return "Strong Fit";
  if (score >= 0.4) return "Good Fit";
  return "Emerging Fit";
};

const pickStrengths = (topClusters: { key: ClusterKey; score: number }[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  topClusters.forEach(({ key }) => {
    clusterMeta[key].strengths.forEach((s) => {
      if (!seen.has(s) && result.length < 7) {
        seen.add(s);
        result.push(s);
      }
    });
  });
  while (result.length < 5) {
    result.push("adaptability");
  }
  return result;
};

const recommendedPaths = (topClusters: { key: ClusterKey; score: number }[]) => {
  const primary = topClusters.slice(0, 3).map(({ key }) => clusterMeta[key].sampleRoles[0]);
  const secondary: string[] = [];
  topClusters.slice(0, 3).forEach(({ key }) => {
    const extras = clusterMeta[key].sampleRoles.slice(1, 3);
    extras.forEach((r) => {
      if (!primary.includes(r) && secondary.length < 2) {
        secondary.push(r);
      }
    });
  });
  return { primary, secondary };
};

export const buildCareerAnalysis = (scores: Record<string, number>): string => {
  const clusterScores: { key: ClusterKey; score: number }[] = Object.entries(clusterWeights).map(
    ([key, weights]) => {
      const sum = Object.entries(weights).reduce((acc, [cat, weight]) => acc + (scores[cat] || 0) * weight, 0);
      return { key: key as ClusterKey, score: sum };
    }
  );

  clusterScores.sort((a, b) => b.score - a.score);
  const topClusters = clusterScores.slice(0, 5);
  const strengths = pickStrengths(topClusters);
  const { primary, secondary } = recommendedPaths(topClusters);

  const lines: string[] = [];

  lines.push(`# Career Intelligence Report`);
  lines.push(`You shared how you think, learn, and work. Here is a calm, clear view of where you can thrive next.`);

  // 1️⃣ Career Snapshot
  lines.push(`\n## 1️⃣ Career Snapshot (Short Summary)`);
  lines.push(
    `You show promise across multiple paths, with the strongest pull toward ${clusterMeta[topClusters[0].key].name}. ` +
      `You balance growth with curiosity and can blend your interests into practical next steps.`
  );

  // 2️⃣ Personality & Thinking Style
  lines.push(`\n## 2️⃣ Personality & Thinking Style`);
  lines.push(`- You approach problems with a mix of structure and exploration.`);
  lines.push(`- You handle new challenges with curiosity and prefer meaningful outcomes over busywork.`);
  lines.push(`- Leadership and collaboration feel natural when the goal is clear.`);

  // 3️⃣ Learning Style Insight
  lines.push(`\n## 3️⃣ Learning Style Insight`);
  lines.push(`- You learn best through applied practice and clear examples; short cycles of try–observe–adjust.`);
  lines.push(`- Avoid long stretches of pure memorization; pair reading with doing (mini-builds, diagrams, summaries).`);

  // 4️⃣ Strength Profile
  lines.push(`\n## 4️⃣ Strength Profile`);
  strengths.slice(0, 7).forEach((s) => lines.push(`- ${s.charAt(0).toUpperCase()}${s.slice(1)}`));

  // 5️⃣ Career Cluster Fit
  lines.push(`\n## 5️⃣ Career Cluster Fit`);
  topClusters.slice(0, 5).forEach(({ key, score }, idx) => {
    lines.push(`${idx + 1}. ${clusterMeta[key].name} — ${likertPhrase(score)}`);
  });

  // 6️⃣ Recommended Career Paths
  lines.push(`\n## 6️⃣ Recommended Career Paths`);
  primary.slice(0, 3).forEach((role, idx) => {
    lines.push(`${idx + 1}. ${role} — fits your current strengths and motivation to build and deliver.`);
  });
  secondary.slice(0, 2).forEach((role, idx) => {
    lines.push(`Alt ${idx + 1}. ${role} — exploratory track to test adjacent interests.`);
  });

  // 7️⃣ Emotional Readiness Insight
  lines.push(`\n## 7️⃣ Emotional Readiness Insight`);
  lines.push(`It’s normal to feel both excited and unsure. Treat this as exploration, not a final decision. Small tests beat big commitments.`);

  // 8️⃣ Clear Next Steps
  lines.push(`\n## 8️⃣ Clear Next Steps`);
  lines.push(`- Within 7 days: pick one micro-project in your top cluster (1–2 hours). Finish and share it.`);
  lines.push(`- Within 30 days: talk to one professional/mentor or watch a deep-dive on daily work in that field.`);
  lines.push(`- Within 60 days: start a second, slightly larger project; document what you enjoyed and what drained you.`);
  lines.push(`- Within 90 days: pick one skill to deepen (e.g., analysis, design prototyping, or stakeholder communication) and practice weekly.`);

  return lines.join("\n");
};
