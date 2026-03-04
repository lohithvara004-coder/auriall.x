
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Users, Zap, Target, Globe, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // User is already logged in, redirect to user dashboard
      navigate("/user-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darker text-foreground overflow-hidden relative">
      {/* Floating orbs */}
      <div className="floating-orb w-32 h-32 top-20 left-20 opacity-20" />
      <div className="floating-orb w-24 h-24 top-60 right-32 opacity-15" />
      <div className="floating-orb w-16 h-16 bottom-40 left-1/4 opacity-10" />
      
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-orbitron font-bold text-cyber-blue neon-glow">
            Aurial.X
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="hover:text-cyber-blue transition-colors">Home</a>
            <a href="#about" className="hover:text-cyber-pink transition-colors">About Us</a>
            <a href="#contact" className="hover:text-cyber-yellow transition-colors">Contact</a>
            <a href="#content" className="hover:text-cyber-blue transition-colors">Content</a>
            <Button 
              onClick={() => navigate('/user-dashboard')}
              className="cyber-button bg-cyber-pink hover:bg-cyber-pink/80 text-black"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-orbitron font-bold mb-8">
            <span className="text-white">Aurial</span>
            <span className="text-red-500 font-black">.X</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Step into the future of investment planning. Aurial.X combines cutting-edge AI with 
            personalized wealth strategies to accelerate your journey to financial independence.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              onClick={() => navigate('/user-dashboard')}
              size="lg"
              className="bg-cyber-blue hover:bg-cyber-blue/80 text-black text-lg px-8 py-4 flex items-center gap-3 transition-all duration-300 hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Button 
              onClick={() => navigate('/admin')}
              size="lg"
              variant="outline"
              className="border-cyber-pink text-cyber-pink hover:bg-cyber-pink/20 text-lg px-8 py-4 transition-all duration-300 hover:scale-105"
            >
              Admin Portal
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="cyber-card p-8 text-center hover:scale-105 transition-transform">
              <Target className="h-12 w-12 text-cyber-blue mx-auto mb-4 neon-glow" />
              <h3 className="text-xl font-orbitron font-bold text-cyber-blue mb-3">FIRE Calculator</h3>
              <p className="text-muted-foreground">
                Calculate your Financial Independence Retire Early number with precision
              </p>
            </div>
            
            <div className="cyber-card p-8 text-center hover:scale-105 transition-transform">
              <TrendingUp className="h-12 w-12 text-cyber-pink mx-auto mb-4 neon-glow" />
              <h3 className="text-xl font-orbitron font-bold text-cyber-pink mb-3">Smart Allocation</h3>
              <p className="text-muted-foreground">
                AI-powered asset allocation across equity, debt, REITs, and global markets
              </p>
            </div>
            
            <div className="cyber-card p-8 text-center hover:scale-105 transition-transform">
              <Shield className="h-12 w-12 text-cyber-yellow mx-auto mb-4 neon-glow" />
              <h3 className="text-xl font-orbitron font-bold text-cyber-yellow mb-3">Risk Profiling</h3>
              <p className="text-muted-foreground">
                Dynamic risk assessment based on age, income, and investment goals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 bg-cyber-dark/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-cyber-blue neon-glow mb-2">₹50Cr+</div>
              <div className="text-cyber-pink">Assets Under Management</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyber-pink neon-glow mb-2">10K+</div>
              <div className="text-cyber-blue">Active Investors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyber-yellow neon-glow mb-2">15%+</div>
              <div className="text-cyber-pink">Average Returns</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyber-blue neon-glow mb-2">24/7</div>
              <div className="text-cyber-yellow">AI Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-8 neon-glow">
            <span className="text-cyber-pink">Ready to</span>{" "}
            <span className="text-cyber-blue">Multiply</span>{" "}
            <span className="text-cyber-yellow">Your Wealth?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of investors already building their financial future with Aurial.X
          </p>
          
          <Button 
            onClick={() => navigate('/user-dashboard')}
            size="lg"
            className="cyber-button bg-gradient-to-r from-cyber-blue to-cyber-pink hover:from-cyber-pink hover:to-cyber-yellow text-black text-xl px-12 py-6 neon-glow"
          >
            Begin Investment Planning
            <Zap className="h-6 w-6 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-cyber-blue/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-orbitron font-bold text-cyber-blue neon-glow mb-4">
            Aurial.X
          </div>
          <p className="text-muted-foreground">
            Powered by AI. Secured by Blockchain. Built for the Future.
          </p>
          <div className="mt-4 text-sm text-cyber-pink">
            © 2024 Aurial.X. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
