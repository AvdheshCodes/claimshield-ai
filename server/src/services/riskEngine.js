/**
 * Risk Engine — Modules 5 & 6: Duplicate Detection + Explainable Risk Assessment
 * Owner: Manaswi
 *
 * Deterministic rule-based engine. Every score is traceable to specific evidence.
 */

const Document = require('../models/Document');

const WEIGHTS = {
  DUPLICATE_INVOICE: parseInt(process.env.RISK_WEIGHT_DUPLICATE_INVOICE) || 35,
  DUPLICATE_FILE: parseInt(process.env.RISK_WEIGHT_DUPLICATE_FILE) || 30,
  POLICY_MISMATCH: parseInt(process.env.RISK_WEIGHT_POLICY_MISMATCH) || 25,
  VEHICLE_MISMATCH: parseInt(process.env.RISK_WEIGHT_VEHICLE_MISMATCH) || 20,
  DATE_CONFLICT: parseInt(process.env.RISK_WEIGHT_DATE_CONFLICT) || 15,
  AMOUNT_ANOMALY: parseInt(process.env.RISK_WEIGHT_AMOUNT_ANOMALY) || 20,
  REPEATED_SUBMISSION: parseInt(process.env.RISK_WEIGHT_REPEATED_SUBMISSION) || 25,
  MISSING_DOCUMENT: parseInt(process.env.RISK_WEIGHT_MISSING_DOCUMENT) || 10
};

const REQUIRED_DOC_TYPES = ['policy', 'claim_form', 'repair_invoice', 'accident_report'];

const getCategory = (score) => {
  if (score <= 24) return 'low';
  if (score <= 49) return 'standard';
  if (score <= 74) return 'enhanced';
  return 'high_priority';
};

const checkDuplicateFiles = async (documents, currentClaimId) => {
  const matches = [];
  for (const doc of documents) {
    const duplicate = await Document.findOne({
      fileHash: doc.fileHash,
      _id: { $ne: doc._id },
      claim: { $ne: currentClaimId }
    }).populate('claim', 'claimNumber');
    if (duplicate) {
      matches.push({
        documentId: doc._id,
        matchedDocumentId: duplicate._id,
        matchedClaimId: duplicate.claim?._id,
        matchedClaimNumber: duplicate.claim?.claimNumber,
        hash: doc.fileHash,
        currentDocType: doc.documentType,
        originalName: doc.originalName
      });
    }
  }
  return matches;
};

const checkDuplicateInvoices = async (documents, currentClaimId) => {
  const matches = [];
  const invoiceDocs = documents.filter(d => d.documentType === 'repair_invoice' && d.extractedFields?.invoiceNumber);
  for (const doc of invoiceDocs) {
    const invoiceNum = doc.extractedFields.invoiceNumber;
    const duplicate = await Document.findOne({
      'extractedFields.invoiceNumber': invoiceNum,
      _id: { $ne: doc._id },
      claim: { $ne: currentClaimId }
    }).populate('claim', 'claimNumber');
    if (duplicate) {
      matches.push({
        invoiceNumber: invoiceNum,
        foundInDocumentId: doc._id,
        previousClaimId: duplicate.claim?._id,
        previousClaimNumber: duplicate.claim?.claimNumber
      });
    }
  }
  return matches;
};

const runValidationChecks = (claim, documents) => {
  const results = [];
  const processed = documents.filter(d => d.processingStatus === 'completed');

  const getFieldValues = (fieldName) =>
    processed
      .filter(d => d.extractedFields?.[fieldName])
      .map(d => ({ value: d.extractedFields[fieldName], source: d.documentType }));

  // Check 1: Policy number consistency
  const policyValues = getFieldValues('policyNumber');
  if (policyValues.length >= 2) {
    const unique = [...new Set(policyValues.map(v => v.value.toUpperCase()))];
    if (unique.length > 1) {
      results.push({ checkName: 'Policy Number Consistency', status: 'fail', details: `Policy number differs across documents: ${unique.join(' vs ')}. Submitted: "${claim.policyNumber}".`, affectedDocuments: policyValues.map(v => v.source) });
    } else if (unique[0] !== claim.policyNumber.toUpperCase()) {
      results.push({ checkName: 'Policy Number vs Submission', status: 'fail', details: `Policy number in documents ("${unique[0]}") does not match submitted policy number ("${claim.policyNumber}").`, affectedDocuments: policyValues.map(v => v.source) });
    } else {
      results.push({ checkName: 'Policy Number Consistency', status: 'pass', details: 'Policy numbers consistent across all documents.', affectedDocuments: [] });
    }
  } else if (processed.length > 0) {
    results.push({ checkName: 'Policy Number Consistency', status: 'warning', details: 'Policy number not extracted from documents. Manual verification required.', affectedDocuments: [] });
  }

  // Check 2: Vehicle registration consistency
  const regValues = getFieldValues('vehicleRegistration');
  if (regValues.length >= 2) {
    const unique = [...new Set(regValues.map(v => v.value.replace(/[\s-]/g, '').toUpperCase()))];
    if (unique.length > 1) {
      results.push({ checkName: 'Vehicle Registration Consistency', status: 'fail', details: `Vehicle registration differs: ${unique.join(' vs ')}. Submitted: "${claim.vehicleRegistration}".`, affectedDocuments: regValues.map(v => v.source) });
    } else {
      const submittedReg = claim.vehicleRegistration.replace(/[\s-]/g, '').toUpperCase();
      if (unique[0] !== submittedReg) {
        results.push({ checkName: 'Vehicle Registration vs Submission', status: 'fail', details: `Vehicle registration in documents ("${unique[0]}") does not match submitted ("${submittedReg}").`, affectedDocuments: regValues.map(v => v.source) });
      } else {
        results.push({ checkName: 'Vehicle Registration Consistency', status: 'pass', details: 'Vehicle registration consistent across documents.', affectedDocuments: [] });
      }
    }
  }

  // Check 3: Policyholder name
  const nameValues = getFieldValues('policyholderName');
  if (nameValues.length >= 2) {
    const normalize = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
    const unique = [...new Set(nameValues.map(v => normalize(v.value)))];
    if (unique.length > 1) {
      results.push({ checkName: 'Policyholder Name Consistency', status: 'fail', details: `Policyholder name differs: ${nameValues.map(v => `"${v.value}" (${v.source})`).join(', ')}`, affectedDocuments: nameValues.map(v => v.source) });
    } else {
      results.push({ checkName: 'Policyholder Name Consistency', status: 'pass', details: 'Policyholder name consistent.', affectedDocuments: [] });
    }
  }

  // Check 4: Accident date consistency
  const accidentDates = getFieldValues('accidentDate');
  if (accidentDates.length >= 2) {
    const unique = [...new Set(accidentDates.map(v => v.value))];
    if (unique.length > 1) {
      results.push({ checkName: 'Accident Date Consistency', status: 'fail', details: `Conflicting accident dates across documents: ${unique.join(' vs ')}`, affectedDocuments: accidentDates.map(v => v.source) });
    } else {
      results.push({ checkName: 'Accident Date Consistency', status: 'pass', details: 'Accident dates consistent.', affectedDocuments: [] });
    }
  }

  // Check 5: Claimed amount vs invoice amount
  const invoiceAmounts = getFieldValues('invoiceAmount');
  if (invoiceAmounts.length > 0) {
    const invoiceTotal = invoiceAmounts.reduce((sum, v) => sum + (v.value || 0), 0);
    const diff = Math.abs(claim.claimedAmount - invoiceTotal);
    const percentDiff = invoiceTotal > 0 ? (diff / invoiceTotal) * 100 : 0;
    if (percentDiff > 20) {
      results.push({ checkName: 'Claimed Amount vs Invoice Amount', status: 'fail', details: `Claimed ₹${claim.claimedAmount.toLocaleString()} vs Invoice ₹${invoiceTotal.toLocaleString()} — ${percentDiff.toFixed(1)}% discrepancy.`, affectedDocuments: ['repair_invoice'] });
    } else if (percentDiff > 10) {
      results.push({ checkName: 'Claimed Amount vs Invoice Amount', status: 'warning', details: `Minor discrepancy: Claimed ₹${claim.claimedAmount.toLocaleString()} vs Invoice ₹${invoiceTotal.toLocaleString()} — ${percentDiff.toFixed(1)}%.`, affectedDocuments: ['repair_invoice'] });
    } else {
      results.push({ checkName: 'Claimed Amount vs Invoice Amount', status: 'pass', details: 'Claimed and invoice amounts are consistent.', affectedDocuments: [] });
    }
  }

  // Check 6: Required documents
  const uploadedTypes = documents.map(d => d.documentType);
  const missing = REQUIRED_DOC_TYPES.filter(t => !uploadedTypes.includes(t));
  if (missing.length > 0) {
    results.push({ checkName: 'Required Documents', status: 'fail', details: `Missing required documents: ${missing.map(m => m.replace(/_/g, ' ')).join(', ')}.`, affectedDocuments: [] });
  } else {
    results.push({ checkName: 'Required Documents', status: 'pass', details: 'All required document types are present.', affectedDocuments: [] });
  }

  return results;
};

const validate = async (claim, documents) => {
  const validationResults = runValidationChecks(claim, documents);
  const fileHashMatches = await checkDuplicateFiles(documents, claim._id);
  const invoiceNumberMatches = await checkDuplicateInvoices(documents, claim._id);
  return { validationResults, duplicates: { fileHashMatches, invoiceNumberMatches } };
};

const assessRisk = async (claim, documents) => {
  const validationResults = runValidationChecks(claim, documents);
  const fileHashMatches = await checkDuplicateFiles(documents, claim._id);
  const invoiceNumberMatches = await checkDuplicateInvoices(documents, claim._id);

  const triggeredRules = [];
  let totalScore = 0;

  if (invoiceNumberMatches.length > 0) {
    totalScore += WEIGHTS.DUPLICATE_INVOICE;
    triggeredRules.push({ ruleId: 'DUPLICATE_INVOICE', ruleName: 'Duplicate Invoice Number', weight: WEIGHTS.DUPLICATE_INVOICE, triggered: true, evidence: { expected: 'Unique invoice number', found: invoiceNumberMatches.map(m => m.invoiceNumber).join(', '), sourceDocuments: ['repair_invoice'], explanation: `Invoice number(s) previously appeared in: ${invoiceNumberMatches.map(m => m.previousClaimNumber || 'unknown').join(', ')}.` }, recommendedAction: 'Obtain original invoice directly from repair workshop.' });
  }

  if (fileHashMatches.length > 0) {
    totalScore += WEIGHTS.DUPLICATE_FILE;
    triggeredRules.push({ ruleId: 'DUPLICATE_FILE', ruleName: 'Duplicate Document Submission', weight: WEIGHTS.DUPLICATE_FILE, triggered: true, evidence: { expected: 'Unique documents', found: `${fileHashMatches.length} duplicate file(s)`, sourceDocuments: fileHashMatches.map(m => m.currentDocType), explanation: `Identical file(s) previously submitted in: ${fileHashMatches.map(m => m.matchedClaimNumber || 'unknown').join(', ')}.` }, recommendedAction: 'Request fresh original documents from claimant.' });
  }

  const policyCheck = validationResults.find(c => c.checkName.includes('Policy') && c.status === 'fail');
  if (policyCheck) { totalScore += WEIGHTS.POLICY_MISMATCH; triggeredRules.push({ ruleId: 'POLICY_MISMATCH', ruleName: 'Policy Number Mismatch', weight: WEIGHTS.POLICY_MISMATCH, triggered: true, evidence: { expected: claim.policyNumber, found: policyCheck.details, sourceDocuments: policyCheck.affectedDocuments, explanation: policyCheck.details }, recommendedAction: 'Verify policy number directly with the insurer database.' }); }

  const vehicleCheck = validationResults.find(c => c.checkName.includes('Vehicle') && c.status === 'fail');
  if (vehicleCheck) { totalScore += WEIGHTS.VEHICLE_MISMATCH; triggeredRules.push({ ruleId: 'VEHICLE_MISMATCH', ruleName: 'Vehicle Registration Mismatch', weight: WEIGHTS.VEHICLE_MISMATCH, triggered: true, evidence: { expected: claim.vehicleRegistration, found: vehicleCheck.details, sourceDocuments: vehicleCheck.affectedDocuments, explanation: vehicleCheck.details }, recommendedAction: 'Verify vehicle registration with RTO records. Request RC book.' }); }

  const dateCheck = validationResults.find(c => c.checkName.includes('Date') && c.status === 'fail');
  if (dateCheck) { totalScore += WEIGHTS.DATE_CONFLICT; triggeredRules.push({ ruleId: 'DATE_CONFLICT', ruleName: 'Conflicting Date Information', weight: WEIGHTS.DATE_CONFLICT, triggered: true, evidence: { expected: 'Consistent dates', found: dateCheck.details, sourceDocuments: dateCheck.affectedDocuments, explanation: dateCheck.details }, recommendedAction: 'Request certified copies with verified dates from relevant authorities.' }); }

  const amountCheck = validationResults.find(c => c.checkName.includes('Amount') && c.status === 'fail');
  if (amountCheck) { totalScore += WEIGHTS.AMOUNT_ANOMALY; triggeredRules.push({ ruleId: 'AMOUNT_ANOMALY', ruleName: 'Claimed Amount Discrepancy', weight: WEIGHTS.AMOUNT_ANOMALY, triggered: true, evidence: { expected: `₹${claim.claimedAmount.toLocaleString()}`, found: amountCheck.details, sourceDocuments: ['repair_invoice'], explanation: amountCheck.details }, recommendedAction: 'Commission independent vehicle damage assessment.' }); }

  const docCheck = validationResults.find(c => c.checkName === 'Required Documents' && c.status === 'fail');
  if (docCheck) { totalScore += WEIGHTS.MISSING_DOCUMENT; triggeredRules.push({ ruleId: 'MISSING_DOCUMENT', ruleName: 'Missing Required Documents', weight: WEIGHTS.MISSING_DOCUMENT, triggered: true, evidence: { expected: 'All 4 required documents', found: docCheck.details, sourceDocuments: [], explanation: docCheck.details }, recommendedAction: 'Request missing documents from claimant. Processing cannot complete without all required files.' }); }

  const score = Math.min(100, totalScore);
  const category = getCategory(score);
  const passedChecks = validationResults.filter(c => c.status === 'pass').length;
  const failedChecks = validationResults.filter(c => c.status === 'fail').length;
  const warningChecks = validationResults.filter(c => c.status === 'warning').length;

  return {
    score, category, triggeredRules, validationResults,
    duplicates: { fileHashMatches, invoiceNumberMatches },
    summary: { totalChecks: validationResults.length, passedChecks, failedChecks, warningChecks, criticalFindings: triggeredRules.map(r => r.ruleName) },
    assessedAt: new Date(),
    assessedBy: 'ClaimShield Risk Engine v1.0'
  };
};

module.exports = { validate, assessRisk, getCategory, WEIGHTS };
