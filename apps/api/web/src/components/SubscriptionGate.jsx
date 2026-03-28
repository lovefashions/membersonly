import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiServerClient } from '@/lib/apiServerClient';
import { Loader2 } from 'lucide-react';

const tierRankMap = {
  fan: 1,
  vip: 2,
  elite: 3,
};

/**
 * SubscriptionGate component enforces tier-based access control
 * 
 * Usage: <SubscriptionGate requiredRank={2}><MyComponent /></SubscriptionGate>
 * Or: <SubscriptionGate requiredTier="vip"><MyComponent /></SubscriptionGate>
 */
const SubscriptionGate = ({ 
  children, 
  requiredTier, 
  requiredRank, 
  fallbackPath = '/pricing' 
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();
  const [userTier, setUserTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiServerClient.get('/api/subscriptions/tier');
        setUserTier(response.data.tier || 'fan');
      } catch (err) {
        console.error('Failed to fetch user tier:', err);
        setError('Unable to verify access');
        setUserTier('fan'); // Default to fan tier on error
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [currentUser, isAuthenticated]);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check tier access
  const requiredRankValue = requiredRank || (requiredTier ? tierRankMap[requiredTier] : 0);
  const userRank = tierRankMap[userTier] || 0;

  if (userRank < requiredRankValue) {
    return <Navigate 
      to={`${fallbackPath}?reason=upgrade&tier=${requiredTier || 'unknown'}`} 
      replace 
    />;
  }

  return children;
};

export default SubscriptionGate;
