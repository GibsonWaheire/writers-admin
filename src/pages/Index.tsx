import { useState } from 'react';
import { Button } from '../components/ui/button';
import { SignInModal, SignUpModal } from '../components/AuthModals';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  Star, 
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

const Index = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openSignIn = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const openSignUp = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  const closeSignIn = () => setShowSignIn(false);
  const closeSignUp = () => setShowSignUp(false);

  const switchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const switchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const features = [
    {
      icon: FileText,
      title: "Assignment Management",
      description: "Organize and track writing assignments from multiple clients efficiently."
    },
    {
      icon: TrendingUp,
      title: "Payment Tracking",
      description: "Monitor your earnings and payment history in one centralized location."
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data and payments are protected with secure, reliable systems."
    },
    {
      icon: Clock,
      title: "Deadline Management",
      description: "Keep track of project deadlines and manage your writing schedule."
    },
    {
      icon: Star,
      title: "Performance Insights",
      description: "Gain insights into your writing productivity and client feedback."
    },
    {
      icon: Users,
      title: "Client Communication",
      description: "Manage client relationships and project communications effectively."
    }
  ];

  const benefits = [
    "Simple and intuitive interface",
    "Centralized assignment tracking",
    "Easy payment monitoring",
    "Deadline management tools",
    "Performance analytics",
    "Secure data handling"
  ];

  const stats = [
    { number: "10+", label: "Active Writers" },
    { number: "100+", label: "Completed Orders" },
    { number: "4.8", label: "Average Rating" },
    { number: "$50K+", label: "Total Payments" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">DealFlow</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">How It Works</a>
                <a href="#benefits" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Benefits</a>
                <a href="#contact" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                onClick={openSignIn}
                variant="ghost"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={openSignUp}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">How It Works</a>
              <a href="#benefits" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">Benefits</a>
              <a href="#contact" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">Contact</a>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <Button 
                  onClick={openSignIn}
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={openSignUp}
                  className="w-full justify-start mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Manage Your Writing
            <span className="text-blue-600 block">Assignments</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            An great platform to manage writing assignments, 
            track payments, and monitor performance. Join the site to start 
            organizing your writing work efficiently.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={openSignUp}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join as Writer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={openSignIn}
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              Sign In to Your Account
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools and resources to organize your writing work effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="inline-flex p-4 bg-blue-100 rounded-full mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Your Profile</h3>
              <p className="text-gray-600">Sign up and complete your writer profile with your expertise and experience.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Browse & Claim Orders</h3>
              <p className="text-gray-600">Find writing assignments that match your skills and claim them to start working.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete & Get Paid</h3>
              <p className="text-gray-600">Submit your work, receive client feedback, and get paid for your completed assignments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Use DealFlow?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, effective way to manage your writing work
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">
                Join the platform to start managing your writing assignments, 
                tracking your progress, and organizing your work efficiently.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={openSignUp}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sign Up Now
                </Button>
                <Button 
                  onClick={openSignIn}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Managing Your Writing Work
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the platform to organize your assignments, track your progress, 
            and manage your writing projects effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={openSignUp}
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={openSignIn}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DealFlow</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                A platform for managing writing assignments, tracking payments, 
                and organizing writing work efficiently.
              </p>
              <div className="flex space-x-4">
                <Button 
                  onClick={openSignUp}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Join as Writer
                </Button>
                <Button 
                  onClick={openSignIn}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Sign In
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DealFlow. All rights reserved. A writing management platform.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modals */}
      <SignInModal 
        isOpen={showSignIn} 
        onClose={closeSignIn} 
        onSwitchToSignUp={switchToSignUp}
      />
      
      <SignUpModal 
        isOpen={showSignUp} 
        onClose={closeSignUp} 
        onSwitchToSignIn={switchToSignIn}
      />
    </div>
  );
};

export default Index;
