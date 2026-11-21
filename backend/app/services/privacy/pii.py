import re
from typing import Dict, Any

class PIIMasker:
    # Regex patterns for sensitive identifiers
    AADHAAR_PATTERN = re.compile(r'\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b')
    PHONE_PATTERN = re.compile(r'\b(?:\+91[\-\s]?)?[6-9]\d{9}\b')
    EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    BANK_ACCOUNT_PATTERN = re.compile(r'\b\d{9,18}\b')

    @classmethod
    def mask_text(cls, text: str) -> str:
        if not text:
            return ""
        
        # Mask Aadhaar (keep last 4 digits)
        def mask_aadhaar(match):
            digits = re.sub(r'\s', '', match.group(0))
            return f"XXXX-XXXX-{digits[-4:]}"

        # Mask Phone (keep last 3 digits)
        def mask_phone(match):
            phone = match.group(0)
            return f"+91-XXXXX-XX{phone[-3:]}"

        # Mask Email (e.g., r***@demo.com)
        def mask_email(match):
            email = match.group(0)
            parts = email.split('@')
            name = parts[0]
            masked_name = name[0] + "***" if len(name) > 1 else "***"
            return f"{masked_name}@{parts[1]}"

        masked = cls.AADHAAR_PATTERN.sub(mask_aadhaar, text)
        masked = cls.PHONE_PATTERN.sub(mask_phone, masked)
        masked = cls.EMAIL_PATTERN.sub(mask_email, masked)
        return masked

    @classmethod
    def sanitize_for_external_ai(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recursively strip and mask sensitive customer data prior to external LLM dispatch.
        """
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = cls.mask_text(value)
            elif isinstance(value, dict):
                sanitized[key] = cls.sanitize_for_external_ai(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    cls.sanitize_for_external_ai(item) if isinstance(item, dict)
                    else (cls.mask_text(item) if isinstance(item, str) else item)
                    for item in value
                ]
            else:
                sanitized[key] = value
        return sanitized
