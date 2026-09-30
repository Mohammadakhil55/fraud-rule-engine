import type { CustomerProfileHistory, UserHistoricalTransaction } from './types';

export function getCustomerProfileHistory(
  userId: string,
  currentAmount?: number,
  currentMerchant?: string,
  currentCity?: string,
  currentCountry?: string
): CustomerProfileHistory {
  const now = new Date();

  // 1. Bob Collector — The classic High-Value Sudden Spike in INR
  if (userId.includes('bob_collector') || (currentAmount && currentAmount >= 50000 && currentAmount < 150000)) {
    const amount = currentAmount || 75000.0;
    const pastAmounts = [500.0, 700.0, 900.0, 1200.0, 650.0, 800.0, 750.0, 950.0, 850.0];
    const avg = pastAmounts.reduce((a, b) => a + b, 0) / pastAmounts.length;
    const hikeMultiplier = Number((amount / avg).toFixed(1));
    const hikePercentage = Math.round(((amount - avg) / avg) * 100);

    const history: UserHistoricalTransaction[] = pastAmounts.map((amt, idx) => {
      const daysAgo = 9 - idx;
      const date = new Date(now.getTime() - daysAgo * 24 * 3600 * 1000);
      return {
        id: `DEMO-100${idx + 1}`,
        tx_seq: idx + 1,
        timestamp: date.toISOString(),
        time_display: `${daysAgo}d ago`,
        amount: amt,
        currency: 'INR',
        merchant_name: [
          'Demo Store Indiranagar',
          'Cafe Coffee Day',
          'Shell Fuel Station',
          'Nature Basket Grocery',
          'Swiggy Gourmet',
          'Apollo Pharmacy',
          'Flipkart Retail',
          'Reliance Digital',
          'Amazon India',
        ][idx],
        merchant_category: 'RETAIL_GROCERY',
        city: 'Bengaluru',
        country: 'India',
        status: 'APPROVED',
        deviation_percentage: Math.round(((amt - avg) / avg) * 100),
      };
    });

    const currentTx: UserHistoricalTransaction = {
      id: `DEMO-1005`,
      tx_seq: 10,
      timestamp: now.toISOString(),
      time_display: 'Just Now',
      amount: amount,
      currency: 'INR',
      merchant_name: currentMerchant || 'Luxury Merchant Mumbai',
      merchant_category: 'LUXURY_JEWELRY',
      city: currentCity || 'Mumbai',
      country: currentCountry || 'India',
      status: 'FLAGGED',
      is_spike: true,
      deviation_percentage: hikePercentage,
      notes: `🚨 Sudden Spike of ${hikeMultiplier}x (+${hikePercentage}%) above 10-tx baseline average (₹${avg.toFixed(0)})!`,
    };

    return {
      user_id: userId,
      user_name: 'Robert (Bob) M. — Premier Consumer',
      account_tier: 'Gold Checking',
      tenure_months: 42,
      baseline_avg_amount: Number(avg.toFixed(2)),
      current_tx: currentTx,
      transactions_last_10: [...history, currentTx],
      has_sudden_hike: true,
      hike_multiplier: hikeMultiplier,
      hike_percentage: hikePercentage,
    };
  }

  // 2. Syndicate / Massive Attack — Extreme Spike in INR
  if (userId.includes('syndicate') || (currentAmount && currentAmount >= 150000)) {
    const amount = currentAmount || 185000.0;
    const pastAmounts = [1200.0, 850.0, 1400.0, 950.0, 1100.0, 1300.0, 750.0, 1600.0, 1050.0];
    const avg = pastAmounts.reduce((a, b) => a + b, 0) / pastAmounts.length;
    const hikeMultiplier = Number((amount / avg).toFixed(1));
    const hikePercentage = Math.round(((amount - avg) / avg) * 100);

    const history: UserHistoricalTransaction[] = pastAmounts.map((amt, idx) => {
      const daysAgo = 9 - idx;
      const date = new Date(now.getTime() - daysAgo * 24 * 3600 * 1000);
      return {
        id: `TX-HIST-SYN-00${idx + 1}`,
        tx_seq: idx + 1,
        timestamp: date.toISOString(),
        time_display: `${daysAgo}d ago`,
        amount: amt,
        currency: 'INR',
        merchant_name: 'Local Utility & Services',
        merchant_category: 'SERVICES',
        city: 'Hyderabad',
        country: 'India',
        status: 'APPROVED',
        deviation_percentage: Math.round(((amt - avg) / avg) * 100),
      };
    });

    const currentTx: UserHistoricalTransaction = {
      id: `TX-SYN-CURRENT`,
      tx_seq: 10,
      timestamp: now.toISOString(),
      time_display: 'Just Now',
      amount: amount,
      currency: 'INR',
      merchant_name: currentMerchant || 'Offshore Crypto Liquidity Node',
      merchant_category: 'FINANCIAL_SERVICES',
      city: currentCity || 'Singapore',
      country: currentCountry || 'Singapore',
      status: 'FLAGGED',
      is_spike: true,
      deviation_percentage: hikePercentage,
      notes: `🚨 Catastrophic Hike: ₹${amount.toLocaleString()} is ${hikeMultiplier}x (+${hikePercentage}%) higher than usual!`,
    };

    return {
      user_id: userId,
      user_name: 'Victor S. — Suspicious Business Entity',
      account_tier: 'Corporate Wire Tier',
      tenure_months: 6,
      baseline_avg_amount: Number(avg.toFixed(2)),
      current_tx: currentTx,
      transactions_last_10: [...history, currentTx],
      has_sudden_hike: true,
      hike_multiplier: hikeMultiplier,
      hike_percentage: hikePercentage,
    };
  }

  // 3. Normal Clean Baseline (Flat spending in INR)
  const defaultAmount = currentAmount || 450.0;
  const pastAmounts = [420.0, 480.0, 410.0, 460.0, 490.0, 430.0, 470.0, 440.0, 450.0];
  const avg = pastAmounts.reduce((a, b) => a + b, 0) / pastAmounts.length;

  const history: UserHistoricalTransaction[] = pastAmounts.map((amt, idx) => {
    const daysAgo = 9 - idx;
    const date = new Date(now.getTime() - daysAgo * 24 * 3600 * 1000);
    return {
      id: `TX-HIST-ALICE-00${idx + 1}`,
      tx_seq: idx + 1,
      timestamp: date.toISOString(),
      time_display: `${daysAgo}d ago`,
      amount: amt,
      currency: 'INR',
      merchant_name: [
        'Artisan Bakery Bangalore',
        'Daily Supermarket',
        'Metro Train Card Reload',
        'Cafe Coffee Day',
        'Quick Pharmacy',
        'Amazon Prime Video',
        'Corner Grocers',
        'Zomato Lunch',
        'Local Bakery',
      ][idx],
      merchant_category: 'FOOD_BEVERAGE',
      city: 'Bengaluru',
      country: 'India',
      status: 'APPROVED',
      deviation_percentage: Math.round(((amt - avg) / avg) * 100),
    };
  });

  const currentTx: UserHistoricalTransaction = {
    id: `TX-ALICE-CURRENT`,
    tx_seq: 10,
    timestamp: now.toISOString(),
    time_display: 'Just Now',
    amount: defaultAmount,
    currency: 'INR',
    merchant_name: currentMerchant || 'Artisan Cafe & Bakery, Indiranagar',
    merchant_category: 'FOOD_BEVERAGE',
    city: currentCity || 'Bengaluru',
    country: currentCountry || 'India',
    status: 'APPROVED',
    is_spike: false,
    deviation_percentage: Math.round(((defaultAmount - avg) / avg) * 100),
    notes: 'Transaction amounts strictly conform with established behavioral bounds.',
  };

  return {
    user_id: userId,
    user_name: 'Alice W. — Regular Verified Consumer',
    account_tier: 'Standard Personal',
    tenure_months: 18,
    baseline_avg_amount: Number(avg.toFixed(2)),
    current_tx: currentTx,
    transactions_last_10: [...history, currentTx],
    has_sudden_hike: false,
  };
}
