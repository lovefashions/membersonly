import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Trash2, Shield, Webhook } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { apiServerClient } from '@/lib/apiServerClient';

const AdminPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [changes, setChanges] = useState({});
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const allProfiles = await pb.collection('profiles').getFullList({
        sort: '-created',
        $autoCancel: false,
      });
      setProfiles(allProfiles);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleTierChange = (profileId, newTier) => {
    setChanges({
      ...changes,
      [profileId]: {
        ...changes[profileId],
        tier: newTier,
      },
    });
  };

  const handleStatusChange = (profileId, newStatus) => {
    setChanges({
      ...changes,
      [profileId]: {
        ...changes[profileId],
        status: newStatus,
      },
    });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      for (const [profileId, updates] of Object.entries(changes)) {
        await pb.collection('profiles').update(profileId, updates, { $autoCancel: false });
      }

      setSuccess(true);
      setChanges({});
      await fetchProfiles();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setWebhookLoading(true);
    setWebhookStatus(null);

    try {
      const response = await apiServerClient.post('/api/billing/test-webhook', {
        event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      });

      setWebhookStatus({
        type: 'success',
        message: 'Test webhook sent successfully',
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      setWebhookStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to send test webhook',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleDeleteUser = async (profileId, email) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user ${email}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await pb.collection('profiles').delete(profileId, { $autoCancel: false });
      await fetchProfiles();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const getTierValue = (profileId, currentTier) => {
    return changes[profileId]?.tier || currentTier;
  };

  const getStatusValue = (profileId, currentStatus) => {
    return changes[profileId]?.status || currentStatus;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60 font-light">Loading administration...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Administration | Apple Jucy</title>
        <meta name="description" content="Manage Apple Jucy user accounts and memberships." />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <Header />

        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-10">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
                Administration
              </h1>
            </div>

            {success && (
              <Alert className="mb-8 bg-green-50/50 border-green-200 text-green-800 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>Changes saved successfully.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-8 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Webhook Configuration */}
            <Card className="bg-card border-border/50 shadow-md rounded-2xl overflow-hidden mb-8">
              <CardHeader className="bg-secondary/20 border-b border-border/30 pb-4">
                <div className="flex items-center space-x-3">
                  <Webhook className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-medium text-foreground">
                    PayPal Webhook Configuration
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Webhook URL</h4>
                    <div className="bg-background/50 border border-border rounded-lg p-3 font-mono text-sm text-foreground/70 break-all">
                      {window.location.origin}/api/billing/paypal/webhook
                    </div>
                    <p className="text-xs text-foreground/50 mt-2">
                      Configure This URL in your PayPal Dashboard → Account Settings → Webhooks
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Required Environment Variables</h4>
                    <ul className="text-sm text-foreground/70 space-y-1 bg-background/50 border border-border rounded-lg p-3">
                      <li>• <code className="font-mono">PAYPAL_CLIENT_ID</code></li>
                      <li>• <code className="font-mono">PAYPAL_CLIENT_SECRET</code></li>
                      <li>• <code className="font-mono">PAYPAL_WEBHOOK_ID</code></li>
                      <li>• <code className="font-mono">PAYPAL_MODE</code> (sandbox or live)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-3">Webhook Events</h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Subscribe to these PayPal subscription events:
                    </p>
                    <ul className="text-sm text-foreground/70 space-y-1 bg-background/50 border border-border rounded-lg p-3">
                      <li>• BILLING.SUBSCRIPTION.CREATED</li>
                      <li>• BILLING.SUBSCRIPTION.ACTIVATED</li>
                      <li>• BILLING.SUBSCRIPTION.TRIALING</li>
                      <li>• BILLING.SUBSCRIPTION.PAYMENT.SUCCESS</li>
                      <li>• BILLING.SUBSCRIPTION.CANCELLED</li>
                      <li>• BILLING.SUBSCRIPTION.EXPIRED</li>
                      <li>• BILLING.SUBSCRIPTION.SUSPENDED</li>
                      <li>• BILLING.SUBSCRIPTION.PAST_DUE</li>
                    </ul>
                  </div>

                  {webhookStatus && (
                    <Alert 
                      className={`${
                        webhookStatus.type === 'success'
                          ? 'bg-green-50/50 border-green-200 text-green-800'
                          : 'bg-red-50/50 border-red-200 text-red-800'
                      } rounded-xl`}
                    >
                      <AlertCircle className={`h-4 w-4 ${webhookStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
                      <AlertDescription>
                        {webhookStatus.message} <span className="text-xs opacity-75">({webhookStatus.timestamp})</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleTestWebhook}
                    disabled={webhookLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    {webhookLoading ? 'Testing...' : 'Test Webhook Connection'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-secondary/20 border-b border-border/30 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-medium text-foreground">
                    User Management
                  </CardTitle>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={Object.keys(changes).length === 0 || saving}
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {saving
                      ? 'Saving...'
                      : `Save Changes ${Object.keys(changes).length > 0 ? `(${Object.keys(changes).length})` : ''}`}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-background/50">
                      <TableRow className="border-border/50">
                        <TableHead className="font-medium text-foreground/70">Email</TableHead>
                        <TableHead className="font-medium text-foreground/70">Tier</TableHead>
                        <TableHead className="font-medium text-foreground/70">Status</TableHead>
                        <TableHead className="font-medium text-foreground/70">Created</TableHead>
                        <TableHead className="text-right font-medium text-foreground/70">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow
                          key={profile.id}
                          className="border-border/30 hover:bg-secondary/10"
                        >
                          <TableCell className="font-light text-foreground">
                            {profile.email}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={getTierValue(profile.id, profile.tier)}
                              onValueChange={(value) => handleTierChange(profile.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-background border-border rounded-lg h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border">
                                <SelectItem value="Fan">Fan Club</SelectItem>
                                <SelectItem value="VIP">VIP Lounge</SelectItem>
                                <SelectItem value="Elite">Elite Lounge</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={getStatusValue(profile.id, profile.status)}
                              onValueChange={(value) => handleStatusChange(profile.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-background border-border rounded-lg h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="trial">Trial</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="font-light text-foreground/70">
                            {new Date(profile.created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(profile.id, profile.email)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {profiles.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-foreground/50 font-light">No users found in the system.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
