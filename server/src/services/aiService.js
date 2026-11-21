/**
 * AI Investigation Service — Module 7: AI Investigation Assistant
 * Owner: Manaswi
 *
 * Uses Google Gemini API to generate evidence-grounded investigation summaries.
 * The LLM receives ONLY structured findings. It does NOT make fraud verdicts.
 */

let GoogleGenerativeAI;
let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured. Add it to your .env file.');
    if (!GoogleGenerativeAI) {
      try { ({ GoogleGenerativeAI } = require('@google/generative-ai')); }
      catch (e) { throw new Error('Install @google/generative-ai: npm install @google/generative-ai'); }
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const buildPrompt = (claim, riskAssessment, documents) => {
  const docList = documents.map(d =>
    `- ${d.documentType.replace(/_/g, ' ')} (${d.processingStatus}): ${d.originalName}`
  ).join('\n');

  const triggeredRulesList = (riskAssessment.triggeredRules || [])
    .filter(r => r.triggered)
    .map(r => `  Rule: ${r.ruleName} (weight: ${r.weight}/100)\n  Evidence: ${r.evidence.explanation}\n  Recommended: ${r.recommendedAction}`)
    .join('\n\n');

  const validationList = (riskAssessment.validationResults || [])
    .map(v => `  [${v.status.toUpperCase()}] ${v.checkName}: ${v.details}`)
    .join('\n');

  return `You are an insurance claims investigation assistant for ClaimShield AI.

Your role is to write a structured investigation summary for a claims officer.
You must ONLY use the information provided below. Do NOT invent or assume facts.
You must NOT conclude whether fraud has occurred. Do NOT approve or reject the claim.

--- CLAIM INFORMATION ---
Claim Number: ${claim.claimNumber}
Claimant Name: ${claim.claimantName}
Policy Number: ${claim.policyNumber}
Vehicle Registration: ${claim.vehicleRegistration}
Accident Date: ${new Date(claim.accidentDate).toLocaleDateString('en-IN')}
Claimed Amount: Rs. ${claim.claimedAmount.toLocaleString()}
Current Status: ${claim.status}

--- UPLOADED DOCUMENTS ---
${docList || 'No documents listed.'}

--- RISK ASSESSMENT ---
Risk Score: ${riskAssessment.score}/100
Risk Category: ${riskAssessment.category.replace(/_/g, ' ').toUpperCase()}
Checks: ${riskAssessment.summary?.totalChecks || 0} total | ${riskAssessment.summary?.passedChecks || 0} passed | ${riskAssessment.summary?.failedChecks || 0} failed | ${riskAssessment.summary?.warningChecks || 0} warnings

--- TRIGGERED RISK RULES ---
${triggeredRulesList || 'No rules triggered. No significant risk indicators detected.'}

--- ALL VALIDATION RESULTS ---
${validationList || 'No validation results available.'}

--- INSTRUCTIONS ---
Write a professional investigation summary with exactly these sections:

1. CLAIM SUMMARY
2. SYSTEM FLAGS EXPLAINED
3. EVIDENCE-BASED OBSERVATIONS
4. MISSING OR UNVERIFIABLE INFORMATION
5. SUGGESTED VERIFICATION STEPS
6. INVESTIGATION PRIORITY (one of: ROUTINE / STANDARD / ELEVATED / URGENT)
7. DISCLAIMER

Use clear, professional language. Keep each section concise. Do not add extra sections.`;
};

const parseSections = (text) => {
  const sections = { claimSummary: null, flagsExplained: null, evidenceObservations: null, missingInformation: null, verificationSteps: null, investigationPriority: null, disclaimer: null };
  const extract = (start, end) => { const r = end ? new RegExp(`${start}[\\s\\S]*?(?=${end}|$)`, 'i') : new RegExp(`${start}[\\s\\S]*$`, 'i'); const m = text.match(r); return m ? m[0].replace(new RegExp(start, 'i'), '').replace(/^\s*\n/, '').trim() : null; };
  sections.claimSummary = extract('1\\.\\s*CLAIM SUMMARY', '2\\.');
  sections.flagsExplained = extract('2\\.\\s*SYSTEM FLAGS EXPLAINED', '3\\.');
  sections.evidenceObservations = extract('3\\.\\s*EVIDENCE-BASED OBSERVATIONS', '4\\.');
  sections.missingInformation = extract('4\\.\\s*MISSING OR UNVERIFIABLE INFORMATION', '5\\.');
  sections.verificationSteps = extract('5\\.\\s*SUGGESTED VERIFICATION STEPS', '6\\.');
  const pMatch = text.match(/6\.\s*INVESTIGATION PRIORITY[\s\S]*?(ROUTINE|STANDARD|ELEVATED|URGENT)/i);
  if (pMatch) sections.investigationPriority = pMatch[1].toLowerCase();
  sections.disclaimer = extract('7\\.\\s*DISCLAIMER', null);
  return sections;
};

const generateInvestigationReport = async (claim, riskAssessment, documents) => {
  const prompt = buildPrompt(claim, riskAssessment, documents);
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  try {
    const client = getClient();
    const geminiModel = client.getGenerativeModel({ model });
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    return { generatedBy: `Google ${model}`, reportSections: parseSections(responseText), fullReportText: responseText, promptSnapshot: prompt, status: 'generated', generatedAt: new Date() };
  } catch (err) {
    console.error('Gemini API error:', err.message);
    const fallback = (riskAssessment.triggeredRules || []).map(r => `${r.ruleName}: ${r.evidence.explanation}`).join('\n') || 'No risk flags triggered.';
    return {
      generatedBy: 'ClaimShield Fallback (Gemini unavailable)',
      reportSections: {
        claimSummary: `Claim ${claim.claimNumber} by ${claim.claimantName}. Risk score: ${riskAssessment.score}/100 (${riskAssessment.category}).`,
        flagsExplained: fallback,
        evidenceObservations: 'See triggered rules for specific evidence.',
        missingInformation: 'AI summary unavailable. Manual review required.',
        verificationSteps: (riskAssessment.triggeredRules || []).map(r => r.recommendedAction).join('\n') || 'Standard verification procedures apply.',
        investigationPriority: riskAssessment.score >= 75 ? 'urgent' : riskAssessment.score >= 50 ? 'elevated' : 'standard',
        disclaimer: 'This is a decision-support summary only. All final decisions require qualified claims officer review.'
      },
      fullReportText: `ClaimShield AI — Investigation Summary\nClaim: ${claim.claimNumber} | Score: ${riskAssessment.score}/100\n\n${fallback}\n\nNote: Gemini API unavailable. Configure GEMINI_API_KEY in .env for full AI summaries.`,
      status: 'generated',
      error: err.message,
      generatedAt: new Date()
    };
  }
};

module.exports = { generateInvestigationReport };
