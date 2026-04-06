CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');
CREATE TYPE turf_status AS ENUM ('active', 'inactive');
CREATE TYPE sport_type AS ENUM ('football', 'cricket', 'basketball', 'badminton', 'tennis');
CREATE TYPE slot_status AS ENUM ('available', 'locked', 'booked', 'blocked');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('created', 'captured', 'refunded', 'failed');
CREATE TYPE rule_type AS ENUM ('peak_hour', 'day_of_week', 'advance_discount');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100),
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE turfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  status turf_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE turf_sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_id UUID REFERENCES turfs(id) ON DELETE CASCADE,
  sport sport_type NOT NULL,
  slot_duration_min INT DEFAULT 60,
  base_price DECIMAL(10,2) NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  max_advance_days INT DEFAULT 7
);

CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_sport_id UUID REFERENCES turf_sports(id) ON DELETE CASCADE,
  rule_type rule_type NOT NULL,
  condition JSONB NOT NULL,
  multiplier DECIMAL(4,2) NOT NULL,
  priority INT DEFAULT 1
);

CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_sport_id UUID REFERENCES turf_sports(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status slot_status DEFAULT 'available',
  locked_by UUID REFERENCES users(id),
  lock_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  turf_sport_id UUID REFERENCES turf_sports(id),
  slot_ids UUID[] NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status booking_status DEFAULT 'pending',
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  gateway VARCHAR(20) DEFAULT 'razorpay',
  gateway_order_id VARCHAR(100),
  gateway_payment_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  refund_amount DECIMAL(10,2),
  status payment_status DEFAULT 'created',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cancellation_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_id UUID REFERENCES turfs(id) ON DELETE CASCADE,
  hours_before INT NOT NULL,
  refund_percent INT NOT NULL CHECK (refund_percent BETWEEN 0 AND 100)
);

CREATE INDEX idx_slots_turf_sport_date ON slots(turf_sport_id, date, status);
CREATE INDEX idx_slots_lock_expires ON slots(lock_expires_at) WHERE status = 'locked';
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_turfs_location ON turfs(latitude, longitude);