import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Trash2, Shield } from 'lucide-react';
import Header from '@/components/Header.jsx';

const AdminPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [changes, setChanges] = useState({});

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

  const handleDeleteUser = async (profileId, email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
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
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">Administration</h1>
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

            <Card className="bg-card border-border/50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-secondary/20 border-b border-border/30 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-lg font-medium text-foreground">User Management</CardTitle>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={Object.keys(changes).length === 0 || saving}
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {saving ? 'Saving...' : `Save Changes ${Object.keys(changes).length > 0 ? `(${Object.keys(changes).length})` : ''}`}
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
                        <TableHead className="text-right font-medium text-foreground/70">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id} className="border-border/30 hover:bg-secondary/10">
                          <TableCell className="font-light text-foreground">{profile.email}</TableCell>
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
                              year: 'numeric', month: 'short', day: 'numeric',
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