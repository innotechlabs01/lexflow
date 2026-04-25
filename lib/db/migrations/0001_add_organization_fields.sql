-- =============================================
-- Add business/organizational fields to organizations table
-- =============================================

-- Add industry field
ALTER TABLE organizations ADD COLUMN industry TEXT;

-- Add employeeCount field
ALTER TABLE organizations ADD COLUMN employee_count INTEGER;

-- Add address field
ALTER TABLE organizations ADD COLUMN address TEXT;

-- Add city field
ALTER TABLE organizations ADD COLUMN city TEXT;

-- Add country field
ALTER TABLE organizations ADD COLUMN country TEXT;

-- Add contactEmail field
ALTER TABLE organizations ADD COLUMN contact_email TEXT;

-- Add contactPhone field
ALTER TABLE organizations ADD COLUMN contact_phone TEXT;

-- Add website field
ALTER TABLE organizations ADD COLUMN website TEXT;

-- =============================================
-- Indexes for better performance on new fields
-- =============================================

CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry);
CREATE INDEX IF NOT EXISTS idx_organizations_country ON organizations(country);
CREATE INDEX IF NOT EXISTS idx_organizations_status_plan ON organizations(status, plan);