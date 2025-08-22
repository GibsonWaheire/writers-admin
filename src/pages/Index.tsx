import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { SignInModal, SignUpModal } from '../components/AuthModals';
import { FileText } from 'lucide-react';

const Index = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Writers Admin</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Manage writing assignments, payments, and reviews in one place.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={openSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            Sign In
          </Button>
          
          <Button 
            onClick={openSignUp}
            variant="outline"
            className="w-full border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 py-3 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            Sign Up
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
      
        </div>
      </div>

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
