
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles
} from "lucide-react";

const ChangeLog = () => {
  const releases = [
    {
      version: "2.0.0",
      date: "July 20, 2025",
      title: "Advanced Legislative Intelligence",
      description: "Transforming how policy professionals research and engage with legislative data through AI-powered insights.",
      isLatest: true,
      features: [
        {
          title: "AI-Powered Analysis",
          description: "Revolutionary AI chat system that provides instant, contextual insights on bills, members, and committees with natural language processing.",
          category: "AI"
        },
        {
          title: "Dynamic Dashboard",
          description: "Comprehensive dashboard with real-time legislative metrics, trending bills, committee activity, and member performance indicators.",
          category: "Analytics"
        },
        {
          title: "Advanced Search",
          description: "Sophisticated search capabilities across all legislative data with intelligent filters, keyword highlighting, and contextual suggestions.",
          category: "Search"
        },
        {
          title: "Personalized Favorites",
          description: "Smart favorites management allowing users to track bills, members, and committees with priority notifications and updates.",
          category: "Personalization"
        }
      ]
    },
    {
      version: "1.2.0",
      date: "July 15, 2025",
      title: "Professional Legislative Research Platform",
      description: "Complete platform overhaul delivering enterprise-grade legislative research capabilities with modern UI/UX.",
      features: [
        {
          title: "Bills Database",
          description: "Full access to New York State legislative database with detailed bill information, sponsor data, committee assignments, and voting records.",
          category: "Data"
        },
        {
          title: "Member Profiles",
          description: "Detailed member profiles with biographical information, committee memberships, sponsored legislation, and voting patterns.",
          category: "Members"
        },
        {
          title: "Committee Management",
          description: "Complete committee information including membership, meeting schedules, active legislation, and jurisdictional details.",
          category: "Committees"
        },
        {
          title: "Interactive Chat",
          description: "Persistent chat sessions with AI assistant specialized in legislative research, policy analysis, and strategic planning.",
          category: "Intelligence"
        }
      ]
    },
    {
      version: "1.1.0",
      date: "July 10, 2025",
      title: "Foundation Platform Launch",
      description: "Initial platform release establishing the core architecture for legislative research and policy analysis.",
      features: [
        {
          title: "Modern Design",
          description: "Comprehensive design system built with Tailwind CSS and Shadcn UI components for consistent, accessible user experience.",
          category: "Design"
        },
        {
          title: "High-Performance",
          description: "React-based architecture with optimized data loading, caching strategies, and responsive design for all devices.",
          category: "Performance"
        },
        {
          title: "NYS API Integration",
          description: "Complete integration with New York State's official legislative API providing comprehensive access to all public legislative data.",
          category: "Integration"
        },
        {
          title: "Responsive Navigation",
          description: "Intuitive sidebar navigation with collapsible design, search integration, and contextual menu organization.",
          category: "Navigation"
        }
      ]
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      "AI": "bg-purple-100 text-purple-800 border-purple-200",
      "Analytics": "bg-blue-100 text-blue-800 border-blue-200",
      "Search": "bg-green-100 text-green-800 border-green-200",
      "Personalization": "bg-pink-100 text-pink-800 border-pink-200",
      "Data": "bg-orange-100 text-orange-800 border-orange-200",
      "Members": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Committees": "bg-teal-100 text-teal-800 border-teal-200",
      "Intelligence": "bg-violet-100 text-violet-800 border-violet-200",
      "Design": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "Performance": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Integration": "bg-slate-100 text-slate-800 border-slate-200",
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
              <p className="text-gray-600">Continuous innovation since July 2025</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Platform Evolution
              </p>
              <p className="text-xs text-blue-700">
                {releases.reduce((acc, release) => acc + release.features.length, 0)} features delivered • 
                {releases.length} major releases
              </p>
            </div>
          </div>
        </div>

        {/* Release Timeline */}
        <div className="space-y-6">
          {releases.map((release, releaseIndex) => (
            <div key={release.version}>
              <Card className="card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CardHeader className="card-header px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          Version {release.version}
                        </CardTitle>
                        {release.isLatest && (
                          <Badge className="bg-black text-white text-xs px-3 py-1 rounded-full">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-gray-500 text-sm">
                        Released on {release.date}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="px-6 pb-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{release.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{release.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {release.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {feature.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getCategoryColor(feature.category)}`}
                            >
                              {feature.category}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-8 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Platform Impact Summary
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Empowering legislative research and policy analysis through cutting-edge technology
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-primary mb-1">
                  {releases.reduce((acc, release) => acc + release.features.length, 0)}
                </div>
                <div className="text-xs text-gray-600">Features Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary mb-1">3</div>
                <div className="text-xs text-gray-600">Major Releases</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary mb-1">10</div>
                <div className="text-xs text-gray-600">Days Active</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary mb-1">24/7</div>
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
