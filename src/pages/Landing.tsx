
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Code, 
  Palette, 
  Users, 
  Star,
  Github,
  Twitter,
  Menu,
  X,
  Image,
  Share2,
  ChevronDown,
  ArrowUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [inputValue, setInputValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholderTexts = [
    "Ask Lovable to create a landing"
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholderTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setIsTyping(true);
      // Simulate navigation to app
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Ship your ideas in minutes, not weeks"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "AI-Powered",
      description: "Just describe what you want to build"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Beautiful Design",
      description: "Professional UI components out of the box"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaborative",
      description: "Share and iterate with your team"
    }
  ];

  const examples = [
    {
      title: "E-commerce Dashboard",
      description: "Complete analytics dashboard with charts and metrics",
      image: "/placeholder.svg",
      tags: ["React", "Charts", "Dashboard"]
    },
    {
      title: "Social Media App",
      description: "Modern social platform with real-time features",
      image: "/placeholder.svg",
      tags: ["Social", "Real-time", "Mobile"]
    },
    {
      title: "Project Manager",
      description: "Kanban board with team collaboration tools",
      image: "/placeholder.svg",
      tags: ["Productivity", "Teams", "Kanban"]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-muted/10 rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Goodable</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#examples" className="text-muted-foreground hover:text-foreground transition-colors">Examples</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border/50 py-4">
              <nav className="space-y-4">
                <a href="#features" className="block text-muted-foreground hover:text-foreground">Features</a>
                <a href="#examples" className="block text-muted-foreground hover:text-foreground">Examples</a>
                <a href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</a>
                <a href="#docs" className="block text-muted-foreground hover:text-foreground">Docs</a>
                <div className="pt-4 space-y-2">
                  <Button variant="ghost" className="w-full" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button className="w-full" onClick={() => navigate('/auth')}>
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Do something,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                something good
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Create policy and legislation by chatting with AI
            </p>

            {/* Input Section */}
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-3 focus-within:border-primary/50 transition-all duration-300">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={placeholderTexts[currentPlaceholder]}
                      className="h-10 pr-16 text-lg bg-transparent border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                      disabled={isTyping}
                    />
                    {inputValue.trim() && (
                      <Button
                        type="submit"
                        className="absolute right-1 top-1 h-8 w-8 p-0 rounded-lg"
                        disabled={isTyping}
                      >
                        {isTyping ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowUp className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Toolbar inside input with 55px spacing */}
                  <div className="flex items-center justify-between pt-[55px] border-t border-border/30" style={{ marginTop: '55px' }}>
                    <div className="flex items-center gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 text-xs px-2 py-1 rounded">
                            Doc
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
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 px-2 py-1 rounded">
                            <Image className="w-3 h-3" />
                            <span className="text-xs">Prompt</span>
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
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 px-2 py-1 rounded" onClick={() => navigate('/plans')}>
                            <Share2 className="w-3 h-3" />
                            <span className="text-xs">Workspace</span>
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
                          <button type="button" className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 px-2 py-1 rounded">
                            <div className="w-3 h-3 bg-green-500 rounded flex items-center justify-center">
                              <span className="text-[8px] text-white font-bold">⚡</span>
                            </div>
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

            {/* User Count */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="flex -space-x-2 mr-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <span>10,000+ developers building with Goodable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why developers love Goodable
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Build faster, deploy easier, and focus on what matters most
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built with Goodable
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See what others have created in minutes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {examples.map((example, index) => (
                <Card key={index} className="group overflow-hidden bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-video bg-muted/50 relative overflow-hidden">
                    <img
                      src={example.image}
                      alt={example.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{example.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{example.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {example.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to build something amazing?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already building the future with Goodable
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Start Building Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
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
                  <Github className="w-5 h-5" />
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

export default Landing;
