import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  PieChart, 
  Target, 
  Shield, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Home,
  Coins,
  Globe
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from "recharts";

const Dashboard = () => {
  // Sample user data - in real app this would come from API/database
  const [userData] = useState({
    name: "John Doe",
    investmentYears: 15,
    monthlyInvestment: 25000,
    sipType: "step-up",
    riskTolerance: "medium",
    monthlyIncome: 150000,
    isMarried: true,
    age: 32
  });

  // Calculate FIRE number (25x annual expenses, assuming 60% of income as expenses)
  const annualExpenses = userData.monthlyIncome * 12 * 0.6;
  const fireNumber = annualExpenses * 25;

  // Asset allocation based on age and risk tolerance
  const assetAllocation = {
    equity: 65,
    debt: 20,
    reits: 8,
    gold: 7
  };

  // Sample projection data
  const projectionData = [
    { year: 2024, value: 300000, stcg: 0, ltcg: 0 },
    { year: 2025, value: 650000, stcg: 15000, ltcg: 0 },
    { year: 2026, value: 1200000, stcg: 25000, ltcg: 35000 },
    { year: 2027, value: 1850000, stcg: 30000, ltcg: 85000 },
    { year: 2028, value: 2650000, stcg: 35000, ltcg: 145000 },
    { year: 2029, value: 3600000, stcg: 40000, ltcg: 220000 },
    { year: 2030, value: 4750000, stcg: 45000, ltcg: 315000 },
  ];

  const pieData = [
    { name: 'Indian Equity', value: assetAllocation.equity, color: '#3B82F6' },
    { name: 'Debt', value: assetAllocation.debt, color: '#10B981' },
    { name: 'REITs', value: assetAllocation.reits, color: '#F59E0B' },
    { name: 'Gold/Silver', value: assetAllocation.gold, color: '#EF4444' },
  ];

  const currentPortfolioValue = 1850000;
  const fireProgress = (currentPortfolioValue / fireNumber) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Welcome back, {userData.name}!</h1>
            <p className="text-muted-foreground">Your wealth building journey continues</p>
          </div>
          <Button className="financial-gradient text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Monthly Report
          </Button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="wealth-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FIRE Number</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{(fireNumber / 10000000).toFixed(1)}Cr</div>
              <Progress value={fireProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{fireProgress.toFixed(1)}% achieved</p>
            </CardContent>
          </Card>

          <Card className="wealth-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Portfolio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">₹{(currentPortfolioValue / 100000).toFixed(1)}L</div>
              <p className="text-xs text-financial-success">+12.5% this year</p>
            </CardContent>
          </Card>

          <Card className="wealth-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly SIP</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{(userData.monthlyInvestment / 1000).toFixed(0)}K</div>
              <Badge variant="secondary" className="mt-1">Step-up SIP</Badge>
            </CardContent>
          </Card>

          <Card className="wealth-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent capitalize">{userData.riskTolerance}</div>
              <p className="text-xs text-muted-foreground">Balanced approach</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Wealth Growth Projection</CardTitle>
              <CardDescription>Your investment journey over {userData.investmentYears} years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${(Number(value) / 100000).toFixed(1)}L`, 'Portfolio Value']} />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Diversified portfolio based on your risk profile</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tax Implications */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Implications & Capital Gains</CardTitle>
            <CardDescription>Understanding your tax efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-primary">Short Term Capital Gains (STCG)</p>
                    <p className="text-sm text-muted-foreground">Taxed at 15% for equity, 30% for debt</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₹35K</p>
                    <p className="text-sm text-muted-foreground">This year</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-accent">Long Term Capital Gains (LTCG)</p>
                    <p className="text-sm text-muted-foreground">10% above ₹1L for equity, 20% for debt</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">₹85K</p>
                    <p className="text-sm text-muted-foreground">This year</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Tax Saving Tips</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Hold equity investments for {'>'}1 year for LTCG benefits</li>
                    <li>• Use ELSS funds for 80C deduction</li>
                    <li>• Consider tax-free bonds for debt allocation</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Emergency Fund & Insurance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Emergency Fund Target</p>
                  <p className="text-sm text-muted-foreground">6 months of expenses</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-accent">₹5.4L</p>
                  <Badge variant="outline" className="text-financial-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Achieved
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Health Insurance</p>
                  <p className="text-sm text-muted-foreground">Family floater recommended</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">₹15L</p>
                  <Badge variant="outline" className="text-financial-warning">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Upgrade needed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-accent" />
                Investment Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Large Cap Equity</span>
                  </div>
                  <span className="font-semibold">40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Global Stocks</span>
                  </div>
                  <span className="font-semibold">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">REITs</span>
                  </div>
                  <span className="font-semibold">8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Gold/Silver</span>
                  </div>
                  <span className="font-semibold">7%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" size="lg">
            Edit Investment Plan
          </Button>
          <Button variant="outline" size="lg">
            Run What-if Scenario
          </Button>
          <Button className="financial-gradient text-white" size="lg">
            View Detailed Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
