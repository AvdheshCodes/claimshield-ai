# ClaimShield AI — API Contracts & Specification

> **Base URL:** `http://localhost:5000/api`  
> **Content-Type:** `application/json` (unless uploading files with `multipart/form-data`)  
> **Authentication:** Bearer Token via `Authorization: Bearer <JWT_TOKEN>`  

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method:** `POST`
- **Path:** `/auth/register`
- **Access:** Public (Applicants only; Admin/Officer seeded or admin-created)
- **Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@demo.com",
  "password": "Demo@123456",
  "role": "applicant"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "673ec123456789abcdef0001",
    "name": "Rahul Sharma",
    "email": "rahul@demo.com",
    "role": "applicant",
    "createdAt": "2026-11-21T06:30:00.000Z"
  }
}
```

### 1.2 Login User
- **Method:** `POST`
- **Path:** `/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "officer@claimshield.demo",
  "password": "Officer@123456"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "673ec123456789abcdef0002",
    "name": "Sarah Officer",
    "email": "officer@claimshield.demo",
    "role": "officer"
  }
}
```

### 1.3 Get Current User Profile
- **Method:** `GET`
- **Path:** `/auth/me`
- **Access:** Authenticated (Any role)
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "673ec123456789abcdef0002",
    "name": "Sarah Officer",
    "email": "officer@claimshield.demo",
    "role": "officer",
    "lastLogin": "2026-11-21T06:35:12.000Z"
  }
}
```

---

## 2. Claims Management Endpoints

### 2.1 Submit New Claim
- **Method:** `POST`
- **Path:** `/claims`
- **Access:** Authenticated (Applicant, Officer, Admin)
- **Request Body:**
```json
{
  "claimantName": "Rahul Sharma",
  "policyNumber": "POL-2024-NORMAL-001",
  "vehicleRegistration": "MH12AB1234",
  "accidentDate": "2024-10-15T00:00:00.000Z",
  "accidentDescription": "Collision with road divider causing front axle and bumper damage.",
  "claimedAmount": 45000,
  "contactPhone": "9876543210",
  "contactEmail": "rahul@demo.com"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Claim created.",
  "claim": {
    "_id": "673ec987654321fedcba0001",
    "claimNumber": "CS-2026-00001",
    "applicant": "673ec123456789abcdef0001",
    "claimantName": "Rahul Sharma",
    "policyNumber": "POL-2024-NORMAL-001",
    "vehicleRegistration": "MH12AB1234",
    "accidentDate": "2024-10-15T00:00:00.000Z",
    "claimedAmount": 45000,
    "status": "submitted",
    "validationStatus": "pending",
    "riskScore": null,
    "riskCategory": null,
    "createdAt": "2026-11-21T06:40:00.000Z"
  }
}
```

### 2.2 List Claims
- **Method:** `GET`
- **Path:** `/claims?page=1&limit=15&status=under_review&search=MH12`
- **Access:** Authenticated (Applicants see own; Officers/Admins see all)
- **Response (200 OK):**
```json
{
  "success": true,
  "claims": [ ... ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 15,
    "pages": 1
  }
}
```

### 2.3 Get Claim By ID
- **Method:** `GET`
- **Path:** `/claims/:id`
- **Access:** Authenticated (Owner applicant or Officer/Admin)
- **Response (200 OK):** Returns claim details, populated documents, risk assessment (if computed), and investigation report (if generated).

### 2.4 Update Claim Status
- **Method:** `PATCH`
- **Path:** `/claims/:id/status`
- **Access:** Officer, Admin
- **Request Body:**
```json
{
  "status": "approved",
  "notes": "All documents verified against insurer records. Claim within permissible policy limit."
}
```
- **Response (200 OK):** Updated claim object with status confirmation.

---

## 3. Intelligence & Risk Assessment Endpoints

### 3.1 Validate Claim Documents
- **Method:** `POST`
- **Path:** `/claims/:id/validate`
- **Access:** Officer, Admin
- **Response (200 OK):**
```json
{
  "success": true,
  "validationResults": [
    {
      "checkName": "Policy Number Consistency",
      "status": "pass",
      "details": "Policy numbers consistent across all documents.",
      "affectedDocuments": []
    },
    {
      "checkName": "Vehicle Registration Consistency",
      "status": "fail",
      "details": "Vehicle registration differs: DL05MN5678 vs DL05MN9999. Submitted: DL05MN5678",
      "affectedDocuments": ["repair_invoice", "claim_form"]
    }
  ],
  "duplicates": {
    "fileHashMatches": [],
    "invoiceNumberMatches": [
      {
        "invoiceNumber": "INV-REPAIR-999",
        "foundInDocumentId": "673eca...",
        "previousClaimId": "673ecb...",
        "previousClaimNumber": "CS-2026-00004"
      }
    ]
  }
}
```

### 3.2 Compute Risk Assessment
- **Method:** `POST`
- **Path:** `/claims/:id/assess-risk`
- **Access:** Officer, Admin
- **Response (200 OK):**
```json
{
  "success": true,
  "riskAssessment": {
    "score": 80,
    "category": "high_priority",
    "triggeredRules": [
      {
        "ruleId": "DUPLICATE_INVOICE",
        "ruleName": "Duplicate Invoice Number",
        "weight": 35,
        "triggered": true,
        "evidence": {
          "expected": "Unique invoice number",
          "found": "INV-REPAIR-999",
          "sourceDocuments": ["repair_invoice"],
          "explanation": "Invoice number(s) previously appeared in claim: CS-2026-00004."
        },
        "recommendedAction": "Obtain original invoice directly from repair workshop."
      }
    ],
    "summary": {
      "totalChecks": 7,
      "passedChecks": 4,
      "failedChecks": 3,
      "warningChecks": 0,
      "criticalFindings": ["Duplicate Invoice Number", "Vehicle Registration Mismatch"]
    }
  }
}
```

### 3.3 Generate AI Investigation Summary
- **Method:** `POST`
- **Path:** `/claims/:id/generate-report`
- **Access:** Officer, Admin
- **Response (200 OK):**
```json
{
  "success": true,
  "investigationReport": {
    "generatedBy": "Google gemini-1.5-flash",
    "reportSections": {
      "claimSummary": "Claim CS-2026-00002 filed by Priya Verma for vehicle damage amounting to ₹95,000.",
      "flagsExplained": "1. Duplicate Invoice: Invoice INV-REPAIR-999 was previously submitted in claim CS-2026-00004...",
      "evidenceObservations": "Invoice date post-dates the reported incident by 3 weeks; vehicle registration in repair bill does not match policy schedule.",
      "missingInformation": "Police FIR report has not been submitted.",
      "verificationSteps": "1. Contact garage owner to verify invoice authenticity.\n2. Request RTO registration certificate.",
      "investigationPriority": "urgent",
      "disclaimer": "This summary is an AI-generated decision-support aid. All final adjudications require authorized officer approval."
    },
    "status": "generated"
  }
}
```

---

## 4. Document Endpoints

### 4.1 Upload Document
- **Method:** `POST`
- **Path:** `/claims/:claimId/documents`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Fields:**
  - `document`: File binary (PDF, JPG, PNG; max 10MB)
  - `documentType`: `policy` | `claim_form` | `repair_invoice` | `accident_report` | `supporting_evidence`
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Document uploaded.",
  "document": {
    "_id": "673ecd11111111abcdef0001",
    "claim": "673ec987654321fedcba0001",
    "documentType": "repair_invoice",
    "originalName": "Invoice_AutoFix_2024.pdf",
    "fileSize": 142850,
    "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "processingStatus": "pending"
  }
}
```

### 4.2 Process Document (Run OCR)
- **Method:** `POST`
- **Path:** `/documents/:id/process`
- **Access:** Officer, Admin
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Document processed.",
  "document": {
    "_id": "673ecd11111111abcdef0001",
    "processingStatus": "completed",
    "extractedFields": {
      "policyNumber": "POL-2024-NORMAL-001",
      "vehicleRegistration": "MH12AB1234",
      "invoiceNumber": "INV-REPAIR-001",
      "invoiceAmount": 45000,
      "accidentDate": "15/10/2024",
      "invoiceDate": "18/10/2024"
    },
    "extractionConfidence": 0.85
  }
}
```

---

## 5. Dashboard & Analytics Endpoints

### 5.1 Dashboard Summary Metrics
- **Method:** `GET`
- **Path:** `/dashboard/summary`
- **Access:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "summary": {
    "total": 12,
    "pending": 4,
    "underReview": 5,
    "highPriority": 2,
    "approved": 4,
    "rejected": 1,
    "investigation": 2,
    "infoRequired": 1
  },
  "recent": [ ... ]
}
```

### 5.2 Risk Score Distribution
- **Method:** `GET`
- **Path:** `/dashboard/risk-distribution`
- **Access:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "distribution": [
    { "category": "low", "label": "Low Risk", "count": 5, "avgScore": 14, "color": "#22c55e" },
    { "category": "standard", "label": "Standard Review", "count": 3, "avgScore": 36, "color": "#eab308" },
    { "category": "enhanced", "label": "Enhanced Review", "count": 2, "avgScore": 62, "color": "#f97316" },
    { "category": "high_priority", "label": "High Priority", "count": 2, "avgScore": 88, "color": "#ef4444" }
  ]
}
```
