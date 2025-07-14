
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RotateCcw, Download, Code, Share, List, ChevronDown, SlidersHorizontal, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const Playground = () => {
  const [prompt, setPrompt] = useState("Write a tagline for an ice cream shop");
  const [selectedChat, setSelectedChat] = useState("");
  const [model, setModel] = useState("text-davinci-003");
  const [temperature, setTemperature] = useState([0.56]);
  const [maxLength, setMaxLength] = useState([256]);
  const [topP, setTopP] = useState([0.9]);
  const [mode, setMode] = useState("complete");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOptions, setChatOptions] = useState<ChatOption[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const fetchUserChats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: chatSessions, error } = await supabase
        .from("chat_sessions")
        .select(`
          *,
          Bills!inner(bill_number, title, description),
          People!inner(name, chamber, district),
          Committees!inner(committee_name, chair_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const options: ChatOption[] = [];

      // Process chat sessions and create options
      chatSessions?.forEach((session: any) => {
        const messages = Array.isArray(session.messages) ? session.messages : JSON.parse(session.messages || '[]');
        const firstUserMessage = messages.find((msg: any) => msg.role === 'user')?.content || '';

        if (session.title.toLowerCase().includes('problem:')) {
          const problemNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Problem ${problemNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: firstUserMessage,
            type: 'problem'
          });
        } else if (session.title.toLowerCase().includes('solution:')) {
          const solutionNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Solution ${solutionNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: firstUserMessage,
            type: 'solution'
          });
        } else if (session.title.toLowerCase().includes('media kit:')) {
          const mediaKitNumber = session.title.split(':')[1]?.trim() || 'Unknown';
          options.push({
            id: session.id,
            label: `Media Kit ${mediaKitNumber}: ${firstUserMessage.substring(0, 50)}...`,
            content: firstUserMessage,
            type: 'mediaKit'
          });
        } else if (session.bill_id && session.Bills) {
          const bill = Array.isArray(session.Bills) ? session.Bills[0] : session.Bills;
          options.push({
            id: session.id,
            label: `Bill ${bill.bill_number}: ${bill.title || bill.description || 'No description'}`,
            content: firstUserMessage,
            type: 'bill'
          });
        } else if (session.member_id && session.People) {
          const member = Array.isArray(session.People) ? session.People[0] : session.People;
          options.push({
            id: session.id,
            label: `Member ${member.name} (${member.chamber}, ${member.district})`,
            content: firstUserMessage,
            type: 'member'
          });
        } else if (session.committee_id && session.Committees) {
          const committee = Array.isArray(session.Committees) ? session.Committees[0] : session.Committees;
          options.push({
            id: session.id,
            label: `Committee ${committee.committee_name} (Chair: ${committee.chair_name})`,
            content: firstUserMessage,
            type: 'committee'
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

  useEffect(() => {
    fetchUserChats();
  }, []);

  const handleChatSelection = (chatId: string) => {
    const selectedOption = chatOptions.find(option => option.id === chatId);
    if (selectedOption) {
      setPrompt(selectedOption.content);
      setSelectedChat(chatId);
    }
  };

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Mode */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Mode</Label>
        <div className="flex rounded-lg border border-gray-300 p-1">
          <Button
            variant={mode === "complete" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("complete")}
          >
            <List className="h-4 w-4 mr-1" />
          </Button>
          <Button
            variant={mode === "insert" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("insert")}
          >
            <Download className="h-4 w-4 mr-1" />
          </Button>
          <Button
            variant={mode === "edit" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("edit")}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
          </Button>
        </div>
      </div>

      {/* Model */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger>
            <SelectValue />
            <ChevronDown className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text-davinci-003">text-davinci-003</SelectItem>
            <SelectItem value="gpt-4">gpt-4</SelectItem>
            <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
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
    <div className="flex h-full bg-white">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Playground</h1>
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

              {/* Load Chat Button */}
              <Select value={selectedChat} onValueChange={handleChatSelection}>
                <SelectTrigger className="w-32 sm:w-48">
                  <SelectValue placeholder="Load" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading chats...</SelectItem>
                  ) : chatOptions.length === 0 ? (
                    <SelectItem value="empty" disabled>No chats found</SelectItem>
                  ) : (
                    chatOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

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
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="flex-1 min-h-[300px] sm:min-h-[500px] resize-none border border-gray-300 rounded-lg p-4 text-sm"
              />
              <div className="flex items-center justify-between mt-4">
                <Button className="bg-black text-white hover:bg-gray-800 px-6">
                  Submit
                </Button>
                <Button variant="ghost" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Settings (Desktop Only) */}
          {!isMobile && (
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <SettingsContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;
