from typing import List, Dict, Any, Tuple
from decimal import Decimal

# Rule weighting configuration matching PRD Section Module 4
RULE_WEIGHTS = {
    "RULE-001": {"name": "Claimed Amount Differs Significantly from Expected/Invoice Range", "points": 20, "severity": "HIGH"},
    "RULE-002": {"name": "Accident Date Conflicts with Supporting Documents", "points": 15, "severity": "HIGH"},
    "RULE-003": {"name": "Duplicate Invoice Number Detected", "points": 35, "severity": "CRITICAL"},
    "RULE-004": {"name": "Repeated Document Submitted Across Different Claims", "points": 30, "severity": "CRITICAL"},
    "RULE-005": {"name": "Multiple Claims Share Contact or Account Identifier", "points": 25, "severity": "HIGH"},
    "RULE-006": {"name": "Invoice Line Items Do Not Match Total Amount", "points": 15, "severity": "MEDIUM"},
    "RULE-007": {"name": "Policy Dates Conflict with Claimed Incident Timeline", "points": 25, "severity": "HIGH"},
    "RULE-008": {"name": "Potentially Manipulated Document Regions Detected", "points": 20, "severity": "HIGH"},
    "RULE-009": {"name": "Repeated Unusual Relationships Between Claims & Service Providers", "points": 20, "severity": "HIGH"},
    "RULE-010": {"name": "Inconsistent Vehicle or Customer Identifiers", "points": 20, "severity": "HIGH"}
}

def determine_risk_band(score: int) -> str:
    if score < 30:
        return "LOW"
    elif score < 60:
        return "MEDIUM"
    elif score < 80:
        return "HIGH"
    return "VERY_HIGH"

class ExplainableFraudEngine:
    @classmethod
    def evaluate(
        cls,
        claim_data: Dict[str, Any],
        extracted_docs: List[Dict[str, Any]],
        historical_duplicates: Dict[str, Any]
    ) -> Tuple[int, str, List[Dict[str, Any]]]:
        """
        Deterministic, explainable evaluation of claim indicators.
        Returns: (risk_score, risk_band, list_of_fraud_findings)
        """
        findings = []
        total_points = 0

        # Check 1: Duplicate Invoice (RULE-003)
        recycled_invoices = historical_duplicates.get("recycled_invoices", [])
        if recycled_invoices:
            rule = RULE_WEIGHTS["RULE-003"]
            total_points += rule["points"]
            findings.append({
                "rule_id": "RULE-003",
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "points": rule["points"],
                "observation": f"Invoice number '{recycled_invoices[0]['invoice_number']}' previously submitted in prior claim '{recycled_invoices[0]['matched_claim']}'.",
                "evidence_document_id": recycled_invoices[0].get("doc_id"),
                "evidence_page_number": 1,
                "evidence_snippet": f"Invoice #{recycled_invoices[0]['invoice_number']}",
                "potential_alternative_explanation": "Billing software generated duplicate sequential sequence or invoice resubmitted after correction.",
                "recommended_action": "Independently contact garage/hospital billing office to verify ledger."
            })

        # Check 2: Vehicle Registration Mismatch (RULE-010)
        submitted_reg = (claim_data.get("vehicle_registration") or "").replace(" ", "").upper()
        if submitted_reg:
            for doc in extracted_docs:
                doc_reg = (doc.get("extracted_metadata", {}).get("vehicleRegistration") or "").replace(" ", "").upper()
                if doc_reg and doc_reg != submitted_reg:
                    rule = RULE_WEIGHTS["RULE-010"]
                    total_points += rule["points"]
                    findings.append({
                        "rule_id": "RULE-010",
                        "rule_name": rule["name"],
                        "severity": rule["severity"],
                        "points": rule["points"],
                        "observation": f"Vehicle registration in {doc.get('document_type')} is '{doc_reg}', which conflicts with submitted registration '{submitted_reg}'.",
                        "evidence_document_id": doc.get("id"),
                        "evidence_page_number": 1,
                        "evidence_snippet": f"Registration No: {doc_reg}",
                        "potential_alternative_explanation": "Typographical error by service provider clerk during invoice generation.",
                        "recommended_action": "Cross-check vehicle RC book with RTO portal."
                    })
                    break

        # Check 3: Conflicting Dates (RULE-002)
        claim_incident_date = str(claim_data.get("incident_date", ""))[:10]
        for doc in extracted_docs:
            reported_date = doc.get("extracted_metadata", {}).get("accidentDate")
            if reported_date and claim_incident_date and reported_date != claim_incident_date:
                rule = RULE_WEIGHTS["RULE-002"]
                total_points += rule["points"]
                findings.append({
                    "rule_id": "RULE-002",
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "points": rule["points"],
                    "observation": f"Document {doc.get('document_type')} reports accident date '{reported_date}', differing from claimed incident date '{claim_incident_date}'.",
                    "evidence_document_id": doc.get("id"),
                    "evidence_page_number": 1,
                    "evidence_snippet": f"Date of incident: {reported_date}",
                    "potential_alternative_explanation": "Claimant may have noted hospital admission date rather than initial trauma date.",
                    "recommended_action": "Request police GD diary or verified ambulance trip log."
                })
                break

        # Check 4: Amount Discrepancy (RULE-001)
        claimed_amt = float(claim_data.get("claimed_amount") or 0)
        for doc in extracted_docs:
            inv_amt = float(doc.get("extracted_metadata", {}).get("invoiceAmount") or 0)
            if inv_amt > 0:
                diff_pct = abs(claimed_amt - inv_amt) / inv_amt * 100
                if diff_pct > 20:
                    rule = RULE_WEIGHTS["RULE-001"]
                    total_points += rule["points"]
                    findings.append({
                        "rule_id": "RULE-001",
                        "rule_name": rule["name"],
                        "severity": rule["severity"],
                        "points": rule["points"],
                        "observation": f"Claimed amount (INR {claimed_amt:,.2f}) differs significantly from invoice total (INR {inv_amt:,.2f}) by {diff_pct:.1f}%.",
                        "evidence_document_id": doc.get("id"),
                        "evidence_page_number": 1,
                        "evidence_snippet": f"Total Invoice: INR {inv_amt:,.2f}",
                        "potential_alternative_explanation": "Claimant included secondary towing or incidental costs not reflected in workshop bill.",
                        "recommended_action": "Request itemized summary of all ancillary expenses."
                    })
                    break

        # Check 5: Document Manipulation Indicators (RULE-008)
        for doc in extracted_docs:
            if doc.get("has_tampering_indicators"):
                rule = RULE_WEIGHTS["RULE-008"]
                total_points += rule["points"]
                findings.append({
                    "rule_id": "RULE-008",
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "points": rule["points"],
                    "observation": f"Potential visual manipulation or uneven compression detected in {doc.get('original_filename')}.",
                    "evidence_document_id": doc.get("id"),
                    "evidence_page_number": 1,
                    "evidence_snippet": "Error Level Analysis variance anomaly detected.",
                    "potential_alternative_explanation": "Document was rescanned, cropped, or converted through multiple compression steps.",
                    "recommended_action": "Request high-resolution original digital PDF or hardcopy inspection."
                })
                break

        # Cap score at 100
        risk_score = min(100, total_points)
        risk_band = determine_risk_band(risk_score)

        return risk_score, risk_band, findings
