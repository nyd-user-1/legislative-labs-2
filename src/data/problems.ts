export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  subProblems: number;
  solutions: number;
  category: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  relatedProblems: string[];
  statistics: {
    label: string;
    value: string | number;
    source?: string;
  }[];
  solutionsList: {
    id: string;
    title: string;
    description: string;
    feasibility: number;
    impact: number;
  }[];
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Convert titles to URL-friendly slugs
const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const problems: Problem[] = [
  {
    id: "childcare",
    slug: createSlug("Childcare"),
    title: "Childcare",
    description: "Addressing the critical need for accessible, affordable, and quality childcare services for working families.",
    subProblems: 26,
    solutions: 84,
    category: "Social Services",
    priority: "urgent",
    relatedProblems: ["quality-time", "education-access", "work-life-balance"],
    statistics: [
      { label: "Families Affected", value: "12.7M", source: "Department of Health & Human Services" },
      { label: "Average Monthly Cost", value: "$1,230", source: "Child Care Aware of America" },
      { label: "Workforce Impact", value: "2.3M", source: "Bureau of Labor Statistics" }
    ],
    solutionsList: [
      {
        id: "universal-pre-k",
        title: "Universal Pre-K Programs",
        description: "Government-funded early childhood education for all children aged 3-5",
        feasibility: 7,
        impact: 9
      },
      {
        id: "childcare-subsidies",
        title: "Childcare Subsidies",
        description: "Income-based financial assistance for childcare costs",
        feasibility: 8,
        impact: 8
      },
      {
        id: "workplace-childcare",
        title: "Workplace Childcare Centers",
        description: "On-site childcare facilities provided by employers",
        feasibility: 6,
        impact: 7
      }
    ],
    metadata: {
      title: "Childcare Crisis Solutions | Goodable",
      description: "Explore comprehensive solutions to the childcare crisis affecting millions of families. From universal pre-K to workplace centers.",
      keywords: ["childcare", "early childhood education", "working families", "affordable childcare", "universal pre-k"]
    }
  },
  {
    id: "quality-time",
    slug: createSlug("Quality Time"),
    title: "Quality Time",
    description: "Creating meaningful connections and reducing the barriers to spending quality time with family and community.",
    subProblems: 5,
    solutions: 17,
    category: "Social Connection",
    priority: "high",
    relatedProblems: ["childcare", "work-life-balance", "social-isolation"],
    statistics: [
      { label: "Average Family Time", value: "37 min/day", source: "American Time Use Survey" },
      { label: "Screen Time vs Family Time", value: "7:1 ratio", source: "Common Sense Media" },
      { label: "Community Engagement", value: "23%", source: "Pew Research Center" }
    ],
    solutionsList: [
      {
        id: "flexible-work",
        title: "Flexible Work Arrangements",
        description: "Remote work and flexible scheduling to increase family time",
        feasibility: 8,
        impact: 7
      },
      {
        id: "community-spaces",
        title: "Community Gathering Spaces",
        description: "Public spaces designed for family and community activities",
        feasibility: 7,
        impact: 6
      }
    ],
    metadata: {
      title: "Quality Time Solutions | Goodable",
      description: "Discover ways to increase meaningful family and community time in our busy modern world.",
      keywords: ["quality time", "family time", "work-life balance", "community connection", "flexible work"]
    }
  },
  {
    id: "climate-change",
    slug: createSlug("Climate Change"),
    title: "Climate Change",
    description: "Addressing the urgent environmental crisis through sustainable policies and innovative solutions.",
    subProblems: 23,
    solutions: 67,
    category: "Environment",
    priority: "urgent",
    relatedProblems: ["renewable-energy", "environmental-justice", "water-conservation"],
    statistics: [
      { label: "Global Temperature Rise", value: "+1.1°C", source: "IPCC" },
      { label: "Carbon Emissions", value: "36.3 Gt", source: "Global Carbon Atlas" },
      { label: "Economic Impact", value: "$23T by 2100", source: "Nature Climate Change" }
    ],
    solutionsList: [
      {
        id: "carbon-pricing",
        title: "Carbon Pricing Mechanisms",
        description: "Market-based approaches to reduce greenhouse gas emissions",
        feasibility: 7,
        impact: 9
      },
      {
        id: "green-infrastructure",
        title: "Green Infrastructure Investment",
        description: "Large-scale investment in renewable energy and sustainable transport",
        feasibility: 6,
        impact: 8
      }
    ],
    metadata: {
      title: "Climate Change Solutions | Goodable",
      description: "Explore evidence-based solutions to combat climate change and build a sustainable future.",
      keywords: ["climate change", "carbon emissions", "renewable energy", "sustainability", "environmental policy"]
    }
  }
  // Adding a few more key problems for demonstration
];

// Additional problems for demonstration
const additionalProblemTitles = [
  "Third Place", "Income Stagnation", "Housing Crisis", "Mental Health Support", "Food Security", 
  "Digital Divide", "Elder Care", "Education Access", "Healthcare Access", "Social Isolation"
];

additionalProblemTitles.forEach((title, index) => {
  const priorities: Problem['priority'][] = ["urgent", "high", "normal"];
  problems.push({
    id: createSlug(title),
    slug: createSlug(title),
    title,
    description: `Comprehensive solutions and policy approaches to address ${title.toLowerCase()} challenges in our communities.`,
    subProblems: Math.floor(Math.random() * 25) + 5,
    solutions: Math.floor(Math.random() * 60) + 20,
    category: "Community",
    priority: priorities[Math.floor(Math.random() * 3)],
    relatedProblems: [],
    statistics: [
      { label: "People Affected", value: `${Math.floor(Math.random() * 50) + 10}M`, source: "Census Bureau" },
      { label: "Annual Cost", value: `$${Math.floor(Math.random() * 500) + 100}B`, source: "Economic Research" }
    ],
    solutionsList: [
      {
        id: `solution-${index}-1`,
        title: `Policy Solution ${index + 1}`,
        description: `Strategic policy approach to address ${title.toLowerCase()}`,
        feasibility: Math.floor(Math.random() * 5) + 5,
        impact: Math.floor(Math.random() * 5) + 5
      }
    ],
    metadata: {
      title: `${title} Solutions | Goodable`,
      description: `Find innovative solutions and policy proposals for ${title.toLowerCase()} challenges.`,
      keywords: [title.toLowerCase(), "policy", "solutions", "community", "social issues"]
    }
  });
});

export const getProblemBySlug = (slug: string): Problem | undefined => {
  return problems.find(problem => problem.slug === slug);
};

export const getRelatedProblems = (currentProblemId: string, limit: number = 3): Problem[] => {
  const currentProblem = problems.find(p => p.id === currentProblemId);
  if (!currentProblem) return [];
  
  return problems
    .filter(p => p.id !== currentProblemId && p.category === currentProblem.category)
    .slice(0, limit);
};