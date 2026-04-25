-- =============================================
-- LexFlow Database Schema for Turso/LibSQL
-- =============================================

-- Organizations (Bufetes)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'trial')),
  logo_url TEXT,
  settings TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK(plan IN ('free', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
  started_at INTEGER,
  expires_at INTEGER,
  max_lawyers INTEGER DEFAULT 1,
  max_clients INTEGER DEFAULT 10,
  max_cases INTEGER DEFAULT 20,
  max_storage_gb INTEGER DEFAULT 1,
  features TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  clerk_id TEXT NOT NULL UNIQUE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'lawyer', 'client')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending')),
  last_login_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Lawyers (Perfil profesional)
CREATE TABLE IF NOT EXISTS lawyers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_number TEXT,
  specialty TEXT,
  bar_association TEXT,
  experience_years INTEGER,
  bio TEXT,
  signature_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_type TEXT CHECK(document_type IN ('CC', 'CE', 'NIT', 'PASSPORT', 'OTHER')),
  document_number TEXT,
  address TEXT,
  city TEXT,
  department TEXT,
  occupation TEXT,
  referred_by TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Cases
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  lawyer_id TEXT REFERENCES lawyers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  case_number TEXT UNIQUE,
  internal_code TEXT,
  court TEXT,
  judge TEXT,
  case_type TEXT CHECK(case_type IN ('labor', 'civil', 'criminal', 'family', 'administrative', 'constitutional', 'commercial', 'property', 'tax', 'other')),
  case_subtype TEXT,
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'hearing', 'appeal', 'closed', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  amount_in_dispute REAL,
  currency TEXT DEFAULT 'COP',
  description TEXT,
  observations TEXT,
  opened_at INTEGER,
  expected_closing_date INTEGER,
  closed_at INTEGER,
  closing_reason TEXT,
  tags TEXT DEFAULT '[]',
  radicado TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Case Events (Timeline)
CREATE TABLE IF NOT EXISTS case_events (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('procedural', 'document', 'hearing', 'communication', 'internal_note', 'status_change', 'task', 'notification', 'external_sync')),
  event_category TEXT,
  title TEXT NOT NULL,
  description TEXT,
  event_date INTEGER NOT NULL,
  visibility TEXT DEFAULT 'internal' CHECK(visibility IN ('internal', 'client_visible', 'public')),
  metadata TEXT DEFAULT '{}',
  source TEXT DEFAULT 'manual' CHECK(source IN ('manual', 'rama_judicial', 'automation', 'client')),
  is_automated INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Hearings
CREATE TABLE IF NOT EXISTS hearings (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  hearing_type TEXT CHECK(hearing_type IN ('initial', 'preliminary', 'instruction', 'trial', 'appeal', 'revision', 'follow_up', 'conciliation', 'other')),
  court TEXT,
  courtroom TEXT,
  judge_name TEXT,
  hearing_date INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  virtual_link TEXT,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'postponed', 'cancelled', 'completed', 'rescheduled')),
  notes TEXT,
  observations TEXT,
  outcome TEXT,
  next_hearing_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  original_name TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT CHECK(document_type IN ('contract', 'petition', 'evidence', 'motion', 'ruling', 'correspondence', 'power_of_attorney', 'id_document', 'proof_of_address', 'financial_statement', 'other')),
  tags TEXT DEFAULT '[]',
  description TEXT,
  is_confidential INTEGER DEFAULT 0,
  expires_at INTEGER,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  lawyer_id TEXT REFERENCES lawyers(id) ON DELETE SET NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK(task_type IN ('research', 'document', 'court_filing', 'client_meeting', 'hearing_prep', 'deadline', 'follow_up', 'internal', 'other')),
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled', 'blocked')),
  due_date INTEGER,
  completed_at INTEGER,
  time_estimated_minutes INTEGER,
  time_spent_minutes INTEGER,
  reminders TEXT DEFAULT '[]',
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('case_update', 'hearing_reminder', 'task_assigned', 'document_shared', 'status_change', 'message_received', 'system', 'payment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT DEFAULT '{}',
  channel TEXT CHECK(channel IN ('in_app', 'email', 'whatsapp', 'sms')),
  status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'archived')),
  sent_at INTEGER,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);

-- Rama Judicial Sync Log
CREATE TABLE IF NOT EXISTS rama_sync_log (
  id TEXT PRIMARY KEY,
  case_id TEXT REFERENCES cases(id) ON DELETE CASCADE,
  radicado TEXT,
  id_proceso TEXT,
  id_rama_api TEXT,
  last_sync_at INTEGER,
  sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('success', 'error', 'pending')),
  error_message TEXT,
  records_synced INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- =============================================
-- Indexes para mejor rendimiento
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_organization ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_cases_organization ON cases(organization_id);
CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_case_events_case ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_hearings_case ON hearings(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_case ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization ON memberships(organization_id);
