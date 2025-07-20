import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, Download, Code, Share, List, SlidersHorizontal, Settings, Info, X, HelpCircle } from "lucide-react";
import { MorphingHeartLoader } from "@/components/ui/MorphingHeartLoader";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  bill_id?: number;
  member_id?: number;
  committee_id?: number;
  created_at: string;
}

interface ChatOption {
  id: string;
  label: string;
  content: string;
  type: 'bill' | 'member' | 'committee' | 'problem' | 'solution' | 'mediaKit';
}

interface Persona {
  id: string;
  act: string;
  prompt: string | null;
  for_devs: boolean | null;
}

const formatChatConversation = (messages: any[]): string => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "";
  }

  return messages
    .map((msg: any, index: number) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const content = msg.content || '';
      return `${role}: ${content}`;
    })
    .join('\n\n');
};

const PipelineStatus = ({ stage }: { stage: 'input' | 'processing' | 'draft' | 'review' }) => {
  const stages = ['Input', 'Processing', 'Draft', 'Review'];
  const stageKeys = ['input', 'processing', 'draft', 'review'];
  
  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-900">Pipeline Stage:</span>
        <div className="flex gap-2">
          {stages.map((s, i) => (
            <div key={s} className={`px-2 py-1 rounded text-xs ${
              i <= stageKeys.indexOf(stage) 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PolicyPortal = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedChat, setSelectedChat] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [selectedPersonaAct, setSelectedPersonaAct] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.56]);
  const [maxWords, setMaxWords] = useState(250); // Changed from maxLength to maxWords
  const [topP, setTopP] = useState([0.9]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOptions, setChatOptions] = useState<ChatOption[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [sampleProblems, setSampleProblems] = useState<{id: number, "Sample Problems": string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [personasLoading, setPersonasLoading] = useState(false);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mode, setMode] = useState<'textEditor' | 'chat'>('textEditor');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pipelineStage, setPipelineStage] = useState<'input' | 'processing' | 'draft' | 'review'>('input');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [hasDrafts, setHasDrafts] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fetchUserChats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, get all chat sessions for the user
      const { data: chatSessions, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const options: ChatOption[] = [];

      // Process chat sessions and create options
      chatSessions?.forEach((session: any) => {
        const messages = Array.isArray(session.messages) ? session.messages : JSON.parse(session.messages || '[]');
        const formattedConversation = formatChatConversation(messages);
        const firstUserMessage = messages.find((msg: any) => msg.role === 'user')?.content || '';

        if (session.title.toLowerCase().includes('problem:')) {
          const problemNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Problem ${problemNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'problem'
          });
        } else if (session.title.toLowerCase().includes('solution:')) {
          const solutionNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Solution ${solutionNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'solution'
          });
        } else if (session.title.toLowerCase().includes('media kit:')) {
          const mediaKitNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Media Kit ${mediaKitNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'mediaKit'
          });
        } else if (session.bill_id) {
          // For bill-related chats, fetch bill info separately if needed
          options.push({
            id: session.id,
            label: `Bill Chat: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'bill'
          });
        } else if (session.member_id) {
          // For member-related chats
          options.push({
            id: session.id,
            label: `Member Chat: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'member'
          });
        } else if (session.committee_id) {
          // For committee-related chats
          options.push({
            id: session.id,
            label: `Committee Chat: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'committee'
          });
        } else {
          // Generic chat session
          options.push({
            id: session.id,
            label: `Chat: ${firstUserMessage.substring(0, 50)}...`,
            content: formattedConversation,
            type: 'problem' // Default type
          });
        }
      });

      setChatOptions(options);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonas = async () => {
    try {
      console.log("Starting to fetch personas...");
      setPersonasLoading(true);
      const { data: personasData, error } = await supabase
        .from("Persona")
        .select("*")
        .order("act", { ascending: true });

      console.log("Personas query result:", { personasData, error });

      if (error) {
        console.error("Error fetching personas:", error);
        throw error;
      }

      console.log(`Found ${personasData?.length || 0} personas`);
      setPersonas(personasData || []);
    } catch (error) {
      console.error("Error fetching personas:", error);
      toast({
        title: "Error",
        description: "Failed to load personas",
        variant: "destructive",
      });
    } finally {
      setPersonasLoading(false);
    }
  };

  const fetchSampleProblems = async () => {
    try {
      setProblemsLoading(true);
      const { data: problemsData, error } = await supabase
        .from("Sample Problems")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching sample problems:", error);
        throw error;
      }

      setSampleProblems(problemsData || []);
    } catch (error) {
      console.error("Error fetching sample problems:", error);
      toast({
        title: "Error",
        description: "Failed to load sample problems",
        variant: "destructive",
      });
    } finally {
      setProblemsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserChats();
    fetchPersonas();
    fetchSampleProblems();
  }, []);

  const handleChatSelection = (chatId: string) => {
    const selectedOption = chatOptions.find(option => option.id === chatId);
    if (selectedOption) {
      // ADD this detection logic
      const isProblemChat = selectedOption.type === 'problem' || 
                           selectedOption.content.includes('Problem Statement:') ||
                           selectedOption.content.includes('Legislative Problem Statement:');
      
      if (isProblemChat) {
        setPrompt(`Policy Playground:\n${selectedOption.content}\n\nInstructions: Transform the identified problem into a policy memo.`);
        setPipelineStage('processing');
      } else {
        setPrompt(selectedOption.content);
      }
      setSelectedChat(chatId);
    }
  };

  const handleSampleProblemSelection = (problemId: string) => {
    const selectedProblem = sampleProblems.find(problem => problem.id.toString() === problemId);
    if (selectedProblem) {
      setPrompt(`Policy Playground:\nProblem Statement: ${selectedProblem["Sample Problems"]}\n\nInstructions: Transform the identified problem into a policy memo.`);
      setPipelineStage('processing');
      setSelectedChat(problemId);
    }
  };

  const handlePersonaSelection = (personaAct: string) => {
    const selectedPersonaData = personas.find(persona => persona.act === personaAct);
    if (selectedPersonaData) {
      setSelectedPersona(personaAct);
      setSelectedPersonaAct(personaAct);
      setSystemPrompt(selectedPersonaData.prompt || "");
      // Auto-switch to chat mode when persona is selected
      if (personaAct) {
        setMode('chat');
      }
    } else {
      setSelectedPersona("");
      setSelectedPersonaAct("");
      setSystemPrompt("");
      // Switch back to text editor if no persona
      setMode('textEditor');
    }
  };

  const handleChatSubmit = async () => {
    if (!selectedPersona || !prompt.trim()) {
      toast({
        title: "Error",
        description: "Please select a persona and enter a prompt",
        variant: "destructive",
      });
      return;
    }

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);
    setIsChatting(true);
    setStreamingContent("");
    setPipelineStage('processing');
    
    try {
      // Initialize chat with user message
      const initialMessages = [{ role: 'user' as const, content: prompt }];
      setChatMessages(initialMessages);

      // Call the edge function with streaming
      const response = await supabase.functions.invoke('chat-with-persona', {
        body: {
          messages: initialMessages,
          systemPrompt: systemPrompt,
          temperature: temperature[0],
          maxWords: maxWords,
          topP: topP[0]
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Check if request was aborted
      if (controller.signal.aborted) {
        throw new Error('Generation stopped by user');
      }

      // Simulate streaming for now - in production, you'd handle actual streaming
      const fullContent = response.data.message;
      let currentContent = "";
      
      for (let i = 0; i < fullContent.length; i++) {
        // Check if request was aborted during streaming
        if (controller.signal.aborted) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing speed
        currentContent += fullContent[i];
        setStreamingContent(currentContent);
        
        // Scroll to bottom during streaming
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }

      // Only complete if not aborted
      if (!controller.signal.aborted) {
        // Add final AI response to chat
        const aiMessage = { role: 'assistant' as const, content: fullContent };
        setChatMessages(prev => [...prev, aiMessage]);
        setStreamingContent("");
        setPipelineStage('draft');
        setHasDrafts(true); // Set drafts flag when first draft is generated

        toast({
          title: "Policy Draft Generated",
          description: `Legislative draft created with ${selectedPersona}`,
        });
      }
      
    } catch (error) {
      console.error("Error starting chat:", error);
      if (error.message === 'Generation stopped by user') {
        toast({
          title: "Generation Stopped",
          description: "AI generation was stopped by user",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate policy draft",
          variant: "destructive",
        });
      }
    } finally {
      setIsChatting(false);
      setAbortController(null);
      setStreamingContent("");
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      toast({
        title: "Stopping Generation",
        description: "Cancelling AI generation...",
      });
    }
  };

  const handleSubmit = async () => {
    if (mode === 'chat') {
      handleChatSubmit();
    } else {
      // Policy Pipeline Processing
      const isProblemInput = prompt.includes('Problem Statement:') || 
                            prompt.includes('problem') || 
                            prompt.includes('issue');
      
      if (isProblemInput && !selectedPersona) {
        // Auto-select appropriate persona
        setSelectedPersona('Legislative Drafter - Citizen Bridge');
        setSelectedPersonaAct('Legislative Drafter - Citizen Bridge');
        const drafterPersona = personas.find(p => p.act === 'Legislative Drafter - Citizen Bridge');
        if (drafterPersona) {
          setSystemPrompt(drafterPersona.prompt || "");
        }
        setMode('chat');
        toast({
          title: "Auto-selected Legislative Drafter",
          description: "Problem detected - using specialized drafter persona",
        });
        return;
      }
      
      // Process with selected persona
      await handleChatSubmit();
    }
  };

  const handleRefresh = () => {
    setPrompt('');
    setChatMessages([]);
    setStreamingContent('');
    setSelectedPersona('');
    setSelectedPersonaAct('');
    setSystemPrompt('');
    setMode('textEditor');
    setPipelineStage('input');
    toast({
      title: "Policy Portal Cleared",
      description: "All content has been reset",
    });
  };

  const exportAsPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export functionality coming soon",
    });
  };

  const shareToNYSLRS = () => {
    toast({
      title: "Professional Sharing",
      description: "NYS professional sharing coming soon",
    });
  };

  const SettingsContent = () => (
    <div className="space-y-6 bg-[#FBF9F6] p-4 rounded-lg">
      {/* Persona Selection */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Persona</Label>
        <Select value={selectedPersona} onValueChange={handlePersonaSelection}>
          <SelectTrigger>
            <SelectValue placeholder="Select a persona..." />
          </SelectTrigger>
          <SelectContent>
            {personasLoading ? (
              <SelectItem value="loading" disabled>Loading personas...</SelectItem>
            ) : personas.length === 0 ? (
              <SelectItem value="empty" disabled>No personas found</SelectItem>
            ) : (
              personas.map((persona) => (
                <SelectItem key={persona.id} value={persona.act}>
                  {persona.act}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Load Sample Problems */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Problem Statement</Label>
        <Select value={selectedChat} onValueChange={handleSampleProblemSelection}>
          <SelectTrigger>
            <SelectValue placeholder="Select a sample problem..." />
          </SelectTrigger>
          <SelectContent>
            {problemsLoading ? (
              <SelectItem value="loading" disabled>Loading problems...</SelectItem>
            ) : sampleProblems.length === 0 ? (
              <SelectItem value="empty" disabled>No problems found</SelectItem>
            ) : (
              sampleProblems.map((problem) => (
                <SelectItem key={problem.id} value={problem.id.toString()}>
                  {problem["Sample Problems"]}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Maximum Length */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Maximum Length</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Maximum Length</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700 leading-relaxed">
                    Maximum Length determines how long the model's response can be. It's a way to guide the AI on how much detail to include based on your needs.
                    <br /><br />
                    A 250-word response is about half a page, single spaced. It works well for a short summary or a quick explanation.
                    <br /><br />
                    A 500-word response is roughly one full page. It's ideal for a focused proposal, policy outline, or structured argument.
                    <br /><br />
                    A 750-word response comes out to about a page and a half. This length allows for a more detailed breakdown or multi-part response while staying concise.
                    <br /><br />
                    A 1000-word response is approximately two single-spaced pages. This is the upper limit for most memos, offering enough space for thorough analysis or complete legislative recommendations without being overwhelming.
                    <br /><br />
                    In most cases, a one-page memo is enough to communicate a strong and actionable idea. Maximum Length simply helps you shape the depth and scope of your message.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <span className="text-sm text-gray-500">{maxWords} words</span>
        </div>
        <Slider
          value={[maxWords]}
          onValueChange={(value) => {
            const newValue = value[0];
            // Snap to nearest valid value
            const validValues = [250, 500, 750, 1000];
            const closest = validValues.reduce((prev, curr) => 
              Math.abs(curr - newValue) < Math.abs(prev - newValue) ? curr : prev
            );
            setMaxWords(closest);
          }}
          max={1000}
          min={0}
          step={1}
          className="w-full"
        />
      </div>

      {/* Temperature */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Temperature</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Temperature</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700 leading-relaxed">
                    Temperature controls how bold or cautious the model is when generating a response.
                    <br /><br />
                    Lower temperatures (closer to 0) make the model more focused and predictable. It will choose the safest and most likely words, which is helpful for formal writing, legal language, or structured analysis.
                    <br /><br />
                    Higher temperatures (closer to 1) make the model more creative and exploratory. It may take more risks with phrasing, tone, or ideas. This is useful for brainstorming, ideation, or more expressive writing.
                    <br /><br />
                    Most thoughtful work happens between the extremes. Use temperature to dial in whether you want the model to stay on-script or think outside the box.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <span className="text-sm text-gray-500">{temperature[0]}</span>
        </div>
        <Slider
          value={temperature}
          onValueChange={setTemperature}
          max={1}
          min={0}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Top P */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-700">Top P</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Top P</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700 leading-relaxed">
                    Top P controls how creatively or narrowly the model responds by limiting which words it's allowed to consider next.
                    <br /><br />
                    A lower Top P (like 0.1 to 0.3) restricts the model to a smaller set of highly likely words. This tends to produce more predictable, focused, or formal responses.
                    <br /><br />
                    A higher Top P (like 0.8 to 1.0) gives the model access to a broader range of words. This results in more open-ended, diverse, or creative answers.
                    <br /><br />
                    In practical terms, lower values are useful when precision or clarity matters most. Higher values are better for brainstorming, storytelling, or exploring new perspectives. Use Top P to tune how safe or surprising you want the output to be.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <span className="text-sm text-gray-500">{topP[0]}</span>
        </div>
        <Slider
          value={topP}
          onValueChange={setTopP}
          max={1}
          min={0}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* My Drafts Panel - Only show after drafts are generated */}
      {hasDrafts && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">My Drafts</Label>
          <div className="space-y-2">
            <div className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="text-sm font-medium text-gray-800">Housing Affordability and Wage Adjustment Act</div>
              <div className="text-xs text-gray-500 mt-1">Created with Legislative Drafter - Citizen Bridge</div>
              <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
            </div>
            
            <div className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="text-sm font-medium text-gray-800">Elder Care Support and Accessibility Act</div>
              <div className="text-xs text-gray-500 mt-1">Created with Legislative Drafter - Citizen Bridge</div>
              <div className="text-xs text-gray-400 mt-1">1 day ago</div>
            </div>
            
            <div className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="text-sm font-medium text-gray-800">Small Business Tax Relief Initiative</div>
              <div className="text-xs text-gray-500 mt-1">Created with Policy Advisor - Economic Development</div>
              <div className="text-xs text-gray-400 mt-1">3 days ago</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full bg-[#F6F4EE]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#F6F4EE] border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Policy Portal
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Settings Button */}
              {isMobile && (
                <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <SettingsContent />
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {/* Desktop Settings Button */}
              {!isMobile && (
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              )}

              <Button variant="outline" size="sm" className="hidden sm:flex">
                Save
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Code className="h-4 w-4 mr-2" />
                View code
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Prompt Area */}
          <div className={`flex-1 p-4 sm:p-6 ${isMobile ? 'w-full' : ''}`}>
            <div className="h-full flex flex-col">

              {/* System Prompt Indicator */}
              {systemPrompt && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button 
                      className="w-full mb-4 p-3 bg-[#FBF9F6] rounded-md cursor-pointer hover:bg-[#EBE9E4] transition-colors text-left"
                      aria-label={`View ${selectedPersonaAct} system prompt details`}
                      aria-describedby="system-prompt-status"
                    >
                      <p id="system-prompt-status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        {selectedPersonaAct} System Prompt Active
                      </p>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-800">
                        {selectedPersonaAct} System Prompt Active
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="text-gray-700 max-h-[60vh] overflow-y-auto prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {systemPrompt}
                          </ReactMarkdown>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction className="bg-gray-600 hover:bg-gray-700">
                        Close
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Chat Content */}
              <div className="flex-1 flex flex-col bg-[#FBF9F6] rounded-lg border border-gray-200 min-h-0">
                <ScrollArea className="flex-1 h-0" ref={chatScrollRef}>
                  <div className="p-4 min-h-full">
                    {chatMessages.length === 0 && !streamingContent ? (
                      <div className="text-center text-gray-500 py-8">
                        <p>Select a Persona. Select a Problem. Start a chat.</p>
                        {selectedPersona && (
                          <p className="mt-2 text-sm">
                            Selected persona: <strong>{selectedPersona}</strong>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-white text-gray-800 ml-4 mr-auto border'
                                : 'bg-white text-gray-800 ml-auto mr-4 border'
                            }`}
                          >
                            <div className="text-xs opacity-70 mb-1">
                              {message.role === 'user' ? 'You' : selectedPersona}
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                        {streamingContent && (
                          <div className="bg-white text-gray-800 ml-auto mr-4 border p-3 rounded-lg">
                            <div className="text-xs opacity-70 mb-1">{selectedPersona}</div>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{streamingContent}</ReactMarkdown>
                            </div>
                          </div>
                        )}
                        {isChatting && !streamingContent && (
                          <div className="bg-white text-gray-800 ml-auto mr-4 border p-3 rounded-lg">
                            <div className="text-xs opacity-70 mb-1">{selectedPersona}</div>
                            <div className="flex items-center gap-2">
                              <MorphingHeartLoader size={16} className="text-red-500" />
                              <span className="text-sm">Generating policy draft...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Input Area */}
                <div className="border-t border-gray-200 p-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe any civic issue you want transformed into legislation. Goodable will automatically detect the input type and transform it."
                    className="min-h-[120px] resize-none border border-gray-300 rounded-lg p-3 text-sm"
                  />
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center gap-2 mt-4">
                {!isChatting ? (
                  <Button 
                    variant="outline"
                    onClick={handleSubmit}
                    disabled={!prompt.trim()}
                    className="px-6 bg-white"
                  >
                    {mode === 'chat' ? 'Process with AI' : 'Generate Legislation'}
                  </Button>
                ) : (
                  <Button 
                    variant="destructive"
                    onClick={handleStopGeneration}
                    className="px-6"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Stop Generation
                  </Button>
                )}
                
                {chatMessages.length > 0 && (
                  <>
                    <Button variant="outline" onClick={exportAsPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" onClick={shareToNYSLRS}>
                      <Share className="h-4 w-4 mr-2" />
                      Share to Professionals
                    </Button>
                  </>
                )}
                
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Settings (Desktop Only) */}
          {!isMobile && (
            <div className="w-80 bg-[#F6F4EE] border-l border-gray-200 p-6">
              <SettingsContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyPortal;
