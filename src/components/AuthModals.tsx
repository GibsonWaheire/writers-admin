import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Shield,
  CheckCircle
} from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Load saved credentials on component mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('dealflow_email');
    const savedPassword = localStorage.getItem('dealflow_password');
    const savedRememberMe = localStorage.getItem('dealflow_remember') === 'true';
    
    if (savedRememberMe && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    
    if (result.success && result.user) {
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('dealflow_email', email);
        localStorage.setItem('dealflow_password', password);
        localStorage.setItem('dealflow_remember', 'true');
      } else {
        // Clear saved credentials if remember me is unchecked
        localStorage.removeItem('dealflow_email');
        localStorage.removeItem('dealflow_password');
        localStorage.removeItem('dealflow_remember');
      }
      
      onClose();
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/writer');
      }
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sign In" size="lg">
      <div className="min-h-[400px]">
        {/* Form Content */}
        <div className="px-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 px-4 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-8 w-8 hover:bg-gray-100 rounded-md"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 font-medium">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="text-center pt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to DealFlow?</span>
                </div>
              </div>
              <Button
                type="button"
                onClick={onSwitchToSignUp}
                variant="ghost"
                className="mt-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium transition-colors"
              >
                Create an account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}

export function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const result = await signup(name, email, password);
    
    if (result.success && result.user) {
      onClose();
      // Check if user needs to complete application
      if (result.requiresApplication) {
        navigate('/writer/application');
      } else {
        navigate('/writer');
      }
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="lg">
      <div className="min-h-[600px]">
        {/* Header with Background */}
        <div className="relative -m-6 mb-8 p-8 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white rounded-t-lg">
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg"></div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4 backdrop-blur-sm">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Join DealFlow</h2>
            <p className="text-green-100 text-sm">Start managing your writing assignments today</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-green-600" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="h-12 px-4 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="h-12 px-4 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="h-12 px-4 pr-12 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-8 w-8 hover:bg-gray-100 rounded-md"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="h-12 px-4 pr-12 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-8 w-8 hover:bg-gray-100 rounded-md"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">By signing up, you'll be registered as a <strong>Writer</strong>.</p>
                  <p className="text-xs mt-1 text-green-700">Admin roles are assigned manually by administrators.</p>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            
            <div className="text-center pt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>
              <Button
                type="button"
                onClick={onSwitchToSignIn}
                variant="ghost"
                className="mt-3 text-green-600 hover:text-green-800 hover:bg-green-50 font-medium transition-colors"
              >
                Sign in instead
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
