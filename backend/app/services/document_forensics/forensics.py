import os
import io
import fitz # PyMuPDF
from PIL import Image, ImageChops, ImageEnhance
from typing import Dict, Any, List

class DocumentForensicsService:
    @staticmethod
    def extract_metadata(file_path: str) -> Dict[str, Any]:
        """
        Inspect PDF and image metadata for modification history, producer tags, and anomalies.
        """
        metadata = {
            "format": None,
            "creation_date": None,
            "modification_date": None,
            "producer": None,
            "author": None,
            "page_count": 1,
            "suspicious_metadata_flags": []
        }
        
        if not os.path.exists(file_path):
            return metadata

        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            try:
                doc = fitz.open(file_path)
                meta = doc.metadata or {}
                metadata["format"] = "PDF"
                metadata["page_count"] = len(doc)
                metadata["creation_date"] = meta.get("creationDate")
                metadata["modification_date"] = meta.get("modDate")
                metadata["producer"] = meta.get("producer")
                metadata["author"] = meta.get("author")
                
                # Check for suspicious editing software
                suspicious_keywords = ["photoshop", "gimp", "canva", "ilovepdf", "pdfescape", "nitro"]
                producer_lower = str(meta.get("producer", "")).lower()
                creator_lower = str(meta.get("creator", "")).lower()
                for kw in suspicious_keywords:
                    if kw in producer_lower or kw in creator_lower:
                        metadata["suspicious_metadata_flags"].append(f"Document modified using graphic/editor tool: '{kw}'")
                doc.close()
            except Exception as e:
                metadata["suspicious_metadata_flags"].append(f"Metadata read error: {str(e)}")
        return metadata

    @staticmethod
    def perform_error_level_analysis(image_path: str, quality: int = 90) -> Dict[str, Any]:
        """
        Perform Error Level Analysis (ELA) to detect manipulated or spliced image regions.
        """
        try:
            original = Image.open(image_path).convert("RGB")
            
            # Save at known compression level
            buffer = io.BytesIO()
            original.save(buffer, "JPEG", quality=quality)
            buffer.seek(0)
            resaved = Image.open(buffer)
            
            # Compute absolute difference
            diff = ImageChops.difference(original, resaved)
            extrema = diff.getextrema()
            max_diff = max([ex[1] for ex in extrema])
            
            # High variance difference suggests uneven compression / pasted regions
            scale = 255.0 / max_diff if max_diff != 0 else 1.0
            enhanced = ImageEnhance.Brightness(diff).enhance(scale)
            
            # Anomaly threshold
            is_suspicious = max_diff > 45
            
            return {
                "max_compression_difference": max_diff,
                "is_suspicious_compression": is_suspicious,
                "forensic_technique": "Error Level Analysis (ELA)",
                "notes": "Uneven compression detected, suggesting localized editing." if is_suspicious else "Uniform compression pattern."
            }
        except Exception as e:
            return {
                "max_compression_difference": 0,
                "is_suspicious_compression": False,
                "error": str(e)
            }
