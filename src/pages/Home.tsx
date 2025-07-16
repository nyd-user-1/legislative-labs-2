
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: "Browse Bills",
      description: "Search and analyze New York State legislation",
      action: () => navigate("/bills")
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Find Members",
      description: "Explore legislators and their voting records",
      action: () => navigate("/members")
    },
    {
      icon: <Search className="w-8 h-8 text-primary" />,
      title: "Research Committees",
      description: "Track committee activities and agendas",
      action: () => navigate("/committees")
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 -z-10 w-full h-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,hsl(var(--primary)/0.08),transparent)]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 2xl:max-w-[1400px] py-24 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 bg-background/80 backdrop-blur-sm">
            New York Digital
          </Badge>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Legislative Research Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Access comprehensive data on New York State bills, legislators, and committees.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 bg-card/95 backdrop-blur-sm border-border/50 cursor-pointer"
              onClick={feature.action}
            >
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm bg-primary/10 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
