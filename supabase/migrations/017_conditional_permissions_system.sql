-- Add master_admin role and action requests system
-- This enables conditional permissions where low-impact actions can be done directly
-- but high-impact actions require master admin approval

-- 1. Add master_admin to role check constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('athlete', 'coach', 'admin', 'master_admin'));

-- 2. Create action_requests table for approval workflow
CREATE TABLE IF NOT EXISTS public.action_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'delete_session',
        'delete_athlete',
        'delete_drill',
        'delete_performance_metric',
        'modify_session',
        'modify_athlete',
        'other'
    )),
    target_id UUID NOT NULL,
    target_table TEXT NOT NULL CHECK (target_table IN (
        'bookings',
        'profiles',
        'drills',
        'athlete_performance_metrics',
        'other'
    )),
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_action_requests_requested_by ON public.action_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_action_requests_status ON public.action_requests(status);
CREATE INDEX IF NOT EXISTS idx_action_requests_target ON public.action_requests(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_action_requests_created_at ON public.action_requests(created_at DESC);

-- 4. Enable RLS on action_requests
ALTER TABLE public.action_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for action_requests

-- Master admins can view all requests
CREATE POLICY "Master admins can view all requests"
ON public.action_requests
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
    )
);

-- Coaches and admins can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.action_requests
FOR SELECT
TO authenticated
USING (requested_by = auth.uid());

-- Coaches and admins can create requests
CREATE POLICY "Coaches and admins can create requests"
ON public.action_requests
FOR INSERT
TO authenticated
WITH CHECK (
    requested_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('coach', 'admin', 'master_admin')
    )
);

-- Only master admins can update requests (approve/deny)
CREATE POLICY "Master admins can update requests"
ON public.action_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'master_admin'
    )
);

-- 6. Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_action_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_action_requests_updated_at
    BEFORE UPDATE ON public.action_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_action_requests_updated_at();

-- 7. Add comments
COMMENT ON TABLE public.action_requests IS 'Stores requests for actions that require master admin approval';
COMMENT ON COLUMN public.action_requests.action_type IS 'Type of action being requested';
COMMENT ON COLUMN public.action_requests.target_id IS 'ID of the resource being acted upon';
COMMENT ON COLUMN public.action_requests.target_table IS 'Table containing the target resource';
COMMENT ON COLUMN public.action_requests.metadata IS 'Additional context about the request (e.g., athlete count, session date)';
COMMENT ON COLUMN public.action_requests.status IS 'Current status: pending, approved, or denied';
