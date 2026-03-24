import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Helmet>
        <title>Sign In | Apple Jucy</title>
        <meta name="description" content="Sign in to your Apple Jucy account to access premium content." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="flex-grow flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-md">
            <Card className="bg-card border-border/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="text-center pt-10 pb-6">
                <CardTitle className="text-3xl font-light tracking-tight text-foreground mb-2">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-foreground/60 font-light text-base">
                  Sign in to access your exclusive membership
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                {error && (
                  <Alert variant="destructive" className="mb-6 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80 font-medium">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-background border-border focus-visible:ring-primary rounded-lg h-12"
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        Forgot Password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-background border-border focus-visible:ring-primary rounded-lg h-12"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base mt-4"
                    disabled={loading}
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-foreground/60 font-light">
                    Not a member yet?{' '}
                    <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Apply for Membership
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

export default LoginPage;