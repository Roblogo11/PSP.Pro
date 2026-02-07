-- Prevent duplicate bookings for the same Stripe checkout session.
-- Protects against race condition where webhook and verify endpoint
-- both try to create a booking simultaneously.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_checkout_session
ON bookings(stripe_checkout_session_id)
WHERE stripe_checkout_session_id IS NOT NULL;
