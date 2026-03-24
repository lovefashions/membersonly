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
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

  return (
    <>
      <Helmet>
        <title>Apply for Membership | Apple Jucy</title>
        <meta name="description" content="Create your Apple Jucy account and unlock premium content." />
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
                    <Label htmlFor="name" className="text-foreground/80 font-medium">Full Name</Label>
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
                    <Label htmlFor="email" className="text-foreground/80 font-medium">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`bg-background border-border focus-visible:ring-primary rounded-lg h-12 ${errors.email ? 'border-destructive' : ''}`}
                      placeholder="name@example.com"
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
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
                    <Label htmlFor="confirmPassword" className="text-foreground/80 font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`bg-background border-border focus-visible:ring-primary rounded-lg h-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base mt-4"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Submit Application'}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-foreground/60 font-light">
                    Already a member?{' '}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
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