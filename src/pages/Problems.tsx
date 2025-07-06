import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type ProblemStatement = Tables<"problem_statements">;

const Problems = () => {
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProblem, setNewProblem] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from("problem_statements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch problem statements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async () => {
    if (!newProblem.title || !newProblem.description) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("problem_statements")
        .insert({
          ...newProblem,
          user_id: user.user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Problem statement created successfully",
      });

      setNewProblem({ title: "", description: "", category: "", priority: "medium" });
      setShowNewForm(false);
      fetchProblems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create problem statement",
        variant: "destructive",
      });
    }
  };

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <div className="page-container min-h-screen bg-gray-50 p-6">
        <div className="content-wrapper max-w-6xl mx-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen bg-gray-50 p-6">
      <div className="content-wrapper max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Problem Statements</h1>
            </div>
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Problem
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {showNewForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Problem Statement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Problem title"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                />
                <Textarea
                  placeholder="Describe the problem in detail..."
                  value={newProblem.description}
                  onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                  rows={4}
                />
                <div className="flex space-x-4">
                  <Input
                    placeholder="Category (optional)"
                    value={newProblem.category}
                    onChange={(e) => setNewProblem({ ...newProblem, category: e.target.value })}
                  />
                  <select
                    value={newProblem.priority}
                    onChange={(e) => setNewProblem({ ...newProblem, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateProblem}>Create Problem</Button>
                  <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem) => (
              <Card key={problem.id} className="card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {problem.title}
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(problem.priority || "medium")}>
                      {problem.priority}
                    </Badge>
                    {problem.category && (
                      <Badge variant="outline">{problem.category}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-4">
                    {problem.description}
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    Created {new Date(problem.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProblems.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No problem statements found.</p>
              <Button className="mt-4" onClick={() => setShowNewForm(true)}>
                Create your first problem statement
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Problems;