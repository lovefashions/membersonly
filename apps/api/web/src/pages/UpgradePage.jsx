import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowUpRight, Loader2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { apiServerClient } from '@/lib/apiServerClient';

const UpgradePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentTier, setCurrentTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribingTo, setSubscribingTo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await apiServerClient.get('/api/billing/plans');
        setPlans(response.data);
        
        // Get user's current tier
        if (currentUser) {
          const tierResponse = await apiServerClient.get('/api/subscriptions/tier');
          setCurrentTier(tierResponse.data.tier || 'fan');
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setError('Failed to load pricing plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [currentUser]);

  const handleSubscribe = async (planSlug) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setSubscribingTo(planSlug);
      setError(null);

      const response = await apiServerClient.post('/api/billing/create-subscription', {
        plan_slug: planSlug,
      });

      if (response.data.approval_url) {
        // Redirect to PayPal for approval
        window.location.href = response.data.approval_url;
      } else {
        setError('Unable to process subscription. Please try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.error || 'Failed to create subscription');
    } finally {
      setSubscribingTo(null);
    }
  };

  const tiers = [
    {
      name: 'fan',
      displayName: 'Fan Club',
      subtitle: 'Insider / Backstage Pass',
      price: '$30',
      period: '/mo',
      features: [
        { name: 'Early looks at new content', included: true },
        { name: 'Behind-the-scenes', included: true },
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

    // Update tiers with current pricing from fetched plans
    plans.forEach((plan) => {
      const tierIndex = tiers.findIndex((t) => t.name === plan.slug);
      if (tierIndex !== -1) {
        tiers[tierIndex].price = `$${plan.price_monthly}`;
      }
    });
  }, [plans]);  const handleSubscribe = async (planSlug) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setSubscribingTo(planSlug);
      setError(null);

      const response = await apiServerClient.post('/api/billing/create-subscription', {
        plan_slug: planSlug,
      });

      if (response.data.approval_url) {
        // Redirect to PayPal for approval
        window.location.href = response.data.approval_url;
      } else {
        setError('Unable to process subscription. Please try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.error || 'Failed to create subscription');
    } finally {
      setSubscribingTo(null);
    }
  };

  const tiers = [
    {
      name: 'fan',
      displayName: 'Fan Club',
      subtitle: 'Insider / Backstage Pass',
      price: '$30',
      period: '/mo',
      features: [
        { name: 'Early looks at new content', included: true },
        { name: 'Behind-the-scenes', included: true },
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

    // Update tiers with current pricing from fetched plans
    plans.forEach((plan) => {
      const tierIndex = tiers.findIndex((t) => t.name === plan.slug);
      if (tierIndex !== -1) {
        tiers[tierIndex].price = `$${plan.price_monthly}`;
      }
    });
  }, [plans]);

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
                Start with a <strong>14-day free trial</strong>, then monthly billing.
              </p>
              {error && (
                <div className="inline-block bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2 rounded-lg mb-6">
                  {error}
                </div>
              )}
              {currentUser && currentTier && (
                <div className="inline-flex items-center space-x-3 bg-secondary/50 px-5 py-2.5 rounded-full border border-border/50">
                  <span className="text-sm text-foreground/70 font-light">Current Tier:</span>
                  <Badge className="bg-primary text-primary-foreground capitalize font-medium px-3 py-0.5 rounded-full">
                    {currentTier}
                  </Badge>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Tier Comparison */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                  {tiers.map((tier) => {
                    const isCurrentTier = currentTier === tier.name;
                    const isLoading = subscribingTo === tier.name;

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
                            <Badge className="bg-foreground text-background font-medium rounded-full">
                              Active
                            </Badge>
                          </div>
                        )}

                        <CardHeader className="text-center pt-10 pb-6">
                          <CardTitle className="text-xl font-medium text-foreground mb-1">
                            {tier.displayName}
                          </CardTitle>
                          <p className="text-xs text-foreground/50 uppercase tracking-wider mb-4">
                            {tier.subtitle}
                          </p>
                          <div className="flex items-baseline justify-center text-foreground">
                            <span className="text-4xl font-light tracking-tight">{tier.price}</span>
                            <span className="text-foreground/60 ml-1">{tier.period}</span>
                          </div>
                          <p className="text-xs text-primary mt-3 font-medium">
                            + 14-day free trial
                          </p>
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
                                <span
                                  className={
                                    feature.included ? 'text-foreground/80' : 'text-foreground/40'
                                  }
                                >
                                  {feature.name}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-auto pt-4 min-h-[50px] flex items-center justify-center w-full">
                            {isCurrentTier ? (
                              <Button
                                disabled
                                className="w-full rounded-full h-12 bg-secondary text-foreground/50 font-medium cursor-not-allowed"
                              >
                                Current Plan
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleSubscribe(tier.name)}
                                disabled={isLoading || !currentUser}
                                className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : currentUser ? (
                                  'Start Free Trial'
                                ) : (
                                  'Sign In to Subscribe'
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}

            {/* Additional Info */}
            <Card className="bg-secondary/30 border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light tracking-tight text-foreground mb-3">
                      The Members Only Promise
                    </h3>
                    <p className="text-foreground/70 font-light leading-relaxed mb-6 max-w-3xl">
                      Start your 14-day trial today and experience exclusive access to premium content,
                      community features, and member-only perks. After the trial, you'll be billed
                      monthly—cancel anytime, no questions asked.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm text-foreground/80 font-light">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span>14-day free trial</span>
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

      <Helmet>
        <title>Upgrade Membership | Members Only</title>
        <meta
          name="description"
          content="Join our membership community. Choose from Fan Club, VIP Lounge, or Elite Lounge. Start your 14-day free trial today!"
        />
      </Helmet>
    </>
  );
};

export default UpgradePage;
