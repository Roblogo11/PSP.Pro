-- ============================================================================
-- Migration 027: Master Admin Simulation Mode
-- Adds tables for tracking simulation sessions and data created during them
-- ============================================================================

-- Simulation sessions — records when a master admin starts/ends a simulation
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  simulated_role TEXT NOT NULL CHECK (simulated_role IN ('athlete', 'coach')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  cleaned_up BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Simulation data log — tracks every record created during a simulation for cleanup
CREATE TABLE IF NOT EXISTS simulation_data_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sim_sessions_admin ON simulation_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sim_data_sim_id ON simulation_data_log(simulation_id);
CREATE INDEX IF NOT EXISTS idx_sim_data_table ON simulation_data_log(table_name);

-- RLS
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_data_log ENABLE ROW LEVEL SECURITY;

-- Allow master admins to manage their own simulation sessions
CREATE POLICY "master_admin_manage_sessions" ON simulation_sessions
  FOR ALL
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

-- Allow master admins to manage their own simulation data logs
CREATE POLICY "master_admin_manage_data_log" ON simulation_data_log
  FOR ALL
  USING (
    simulation_id IN (
      SELECT id FROM simulation_sessions WHERE admin_id = auth.uid()
    )
  )
  WITH CHECK (
    simulation_id IN (
      SELECT id FROM simulation_sessions WHERE admin_id = auth.uid()
    )
  );
