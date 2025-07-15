
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Clock, Shield, Plus } from "lucide-react";

const Home = () => {
  const milestones = [
    {
      date: "Live",
      title: "AI-Powered Problem Generation",
      description: "Transform real complaints into refined problem statements with our advanced AI-powered Problem Engine.",
      status: "Released",
      icon: <Check className="w-6 h-6 text-primary" />,
    },
    {
      date: "Live", 
      title: "Real-Time Collaboration",
      description: "Leverage your problem statement into an actionable solution statement ready for legislative drafting or policy advocacy.",
      status: "Released",
      icon: <Plus className="w-6 h-6 text-primary" />,
    },
    {
      date: "Q3 2024",
      title: "Advanced Testing Suite", 
      description: "Automated testing framework with AI-driven test generation and coverage analysis.",
      status: "Planned",
      icon: <Clock className="w-6 h-6 text-muted-foreground" />,
    },
    {
      date: "Q4 2024",
      title: "Enterprise Security Features",
      description: "Advanced security controls, audit logging, and compliance reporting for enterprise teams.",
      status: "Planned", 
      icon: <Shield className="w-6 h-6 text-muted-foreground" />,
    },
  ];

  return (
    <div className="">
      <div className="relative">
        {/* Background pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full">
          <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(120,119,198,0.1),transparent)]"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px] py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">
              New York Digital
            </Badge>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              Building the future we want.
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Our commitment to innovation drives us forward. Your complaints and problems are the fuel to get us there.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg">
                View Problem Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Submit Problem
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.date + milestone.title} className="relative">
                  {/* Timeline line */}
                  {index !== milestones.length - 1 && (
                    <div
                      className={`absolute left-6 top-12 h-full w-0.5 ${
                        milestone.status === "Released"
                          ? "bg-primary"
                          : milestone.status === "In Progress"
                          ? "bg-gradient-to-b from-primary to-muted"
                          : "bg-muted"
                      }`}
                    ></div>
                  )}

                  <Card className="relative flex gap-6 p-6 hover:shadow-lg transition-all duration-300">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        milestone.status === "Released"
                          ? "bg-primary/10"
                          : milestone.status === "In Progress"
                          ? "bg-primary/5"
                          : "bg-muted"
                      }`}
                    >
                      {milestone.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            milestone.status === "Released"
                              ? "default"
                              : milestone.status === "In Progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {milestone.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {milestone.date}
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Request CTA */}
          <Card className="mt-16 p-8 text-center max-w-2xl mx-auto bg-muted/50">
            <h3 className="font-semibold mb-2">Have a feature in mind?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're always looking to improve. Share your ideas and help shape our roadmap.
            </p>
            <Button variant="outline" size="lg">
              Submit Feature Request
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
