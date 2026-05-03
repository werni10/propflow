-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) CHECK (role IN ('decorator', 'renter')),
  status VARCHAR(50) DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'banned')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create decorators table (extends users)
CREATE TABLE decorators (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  portfolio_verified BOOLEAN DEFAULT FALSE,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  subscription_active BOOLEAN DEFAULT FALSE,
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP
);

-- Create items (props) table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decorator_id UUID NOT NULL REFERENCES decorators(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  deposit_required BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(10,2),
  condition VARCHAR(50) DEFAULT 'Good' CHECK (condition IN ('Excellent', 'Good', 'Fair')),
  location VARCHAR(255) NOT NULL,
  photos JSONB, -- Array of photo URLs
  availability_dates JSONB, -- Calendar availability data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decorator_id UUID NOT NULL REFERENCES decorators(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  platform VARCHAR(50) DEFAULT 'YouCanPay',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_ref VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create verification queue table
CREATE TABLE verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) CHECK (user_type IN ('decorator', 'renter')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews/ratings table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewed_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decorator_id UUID NOT NULL REFERENCES decorators(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE,
  period_end DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_items_decorator ON items(decorator_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_location ON items(location);
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_decorator ON bookings(decorator_id);
CREATE INDEX idx_bookings_item ON bookings(item_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_payouts_decorator ON payouts(decorator_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE decorators ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Decorators can read their own profile" ON decorators FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Decorators can update their own profile" ON decorators FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Items are readable by all" ON items FOR SELECT USING (TRUE);
CREATE POLICY "Decorators can insert items" ON items FOR INSERT WITH CHECK (auth.uid() = decorator_id);
CREATE POLICY "Decorators can update own items" ON items FOR UPDATE USING (auth.uid() = decorator_id);
CREATE POLICY "Users can read own bookings" ON bookings FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = decorator_id);
CREATE POLICY "Users can insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = renter_id);
