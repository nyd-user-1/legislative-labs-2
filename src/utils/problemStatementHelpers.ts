export const generateProblemFromScenario = async (scenario: string): Promise<string> => {
  // Analyze the scenario content for specific problem domains
  const analysis = analyzeScenarioContext(scenario);
  
  // Generate domain-specific problem statement
  return generateContextualProblemStatement(scenario, analysis);
};

// Helper function to analyze scenario context
export const analyzeScenarioContext = (scenario: string) => {
  const lowerScenario = scenario.toLowerCase();
  const words = lowerScenario.split(/\W+/);
  
  // Define problem domains with keywords and characteristics
  const domains = {
    affordability: {
      keywords: ['expensive', 'afford', 'cost', 'price', 'money', 'budget', 'financial', 'pay'],
      stakeholders: ['families', 'low-income individuals', 'working parents'],
      impacts: ['financial hardship', 'limited access', 'economic inequality'],
      solutions: ['subsidies', 'price regulation', 'income support', 'tax credits']
    },
    access: {
      keywords: ['access', 'available', 'reach', 'distance', 'location', 'transportation'],
      stakeholders: ['rural communities', 'underserved populations', 'disabled individuals'],
      impacts: ['service gaps', 'geographic inequality', 'reduced opportunities'],
      solutions: ['infrastructure investment', 'mobile services', 'digital platforms', 'transportation support']
    },
    quality: {
      keywords: ['quality', 'standard', 'poor', 'inadequate', 'substandard', 'unsafe'],
      stakeholders: ['consumers', 'service users', 'vulnerable populations'],
      impacts: ['health risks', 'poor outcomes', 'public safety concerns'],
      solutions: ['quality standards', 'certification requirements', 'regular inspections', 'accountability measures']
    },
    employment: {
      keywords: ['job', 'work', 'employment', 'wage', 'hours', 'benefits', 'unemployment'],
      stakeholders: ['workers', 'job seekers', 'employers', 'labor unions'],
      impacts: ['economic insecurity', 'workplace exploitation', 'skills gaps'],
      solutions: ['job training programs', 'wage protection', 'employment standards', 'career development']
    },
    healthcare: {
      keywords: ['health', 'medical', 'doctor', 'hospital', 'treatment', 'insurance', 'care'],
      stakeholders: ['patients', 'healthcare providers', 'families', 'caregivers'],
      impacts: ['health disparities', 'treatment delays', 'medical debt'],
      solutions: ['healthcare coverage', 'provider networks', 'cost transparency', 'quality measures']
    },
    housing: {
      keywords: ['housing', 'rent', 'home', 'apartment', 'homeless', 'shelter', 'eviction'],
      stakeholders: ['tenants', 'homeowners', 'developers', 'communities'],
      impacts: ['housing instability', 'homelessness', 'neighborhood displacement'],
      solutions: ['rent control', 'affordable housing', 'tenant protections', 'zoning reform']
    },
    education: {
      keywords: ['school', 'education', 'student', 'teacher', 'learning', 'tuition', 'degree'],
      stakeholders: ['students', 'parents', 'educators', 'institutions'],
      impacts: ['educational inequality', 'achievement gaps', 'limited opportunities'],
      solutions: ['funding equity', 'curriculum standards', 'teacher support', 'access programs']
    },
    childcare: {
      keywords: ['childcare', 'daycare', 'children', 'kids', 'parent', 'babysitter', 'preschool'],
      stakeholders: ['working parents', 'children', 'childcare providers', 'employers'],
      impacts: ['workforce participation barriers', 'child development gaps', 'family stress'],
      solutions: ['childcare subsidies', 'provider support', 'workplace programs', 'quality standards']
    }
  };
  
  // Score each domain based on keyword matches
  const domainScores = Object.entries(domains).map(([name, domain]) => {
    const matches = domain.keywords.filter(keyword => 
      words.some(word => word.includes(keyword) || keyword.includes(word))
    ).length;
    return { name, domain, score: matches };
  });
  
  // Get the highest scoring domain
  const primaryDomain = domainScores.reduce((max, current) => 
    current.score > max.score ? current : max
  );
  
  // Extract specific issues mentioned in the scenario
  const specificIssues = extractSpecificIssues(scenario);
  
  // Identify root causes
  const rootCauses = identifyRootCauses(scenario, primaryDomain.domain);
  
  return {
    primaryDomain: primaryDomain.name,
    domainData: primaryDomain.domain,
    specificIssues,
    rootCauses,
    stakeholders: primaryDomain.domain.stakeholders,
    potentialSolutions: primaryDomain.domain.solutions
  };
};

// Extract specific issues from the scenario
export const extractSpecificIssues = (scenario: string): string[] => {
  const issues = [];
  const lowerScenario = scenario.toLowerCase();
  
  // Common issue patterns
  const issuePatterns = [
    { pattern: /cannot afford|can't afford|too expensive/, issue: "Affordability barriers" },
    { pattern: /no access|cannot access|can't reach/, issue: "Access limitations" },
    { pattern: /poor quality|inadequate|substandard/, issue: "Quality concerns" },
    { pattern: /not available|unavailable|limited options/, issue: "Availability constraints" },
    { pattern: /long wait|delayed|slow process/, issue: "Service delays" },
    { pattern: /discriminat|unfair|bias/, issue: "Equity and fairness concerns" },
    { pattern: /unsafe|dangerous|risk/, issue: "Safety and security issues" },
    { pattern: /confusing|complicated|unclear/, issue: "System complexity and clarity" }
  ];
  
  issuePatterns.forEach(({ pattern, issue }) => {
    if (pattern.test(lowerScenario)) {
      issues.push(issue);
    }
  });
  
  return issues.length > 0 ? issues : ["Systemic barriers to accessing essential services"];
};

// Identify root causes based on scenario content
export const identifyRootCauses = (scenario: string, domainData: any): string[] => {
  const causes = [];
  const lowerScenario = scenario.toLowerCase();
  
  // Common root cause patterns
  if (lowerScenario.includes('expensive') || lowerScenario.includes('cost')) {
    causes.push("Market failures leading to unaffordable pricing");
  }
  if (lowerScenario.includes('not enough') || lowerScenario.includes('limited')) {
    causes.push("Insufficient supply or capacity to meet demand");
  }
  if (lowerScenario.includes('far') || lowerScenario.includes('distance')) {
    causes.push("Geographic barriers and inadequate distribution of services");
  }
  if (lowerScenario.includes('wait') || lowerScenario.includes('delay')) {
    causes.push("System inefficiencies and resource constraints");
  }
  if (lowerScenario.includes('unclear') || lowerScenario.includes('confusing')) {
    causes.push("Lack of transparency and standardization");
  }
  
  // Add domain-specific causes
  if (causes.length === 0) {
    causes.push("Regulatory gaps in current policy framework");
    causes.push("Lack of coordinated oversight and accountability");
  }
  
  return causes;
};

// Generate contextual problem statement
export const generateContextualProblemStatement = (scenario: string, analysis: any): string => {
  const { primaryDomain, domainData, specificIssues, rootCauses, stakeholders, potentialSolutions } = analysis;
  
  return `CONTEXTUAL PROBLEM ANALYSIS

SCENARIO SUMMARY:
${scenario}

PRIMARY PROBLEM DOMAIN: ${primaryDomain.charAt(0).toUpperCase() + primaryDomain.slice(1)}

SPECIFIC ISSUES IDENTIFIED:
${specificIssues.map(issue => `• ${issue}`).join('\n')}

ROOT CAUSES ANALYSIS:
${rootCauses.map(cause => `• ${cause}`).join('\n')}

AFFECTED STAKEHOLDERS:
${stakeholders.map(stakeholder => `• ${stakeholder.charAt(0).toUpperCase() + stakeholder.slice(1)}`).join('\n')}

LEGISLATIVE PROBLEM STATEMENT:
The scenario reveals a systemic failure in ${primaryDomain} policy that creates barriers for ${stakeholders.join(', ')}. Current regulatory frameworks are inadequate to address the identified issues, resulting in ${specificIssues.join(', ').toLowerCase()}. This situation requires immediate legislative intervention to establish comprehensive policy solutions.

POLICY INTERVENTION NEEDS:
• Address market failures and regulatory gaps in ${primaryDomain}
• Establish clear standards and accountability mechanisms
• Ensure equitable access and affordability for all stakeholders
• Create oversight and enforcement capabilities
• Provide adequate funding and resource allocation

POTENTIAL LEGISLATIVE APPROACHES:
${potentialSolutions.map(solution => `• ${solution.charAt(0).toUpperCase() + solution.slice(1)}`).join('\n')}

RESEARCH PRIORITIES:
• Review existing ${primaryDomain} legislation in other jurisdictions
• Analyze constitutional authority and legal precedents
• Conduct stakeholder impact assessment and cost-benefit analysis
• Study implementation models and best practices
• Evaluate enforcement mechanisms and compliance strategies

This analysis provides a foundation for developing targeted legislative solutions that address the specific challenges identified in your scenario.`;
};