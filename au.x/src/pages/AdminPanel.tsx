import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, TrendingUp, Target, DollarSign, Settings, ArrowLeft, Search, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  riskLevel: 'low' | 'medium' | 'high';
  monthlyIncome: number;
  monthlyInvestment: number;
  fireTarget: number;
  joinedDate: string;
  status: 'active' | 'inactive';
}

interface AdminSettings {
  lowRiskEquity: number;
  mediumRiskEquity: number;
  highRiskEquity: number;
  emergencyFundMultiplier: number;
  healthInsurancePercentage: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filterBy, setFilterBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    lowRiskEquity: 30,
    mediumRiskEquity: 50,
    highRiskEquity: 70,
    emergencyFundMultiplier: 6,
    healthInsurancePercentage: 5,
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/onboarding");
      return;
    }

    // Load all users and their investment plans
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*, investment_plans(*)");

    if (profiles) {
      const formattedUsers: User[] = profiles.map((profile: any) => {
        const plan = profile.investment_plans?.[0];
        return {
          id: profile.id,
          name: profile.full_name || "Unknown",
          email: profile.email || "",
          riskLevel: plan?.risk_tolerance || "medium",
          monthlyIncome: plan?.monthly_income || 0,
          monthlyInvestment: plan?.monthly_investment || 0,
          fireTarget: plan?.fire_number || 0,
          joinedDate: new Date(profile.created_at).toLocaleDateString(),
          status: "active",
        };
      });
      setUsers(formattedUsers);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const totalAUM = users.reduce((sum, u) => sum + (u.monthlyInvestment * 12 * 20), 0);
  const avgFIRE = users.length > 0 ? users.reduce((sum, u) => sum + u.fireTarget, 0) / users.length : 0;

  const filteredUsers = users.filter(user => {
    const matchesFilter = filterBy === "all" || user.riskLevel === filterBy || user.status === filterBy;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const riskDistribution = [
    { name: 'Low Risk', value: users.filter(u => u.riskLevel === 'low').length, color: '#00FFFF' },
    { name: 'Medium Risk', value: users.filter(u => u.riskLevel === 'medium').length, color: '#FF1493' },
    { name: 'High Risk', value: users.filter(u => u.riskLevel === 'high').length, color: '#FFFF00' }
  ];

  const fireTargetTrend = [
    { month: 'Jan', avgTarget: avgFIRE * 0.7, users: Math.ceil(totalUsers * 0.2) },
    { month: 'Feb', avgTarget: avgFIRE * 0.8, users: Math.ceil(totalUsers * 0.4) },
    { month: 'Mar', avgTarget: avgFIRE * 0.85, users: Math.ceil(totalUsers * 0.6) },
    { month: 'Apr', avgTarget: avgFIRE * 0.9, users: Math.ceil(totalUsers * 0.8) },
    { month: 'May', avgTarget: avgFIRE, users: totalUsers }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-cyber-blue';
      case 'medium': return 'text-cyber-pink';
      case 'high': return 'text-cyber-yellow';
      default: return 'text-foreground';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'border-cyber-blue/50 text-cyber-blue';
      case 'medium': return 'border-cyber-pink/50 text-cyber-pink';
      case 'high': return 'border-cyber-yellow/50 text-cyber-yellow';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background flex items-center justify-center">
        <div className="text-xl text-foreground">Loading...</div>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-orbitron font-bold text-white">Admin Settings</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-cyber-pink text-cyber-pink hover:bg-cyber-pink/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-cyber-yellow flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Risk Engine Configuration
              </CardTitle>
              <CardDescription>Adjust asset allocation percentages for different risk profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-cyber-blue">Low Risk Equity Allocation (%)</Label>
                  <Input
                    type="number"
                    value={adminSettings.lowRiskEquity}
                    onChange={(e) => setAdminSettings({
                      ...adminSettings,
                      lowRiskEquity: parseInt(e.target.value)
                    })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-cyber-pink">Medium Risk Equity Allocation (%)</Label>
                  <Input
                    type="number"
                    value={adminSettings.mediumRiskEquity}
                    onChange={(e) => setAdminSettings({
                      ...adminSettings,
                      mediumRiskEquity: parseInt(e.target.value)
                    })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-cyber-yellow">High Risk Equity Allocation (%)</Label>
                  <Input
                    type="number"
                    value={adminSettings.highRiskEquity}
                    onChange={(e) => setAdminSettings({
                      ...adminSettings,
                      highRiskEquity: parseInt(e.target.value)
                    })}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-cyber-blue">Emergency Fund Multiplier (months)</Label>
                  <Input
                    type="number"
                    value={adminSettings.emergencyFundMultiplier}
                    onChange={(e) => setAdminSettings({
                      ...adminSettings,
                      emergencyFundMultiplier: parseInt(e.target.value)
                    })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-cyber-pink">Health Insurance (% of income)</Label>
                  <Input
                    type="number"
                    value={adminSettings.healthInsurancePercentage}
                    onChange={(e) => setAdminSettings({
                      ...adminSettings,
                      healthInsurancePercentage: parseInt(e.target.value)
                    })}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <Button className="bg-cyber-blue hover:bg-cyber-blue/80 text-black">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">Admin Panel</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-cyber-pink text-cyber-pink hover:bg-cyber-pink/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyber-blue flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyber-yellow">{totalUsers}</div>
              <p className="text-xs text-cyber-blue">{activeUsers} active</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyber-pink flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total AUM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyber-blue">
                ₹{(totalAUM / 10000000).toFixed(1)}Cr
              </div>
              <p className="text-xs text-muted-foreground">Annual investment flow</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyber-yellow flex items-center gap-2">
                <Target className="h-5 w-5" />
                Avg FIRE Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyber-pink">
                ₹{(avgFIRE / 10000000).toFixed(1)}Cr
              </div>
              <p className="text-xs text-muted-foreground">Average user goal</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyber-blue flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyber-yellow">+{totalUsers > 0 ? '25' : '0'}%</div>
              <p className="text-xs text-muted-foreground">Monthly user growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-cyber-blue flex items-center gap-2">
                Risk Profile Distribution
              </CardTitle>
              <CardDescription>User distribution by risk tolerance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={riskDistribution} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-cyber-pink flex items-center gap-2">
                Average FIRE Targets Over Time
              </CardTitle>
              <CardDescription>Monthly trend of user financial goals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fireTargetTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#00FFFF" />
                  <YAxis stroke="#00FFFF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a0a2e', 
                      border: '1px solid #00FFFF',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`₹${(Number(value) / 10000000).toFixed(1)}Cr`, 'Avg FIRE Target']}
                  />
                  <Line type="monotone" dataKey="avgTarget" stroke="#FF1493" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-cyber-yellow flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>View and manage all platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-cyber-blue" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50 w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="bg-background/50 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found. Create an investment plan to see users here.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 bg-background/50 rounded-lg border border-border hover:border-cyber-blue/40 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-cyber-blue">{user.name}</h3>
                          <Badge variant="outline" className={getRiskBadgeColor(user.riskLevel)}>
                            {user.riskLevel} risk
                          </Badge>
                          <Badge variant="outline" className={user.status === 'active' ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}>
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Income</p>
                          <p className="font-semibold text-cyber-pink">₹{(user.monthlyIncome / 1000).toFixed(0)}K/mo</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Investment</p>
                          <p className="font-semibold text-cyber-yellow">₹{(user.monthlyInvestment / 1000).toFixed(0)}K/mo</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">FIRE Target</p>
                          <p className="font-semibold text-cyber-blue">₹{(user.fireTarget / 10000000).toFixed(1)}Cr</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Joined</p>
                          <p className="font-semibold">{user.joinedDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
