import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type LegislativeIdea = Tables<"legislative_ideas">;
type ProblemStatement = Tables<"problem_statements">;

const Ideas = () => {
  const [ideas, setIdeas] = useState<LegislativeIdea[]>([]);
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: "",
    original_idea: "",
    category: "",
    problem_statement_id: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ideasResponse, problemsResponse] = await Promise.all([
        supabase
          .from("legislative_ideas")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("problem_statements")
          .select("*")
          .order("title", { ascending: true })
      ]);

      if (ideasResponse.error) throw ideasResponse.error;
      if (problemsResponse.error) throw problemsResponse.error;

      setIdeas(ideasResponse.data || []);
      setProblems(problemsResponse.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIdea = async () => {
    if (!newIdea.title || !newIdea.original_idea) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("legislative_ideas")
        .insert({
          ...newIdea,
          user_id: user.user.id,
          problem_statement_id: newIdea.problem_statement_id || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Legislative idea created successfully",
      });

      setNewIdea({ title: "", original_idea: "", category: "", problem_statement_id: "" });
      setShowNewForm(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create legislative idea",
        variant: "destructive",
      });
    }
  };

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.original_idea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container min-h-screen bg-gray-50 p-6">
        <div className="content-wrapper max-w-6xl mx-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
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
              <h1 className="text-3xl font-bold text-gray-900">Legislative Ideas</h1>
              <p className="text-gray-600 mt-2">Transform problems into actionable legislative solutions</p>
            </div>
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {showNewForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Create New Legislative Idea
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Idea title"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                />
                <Textarea
                  placeholder="Describe your legislative idea in detail..."
                  value={newIdea.original_idea}
                  onChange={(e) => setNewIdea({ ...newIdea, original_idea: e.target.value })}
                  rows={5}
                />
                <div className="flex space-x-4">
                  <Input
                    placeholder="Category (optional)"
                    value={newIdea.category}
                    onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                  />
                  <select
                    value={newIdea.problem_statement_id}
                    onChange={(e) => setNewIdea({ ...newIdea, problem_statement_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select related problem (optional)</option>
                    {problems.map((problem) => (
                      <option key={problem.id} value={problem.id}>
                        {problem.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateIdea}>Create Idea</Button>
                  <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {idea.title}
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
                    <Badge variant="secondary">
                      {idea.status || "draft"}
                    </Badge>
                    {idea.category && (
                      <Badge variant="outline">{idea.category}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-4 mb-4">
                    {idea.original_idea}
                  </p>
                  {idea.improved_idea && (
                    <div className="p-3 bg-green-50 rounded-lg mb-4">
                      <h4 className="font-medium text-green-800 mb-2">Improved Version:</h4>
                      <p className="text-green-700 text-sm line-clamp-3">
                        {idea.improved_idea}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Created {new Date(idea.created_at).toLocaleDateString()}</span>
                    <Button size="sm" variant="outline">
                      Generate Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredIdeas.length === 0 && !loading && (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No legislative ideas found.</p>
              <Button className="mt-4" onClick={() => setShowNewForm(true)}>
                Create your first idea
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ideas;