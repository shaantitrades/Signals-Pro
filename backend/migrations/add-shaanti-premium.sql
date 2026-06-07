-- ============================================================================
-- Add Premium User: shaantitrades@gmail.com / Hababa11@
-- Pre-hashed bcrypt password for: Hababa11@
-- ============================================================================

-- Hash: $2b$10$SkOYyOVYABWAmT3Ei./hVO5.2mhAKD3a4sBgrfuiIVgkRDvB6x8lO
-- (bcryptjs, 10 rounds)

-- Insert or update user
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'shaantitrades@gmail.com',
  '$2b$10$SkOYyOVYABWAmT3Ei./hVO5.2mhAKD3a4sBgrfuiIVgkRDvB6x8lO',
  'Shaanti',
  'Trades',
  'ADMIN',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Get the user ID (for reference in subscription creation)
DO $$
DECLARE
  v_user_id UUID;
  v_plan_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE email = 'shaantitrades@gmail.com';
  SELECT id INTO v_plan_id FROM subscription_plans WHERE slug = 'monthly';
  
  IF v_plan_id IS NULL THEN
    RAISE NOTICE 'Monthly plan not found. Please run seed first.';
    RETURN;
  END IF;

  -- Create active subscription (30 days)
  INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    v_plan_id,
    'ACTIVE',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    status = 'ACTIVE',
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = NOW();

  RAISE NOTICE 'Premium user shaantitrades@gmail.com activated successfully';
  RAISE NOTICE 'Subscription valid until: %', NOW() + INTERVAL '30 days';
END $$;