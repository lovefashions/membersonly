import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header.jsx';

const SignupPage = () => {
  const { signup, googleAuth } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = formData.email.trim();

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // Clear previous errors before retrying

    const trimmedEmail = formData.email.trim();
    const trimmedName = formData.name.trim();

    try {
      await signup(trimmedEmail, formData.password, trimmedName);
      setSuccess(true);
      // Reset form fields after successful signup
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Signup error:', error);

      // Extract PocketBase specific error messages
      const emailErrorObj = error.response?.data?.email || error.response?.data?.data?.email;
      const emailErrorMsg = emailErrorObj?.message || '';
      const genericErrorMsg = error.message || '';

      // Check if the error is related to a duplicate email
      const isDuplicate =
        emailErrorMsg.toLowerCase().includes('unique') ||
        emailErrorMsg.toLowerCase().includes('already in use') ||
        genericErrorMsg.toLowerCase().includes('unique') ||
        genericErrorMsg.toLowerCase().includes('already exists');

      if (isDuplicate) {
        setErrors({ email: 'This email is already registered' });
      } else if (emailErrorMsg) {
        setErrors({ email: emailErrorMsg });
      } else {
        setErrors({ submit: genericErrorMsg || 'Failed to create account. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setErrors({});

    try {
      await googleAuth();
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Google signup error:', err);
      setErrors({ submit: 'Google sign-up failed. Please try again.' });
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Apply for Membership | Apple Jucy</title>
        <meta
          name="description"
          content="Create your Apple Jucy account and unlock premium content."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="flex-grow flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-md">
            <Card className="bg-card border-border/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="text-center pt-10 pb-6">
                <CardTitle className="text-3xl font-light tracking-tight text-foreground mb-2">
                  Join the Club
                </CardTitle>
                <CardDescription className="text-foreground/60 font-light text-base">
                  Apply for your exclusive membership
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                {success && (
                  <Alert className="mb-6 bg-green-50/50 border-green-200 text-green-800 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>Application successful. Redirecting...</AlertDescription>
                  </Alert>
                )}

                {errors.submit && (
                  <Alert variant="destructive" className="mb-6 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground/80 font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`bg-background border-border focus-visible:ring-primary rounded-lg h-12 ${errors.name ? 'border-destructive' : ''}`}
                      placeholder="Jane Doe"
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`bg-background border-border focus-visible:ring-primary rounded-lg h-12 ${errors.email ? 'border-destructive' : ''}`}
                      placeholder="name@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground/80 font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`bg-background border-border focus-visible:ring-primary rounded-lg h-12 ${errors.password ? 'border-destructive' : ''}`}
                      placeholder="••••••••"
                    />
                    {errors.password ? (
                      <p className="text-xs text-destructive mt-1">{errors.password}</p>
                    ) : (
                      <p className="text-xs text-foreground/50 font-light mt-1">
                        8+ characters, uppercase, lowercase, and number
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground/80 font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`bg-background border-border focus-visible:ring-primary rounded-lg h-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base mt-4"
                    disabled={loading || googleLoading}
                  >
                    {loading ? 'Processing...' : 'Submit Application'}
                  </Button>
                </form>

                <div className="relative mt-8 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-card text-foreground/50 font-light">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={googleLoading || loading}
                  className="w-full rounded-full h-12 bg-background hover:bg-background/80 border border-border text-foreground text-base font-medium transition-colors"
                >
                  {googleLoading ? (
                    'Connecting to Google...'
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign up with Google
                    </div>
                  )}
                </Button>

                <div className="mt-8 text-center">
                  <p className="text-sm text-foreground/60 font-light">
                    Already a member?{' '}
                    <Link
                      to="/login"
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
