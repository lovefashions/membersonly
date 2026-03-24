import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header.jsx';

const PasswordResetPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { confirmPasswordReset } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(token, formData.password, formData.confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. The link may be expired or invalid.');
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
        <title>Create New Password | Apple Jucy</title>
        <meta name="description" content="Create a new password for your Apple Jucy account." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="flex-grow flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-md">
            <Card className="bg-card border-border/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="text-center pt-10 pb-6">
                <CardTitle className="text-3xl font-light tracking-tight text-foreground mb-2">
                  Secure Account
                </CardTitle>
                <CardDescription className="text-foreground/60 font-light text-base">
                  Establish your new credentials
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                {success && (
                  <Alert className="mb-6 bg-green-50/50 border-green-200 text-green-800 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>Password secured. Redirecting to sign in...</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-6 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!success && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground/80 font-medium">New Password</Label>
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
                      <p className="text-xs text-foreground/50 font-light mt-1">Must be at least 8 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground/80 font-medium">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
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
                      {loading ? 'Securing...' : 'Update Password'}
                    </Button>
                  </form>
                )}

                <div className="mt-8 text-center">
                  <Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    Return to Sign In
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordResetPage;