import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, User, Lock, Mail } from 'lucide-react';
import Header from '@/components/Header.jsx';

const AccountPage = () => {
  const { currentUser, updateEmail, updatePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await pb
          .collection('profiles')
          .getFirstListItem(`user_id="${currentUser.id}"`, { $autoCancel: false });
        setProfile(userProfile);
        setEmailForm({ email: currentUser.email });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError('');
    setEmailSuccess(false);

    try {
      await updateEmail(emailForm.email);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (error) {
      setEmailError(error.message || 'Failed to update email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    try {
      await updatePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordSuccess(true);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password. Check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Account Settings | Apple Jucy</title>
        <meta
          name="description"
          content="Manage your Apple Jucy account settings and profile information."
        />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <Header />

        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
                Account Settings
              </h1>
              <p className="text-foreground/60 font-light">
                Manage your personal information and security preferences.
              </p>
            </div>

            {/* Profile Information */}
            <Card className="bg-card border-border/50 shadow-md rounded-2xl mb-8 overflow-hidden">
              <CardHeader className="bg-secondary/20 border-b border-border/30 pb-4">
                <CardTitle className="flex items-center text-lg font-medium text-foreground">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-foreground/50 mb-1 block">
                      Name
                    </Label>
                    <p className="text-base font-medium text-foreground">{currentUser?.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-foreground/50 mb-1 block">
                      Member Since
                    </Label>
                    <p className="text-base font-medium text-foreground">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update Email */}
            <Card className="bg-card border-border/50 shadow-md rounded-2xl mb-8 overflow-hidden">
              <CardHeader className="bg-secondary/20 border-b border-border/30 pb-4">
                <CardTitle className="flex items-center text-lg font-medium text-foreground">
                  <Mail className="w-5 h-5 mr-2 text-primary" />
                  Email Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {emailSuccess && (
                  <Alert className="mb-6 bg-green-50/50 border-green-200 text-green-800 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>Email updated successfully.</AlertDescription>
                  </Alert>
                )}

                {emailError && (
                  <Alert variant="destructive" className="mb-6 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{emailError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleEmailUpdate} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80 font-medium">
                      New Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ email: e.target.value })}
                      className="bg-background border-border focus-visible:ring-primary rounded-lg h-12"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                    disabled={emailLoading || emailForm.email === currentUser?.email}
                  >
                    {emailLoading ? 'Updating...' : 'Update Email'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="bg-card border-border/50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-secondary/20 border-b border-border/30 pb-4">
                <CardTitle className="flex items-center text-lg font-medium text-foreground">
                  <Lock className="w-5 h-5 mr-2 text-primary" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {passwordSuccess && (
                  <Alert className="mb-6 bg-green-50/50 border-green-200 text-green-800 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>Password changed successfully.</AlertDescription>
                  </Alert>
                )}

                {passwordError && (
                  <Alert variant="destructive" className="mb-6 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword" className="text-foreground/80 font-medium">
                      Current Password
                    </Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                      }
                      className="bg-background border-border focus-visible:ring-primary rounded-lg h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground/80 font-medium">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="bg-background border-border focus-visible:ring-primary rounded-lg h-12"
                      required
                    />
                    <p className="text-xs text-foreground/50 font-light">
                      Must be at least 8 characters
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground/80 font-medium">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="bg-background border-border focus-visible:ring-primary rounded-lg h-12"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="rounded-full bg-foreground hover:bg-foreground/90 text-background px-8"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPage;
