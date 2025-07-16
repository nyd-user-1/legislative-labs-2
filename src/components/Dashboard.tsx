
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Users, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills">;
type Member = Tables<"People">;
type Committee = Tables<"Committees">;

export const Dashboard = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent bills
      const { data: billsData, error: billsError } = await supabase
        .from('Bills')
        .select('*')
        .order('status_date', { ascending: false })
        .limit(10);

      if (billsError) throw billsError;

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('People')
        .select('*')
        .limit(10);

      if (membersError) throw membersError;

      // Fetch committees
      const { data: committeesData, error: committeesError } = await supabase
        .from('Committees')
        .select('*')
        .limit(10);

      if (committeesError) throw committeesError;

      setBills(billsData || []);
      setMembers(membersData || []);
      setCommittees(committeesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => 
    bill.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = members.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.party?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCommittees = committees.filter(committee => 
    committee.committee_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of New York State legislative data
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bills, members, committees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bills.length}</div>
              <p className="text-xs text-muted-foreground">Recent legislation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">Legislators</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Committees</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{committees.length}</div>
              <p className="text-xs text-muted-foreground">Active committees</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="bills" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="committees">Committees</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>Latest legislative proposals</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading bills...</div>
                ) : filteredBills.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No bills found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredBills.slice(0, 5).map((bill) => (
                      <div key={bill.bill_id} className="border-b pb-4 last:border-b-0">
                        <h4 className="font-medium">{bill.bill_number}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{bill.title}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">{bill.status_desc}</span>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Legislators</CardTitle>
                <CardDescription>New York State Assembly and Senate members</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading members...</div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No members found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredMembers.slice(0, 5).map((member) => (
                      <div key={member.people_id} className="border-b pb-4 last:border-b-0">
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {member.party} • {member.chamber} • District {member.district}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">{member.role}</span>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="committees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Committees</CardTitle>
                <CardDescription>Legislative committees and their activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading committees...</div>
                ) : filteredCommittees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No committees found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredCommittees.slice(0, 5).map((committee) => (
                      <div key={committee.committee_id} className="border-b pb-4 last:border-b-0">
                        <h4 className="font-medium">{committee.committee_name}</h4>
                        <p className="text-sm text-muted-foreground">{committee.chamber}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            Chair: {committee.chair_name}
                          </span>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
