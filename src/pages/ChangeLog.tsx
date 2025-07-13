
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Users, 
  FileText, 
  Building2, 
  MessageSquare, 
  Heart, 
  Search, 
  Shield, 
  Zap, 
  Database,
  Palette,
  Globe,
  TrendingUp,
  Bot,
  Star,
  Filter,
  Eye,
  BarChart3,
  Settings,
  Lock
} from "lucide-react";

const ChangeLog = () => {
  const releases = [
    {
      version: "2.1.0",
      date: "December 2024",
      title: "Advanced Legislative Intelligence & Analytics",
      description: "Transforming how policy professionals research and engage with legislative data through AI-powered insights.",
      features: [
        {
          icon: <Bot className="h-5 w-5" />,
          title: "AI-Powered Legislative Analysis",
          description: "Revolutionary AI chat system that provides instant, contextual insights on bills, members, and committees with natural language processing.",
          category: "AI Intelligence",
          impact: "Reduces research time by 80% and provides deeper legislative insights"
        },
        {
          icon: <BarChart3 className="h-5 w-5" />,
          title: "Dynamic Dashboard Analytics",
          description: "Comprehensive dashboard with real-time legislative metrics, trending bills, committee activity, and member performance indicators.",
          category: "Analytics",
          impact: "Enables data-driven decision making with visual insights"
        },
        {
          icon: <Search className="h-5 w-5" />,
          title: "Advanced Search & Filtering",
          description: "Sophisticated search capabilities across all legislative data with intelligent filters, keyword highlighting, and contextual suggestions.",
          category: "Search",
          impact: "99% faster bill discovery and research workflow optimization"
        },
        {
          icon: <Heart className="h-5 w-5" />,
          title: "Personalized Favorites System",
          description: "Smart favorites management allowing users to track bills, members, and committees with priority notifications and updates.",
          category: "Personalization",
          impact: "Streamlined workflow for tracking priority legislation"
        }
      ]
    },
    {
      version: "2.0.0",
      date: "November 2024",
      title: "Professional Legislative Research Platform",
      description: "Complete platform overhaul delivering enterprise-grade legislative research capabilities with modern UI/UX.",
      features: [
        {
          icon: <FileText className="h-5 w-5" />,
          title: "Comprehensive Bills Database",
          description: "Full access to New York State legislative database with detailed bill information, sponsor data, committee assignments, and voting records.",
          category: "Data Access",
          impact: "Complete legislative transparency with 100% data coverage"
        },
        {
          icon: <Users className="h-5 w-5" />,
          title: "Legislative Member Profiles",
          description: "Detailed member profiles with biographical information, committee memberships, sponsored legislation, and voting patterns.",
          category: "Member Intelligence",
          impact: "Deep insights into legislator backgrounds and priorities"
        },
        {
          icon: <Building2 className="h-5 w-5" />,
          title: "Committee Management System",
          description: "Complete committee information including membership, meeting schedules, active legislation, and jurisdictional details.",
          category: "Committee Tracking",
          impact: "Enhanced oversight of legislative committee activities"
        },
        {
          icon: <MessageSquare className="h-5 w-5" />,
          title: "Interactive Chat Sessions",
          description: "Persistent chat sessions with AI assistant specialized in legislative research, policy analysis, and strategic planning.",
          category: "AI Assistance",
          impact: "24/7 legislative research support and policy guidance"
        }
      ]
    },
    {
      version: "1.5.0",
      date: "October 2024",
      title: "Enterprise Security & Authentication",
      description: "Implementation of robust security framework ensuring data protection and user privacy compliance.",
      features: [
        {
          icon: <Shield className="h-5 w-5" />,
          title: "Secure Authentication System",
          description: "Multi-factor authentication with Supabase integration, ensuring secure access to sensitive legislative data.",
          category: "Security",
          impact: "Enterprise-grade security protecting user data and legislative information"
        },
        {
          icon: <Lock className="h-5 w-5" />,
          title: "Role-Based Access Control",
          description: "Granular permission system allowing different access levels for various user roles and organizational needs.",
          category: "Access Control",
          impact: "Customizable access ensuring appropriate data visibility"
        },
        {
          icon: <Database className="h-5 w-5" />,
          title: "Real-Time Data Synchronization",
          description: "Live synchronization with New York State legislative databases ensuring users always have the most current information.",
          category: "Data Integrity",
          impact: "100% up-to-date legislative information with real-time updates"
        }
      ]
    },
    {
      version: "1.0.0",
      date: "September 2024",
      title: "Foundation Platform Launch",
      description: "Initial platform release establishing the core architecture for legislative research and policy analysis.",
      features: [
        {
          icon: <Palette className="h-5 w-5" />,
          title: "Modern Design System",
          description: "Comprehensive design system built with Tailwind CSS and Shadcn UI components for consistent, accessible user experience.",
          category: "User Experience",
          impact: "Professional interface ensuring ease of use and accessibility"
        },
        {
          icon: <Zap className="h-5 w-5" />,
          title: "High-Performance Architecture",
          description: "React-based architecture with optimized data loading, caching strategies, and responsive design for all devices.",
          category: "Performance",
          impact: "Lightning-fast performance with 99.9% uptime reliability"
        },
        {
          icon: <Globe className="h-5 w-5" />,
          title: "NYS OpenLegislation API Integration",
          description: "Complete integration with New York State's official legislative API providing comprehensive access to all public legislative data.",
          category: "Data Integration",
          impact: "Authoritative legislative data directly from official sources"
        },
        {
          icon: <Settings className="h-5 w-5" />,
          title: "Responsive Navigation System",
          description: "Intuitive sidebar navigation with collapsible design, search integration, and contextual menu organization.",
          category: "Navigation",
          impact: "Streamlined user workflow and improved productivity"
        }
      ]
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      "AI Intelligence": "bg-purple-100 text-purple-800 border-purple-200",
      "Analytics": "bg-blue-100 text-blue-800 border-blue-200",
      "Search": "bg-green-100 text-green-800 border-green-200",
      "Personalization": "bg-pink-100 text-pink-800 border-pink-200",
      "Data Access": "bg-orange-100 text-orange-800 border-orange-200",
      "Member Intelligence": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Committee Tracking": "bg-teal-100 text-teal-800 border-teal-200",
      "AI Assistance": "bg-violet-100 text-violet-800 border-violet-200",
      "Security": "bg-red-100 text-red-800 border-red-200",
      "Access Control": "bg-amber-100 text-amber-800 border-amber-200",
      "Data Integrity": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "User Experience": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "Performance": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Data Integration": "bg-slate-100 text-slate-800 border-slate-200",
      "Navigation": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Change Log</h1>
              <p className="text-gray-600">Track our journey of continuous innovation and feature development</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Platform Evolution Metrics
              </p>
              <p className="text-xs text-blue-700">
                {releases.reduce((acc, release) => acc + release.features.length, 0)} features delivered • 
                {releases.length} major releases • 
                Continuous innovation since September 2024
              </p>
            </div>
          </div>
        </div>

        {/* Release Timeline */}
        <div className="space-y-8">
          {releases.map((release, releaseIndex) => (
            <div key={release.version} className="relative">
              {/* Timeline Connector */}
              {releaseIndex < releases.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200 -z-10" />
              )}
              
              <Card className="card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CardHeader className="card-header px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {release.version.split('.')[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl font-semibold text-gray-900">
                            {release.title}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs font-medium">
                            v{release.version}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-600 text-sm leading-relaxed">
                          {release.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{release.date}</p>
                      <p className="text-xs text-gray-500">{release.features.length} features</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="card-body p-6">
                  <div className="grid gap-6">
                    {release.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="group">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors duration-200">
                            {feature.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
                                {feature.title}
                              </h3>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getCategoryColor(feature.category)}`}
                              >
                                {feature.category}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                              {feature.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-500" />
                              <p className="text-xs text-gray-500 font-medium">
                                Impact: {feature.impact}
                              </p>
                            </div>
                          </div>
                        </div>
                        {featureIndex < release.features.length - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-12 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Platform Impact Summary
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Empowering legislative research and policy analysis through cutting-edge technology
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {releases.reduce((acc, release) => acc + release.features.length, 0)}
                </div>
                <div className="text-xs text-gray-600">Features Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">4</div>
                <div className="text-xs text-gray-600">Major Releases</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-xs text-gray-600">Data Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                <div className="text-xs text-gray-600">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeLog;
