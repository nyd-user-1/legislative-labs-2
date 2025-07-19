import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Twitter, ChevronDown, ArrowUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useVisitorCount } from '@/hooks/useVisitorCount';
import { useAuth } from '@/contexts/AuthContext';
import { ProblemChatSheet } from '@/components/ProblemChatSheet';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  const [userProblem, setUserProblem] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAIChatSheet, setShowAIChatSheet] = useState(false);
  const [sampleProblems, setSampleProblems] = useState<Array<{text: string}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { count, loading } = useVisitorCount();
  const { user } = useAuth();
  
  const placeholderTexts = ["Solve a problem", "Bring home Sara Lopez Garcia", "Write a new contract for your union", "Draft a constitutional amendment", "Eliminate addictive tech design features", "Develop a program for universal pre-k"];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  
  // Check if input has meaningful content (not just whitespace)
  const hasContent = userProblem.trim().length > 0;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSampleProblems = async () => {
      console.log('Fetching sample problems...');
      try {
        const { data, error } = await supabase
          .from('Sample Problems')
          .select('"Sample Problems"')
          .order('"Sample Problems"');
        
        console.log('Sample problems query result:', { data, error });
        
        if (error) {
          console.error('Error fetching sample problems:', error);
          return;
        }
        
        if (data) {
          console.log('Raw data from database:', data);
          const processedData = data.map(item => ({
            text: item['Sample Problems']
          }));
          console.log('Processed data:', processedData);
          setSampleProblems(processedData);
        }
      } catch (error) {
        console.error('Error fetching sample problems:', error);
      }
    };

    fetchSampleProblems();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasContent && !isTyping) {
      // For authenticated users, open AI chat sheet directly
      setShowAIChatSheet(true);
    }
  };

  const handleDropdownSelect = (text: string) => {
    setUserProblem(`It's a problem that ${text.toLowerCase()}`);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleDoSomethingClick = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      inputRef.current.focus();
    }
  };

  const formatVisitorCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}K+`;
    }
    return count.toString();
  };
  
  const problemCategories = [
    // Row 1
    { title: "Childcare", subtitle: "26 Sub-problems • 84 Solutions" },
    { title: "Quality Time", subtitle: "5 Sub-problems • 17 Solutions" },
    { title: "Third Place", subtitle: "30 Sub-problems • 86 Solutions" },
    // ... keep existing code (all problem categories array)
    { title: "Grassroots Mobilization", subtitle: "23 Sub-problems • 59 Collaborations" },
    { title: "Social Innovation", subtitle: "20 Sub-problems • 52 Solutions" },
    { title: "Impact Measurement", subtitle: "13 Sub-problems • 33 Solutions" },
  ].slice(0, 60); // Keep all 60 categories from the original

  return (
    <div className="min-h-screen text-foreground overflow-hidden" style={{ backgroundColor: '#F6F4ED' }}>
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-muted/10 rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      <main className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen" style={{ paddingTop: '175px' }}>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Do something,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">something good</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">Create legislation by chatting with ai</p>

            <div className="w-full max-w-[900px] sm:w-[calc(100vw-32px)] mx-auto mb-16 px-4 sm:px-0">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative bg-background/50 backdrop-blur-sm border border-gray-300 rounded-2xl pl-3 pr-6 py-3 focus-within:border-primary/50 transition-all duration-300 shadow-md">
                  <div className="relative">
                    <Input 
                      ref={inputRef} 
                      type="text" 
                      value={userProblem} 
                      onChange={e => setUserProblem(e.target.value)} 
                      placeholder={placeholderTexts[currentPlaceholder]} 
                      className="h-10 pr-16 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground overflow-hidden text-ellipsis" 
                      style={{ fontSize: '16px' }}
                      disabled={isTyping} 
                    />
                    {hasContent && (
                      <Button 
                        type="submit" 
                        className={`absolute right-1 top-1 h-8 w-8 p-0 rounded-lg transition-all duration-300 ${
                          hasContent && !isTyping 
                            ? 'opacity-100 bg-primary hover:bg-primary/90' 
                            : 'opacity-40 bg-muted-foreground cursor-not-allowed'
                        }`}
                        disabled={!hasContent || isTyping}
                      >
                        {isTyping ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowUp className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="absolute left-0 right-0 h-px bg-border/30 mt-8 mb-4" />
                  
                  <div className="flex items-center justify-between mt-12">
                    <div className="flex items-center gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-[#EBE9E4] transition-all duration-200 px-3 py-2 rounded-[128px] border border-border/30 hover:border-border/50">
                            <span className="text-xs">Problems</span>
                            <ChevronDown className="w-2 h-2" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-auto min-w-0" sideOffset={8}>
                          {sampleProblems.length === 0 ? (
                            <DropdownMenuItem className="text-muted-foreground">
                              Loading problems...
                            </DropdownMenuItem>
                          ) : (
                            sampleProblems.map((problem, index) => {
                              console.log('Rendering problem:', problem);
                              return (
                                <DropdownMenuItem 
                                  key={index}
                                  onClick={() => handleDropdownSelect(problem.text)}
                                  className="whitespace-nowrap cursor-pointer"
                                >
                                  {problem.text}
                                </DropdownMenuItem>
                              );
                            })
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 mb-16">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <span>Loading visitor count...</span>
                ) : count ? (
                  <span>{formatVisitorCount(count)}+ visited Goodable today</span>
                ) : (
                  <span>183+ visited Goodable today</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <section id="examples" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Do goodable
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See the good others are doing today
              </p>
            </div>

            <div className="max-w-[1200px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                {problemCategories.map((category, index) => (
                  <div
                    key={index}
                    className="bg-white border border-[#e5e5e5] rounded-xl p-6 min-h-[140px] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 cursor-pointer"
                  >
                    <h3 className="font-bold text-lg text-[#1a1a1a] mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-[#666666] mb-4">
                      {category.subtitle}
                    </p>
                    <div className="text-sm text-[#ef4444] hover:underline">
                      Learn more →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20" style={{ backgroundColor: '#F6F4ED' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-[#FBF9F6] rounded-2xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to do something good?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of people who are collaborating on a future that's Goodable.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" size="lg" onClick={handleDoSomethingClick}>
                  <Heart className="w-4 h-4 mr-2" style={{ color: '#FF0000' }} />
                  Do Something
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Problem Chat Sheet */}
      <ProblemChatSheet
        open={showAIChatSheet}
        onOpenChange={setShowAIChatSheet}
        userProblem={userProblem}
      />

      <footer className="border-t border-border/50" style={{ backgroundColor: '#F6F4ED' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <span className="text-xl font-bold">Goodable</span>
              </div>
              <p className="text-muted-foreground text-sm" style={{ textAlign: 'left' }}>
                Do something,<br />
                something good.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#examples" className="hover:text-foreground">Examples</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#docs" className="hover:text-foreground">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground">About</a></li>
                <li><a href="#blog" className="hover:text-foreground">Blog</a></li>
                <li><a href="#careers" className="hover:text-foreground">Careers</a></li>
                <li><a href="#contact" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Heart className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Goodable. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
