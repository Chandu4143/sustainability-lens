import { AnalysisResult } from "@/pages/Index";

export const mockAnalysisResults: AnalysisResult = {
  initiatives: [
    {
      id: "1",
      framework: "Science Based Targets initiative (SBTi)",
      description: "Nike has committed to science-based targets for reducing greenhouse gas emissions in line with climate science.",
      evidence: "In addition to these 2030 targets aligned to the Science Based Targets initiative (SBTi), NIKE has also set a series of 2025 carbon targets to further accelerate our efforts (with an FY20 baseline and aligned to the timeframe of our other corporate targets).",
      pageNumber: 42,
      confidence: 95,
      category: "Environmental"
    },
    {
      id: "2", 
      framework: "Social & Labor Convergence Program (SLCP)",
      description: "Nike conducts supplier assessments through the SLCP framework to ensure social and labor compliance across its supply chain.",
      evidence: "We now assess our Foundational Expectations for suppliers through industry tools, including verified Social & Labor Convergence Program (SLCP) assessments. Nike is aligned with SLCP framework and conducts 333 SLCP aligned audits.",
      pageNumber: 28,
      confidence: 92,
      category: "Social"
    },
    {
      id: "3",
      framework: "Higg Facility Environmental Module (Higg FEM)",
      description: "Environmental assessments of manufacturing facilities using the Sustainable Apparel Coalition's Higg FEM tool.",
      evidence: "SAC's FEM assessments help us understand environmental performance across our supply chain with 378 Tier 1 and 179 Tier 2 facilities completing assessments.",
      pageNumber: 35,
      confidence: 88,
      category: "Environmental"
    },
    {
      id: "4",
      framework: "Zero Discharge of Hazardous Chemicals (ZDHC) Wastewater Guidelines",
      description: "Nike implements ZDHC wastewater testing protocols to eliminate hazardous chemical discharge from manufacturing processes.",
      evidence: "ZDHC Wastewater Guidelines testing shows Nike's commitment to eliminating hazardous chemicals, with 97 Tier 1 and 192 Tier 2 facilities following these protocols.",
      pageNumber: 31,
      confidence: 90,
      category: "Environmental"
    },
    {
      id: "5",
      framework: "Global Reporting Initiative (GRI)",
      description: "Nike follows GRI standards for sustainability reporting and disclosure of environmental, social and governance performance.",
      evidence: "This report has been prepared in accordance with GRI Standards and provides comprehensive disclosure of our sustainability performance across all material topics.",
      pageNumber: 5,
      confidence: 85,
      category: "Governance"
    },
    {
      id: "6",
      framework: "Task Force on Climate-related Financial Disclosures (TCFD)",
      description: "Nike provides climate-related financial disclosures following TCFD recommendations for governance, strategy, risk management and metrics.",
      evidence: "Nike supports the Task Force on Climate-related Financial Disclosures (TCFD) and this report includes disclosures aligned with TCFD recommendations across governance, strategy, risk management, and metrics and targets.",
      pageNumber: 8,
      confidence: 87,
      category: "Governance"
    },
    {
      id: "7",
      framework: "Fair Labor Association (FLA)",
      description: "Nike maintains accreditation with the Fair Labor Association for workplace standards monitoring and compliance.",
      evidence: "Nike has been an accredited company of the Fair Labor Association since 2001, demonstrating our commitment to fair labor practices and continuous improvement in workplace standards.",
      pageNumber: 52,
      confidence: 91,
      category: "Social"
    },
    {
      id: "8",
      framework: "UN Global Compact",
      description: "Nike is a signatory to the UN Global Compact, committing to align operations with universal principles on human rights, labor, environment and anti-corruption.",
      evidence: "As a participant in the UN Global Compact since 2001, Nike is committed to the ten universal principles covering human rights, labor standards, environmental protection, and anti-corruption.",
      pageNumber: 12,
      confidence: 83,
      category: "Governance"
    }
  ],
  documentName: "Nike_FY23_Impact_Report.pdf",
  totalPages: 85,
  processingTime: 42
};