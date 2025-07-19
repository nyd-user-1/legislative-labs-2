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
import { RotateCcw, Download, Code, Share, List, SlidersHorizontal, Settings, Info } from "lucide-react";
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
  const [maxLength, setMaxLength] = useState([256]);
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
        setPrompt(`POLICY PIPELINE INPUT:\n${selectedOption.content}\n\nINSTRUCTIONS: Transform this citizen problem into a complete NYS legislative draft.`);
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
      setPrompt(`POLICY PIPELINE INPUT:\nProblem Statement: ${selectedProblem["Sample Problems"]}\n\nINSTRUCTIONS: Transform this citizen problem into a complete NYS legislative draft.`);
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
          systemPrompt: systemPrompt
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Simulate streaming for now - in production, you'd handle actual streaming
      const fullContent = response.data.message;
      let currentContent = "";
      
      for (let i = 0; i < fullContent.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing speed
        currentContent += fullContent[i];
        setStreamingContent(currentContent);
        
        // Scroll to bottom during streaming
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }

      // Add final AI response to chat
      const aiMessage = { role: 'assistant' as const, content: fullContent };
      setChatMessages(prev => [...prev, aiMessage]);
      setStreamingContent("");
      setPipelineStage('draft');

      toast({
        title: "Policy Draft Generated",
        description: `Legislative draft created with ${selectedPersona}`,
      });
      
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to generate policy draft",
        variant: "destructive",
      });
    } finally {
      setIsChatting(false);
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

      {/* Temperature */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-sm font-medium text-gray-700">Temperature</Label>
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

      {/* Maximum Length */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-sm font-medium text-gray-700">Maximum Length</Label>
          <span className="text-sm text-gray-500">{maxLength[0]}</span>
        </div>
        <Slider
          value={maxLength}
          onValueChange={setMaxLength}
          max={4000}
          min={1}
          step={1}
          className="w-full"
        />
      </div>

      {/* Top P */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-sm font-medium text-gray-700">Top P</Label>
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
              
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={mode === 'chat' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode('chat')}
                  className="flex items-center gap-2"
                >
                  Chat
                </Button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 flex flex-col bg-[#FBF9F6] rounded-lg border border-gray-200">
                <ScrollArea className="flex-1" ref={chatScrollRef}>
                  <div className="p-4">
                    {chatMessages.length === 0 && !streamingContent ? (
                      <div className="text-center text-gray-500 py-8">
                        <p>Start a conversation by entering your prompt and clicking "Generate Legislation"</p>
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
                              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
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
                    placeholder="POLICY PIPELINE INPUT:

Option 1 - Load from Goodable:
Click 'Load' above and select a citizen problem from your chat history.

Option 2 - Direct Input:
Paste a problem statement like:
'Problem: Childcare costs are unaffordable for working families...'

Option 3 - Manual Entry:
Describe any civic issue you want transformed into legislation.

The AI will automatically detect the input type and transform it into professional NYS legislative format."
                    className="min-h-[120px] resize-none border border-gray-300 rounded-lg p-3 text-sm"
                  />
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center gap-2 mt-4">
                <Button 
                  className="bg-black text-white hover:bg-gray-800 px-6"
                  onClick={handleSubmit}
                  disabled={isChatting}
                >
                  {mode === 'chat' ? 'Process with AI' : 'Generate Legislation'}
                </Button>
                
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