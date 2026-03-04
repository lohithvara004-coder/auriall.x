import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users,
  Target,
  Shield,
  PieChart,
  Activity,
  LogOut
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingData {
  investmentYears: number;
  monthlyInvestment: number;
  isStepUp: boolean;
  riskTolerance: string;
  monthlyIncome: number;
  maritalStatus: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OnboardingData>({
    investmentYears: 0,
    monthlyInvestment: 0,
    isStepUp: false,
    riskTolerance: "medium",
    monthlyIncome: 0,
    maritalStatus: "single",
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/onboarding");
      return;
    }

    setUserId(user.id);
    
    // Load existing investment plan if any
    const { data: existingPlan } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingPlan) {
      setData({
        investmentYears: existingPlan.investment_years,
        monthlyInvestment: Number(existingPlan.monthly_investment),
        isStepUp: existingPlan.is_step_up,
        riskTolerance: existingPlan.risk_tolerance,
        monthlyIncome: Number(existingPlan.monthly_income),
        maritalStatus: "single",
      });
      setShowResults(true);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const savePlan = async () => {
    if (!userId) return;

    const results = calculateResults();
    
    try {
      const { error } = await supabase
        .from("investment_plans")
        .upsert({
          user_id: userId,
          investment_years: data.investmentYears,
          monthly_investment: data.monthlyInvestment,
          is_step_up: data.isStepUp,
          risk_tolerance: data.riskTolerance,
          monthly_income: data.monthlyIncome,
          fire_number: results.fireNumber,
          emergency_fund: results.emergencyFund,
          health_insurance: results.healthInsurance,
          asset_allocation: getAssetAllocation(),
        });

      if (error) throw error;

      toast({
        title: "Plan Saved!",
        description: "Your investment plan has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Calculate FIRE number and recommendations
  const calculateResults = () => {
    const annualExpenses = data.monthlyIncome * 12 * 0.6;
    const fireNumber = annualExpenses * 25;
    const emergencyFund = data.monthlyIncome * 6;
    const healthInsurance = data.monthlyIncome < 50000 ? 5 : data.monthlyIncome < 100000 ? 10 : 15;
    
    return {
      fireNumber,
      emergencyFund,
      healthInsurance,
      allocation: getAssetAllocation()
    };
  };

  // Asset allocation based on risk tolerance
  const getAssetAllocation = () => {
    switch (data.riskTolerance) {
      case 'low':
        return [
          { name: 'Debt Instruments', value: 50, color: '#00FFFF' },
          { name: 'Large Cap Equity', value: 30, color: '#FF1493' },
          { name: 'Gold/Silver', value: 15, color: '#FFFF00' },
          { name: 'REITs', value: 5, color: '#9400D3' }
        ];
      case 'medium':
        return [
          { name: 'Large Cap Equity', value: 40, color: '#00FFFF' },
          { name: 'Mid Cap Equity', value: 20, color: '#FF1493' },
          { name: 'Foreign Stocks', value: 15, color: '#FFFF00' },
          { name: 'Debt Instruments', value: 15, color: '#9400D3' },
          { name: 'REITs', value: 7, color: '#00FF00' },
          { name: 'Gold/Silver', value: 3, color: '#FF4500' }
        ];
      case 'high':
        return [
          { name: 'Mid Cap Equity', value: 35, color: '#00FFFF' },
          { name: 'Small Cap Equity', value: 25, color: '#FF1493' },
          { name: 'Foreign Stocks', value: 20, color: '#FFFF00' },
          { name: 'Large Cap Equity', value: 10, color: '#9400D3' },
          { name: 'REITs', value: 7, color: '#00FF00' },
          { name: 'Gold/Silver', value: 3, color: '#FF4500' }
        ];
      default:
        return [];
    }
  };

  // Growth projection data
  const getGrowthData = () => {
    const rate = data.riskTolerance === 'low' ? 0.08 : data.riskTolerance === 'medium' ? 0.12 : 0.15;
    
    const projectionData = [];
    let totalInvested = 0;
    let currentValue = 0;
    
    for (let year = 1; year <= data.investmentYears; year++) {
      const yearlyInvestment = data.monthlyInvestment * 12 * (data.isStepUp ? Math.pow(1.1, year - 1) : 1);
      totalInvested += yearlyInvestment;
      currentValue = totalInvested * Math.pow(1 + rate, year);
      
      const stcg = currentValue * 0.02;
      const ltcg = year > 1 ? currentValue * 0.05 : 0;
      
      projectionData.push({
        year: new Date().getFullYear() + year,
        value: Math.round(currentValue),
        invested: Math.round(totalInvested),
        stcg: Math.round(stcg),
        ltcg: Math.round(ltcg)
      });
    }
    
    return projectionData;
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await savePlan();
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return data.investmentYears > 0;
      case 2: return data.monthlyInvestment > 0;
      case 3: return data.riskTolerance !== "";
      case 4: return data.monthlyIncome > 0;
      default: return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background flex items-center justify-center">
        <div className="text-xl text-foreground">Loading...</div>
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();
    const allocation = getAssetAllocation();
    const growthData = getGrowthData();

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-orbitron font-bold">
              <span className="text-white">Your Investment Plan</span>
            </h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-cyber-pink text-cyber-pink hover:bg-cyber-pink/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyber-blue flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  FIRE Number
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyber-yellow">
                  ₹{(results.fireNumber / 10000000).toFixed(1)}Cr
                </div>
                <p className="text-xs text-muted-foreground">Financial Independence Target</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyber-pink flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Emergency Fund
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyber-blue">
                  ₹{(results.emergencyFund / 100000).toFixed(1)}L
                </div>
                <p className="text-xs text-muted-foreground">6 months expenses</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyber-yellow flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyber-pink">
                  ₹{results.healthInsurance}L
                </div>
                <p className="text-xs text-muted-foreground">Recommended coverage</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyber-blue flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyber-yellow capitalize">
                  {data.riskTolerance}
                </div>
                <Badge variant="outline" className="text-cyber-pink border-cyber-pink/50">
                  {data.riskTolerance === 'low' ? '1/3' : data.riskTolerance === 'medium' ? '2/3' : '3/3'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Asset Allocation */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-cyber-blue flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Asset Allocation
                </CardTitle>
                <CardDescription>Diversified portfolio based on your risk profile</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie 
                      data={allocation} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {allocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Projection */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-cyber-pink flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Growth
                </CardTitle>
                <CardDescription>Projected wealth over {data.investmentYears} years</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="year" stroke="#00FFFF" />
                    <YAxis stroke="#00FFFF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a0a2e', 
                        border: '1px solid #00FFFF',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#FF1493" strokeWidth={3} name="Portfolio Value" />
                    <Line type="monotone" dataKey="invested" stroke="#FFFF00" strokeWidth={2} name="Total Invested" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Capital Gains Summary */}
          <Card className="bg-card/50 border-border mb-8">
            <CardHeader>
              <CardTitle className="text-cyber-yellow">Capital Gains Analysis</CardTitle>
              <CardDescription>Tax implications of your investment strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-cyber-blue/10 rounded-lg border border-cyber-blue/30">
                  <h4 className="font-semibold text-cyber-blue mb-2">Short Term Capital Gains (STCG)</h4>
                  <p className="text-2xl font-bold text-cyber-pink">₹{(growthData[growthData.length - 1]?.stcg / 100000).toFixed(1)}L</p>
                  <p className="text-sm text-muted-foreground">Taxed at 15% for equity</p>
                </div>
                <div className="p-4 bg-cyber-pink/10 rounded-lg border border-cyber-pink/30">
                  <h4 className="font-semibold text-cyber-pink mb-2">Long Term Capital Gains (LTCG)</h4>
                  <p className="text-2xl font-bold text-cyber-yellow">₹{(growthData[growthData.length - 1]?.ltcg / 100000).toFixed(1)}L</p>
                  <p className="text-sm text-muted-foreground">10% above ₹1L for equity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowResults(false)}
              className="border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20"
            >
              Edit Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding questionnaire
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-cyber-blue mx-auto mb-4" />
              <h2 className="text-2xl font-orbitron font-bold text-cyber-blue">Investment Timeline</h2>
              <p className="text-foreground/70">How many years do you want to invest?</p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="years">Investment Period (Years)</Label>
              <Input
                id="years"
                type="number"
                min="1"
                max="50"
                value={data.investmentYears || ""}
                onChange={(e) => setData({...data, investmentYears: parseInt(e.target.value) || 0})}
                placeholder="Enter number of years (e.g., 20)"
                className="bg-background/50"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="h-12 w-12 text-cyber-pink mx-auto mb-4" />
              <h2 className="text-2xl font-orbitron font-bold text-cyber-pink">Monthly Investment</h2>
              <p className="text-foreground/70">How much can you invest every month?</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Monthly Investment Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="25000"
                  value={data.monthlyInvestment || ""}
                  onChange={(e) => setData({...data, monthlyInvestment: parseFloat(e.target.value) || 0})}
                  className="bg-background/50"
                />
              </div>
              <div>
                <Label>Investment Type</Label>
                <RadioGroup 
                  value={data.isStepUp ? "stepup" : "constant"} 
                  onValueChange={(value) => setData({...data, isStepUp: value === "stepup"})}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="constant" id="constant" />
                    <Label htmlFor="constant">Constant Amount (Same amount every month)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stepup" id="stepup" />
                    <Label htmlFor="stepup">Step-up SIP (Increase annually by 10%)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <TrendingUp className="h-12 w-12 text-cyber-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-orbitron font-bold text-cyber-yellow">Risk Tolerance</h2>
              <p className="text-foreground/70">What's your comfort level with investment risk?</p>
            </div>
            <RadioGroup 
              value={data.riskTolerance} 
              onValueChange={(value) => setData({...data, riskTolerance: value})}
              className="space-y-4"
            >
              <Card className="p-4 hover:border-primary cursor-pointer transition-colors">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <div>
                    <Label htmlFor="low" className="font-semibold cursor-pointer">Low Risk (1/3)</Label>
                    <p className="text-sm text-muted-foreground">Conservative investor, prefer stable returns</p>
                    <p className="text-xs text-accent">Expected: 8-10% returns</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 hover:border-primary cursor-pointer transition-colors">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <div>
                    <Label htmlFor="medium" className="font-semibold cursor-pointer">Medium Risk (2/3)</Label>
                    <p className="text-sm text-muted-foreground">Balanced approach, moderate risk for better returns</p>
                    <p className="text-xs text-accent">Expected: 10-12% returns</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 hover:border-primary cursor-pointer transition-colors">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <div>
                    <Label htmlFor="high" className="font-semibold cursor-pointer">High Risk (3/3)</Label>
                    <p className="text-sm text-muted-foreground">Aggressive investor, can handle volatility</p>
                    <p className="text-xs text-accent">Expected: 12-15% returns</p>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="h-12 w-12 text-cyber-blue mx-auto mb-4" />
              <h2 className="text-2xl font-orbitron font-bold text-cyber-blue">Income Details</h2>
              <p className="text-foreground/70">Tell us about your monthly income</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Marital Status</Label>
                <RadioGroup 
                  value={data.maritalStatus} 
                  onValueChange={(value) => setData({...data, maritalStatus: value})}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="married" id="married" />
                    <Label htmlFor="married">Married (Combined family income)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="income">Monthly Income (₹)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="100000"
                  value={data.monthlyIncome || ""}
                  onChange={(e) => setData({...data, monthlyIncome: parseFloat(e.target.value) || 0})}
                  className="bg-background/50"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-orbitron font-bold">
            <span className="text-white">Aurial</span>
            <span className="text-red-500 font-black">.X</span>
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-cyber-pink text-cyber-pink hover:bg-cyber-pink/20"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl">Let's Build Your Investment Plan</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <CardDescription>
              We'll create a personalized investment strategy based on your goals
            </CardDescription>
          </CardHeader>
          
          <CardContent className="min-h-[400px]">
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2 bg-cyber-blue hover:bg-cyber-blue/80 text-black"
              >
                {currentStep === totalSteps ? "Create Plan" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
