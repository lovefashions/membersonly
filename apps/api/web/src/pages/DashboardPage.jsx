import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowUpRight, User, Shield, Star } from 'lucide-react';
import Header from '@/components/Header.jsx';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await pb
          .collection('profiles')
          .getFirstListItem(`user_id="${currentUser.id}"`, { $autoCancel: false });
        setProfile(userProfile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const getTierPerks = (tier) => {
    const normalizedTier = tier?.toLowerCase() || 'fan';
    const perks = {
      fan: ['Access to community', 'Monthly newsletter'],
      vip: [
        'Access to community',
        'Monthly newsletter',
        'Early access to new content',
        'Exclusive discounts',
      ],
      elite: [
        'Access to community',
        'Monthly newsletter',
        'Early access to new content',
        'Exclusive discounts',
        'Priority support',
        'VIP-only events',
      ],
    };
    return perks[normalizedTier] || perks.fan;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60 font-light">Loading your space...</p>
          </div>
        </div>
      </>
    );
  }

  const currentTier = profile?.tier || 'fan';
  const normalizedTier = currentTier.toLowerCase();

  return (
    <>
      <Helmet>
        <title>Members Room | Apple Jucy</title>
        <meta name="description" content="Your exclusive Apple Jucy members dashboard." />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <Header />

        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground mb-2">
                Welcome back, <span className="font-medium">{currentUser?.name}</span>
              </h1>
              <p className="text-foreground/60 font-light">Your exclusive members room</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-2 bg-card border-border/50 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/30 bg-secondary/20">
                  <CardTitle className="text-lg font-medium flex items-center text-foreground">
                    <Star className="w-5 h-5 mr-2 text-primary" />
                    Membership Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">
                        Current Tier
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-light capitalize">{currentTier}</span>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-full px-3">
                          {profile?.status || 'Active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/60 mt-2 font-light">
                        Member since{' '}
                        {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>

                    {normalizedTier !== 'elite' && (
                      <Link to="/upgrade">
                        <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-md">
                          Upgrade Access
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/30 bg-secondary/20">
                  <CardTitle className="text-lg font-medium flex items-center text-foreground">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[calc(100%-65px)]">
                  <div>
                    <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="text-foreground font-light truncate" title={currentUser?.email}>
                      {currentUser?.email}
                    </p>
                  </div>
                  <Link to="/account" className="mt-6 inline-block">
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-border hover:bg-secondary"
                    >
                      Manage Account
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border/50 shadow-md rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-medium text-foreground">
                    Your Privileges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {getTierPerks(currentTier).map((perk, index) => (
                      <li key={index} className="flex items-start text-foreground/80 font-light">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5 mr-3" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {normalizedTier !== 'elite' && (
                <Card className="bg-primary/5 border-primary/20 shadow-md rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Shield className="w-32 h-32 text-primary" />
                  </div>
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-xl font-medium text-foreground">
                      Unlock the Elite Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-foreground/70 font-light mb-6 leading-relaxed">
                      Elevate your membership to access our most exclusive content, priority support
                      channels, and VIP-only events reserved for our top tier members.
                    </p>
                    <Link to="/upgrade">
                      <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group">
                        View Elite Benefits
                        <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
