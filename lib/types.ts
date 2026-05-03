export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'decorator' | 'renter';
  status: 'unverified' | 'verified' | 'banned';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Decorator = User & {
  bio?: string;
  portfolio_verified: boolean;
  average_rating: number;
  total_listings: number;
  subscription_active: boolean;
};

export type Item = {
  id: string;
  decorator_id: string;
  title: string;
  description?: string;
  category: string;
  price_per_day: number;
  deposit_required: boolean;
  deposit_amount?: number;
  condition: 'Excellent' | 'Good' | 'Fair';
  location: string;
  photos: string[];
  availability_dates: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  item_id: string;
  renter_id: string;
  decorator_id: string;
  start_date: string;
  end_date: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_id?: string;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  platform: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_ref?: string;
  created_at: string;
};

export type Review = {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment?: string;
  created_at: string;
};
