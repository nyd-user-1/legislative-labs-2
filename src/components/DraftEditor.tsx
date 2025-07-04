import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, FileText, Save, Copy, Lightbulb } from "lucide-react";
import { LegislativeDraft, DraftProgress } from "@/types/legislation";

interface DraftEditorProps {
  draft: LegislativeDraft | null;
  onDraftChange: (draft: LegislativeDraft) => void;
  onProgressChange: (progress: DraftProgress) => void;
}

export const DraftEditor = ({ draft, onDraftChange, onProgressChange }: DraftEditorProps) => {
  const [idea, setIdea] = useState("");
  const [improvedIdea, setImprovedIdea] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftType, setDraftType] = useState<'technology' | 'environment' | 'tax' | 'social services' | 'labor' | 'human rights' | 'digital rights' | 'education'>('technology');
  const [isImprovingIdea, setIsImprovingIdea] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [scenarioInput, setScenarioInput] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (draft) {
      setIdea(draft.originalIdea);
      setImprovedIdea(draft.improvedIdea);
      setDraftContent(draft.draftContent);
      setDraftType(draft.type);
      setScenarioInput("");
      setProblemStatement("");
    }
  }, [draft]);

const improveIdea = async () => {
    if (!idea.trim()) {
      toast({
        title: "Please enter an idea",
        description: "The idea field cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsImprovingIdea(true);
    try {
      const improved = await generateImprovedIdea(idea, draftType);
      setImprovedIdea(improved);
      
      onProgressChange({
        currentStep: 2,
        totalSteps: 4,
        stepNames: ["Idea Input", "Analysis", "Draft Generation", "Review & Export"]
      });

      toast({
        title: "Idea analyzed and improved!",
        description: "Review the enhanced version and analysis below.",
      });
    } catch (error) {
      toast({
        title: "Error improving idea",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsImprovingIdea(false);
    }
  };

  const generateDraft = async () => {
    if (!idea.trim()) {
      toast({
        title: "Please enter an idea first",
        description: "You need to provide an idea before generating a draft",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDraft(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      const draft = generateLegislativeDraft(improvedIdea || idea, draftType);
      setDraftContent(draft);
      
      onProgressChange({
        currentStep: 3,
        totalSteps: 4,
        stepNames: ["Idea Input", "Analysis", "Draft Generation", "Review & Export"]
      });

      toast({
        title: "Draft generated successfully!",
        description: "Your legislative draft is ready for review.",
      });
    } catch (error) {
      toast({
        title: "Error generating draft",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const saveDraft = () => {
    const newDraft: LegislativeDraft = {
      id: draft?.id || crypto.randomUUID(),
      title: extractTitleFromIdea(idea) || "Untitled Draft",
      type: draftType,
      originalIdea: idea,
      improvedIdea,
      draftContent,
      analysis: {
        fiscalImpact: "Analysis pending",
        implementationTimeline: "Timeline pending",
        similarLegislation: [],
        stakeholders: []
      },
      votes: draft?.votes || {
        rating: 0,
        totalVotes: 0,
        starCounts: [0, 0, 0, 0, 0]
      },
      isPublic: true, // All saves are public by default
      createdAt: draft?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onDraftChange(newDraft);
    
    // Save to localStorage
    const existingDrafts = JSON.parse(localStorage.getItem('legislativeDrafts') || '[]');
    const updatedDrafts = draft 
      ? existingDrafts.map((d: LegislativeDraft) => d.id === draft.id ? newDraft : d)
      : [...existingDrafts, newDraft];
    localStorage.setItem('legislativeDrafts', JSON.stringify(updatedDrafts));

    toast({
      title: "Draft saved!",
      description: "Your work has been saved successfully.",
    });
  };

  const generateProblemStatement = async () => {
    if (!scenarioInput.trim()) {
      toast({
        title: "Please enter a scenario",
        description: "Describe a real-life scenario to generate a problem statement",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingProblem(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const generated = await generateProblemFromScenario(scenarioInput);
      setProblemStatement(generated);

      toast({
        title: "Problem statement generated!",
        description: "Review and copy the statement to use in your legislative idea.",
      });
    } catch (error) {
      toast({
        title: "Error generating problem statement",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  const copyProblemStatement = async () => {
    if (!problemStatement) return;
    
    try {
      await navigator.clipboard.writeText(problemStatement);
      toast({
        title: "Copied to clipboard!",
        description: "Problem statement has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Legislative Ideation Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="draftType">Category</Label>
            <Select value={draftType} onValueChange={(value: 'technology' | 'environment' | 'tax' | 'social services' | 'labor' | 'human rights' | 'digital rights' | 'education') => setDraftType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="tax">Tax</SelectItem>
                <SelectItem value="social services">Social Services</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="human rights">Human Rights</SelectItem>
                <SelectItem value="digital rights">Digital Rights</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idea">Your Legislative Idea (What problem do you want to solve?)</Label>
            <Textarea
              id="idea"
              placeholder="Enter your idea for legislation or policy here. Be as detailed as possible and include a problem statement."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={improveIdea}
              disabled={isImprovingIdea}
              className="flex-1"
            >
              {isImprovingIdea ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Improve Idea
                </>
              )}
            </Button>

            <Button
              onClick={generateDraft}
              disabled={isGeneratingDraft}
              variant="secondary"
              className="flex-1"
            >
              {isGeneratingDraft ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Draft
                </>
              )}
            </Button>

            <Button onClick={saveDraft} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Problem Statement Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario">Describe a Real-Life Scenario</Label>
            <Textarea
              id="scenario"
              placeholder="Describe a real-life situation or scenario that illustrates the problem you want to address with legislation..."
              value={scenarioInput}
              onChange={(e) => setScenarioInput(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button
            onClick={generateProblemStatement}
            disabled={isGeneratingProblem}
            className="w-full"
          >
            {isGeneratingProblem ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Problem Statement...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate Problem Statement
              </>
            )}
          </Button>

          {problemStatement && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Problem Statement</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyProblemStatement}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg border">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{problemStatement}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {improvedIdea && (
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Legislative Concept</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{improvedIdea}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {draftContent && (
        <Card>
          <CardHeader>
            <CardTitle>Legislative Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background border rounded-lg p-6">
              <div className="prose max-w-none font-serif">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{draftContent}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper functions
const generateImprovedIdea = async (idea: string, type: string): Promise<string> => {
  // Derive a proper problem statement from the user input
  const problemStatement = deriveProblemStatement(idea);
  
  // Try to find similar legislation via web search
  let similarLegislation = "• Research needed for similar legislation in other jurisdictions";
  try {
    const searchResults = await searchSimilarLegislation(idea, type);
    if (searchResults) {
      similarLegislation = searchResults;
    }
  } catch (error) {
    console.error("Failed to search for similar legislation:", error);
  }
  
  return `CONSIDERATIONS

PROBLEM STATEMENT:
${problemStatement}

LEGISLATIVE APPROACH (${type}):
This ${type.toLowerCase()} legislation addresses the identified issues through a structured approach that considers constitutional authority, implementation feasibility, and stakeholder impact.

KEY IMPROVEMENTS NEEDED:
• Define specific legal authority and jurisdiction (See: Congressional Research Service guides on statutory authority)
• Clarify enforcement mechanisms and responsible agencies (Reference: Administrative Procedure Act, 5 U.S.C. §551 et seq.)
• Establish clear timelines and implementation phases (Best practice: 180-day implementation period for regulations)
• Include provisions for public comment and stakeholder input (Required under: Administrative Procedure Act notice-and-comment procedures)
• Address potential constitutional challenges (Review: relevant Supreme Court precedents and constitutional law analyses)
• Define funding sources and fiscal impact (Consult: Congressional Budget Office scoring methodology)
• Include sunset clauses or review periods where appropriate (Standard practice: 5-10 year review cycles for new programs)

RECOMMENDED RESEARCH AREAS:
${similarLegislation}
• Constitutional law precedents (Search: Westlaw, Lexis databases for relevant case law)
• Administrative feasibility assessment (Consult: Government Accountability Office implementation studies)
• Stakeholder analysis and potential opposition (Review: lobbying disclosures, industry position papers)
• Economic impact evaluation (Reference: Office of Management and Budget Circular A-4 for regulatory analysis)
• Implementation cost analysis (Model after: similar program cost estimates from CBO or agency budget justifications)

POTENTIAL CHALLENGES:
• Legal and constitutional concerns (Consider: Commerce Clause, Due Process, Equal Protection implications)
• Administrative complexity (Factor in: agency capacity, existing regulatory framework, coordination requirements)
• Political feasibility (Assess: current political climate, stakeholder support, timing considerations)
• Resource requirements (Estimate: personnel, technology, infrastructure needs)
• Enforcement difficulties (Plan for: compliance monitoring, penalty structures, appeal processes)
• Unintended consequences (Conduct: stakeholder impact analysis, small business considerations)

NEXT STEPS:
Proceed to draft generation to create properly structured legislative text with standard legal formatting and required sections.`;
};

const deriveProblemStatement = (idea: string): string => {
  // Extract the core problem from the user's legislative idea
  const sentences = idea.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return idea;
  
  // Look for problem indicators in the text
  const problemIndicators = ['problem', 'issue', 'concern', 'lack', 'insufficient', 'need', 'challenge', 'gap'];
  const solutionIndicators = ['propose', 'suggest', 'should', 'would', 'create', 'establish', 'implement'];
  
  let problemStatement = "";
  let foundProblem = false;
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    // If we find a problem indicator, this likely describes the problem
    if (problemIndicators.some(indicator => lowerSentence.includes(indicator)) && !foundProblem) {
      problemStatement += sentence.trim() + ". ";
      foundProblem = true;
    }
    // If no explicit problem found, look for context that implies a problem
    else if (!foundProblem && !solutionIndicators.some(indicator => lowerSentence.includes(indicator))) {
      problemStatement += sentence.trim() + ". ";
      foundProblem = true;
    }
  }
  
  // If we couldn't derive a problem statement, create one
  if (!problemStatement) {
    problemStatement = `Current legislative frameworks are inadequate to address the issues outlined in the following proposal: ${idea}`;
  }
  
  return problemStatement.trim();
};

const generateProblemFromScenario = async (scenario: string): Promise<string> => {
  // Analyze the scenario content for specific problem domains
  const analysis = analyzeScenarioContext(scenario);
  
  // Generate domain-specific problem statement
  return generateContextualProblemStatement(scenario, analysis);
};

// Helper function to analyze scenario context
const analyzeScenarioContext = (scenario: string) => {
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
const extractSpecificIssues = (scenario: string): string[] => {
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
const identifyRootCauses = (scenario: string, domainData: any): string[] => {
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
const generateContextualProblemStatement = (scenario: string, analysis: any): string => {
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

const searchSimilarLegislation = async (idea: string, type: string): Promise<string> => {
  try {
    // Use web search to find actual comparable legislation
    const searchQuery = `${type} legislation ${idea.split(' ').slice(0, 5).join(' ')} similar bills`;
    
    // This would use the web_search function if available
    // For now, return a more specific placeholder
    return `• Similar legislation in other jurisdictions (Search needed: "${searchQuery}")
• Constitutional law precedents (Research required for relevant Supreme Court cases)
• Administrative feasibility assessment (Review needed: agency implementation capacity studies)
• Stakeholder analysis and potential opposition (Analysis needed: industry and advocacy group positions)
• Economic impact evaluation (Required: cost-benefit analysis using OMB guidelines)
• Implementation cost analysis (Needed: detailed budget estimates and resource requirements)`;
  } catch (error) {
    throw error;
  }
};

const generateLegislativeDraft = (idea: string, type: string): string => {
  const title = extractTitleFromIdea(idea) || `Sample ${type}`;
  const date = new Date().getFullYear();
  
  return `${type.toUpperCase()} NO. [NUMBER]

${title.toUpperCase()}

${type === 'Bill' ? `A BILL` : type === 'Resolution' ? `A RESOLUTION` : `AN AMENDMENT`}

To ${idea.split('.')[0].toLowerCase()}.

Be it enacted by the Legislature:

SECTION 1. SHORT TITLE.
This Act may be cited as the "${title}."

SECTION 2. FINDINGS AND PURPOSE.
The Legislature finds that:
(1) [Finding based on the legislative idea]
(2) Current law is insufficient to address these concerns
(3) Legislative action is necessary to protect the public interest

SECTION 3. DEFINITIONS.
For purposes of this Act:
(1) "Agency" means the relevant state agency responsible for implementation
(2) [Additional definitions as needed]

SECTION 4. [OPERATIVE PROVISIONS]
(a) [Primary provision based on legislative idea]
(b) The responsible agency shall:
    (1) Develop implementing regulations within 180 days
    (2) Establish enforcement procedures
    (3) Report annually to the Legislature on implementation

SECTION 5. ENFORCEMENT.
(a) Violations of this Act shall be subject to [appropriate penalties]
(b) The agency may impose administrative sanctions including [specific sanctions]

SECTION 6. FUNDING.
Implementation of this Act shall be funded through [funding mechanism to be determined]

SECTION 7. EFFECTIVE DATE.
This Act shall take effect on January 1, ${date + 1}.

SECTION 8. SEVERABILITY.
If any provision of this Act is held invalid, the remainder shall not be affected.

---
LEGISLATIVE HISTORY:
Introduced: [Date]
Committee: [Committee Assignment]
Status: Draft

FISCAL NOTE:
Estimated cost: [To be determined]
Revenue impact: [To be determined]`;
};

const extractTitleFromIdea = (idea: string): string => {
  const words = idea.split(' ').slice(0, 8).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1) + " Act";
};