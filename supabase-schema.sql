-- ============================================================
-- Bombo TechOps Suite — Supabase Schema (Full)
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. EQUIPMENT
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  serial_number TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'operational'
    CHECK (status IN ('operational', 'maintenance', 'faulty', 'decommissioned')),
  purchase_date DATE,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MAINTENANCE LOGS (per equipment)
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL DEFAULT 'Routine check',
  description TEXT NOT NULL,
  technician_name TEXT,
  parts_replaced TEXT,
  cost NUMERIC(10,2),
  next_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MAINTENANCE TASKS (Scheduler)
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium'
    CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  frequency TEXT NOT NULL DEFAULT 'One-time',
  due_date DATE,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'done', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  incident_type TEXT NOT NULL DEFAULT 'Equipment failure',
  severity TEXT NOT NULL DEFAULT 'Medium'
    CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  description TEXT,
  affected_equipment TEXT,
  reported_by TEXT,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LOGBOOK
CREATE TABLE IF NOT EXISTS logbook (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  shift TEXT,
  technician TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HELPDESK TICKETS
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Hardware',
  priority TEXT NOT NULL DEFAULT 'Normal'
    CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'pending_parts', 'resolved', 'closed')),
  requester_name TEXT,
  department TEXT,
  description TEXT,
  assigned_to TEXT,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. OUTAGES
CREATE TABLE IF NOT EXISTS outages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  outage_type TEXT NOT NULL DEFAULT 'Transmitter',
  cause TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'restored')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  restored_at TIMESTAMPTZ,
  description TEXT,
  action_taken TEXT,
  reported_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON equipment;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON maintenance_tasks;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON incidents;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON helpdesk_tickets;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON helpdesk_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE outages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_equipment" ON equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_equipment" ON equipment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_equipment" ON equipment FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_equipment" ON equipment FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select_logs" ON maintenance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_logs" ON maintenance_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_delete_logs" ON maintenance_logs FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select_tasks" ON maintenance_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_tasks" ON maintenance_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_tasks" ON maintenance_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_tasks" ON maintenance_tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select_incidents" ON incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_incidents" ON incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_incidents" ON incidents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_incidents" ON incidents FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select_logbook" ON logbook FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_logbook" ON logbook FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_logbook" ON logbook FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_logbook" ON logbook FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select_helpdesk" ON helpdesk_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_helpdesk" ON helpdesk_tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_helpdesk" ON helpdesk_tickets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_helpdesk" ON helpdesk_tickets FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth_select_outages" ON outages FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_outages" ON outages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_outages" ON outages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_outages" ON outages FOR DELETE TO authenticated USING (true);
