-- InsureGuard AI — PostgreSQL 16 + pgvector Database Schema
-- Version: 2.0 (PRD Aligned)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'INVESTIGATOR', 'CUSTOMER');
CREATE TYPE claim_category AS ENUM ('MOTOR', 'HEALTH', 'PROPERTY');
CREATE TYPE claim_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'PROCESSING',
    'DOCUMENT_VERIFICATION',
    'ADDITIONAL_INFORMATION_REQUIRED',
    'UNDER_INVESTIGATION',
    'HUMAN_REVIEW',
    'APPROVED',
    'REJECTED',
    'CLOSED'
);
CREATE TYPE case_status AS ENUM (
    'OPEN',
    'ASSIGNED',
    'IN_PROGRESS',
    'PENDING_INFORMATION',
    'PENDING_REVIEW',
    'RESOLVED',
    'CLOSED'
);
CREATE TYPE risk_band AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category claim_category NOT NULL,
    insurer_name VARCHAR(200) NOT NULL,
    coverage_limit NUMERIC(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES policies(id),
    category claim_category NOT NULL,
    status claim_status NOT NULL DEFAULT 'SUBMITTED',
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_description TEXT NOT NULL,
    incident_location VARCHAR(255),
    claimed_amount NUMERIC(12, 2) NOT NULL,
    approved_amount NUMERIC(12, 2),
    
    -- Metadata & Extracted Identifiers
    vehicle_registration VARCHAR(50),
    hospital_name VARCHAR(200),
    garage_name VARCHAR(200),
    treating_doctor VARCHAR(150),
    
    -- Risk Engine Outputs
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_band risk_band,
    assigned_investigator_id UUID REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    document_type VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    
    -- OCR Extraction
    ocr_status VARCHAR(50) DEFAULT 'PENDING',
    raw_extracted_text TEXT,
    extracted_metadata JSONB,
    extraction_confidence NUMERIC(4, 2),
    
    -- Document Forensics
    has_tampering_indicators BOOLEAN DEFAULT FALSE,
    forensic_details JSONB,
    
    -- Semantic Vector for RAG Copilot (e.g. 1536 dims or 768 dims)
    embedding vector(768),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Fraud Findings ("WHY SUSPICIOUS?") Table
CREATE TABLE IF NOT EXISTS fraud_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    rule_id VARCHAR(50) NOT NULL,
    rule_name VARCHAR(200) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    points INTEGER NOT NULL,
    
    observation TEXT NOT NULL,
    evidence_document_id UUID REFERENCES documents(id),
    evidence_page_number INTEGER,
    evidence_snippet TEXT,
    
    potential_alternative_explanation TEXT,
    recommended_action TEXT,
    investigator_feedback VARCHAR(50) DEFAULT 'UNRESOLVED', -- VERIFIED, UNRESOLVED, DISMISSED
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Investigation Cases Table
CREATE TABLE IF NOT EXISTS investigation_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(100) UNIQUE NOT NULL,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    assigned_investigator_id UUID REFERENCES users(id),
    status case_status NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    summary TEXT,
    final_decision VARCHAR(50),
    decision_rationale TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Case Notes Table
CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES investigation_cases(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    note_text TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Audit Logs Table (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_claims_customer ON claims(customer_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_risk ON claims(risk_score);
CREATE INDEX IF NOT EXISTS idx_documents_claim ON documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_findings_claim ON fraud_findings(claim_id);
CREATE INDEX IF NOT EXISTS idx_cases_claim ON investigation_cases(claim_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_id);
