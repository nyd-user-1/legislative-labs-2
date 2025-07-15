
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Shield } from "lucide-react";

const Home = () => {
  return (
    <div className="page-container min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="content-wrapper max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
            New York Digital
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Building the future we want.
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our commitment to innovation drives us forward. Your complaints and problems are the fuel to get us there.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium">
              View Problem Gallery →
            </Button>
            <Button variant="outline" className="border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium">
              Submit Problem
            </Button>
          </div>
        </div>

        {/* Cards Section */}
        <div className="space-y-6">
          {/* Card 1 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Live
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    AI-Powered Problem Generation
                  </h3>
                  <p className="text-gray-600">
                    Transform real complaints into refined problem statements with our advanced AI-powered Problem Engine.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Live
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Real-Time Collaboration
                  </h3>
                  <p className="text-gray-600">
                    Leverage your problem statement into an actionable solution statement ready for legislative drafting or policy advocacy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      Planned
                    </span>
                    <span className="text-gray-500 text-sm">Q3 2024</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Advanced Testing Suite
                  </h3>
                  <p className="text-gray-600">
                    Automated testing framework with AI-driven test generation and coverage analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      Planned
                    </span>
                    <span className="text-gray-500 text-sm">Q4 2024</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Enterprise Security Features
                  </h3>
                  <p className="text-gray-600">
                    Advanced security controls, audit logging, and compliance reporting for enterprise teams.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Have a feature in mind?
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're always looking to improve. Share your ideas and help shape our roadmap.
            </p>
            <Button variant="outline" className="border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium">
              Submit Feature Request
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
