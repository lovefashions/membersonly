import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header.jsx';

const UpgradePage = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paypalError, setPaypalError] = useState(false);
  const paypalRendered = useRef({ fan: false, vip: false, elite: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (currentUser) {
          const userProfile = await pb.collection('profiles').getFirstListItem(
            `user_id="${currentUser.id}"`,
            { $autoCancel: false }
          );
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const tiers = [
    {
      name: 'fan',
      displayName: 'Fan Club',
      subtitle: 'Insider / Backstage Pass',
      price: '$30',
      period: '/mo',
      containerId: 'paypal-tier1',
      buttonId: 'CPNYX2PLPG6CU',
      features: [
        { name: 'Early looks at new content', included: true },
        { name: 'Behind-the-scenes',  included: true },
        { name: 'Members-only posts & updates', included: true },
        { name: 'Exclusive discounts', included: false },
        { name: 'Community access', included: true },
      ],
    },
    {
      name: 'vip',
      displayName: 'VIP Lounge',
      subtitle: 'Premium Access',
      price: '$45',
      period: '/mo',
      containerId: 'paypal-tier2',
      buttonId: 'E23D4H78JSZCY',
      featured: true,
      features: [
        { name: 'Access to community', included: true },
        { name: 'Monthly newsletter', included: true },
        { name: 'Early access to new content', included: true },
        { name: 'Exclusive discounts', included: true },
        { name: 'Access with bigger drops', included: true },
        { name: 'VIP-only events', included: true },
      ],
    },
    {
      name: 'elite',
      displayName: 'Elite Lounge',
      subtitle: 'Exclusive Access',
      price: '$55',
      period: '/mo',
      containerId: 'paypal-tier3',
      buttonId: 'L3MKECMJ7PA52',
      features: [
        { name: 'All access', included: true },
        { name: 'Monthly newsletter', included: true },
        { name: 'Exclusive experience', included: true },
        { name: 'Exclusive discounts', included: true },
        { name: 'Priority support', included: true },
        { name: 'VIP-only events', included: true },
      ],
    },
  ];

  useEffect(() => {
    if (loading) return;

    if (!window.paypal) {
      setPaypalError(true);
      return;
    }

    const currentTier = profile?.tier?.toLowerCase() || 'fan';

    tiers.forEach(tier => {
      const isCurrentTier = tier.name === currentTier;
      
      if (!isCurrentTier && !paypalRendered.current[tier.name]) {
        const container = document.getElementById(tier.containerId);
        if (container) {
          try {
            window.paypal.HostedButtons({
              hostedButtonId: tier.buttonId,
            }).render(`#${tier.containerId}`);
            paypalRendered.current[tier.name] = true;
          } catch (err) {
            console.error(`Failed to render PayPal button for ${tier.name}`, err);
          }
        }
      }
    });
  }, [loading, profile, tiers]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60 font-light">Preparing your experience...</p>
          </div>
        </div>
      </>
    );
  }

  const currentTier = profile?.tier?.toLowerCase() || 'fan';

  return (
    <>
      <Helmet>
        <title>Upgrade Membership | Apple Jucy</title>
        <meta name="description" content="Elevate your Apple Jucy experience with our premium membership tiers." />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <Header />

        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground mb-4">
                Elevate Your <span className="font-medium">Membership</span>
              </h1>
              <p className="text-lg text-foreground/70 font-light max-w-2xl mx-auto mb-6">
                Unlock premium features, exclusive content, and take your journey to the next level.
              </p>
              {currentUser && (
                <div className="inline-flex items-center space-x-3 bg-secondary/50 px-5 py-2.5 rounded-full border border-border/50">
                  <span className="text-sm text-foreground/70 font-light">Current Status:</span>
                  <Badge className="bg-primary text-primary-foreground capitalize font-medium px-3 py-0.5 rounded-full">
                    {profile?.tier || 'Fan'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Tier Comparison */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {tiers.map((tier) => {
                const isCurrentTier = currentUser && tier.name === currentTier;
                
                return (
                  <Card
                    key={tier.name}
                    className={`relative transition-all duration-500 flex flex-col rounded-2xl border-border/50 ${
                      tier.featured
                        ? 'bg-card shadow-2xl scale-100 md:scale-105 z-10 border-primary/20'
                        : 'bg-card/50 shadow-lg hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {tier.featured && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="bg-primary text-primary-foreground text-xs font-medium tracking-widest uppercase py-1.5 px-4 rounded-full shadow-md">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {isCurrentTier && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-foreground text-background font-medium rounded-full">Active</Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pt-10 pb-6">
                      <CardTitle className="text-xl font-medium text-foreground mb-1">{tier.displayName}</CardTitle>
                      <p className="text-xs text-foreground/50 uppercase tracking-wider mb-4">{tier.subtitle}</p>
                      <div className="flex items-baseline justify-center text-foreground">
                        <span className="text-4xl font-light tracking-tight">{tier.price}</span>
                        <span className="text-foreground/60 ml-1">{tier.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow flex flex-col px-8 pb-10">
                      <ul className="space-y-4 mb-8 flex-grow">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm font-light">
                            {feature.included ? (
                              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5 mr-3" />
                            ) : (
                              <X className="w-4 h-4 text-foreground/20 shrink-0 mt-0.5 mr-3" />
                            )}
                            <span className={feature.included ? 'text-foreground/80' : 'text-foreground/40'}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-4 min-h-[50px] flex items-center justify-center w-full">
                        {isCurrentTier ? (
                          <Button disabled className="w-full rounded-full h-12 bg-secondary text-foreground/50 font-medium cursor-not-allowed">
                            Current Plan
                          </Button>
                        ) : (
                          <div className="w-full">
                            {paypalError ? (
                              <div className="text-center text-destructive text-sm p-3 border border-destructive/20 rounded-xl bg-destructive/5">
                                Payment system unavailable. Please refresh.
                              </div>
                            ) : (
                              <div id={tier.containerId} className="w-full flex justify-center min-h-[45px]"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Info */}
            <Card className="bg-secondary/30 border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light tracking-tight text-foreground mb-3">The Apple Jucy Promise</h3>
                    <p className="text-foreground/70 font-light leading-relaxed mb-6 max-w-3xl">
                      Upgrading your membership grants you immediate access to our exclusive archives, priority support channels, and a curated experience designed for those who demand excellence.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm text-foreground/80 font-light">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span>Instant activation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span>Cancel anytime</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span>Secure processing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpgradePage;