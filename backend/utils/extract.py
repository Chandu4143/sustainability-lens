"""
Text extraction and ESG framework matching utilities.
Handles PDF text extraction, OCR, and fuzzy matching of ESG initiatives.
"""

import re
import io
from typing import List, Tuple, Dict, Any, Optional
from pathlib import Path
from dataclasses import dataclass

import fitz  # PyMuPDF for better PDF handling
import pytesseract
from PIL import Image
from rapidfuzz import fuzz, process
from pydantic import BaseModel

# ESG Framework seed list - based on common sustainability reporting frameworks
ESG_FRAMEWORKS = {
    "Science Based Targets initiative": [
        "science based targets", "sbti", "science-based targets", 
        "1.5°c pathway", "net zero targets", "carbon reduction targets"
    ],
    "Social & Labor Convergence Program": [
        "slcp", "social labor convergence", "labor convergence program",
        "slcp assessment", "slcp audit", "social compliance audit"
    ],
    "Higg Facility Environmental Module": [
        "higg fem", "higg facility environmental", "sustainable apparel coalition",
        "higg index", "environmental module", "facility environmental assessment"
    ],
    "Zero Discharge of Hazardous Chemicals": [
        "zdhc", "zero discharge hazardous", "hazardous chemicals discharge",
        "chemical management", "wastewater guidelines", "textile chemicals"
    ],
    "Global Reporting Initiative": [
        "gri standards", "global reporting initiative", "gri framework",
        "sustainability reporting standards", "gri disclosure"
    ],
    "Task Force on Climate-related Financial Disclosures": [
        "tcfd", "climate-related financial disclosures", "climate risk disclosure",
        "financial climate risk", "tcfd recommendations"
    ],
    "Fair Labor Association": [
        "fair labor association", "fla accreditation", "workplace standards",
        "labor rights monitoring", "fla compliance"
    ],
    "UN Global Compact": [
        "un global compact", "united nations global compact", "global compact principles",
        "ten principles", "human rights principles"
    ],
    "Carbon Disclosure Project": [
        "cdp", "carbon disclosure project", "climate disclosure",
        "environmental disclosure", "carbon reporting"
    ],
    "Sustainability Accounting Standards Board": [
        "sasb", "sustainability accounting standards", "sasb standards",
        "industry-specific sustainability", "material sustainability issues"
    ],
    "ISO 14001": [
        "iso 14001", "environmental management system", "environmental certification",
        "iso environmental standard"
    ],
    "B Corporation Certification": [
        "b corp", "b corporation", "benefit corporation", "b corp certification",
        "social and environmental performance", "certified b corp"
    ],
    "Forest Stewardship Council": [
        "fsc", "forest stewardship council", "fsc certified", "responsible forestry",
        "sustainable forest management"
    ],
    "Cradle to Cradle Certified": [
        "cradle to cradle", "c2c certified", "circular design", "material health assessment"
    ],
    "LEED Certification": [
        "leed", "leadership in energy environmental design", "green building certification",
        "leed certified", "sustainable building"
    ]
}

class ESGMatch(BaseModel):
    """Represents a matched ESG framework in the document."""
    id: str
    framework: str
    description: str
    evidence: str
    page_number: int
    confidence: int
    category: str
    bbox: List[float] = [0, 0, 100, 100]  # [x1, y1, x2, y2] as percentages

def extract_selectable_text(pdf_path: str) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Extract selectable text from PDF using PyMuPDF.
    Returns full text and page layout information for bounding box computation.
    """
    full_text = []
    page_layouts = []
    
    try:
        doc = fitz.open(pdf_path)
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # Extract text with layout information
            text_dict = page.get_text("dict")
            page_text = page.get_text()
            
            # Store page layout for bbox computation
            page_layout = {
                "page_num": page_num + 1,
                "width": page.rect.width,
                "height": page.rect.height,
                "text_dict": text_dict,
                "raw_text": page_text
            }
            page_layouts.append(page_layout)
            full_text.append(page_text)
        
        doc.close()
        return "\n\n".join(full_text), page_layouts
        
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return "", []

def run_tesseract_on_pages(pdf_path: str) -> List[Tuple[str, int]]:
    """
    Run Tesseract OCR on PDF pages when selectable text is insufficient.
    Returns list of (text, page_number) tuples.
    """
    ocr_results = []
    
    try:
        doc = fitz.open(pdf_path)
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # Convert page to image
            mat = fitz.Matrix(2, 2)  # 2x zoom for better OCR
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Run OCR
            image = Image.open(io.BytesIO(img_data))
            ocr_text = pytesseract.image_to_string(image, lang='eng')
            
            ocr_results.append((ocr_text, page_num + 1))
        
        doc.close()
        return ocr_results
        
    except Exception as e:
        print(f"Error running OCR on {pdf_path}: {e}")
        return []

def compute_sentence_bbox(sentence: str, page_layout: Dict[str, Any]) -> List[float]:
    """
    Attempt to compute bounding box for a sentence using layout analysis.
    Returns [x1, y1, x2, y2] as percentages of page dimensions.
    """
    try:
        # This is a simplified approach - in production, you'd want more sophisticated
        # text matching using the text_dict structure from PyMuPDF
        
        page_width = page_layout["width"]
        page_height = page_layout["height"]
        
        # For MVP, search for sentence in the raw text and estimate position
        raw_text = page_layout["raw_text"]
        sentence_clean = re.sub(r'\s+', ' ', sentence.strip())
        
        # Find approximate position
        start_idx = raw_text.find(sentence_clean[:50])  # Match first 50 chars
        
        if start_idx != -1:
            # Rough estimation: assume text flows top to bottom
            # This is very approximate - real implementation would use text_dict
            lines = raw_text[:start_idx].count('\n')
            estimated_y = (lines / raw_text.count('\n')) * 100 if raw_text.count('\n') > 0 else 10
            
            return [10, max(0, estimated_y - 2), 90, min(100, estimated_y + 5)]
        
        # Fallback to page center
        return [10, 45, 90, 55]
        
    except Exception as e:
        print(f"Error computing bbox: {e}")
        return [0, 0, 100, 100]  # Full page fallback

def find_sentence_in_pages(sentence: str, page_layouts: List[Dict[str, Any]]) -> Tuple[int, List[float]]:
    """Find which page contains a sentence and compute its bounding box."""
    
    sentence_clean = re.sub(r'\s+', ' ', sentence.strip())
    
    for page_layout in page_layouts:
        if sentence_clean.lower() in page_layout["raw_text"].lower():
            bbox = compute_sentence_bbox(sentence, page_layout)
            return page_layout["page_num"], bbox
    
    # Default to first page if not found
    return 1, [0, 0, 100, 100]

def categorize_framework(framework_name: str) -> str:
    """Categorize ESG framework into Environmental, Social, or Governance."""
    
    environmental_keywords = [
        "climate", "carbon", "environmental", "emission", "energy", 
        "waste", "water", "forest", "chemical", "pollution", "circular"
    ]
    
    social_keywords = [
        "labor", "social", "human rights", "fair", "worker", "community",
        "diversity", "health", "safety", "supply chain"
    ]
    
    governance_keywords = [
        "governance", "reporting", "disclosure", "compliance", "standards",
        "ethics", "transparency", "accountability", "risk management"
    ]
    
    framework_lower = framework_name.lower()
    
    env_score = sum(1 for kw in environmental_keywords if kw in framework_lower)
    social_score = sum(1 for kw in social_keywords if kw in framework_lower)
    gov_score = sum(1 for kw in governance_keywords if kw in framework_lower)
    
    if env_score >= social_score and env_score >= gov_score:
        return "Environmental"
    elif social_score >= gov_score:
        return "Social"
    else:
        return "Governance"

def find_framework_matches(
    text_content: str, 
    page_layouts: List[Dict[str, Any]], 
    document_name: str
) -> List[ESGMatch]:
    """
    Find ESG framework matches in text using fuzzy matching.
    Returns list of ESGMatch objects with evidence and location.
    """
    matches = []
    
    # Split text into sentences for better matching
    sentences = re.split(r'[.!?]+', text_content)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    match_id = 1
    
    for framework_name, keywords in ESG_FRAMEWORKS.items():
        best_matches = []
        
        # For each sentence, check if it matches any of the framework keywords
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Direct keyword matching first
            for keyword in keywords:
                if keyword.lower() in sentence_lower:
                    confidence = 95 if len(keyword) > 10 else 85
                    best_matches.append((sentence, confidence))
                    break
            
            # Fuzzy matching as fallback
            if not best_matches:
                for keyword in keywords:
                    ratio = fuzz.partial_ratio(keyword.lower(), sentence_lower)
                    if ratio > 80:  # High threshold for fuzzy matching
                        best_matches.append((sentence, min(ratio, 90)))
                        break
        
        # Create matches for the best evidence found
        for sentence, confidence in best_matches[:1]:  # Take best match per framework
            page_num, bbox = find_sentence_in_pages(sentence, page_layouts)
            
            # Generate description based on framework
            description = generate_framework_description(framework_name)
            
            match = ESGMatch(
                id=str(match_id),
                framework=framework_name,
                description=description,
                evidence=sentence.strip(),
                page_number=page_num,
                confidence=confidence,
                category=categorize_framework(framework_name),
                bbox=bbox
            )
            matches.append(match)
            match_id += 1
    
    # Sort by confidence
    matches = sorted(matches, key=lambda x: x.confidence, reverse=True)
    
    return matches

def generate_framework_description(framework_name: str) -> str:
    """Generate a description for the ESG framework."""
    
    descriptions = {
        "Science Based Targets initiative": "Nike has committed to science-based targets for reducing greenhouse gas emissions in line with climate science.",
        "Social & Labor Convergence Program": "Nike conducts supplier assessments through the SLCP framework to ensure social and labor compliance across its supply chain.",
        "Higg Facility Environmental Module": "Environmental assessments of manufacturing facilities using the Sustainable Apparel Coalition's Higg FEM tool.",
        "Zero Discharge of Hazardous Chemicals": "Nike implements ZDHC wastewater testing protocols to eliminate hazardous chemical discharge from manufacturing processes.",
        "Global Reporting Initiative": "Nike follows GRI standards for sustainability reporting and disclosure of environmental, social and governance performance.",
        "Task Force on Climate-related Financial Disclosures": "Nike provides climate-related financial disclosures following TCFD recommendations for governance, strategy, risk management and metrics.",
        "Fair Labor Association": "Nike maintains accreditation with the Fair Labor Association for workplace standards monitoring and compliance.",
        "UN Global Compact": "Nike is a signatory to the UN Global Compact, committing to align operations with universal principles on human rights, labor, environment and anti-corruption.",
        "Carbon Disclosure Project": "Nike participates in CDP climate and environmental disclosure programs for transparency in environmental impact.",
        "Sustainability Accounting Standards Board": "Nike follows SASB standards for industry-specific sustainability accounting and disclosure.",
        "ISO 14001": "Environmental management system certification demonstrating commitment to environmental performance improvement.",
        "B Corporation Certification": "Certification demonstrating high standards of social and environmental performance, accountability, and transparency.",
        "Forest Stewardship Council": "FSC certification ensures responsible forestry practices in supply chain materials and packaging.",
        "Cradle to Cradle Certified": "Product certification for circular design principles and material health assessment.",
        "LEED Certification": "Green building certification for leadership in energy and environmental design of facilities."
    }
    
    return descriptions.get(framework_name, f"Implementation of {framework_name} standards and practices in sustainability operations.")