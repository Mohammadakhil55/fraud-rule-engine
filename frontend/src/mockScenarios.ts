import type { TransactionEvaluationRequest } from './types';

export interface PredefinedScenario {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  expectedTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedRules: string[];
  request: TransactionEvaluationRequest;
}

export function getMockScenarios(): PredefinedScenario[] {
  const now = new Date();
  const randSuffix = Math.floor(1000 + Math.random() * 9000);

  return [
    {
      id: 'normal-lunch',
      name: 'Everyday Coffee & Lunch',
      icon: '☕',
      category: 'Normal Spending',
      description: 'Standard retail micro-charge within normal geographical and temporal limits.',
      expectedTier: 'LOW',
      expectedRules: [],
      request: {
        transaction: {
          transaction_id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          user_id: `alice_austin_${randSuffix}`,
          amount: 450.0,
          currency: 'INR',
          merchant_name: 'Artisan Cafe & Bakery, Indiranagar',
          merchant_category: 'FOOD_BEVERAGE',
          city: 'Bengaluru',
          country: 'India',
          latitude: 12.9716,
          longitude: 77.5946,
          timestamp: now.toISOString(),
        },
        // Explicitly clean history so repeated testing never falsely triggers velocity
        history_override: [],
        save_to_db: true,
      },
    },
    {
      id: 'high-value-luxury',
      name: 'High-Value Luxury Outlier',
      icon: '💎',
      category: 'Unusual Amount',
      description: 'Single purchase of ₹75,000 exceeding standard high-risk ceiling (₹5,000).',
      expectedTier: 'MEDIUM',
      expectedRules: ['Unusual Transaction Amount'],
      request: {
        transaction: {
          transaction_id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          user_id: `bob_collector_${randSuffix}`,
          amount: 75000.0,
          currency: 'INR',
          merchant_name: 'Geneva Horology & Luxury Watches',
          merchant_category: 'JEWELRY_LUXURY',
          city: 'Mumbai',
          country: 'India',
          latitude: 19.0760,
          longitude: 72.8777,
          timestamp: now.toISOString(),
        },
        // Clean history so this scenario exclusively isolates and tests the high-value rule
        history_override: [],
        save_to_db: true,
      },
    },
    {
      id: 'velocity-burst',
      name: 'Card-Testing Velocity Burst',
      icon: '⚡',
      category: 'Velocity Anomaly',
      description: '6 rapid successive micro-transactions in under 5 minutes simulating bot testing.',
      expectedTier: 'MEDIUM',
      expectedRules: ['Transaction Velocity Anomaly'],
      request: {
        transaction: {
          transaction_id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          user_id: `bot_target_${randSuffix}`,
          amount: 120.0,
          currency: 'INR',
          merchant_name: 'FastDigital Services',
          merchant_category: 'DIGITAL_GOODS',
          city: 'Hyderabad',
          country: 'India',
          latitude: 17.3850,
          longitude: 78.4867,
          timestamp: now.toISOString(),
        },
        history_override: [1, 2, 3, 4, 5].map((mins) => ({
          transaction_id: `TX-BURST-HIST-${mins}-${randSuffix}`,
          user_id: `bot_target_${randSuffix}`,
          amount: 100.0 + mins * 10,
          currency: 'INR',
          timestamp: new Date(now.getTime() - mins * 60 * 1000).toISOString(),
          city: 'Hyderabad',
          country: 'India',
        })),
        save_to_db: true,
      },
    },
    {
      id: 'impossible-travel',
      name: 'Impossible Physical Travel',
      icon: '✈️',
      category: 'Impossible Location',
      description: 'Transaction in Tokyo 15 minutes after transacting in New Delhi (5,800 km apart, >23,000 km/h).',
      expectedTier: 'HIGH',
      expectedRules: ['Impossible Geographical Location'],
      request: {
        transaction: {
          transaction_id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          user_id: `traveler_sam_${randSuffix}`,
          amount: 6500.0,
          currency: 'INR',
          merchant_name: 'Tokyo Metro Express Kiosk',
          merchant_category: 'TRANSPORTATION',
          city: 'Tokyo',
          country: 'Japan',
          latitude: 35.6762,
          longitude: 139.6503,
          timestamp: now.toISOString(),
        },
        history_override: [
          {
            transaction_id: `TX-PRIOR-DELHI-${randSuffix}`,
            user_id: `traveler_sam_${randSuffix}`,
            amount: 1500.0,
            currency: 'INR',
            merchant_name: 'Connaught Place Retail',
            city: 'New Delhi',
            country: 'India',
            latitude: 28.6139,
            longitude: 77.2090,
            timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
          },
        ],
        save_to_db: true,
      },
    },
    {
      id: 'multi-vector-attack',
      name: 'Coordinated Syndicate Attack',
      icon: '🚨',
      category: 'Multi-Rule Attack',
      description: '₹1,85,000 Wire + Impossible Travel (Frankfurt to Singapore in 2 min) + 6 rapid bursts.',
      expectedTier: 'CRITICAL',
      expectedRules: [
        'Transaction Velocity Anomaly',
        'Unusual Transaction Amount',
        'Impossible Geographical Location',
      ],
      request: {
        transaction: {
          transaction_id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
          user_id: `syndicate_${randSuffix}`,
          amount: 185000.0,
          currency: 'INR',
          merchant_name: 'Offshore Crypto Liquidity Node',
          merchant_category: 'FINANCIAL_SERVICES',
          city: 'Singapore',
          country: 'Singapore',
          latitude: 1.3521,
          longitude: 103.8198,
          timestamp: now.toISOString(),
        },
        history_override: [1, 2, 3, 4, 5].map((mins) => ({
          transaction_id: `TX-SYNDICATE-HIST-${mins}-${randSuffix}`,
          user_id: `syndicate_${randSuffix}`,
          amount: 5000.0,
          currency: 'INR',
          city: 'Frankfurt',
          country: 'Germany',
          latitude: 50.1109,
          longitude: 8.6821,
          timestamp: new Date(now.getTime() - mins * 60 * 1000).toISOString(),
        })),
        save_to_db: true,
      },
    },
  ];
}
