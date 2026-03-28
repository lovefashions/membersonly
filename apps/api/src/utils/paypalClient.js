import logger from './logger.js';
import crypto from 'crypto';

// PayPal API constants
const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

// ============================================================================
// Get PayPal Access Token
// ============================================================================
async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    logger.error('Error getting PayPal access token:', error);
    throw error;
  }
}

// ============================================================================
// Create PayPal Subscription
// ============================================================================
export async function createPayPalSubscription({ plan_id, email, custom_id }) {
  try {
    const accessToken = await getPayPalAccessToken();

    const payload = {
      plan_id,
      subscriber: {
        email_address: email,
      },
      custom_id,
      application_context: {
        brand_name: process.env.APP_NAME || 'Members Only',
        locale: 'en-US',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${process.env.APP_URL}/account?subscription=success`,
        cancel_url: `${process.env.APP_URL}/pricing?subscription=cancelled`,
      },
    };

    const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `${custom_id}-${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('PayPal subscription creation failed:', error);
      return { success: false, error };
    }

    const data = await response.json();
    
    // Extract approval URL
    const approvalLink = data.links?.find((link) => link.rel === 'approve');

    return {
      success: true,
      subscription_id: data.id,
      customer_id: email,
      approval_url: approvalLink?.href || null,
    };
  } catch (error) {
    logger.error('Error creating PayPal subscription:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Verify PayPal Webhook Signature
// ============================================================================
export async function verifyPayPalWebhookSignature({
  transmission_id,
  transmission_time,
  cert_url,
  auth_algo,
  transmission_sig,
  webhook_id,
  body,
}) {
  try {
    // Validate required headers
    if (!transmission_id || !transmission_time || !cert_url || !auth_algo || !transmission_sig) {
      logger.warn('Missing PayPal webhook headers');
      return false;
    }

    // For production: Verify signature using PayPal's certificate
    // For now, use a simplified verification with direct API call
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transmission_id,
          transmission_time,
          cert_url,
          auth_algo,
          transmission_sig,
          webhook_id,
          webhook_event: JSON.parse(body.toString()),
        }),
      }
    );

    if (!response.ok) {
      logger.warn('PayPal webhook signature verification failed');
      return false;
    }

    const data = await response.json();
    return data.verification_status === 'SUCCESS';
  } catch (error) {
    logger.error('Error verifying PayPal webhook signature:', error);
    return false;
  }
}

// ============================================================================
// Get Subscription Details from PayPal
// ============================================================================
export async function getPayPalSubscription(subscriptionId) {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get subscription: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Error getting PayPal subscription:', error);
    throw error;
  }
}

// ============================================================================
// Get PayPal Plan Details
// ============================================================================
export async function getPayPalPlan(planId) {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_API_URL}/v1/billing/plans/${planId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get plan: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Error getting PayPal plan:', error);
    throw error;
  }
}
