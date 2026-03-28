import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    try {
      // Create user account
      const user = await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name,
        emailVisibility: true,
      });

      // Create profile for the user with default tier 'fan' and status 'active'
      await pb.collection('profiles').create(
        {
          user_id: user.id,
          email: email,
          tier: 'fan',
          status: 'active',
        },
        { $autoCancel: false }
      );

      // Auto-login after signup
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);

      return authData;
    } catch (error) {
      // Explicitly propagate the error so the component can read error.response for field validation
      throw error;
    }
  };

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password);
    setCurrentUser(authData.record);
    return authData;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const requestPasswordReset = async (email) => {
    await pb.collection('users').requestPasswordReset(email);
  };

  const confirmPasswordReset = async (token, password, passwordConfirm) => {
    await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
  };

  const updateEmail = async (newEmail) => {
    const updated = await pb.collection('users').update(
      currentUser.id,
      {
        email: newEmail,
      },
      { $autoCancel: false }
    );
    setCurrentUser(updated);

    // Also update profile email
    const profile = await pb
      .collection('profiles')
      .getFirstListItem(`user_id="${currentUser.id}"`, { $autoCancel: false });
    await pb.collection('profiles').update(
      profile.id,
      {
        email: newEmail,
      },
      { $autoCancel: false }
    );
  };

  const updatePassword = async (oldPassword, newPassword) => {
    await pb.collection('users').update(
      currentUser.id,
      {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      },
      { $autoCancel: false }
    );
  };

  const googleAuth = async () => {
    try {
      // Use PocketBase's built-in OAuth2 authentication
      // This will redirect to Google login and callback to the app
      const authData = await pb.collection('users').authWithOAuth2({
        provider: 'google',
      });

      setCurrentUser(authData.record);

      // Create or update profile for the user
      try {
        const existingProfile = await pb
          .collection('profiles')
          .getFirstListItem(`user_id="${authData.record.id}"`, { $autoCancel: false });
        
        // Update existing profile with email if needed
        if (existingProfile.email !== authData.record.email) {
          await pb.collection('profiles').update(
            existingProfile.id,
            {
              email: authData.record.email,
            },
            { $autoCancel: false }
          );
        }
      } catch (error) {
        // Profile doesn't exist, create one
        if (error.status === 404) {
          await pb.collection('profiles').create(
            {
              user_id: authData.record.id,
              email: authData.record.email,
              tier: 'fan',
              status: 'active',
            },
            { $autoCancel: false }
          );
        } else {
          throw error;
        }
      }

      return authData;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    initialLoading,
    signup,
    login,
    logout,
    googleAuth,
    requestPasswordReset,
    confirmPasswordReset,
    updateEmail,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
