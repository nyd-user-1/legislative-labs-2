import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, Code, Palette, Users, Star, Heart, Twitter, Image, Share2, ChevronDown, ArrowUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { useVisitorCount } from '@/hooks/useVisitorCount';

const Landing = () => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { count, loading } = useVisitorCount();
  
  const placeholderTexts = ["Solve a problem", "Write a new contract for your union", "Draft a constitutional amendment", "Eliminate addictive tech design features", "Develop a program for universal pre-k"];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  
  // Check if input has meaningful content (not just whitespace)
  const hasContent = inputValue.trim().length > 0;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholderTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasContent && !isTyping) {
      setIsTyping(true);
      // Simulate navigation to app
      setTimeout(() => {
        navigate('/home');
      }, 1000);
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
    // Row 2
    { title: "Income Stagnation", subtitle: "16 Sub-problems • 32 Solutions" },
    { title: "End Stage Capitalism", subtitle: "2 Sub-problems • 2 Solutions" },
    { title: "Cultural Divisions", subtitle: "1 Sub-problems • 1 Solutions" },
    // Row 3
    { title: "Addictive Technology", subtitle: "5 Sub-problems • 8 Solutions" },
    { title: "Fake News", subtitle: "1 Sub-problems • 3 Solutions" },
    { title: "Free Time", subtitle: "11 Sub-problems • 20 Solutions" },
    // Row 4
    { title: "Climate Change", subtitle: "23 Sub-problems • 67 Solutions" },
    { title: "Housing Crisis", subtitle: "18 Sub-problems • 45 Solutions" },
    { title: "Mental Health Support", subtitle: "12 Sub-problems • 38 Solutions" },
    // Row 5
    { title: "Food Security", subtitle: "9 Sub-problems • 24 Solutions" },
    { title: "Digital Divide", subtitle: "14 Sub-problems • 41 Solutions" },
    { title: "Elder Care", subtitle: "7 Sub-problems • 19 Solutions" },
    // Row 6
    { title: "Education Access", subtitle: "31 Sub-problems • 78 Solutions" },
    { title: "Workplace Burnout", subtitle: "6 Sub-problems • 15 Solutions" },
    { title: "Social Isolation", subtitle: "11 Sub-problems • 29 Solutions" },
    // Row 7
    { title: "Healthcare Access", subtitle: "22 Sub-problems • 56 Solutions" },
    { title: "Financial Literacy", subtitle: "8 Sub-problems • 22 Solutions" },
    { title: "Community Safety", subtitle: "13 Sub-problems • 34 Solutions" },
    // Row 8
    { title: "Environmental Justice", subtitle: "17 Sub-problems • 43 Solutions" },
    { title: "Youth Development", subtitle: "21 Sub-problems • 51 Solutions" },
    { title: "Disability Rights", subtitle: "5 Sub-problems • 12 Solutions" },
    // Row 9
    { title: "Immigration Support", subtitle: "19 Sub-problems • 47 Solutions" },
    { title: "Gender Equality", subtitle: "24 Sub-problems • 62 Solutions" },
    { title: "Veteran Services", subtitle: "10 Sub-problems • 26 Solutions" },
    // Row 10
    { title: "Rural Development", subtitle: "15 Sub-problems • 39 Solutions" },
    { title: "Urban Planning", subtitle: "28 Sub-problems • 71 Solutions" },
    { title: "Transportation Equity", subtitle: "12 Sub-problems • 31 Solutions" },
    // Row 11
    { title: "Criminal Justice Reform", subtitle: "20 Sub-problems • 54 Solutions" },
    { title: "Substance Abuse", subtitle: "9 Sub-problems • 23 Solutions" },
    { title: "Homelessness", subtitle: "16 Sub-problems • 42 Solutions" },
    // Row 12
    { title: "Digital Privacy", subtitle: "11 Sub-problems • 28 Solutions" },
    { title: "Renewable Energy", subtitle: "25 Sub-problems • 65 Solutions" },
    { title: "Water Conservation", subtitle: "7 Sub-problems • 18 Solutions" },
    // Row 13
    { title: "Food Waste Reduction", subtitle: "13 Sub-problems • 35 Solutions" },
    { title: "Civic Engagement", subtitle: "18 Sub-problems • 46 Solutions" },
    { title: "Small Business Support", subtitle: "22 Sub-problems • 58 Solutions" },
    // Row 14
    { title: "Disaster Relief", subtitle: "8 Sub-problems • 21 Solutions" },
    { title: "Cultural Preservation", subtitle: "14 Sub-problems • 37 Solutions" },
    { title: "Scientific Research", subtitle: "27 Sub-problems • 69 Solutions" },
    // Row 15
    { title: "Public Health", subtitle: "32 Sub-problems • 81 Solutions" },
    { title: "Economic Development", subtitle: "19 Sub-problems • 49 Solutions" },
    { title: "Infrastructure", subtitle: "24 Sub-problems • 61 Solutions" },
    // Row 16
    { title: "Racial Justice", subtitle: "17 Sub-problems • 44 Solutions" },
    { title: "Worker Rights", subtitle: "15 Sub-problems • 40 Solutions" },
    { title: "Consumer Protection", subtitle: "10 Sub-problems • 27 Solutions" },
    // Row 17
    { title: "Animal Welfare", subtitle: "12 Sub-problems • 32 Solutions" },
    { title: "Media Literacy", subtitle: "9 Sub-problems • 25 Solutions" },
    { title: "Government Transparency", subtitle: "21 Sub-problems • 53 Solutions" },
    // Row 18
    { title: "Nonprofit Management", subtitle: "26 Sub-problems • 66 Solutions" },
    { title: "Community Organizing", subtitle: "14 Sub-problems • 36 Solutions" },
    { title: "Volunteer Coordination", subtitle: "8 Sub-problems • 20 Solutions" },
    // Row 19
    { title: "Policy Analysis", subtitle: "18 Sub-problems • 47 Solutions" },
    { title: "Data Advocacy", subtitle: "16 Sub-problems • 41 Solutions" },
    { title: "Legal Aid", subtitle: "11 Sub-problems • 30 Solutions" },
    // Row 20
    { title: "Grassroots Mobilization", subtitle: "23 Sub-problems • 59 Collaborations" },
    { title: "Social Innovation", subtitle: "20 Sub-problems • 52 Solutions" },
    { title: "Impact Measurement", subtitle: "13 Sub-problems • 33 Solutions" },
  ];

  return <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-muted/10 rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      <header className="relative z-10 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-lg">❤️</span>
              </div>
              <span className="text-xl font-bold">Goodable</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

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

            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-3 focus-within:border-primary/50 transition-all duration-300">
                  <div className="relative">
                    <Input 
                      ref={inputRef} 
                      type="text" 
                      value={inputValue} 
                      onChange={e => setInputValue(e.target.value)} 
                      placeholder={placeholderTexts[currentPlaceholder]} 
                      className="h-10 pr-16 text-lg bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground" 
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
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-blue-50 transition-all duration-200 px-3 py-2 rounded-[128px] border border-border/30 hover:border-border/50">
                            <span className="text-xs">Doc</span>
                            <ChevronDown className="w-2 h-2" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Option 1</DropdownMenuItem>
                          <DropdownMenuItem>Option 2</DropdownMenuItem>
                          <DropdownMenuItem>How to use goodable</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-blue-50 transition-all duration-200 px-3 py-2 rounded-[128px] border border-border/30 hover:border-border/50">
                            <span className="text-xs">Prompt</span>
                            <ChevronDown className="w-2 h-2" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Option 1</DropdownMenuItem>
                          <DropdownMenuItem>Option 2</DropdownMenuItem>
                          <DropdownMenuItem>Option 3</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-blue-50 transition-all duration-200 px-3 py-2 rounded-[128px] border border-border/30 hover:border-border/50" onClick={() => navigate('/plans')}>
                            <span className="text-xs">Workspace</span>
                            <ChevronDown className="w-2 h-2" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Option 1</DropdownMenuItem>
                          <DropdownMenuItem>Option 2</DropdownMenuItem>
                          <DropdownMenuItem>Option 3</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-blue-50 transition-all duration-200 px-3 py-2 rounded-[128px] border border-border/30 hover:border-border/50">
                            <span className="text-xs">Supabase</span>
                            <ChevronDown className="w-2 h-2" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Option 1</DropdownMenuItem>
                          <DropdownMenuItem>Option 2</DropdownMenuItem>
                          <DropdownMenuItem>Option 3</DropdownMenuItem>
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
                  <span>{formatVisitorCount(count)}+ people building with Goodable</span>
                ) : (
                  <span>10,000+ people building with Goodable</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <section id="examples" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Just do goodable
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what others are doing right now
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
                    <div className="text-sm text-[#0066cc] hover:underline">
                      Browse tutorials →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to do something good?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of people who are collaborating on a future that's Goodable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" size="lg" onClick={handleDoSomethingClick}>
                <Heart className="w-4 h-4 mr-2" />
                Do Something
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-lg">❤️</span>
                </div>
                <span className="text-xl font-bold">Goodable</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The AI-powered development platform that turns your ideas into reality.
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
    </div>;
};

export default Landing;
