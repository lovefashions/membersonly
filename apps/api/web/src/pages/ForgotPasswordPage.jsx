import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header.jsx';

const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please verify your address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | Apple Jucy</title>
        <meta name="description" content="Reset your Apple Jucy account password." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="flex-grow flex items-center justify-center px-6 py-24">
          <div className="w-full max-w-md">
            <Card className="bg-card border-border/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="text-center pt-10 pb-6">
                <CardTitle className="text-3xl font-light tracking-tight text-foreground mb-2">
                  Recover Access
                </CardTitle>
                <CardDescription className="text-foreground/60 font-light text-base">
                  Enter your email to receive a secure reset link
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                {success && (
                  <Alert className="mb-6 bg-green-50/50 border-green-200 text-green-800 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Reset link dispatched. Please check your inbox.
                    </AlertDescription>
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
                      <Label htmlFor="email" className="text-foreground/80 font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background border-border focus-visible:ring-primary rounded-lg h-12"
                        placeholder="name@example.com"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base mt-4"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Send Reset Link'}
                    </Button>
                  </form>
                )}

                <div className="mt-8 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:text-primary/80 font-medium inline-flex items-center transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
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

export default ForgotPasswordPage;
