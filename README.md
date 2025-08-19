# Sustainability Lens

An AI-powered ESG (Environmental, Social, Governance) initiative extraction tool that analyzes PDF documents to identify and classify sustainability reporting frameworks and initiatives.

## 🌟 Features

### Document Processing
- **PDF Upload & Analysis**: Support for PDF documents up to 50MB
- **Intelligent Text Extraction**: Primary extraction using PyMuPDF with pdfminer.six fallback
- **OCR Processing**: Tesseract OCR for scanned documents when selectable text is insufficient
- **Real-time Processing**: Immediate analysis with progress tracking

### ESG Framework Detection
- **15+ Major ESG Frameworks**: Including SBTi, SLCP, GRI, TCFD, ZDHC, FLA, UN Global Compact, and more
- **Fuzzy Matching**: Advanced string matching for framework identification
- **Confidence Scoring**: AI-powered confidence levels for each detected initiative
- **Evidence Extraction**: Direct quotes and context from source documents

### User Interface
- **Modern React Frontend**: Built with TypeScript, Vite, and shadcn/ui
- **Responsive Design**: Optimized for desktop and mobile devices
- **Interactive Results**: Filter by category (Environmental, Social, Governance)
- **Sorting Options**: Sort by confidence, category, or framework
- **Export Functionality**: Download analysis results as JSON

### Analysis & Reporting
- **Category Classification**: Automatic categorization into Environmental, Social, and Governance
- **Page-level Tracking**: Precise page number references for each finding
- **Comprehensive Metadata**: Processing time, page count, extraction methods
- **Visual Dashboard**: Charts and statistics for analysis overview

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks and context
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API with error handling

### Backend (Python + FastAPI)
- **Framework**: FastAPI for high-performance API
- **PDF Processing**: PyMuPDF (fitz) and pdfminer.six
- **OCR Engine**: Tesseract with pytesseract wrapper
- **Database**: SQLite for development (PostgreSQL ready for production)
- **Text Matching**: RapidFuzz for fuzzy string matching
- **File Storage**: Local filesystem (S3-ready for production)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm/yarn
- **Python** 3.8+
- **Tesseract OCR** (optional, for scanned documents)
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
  - macOS: `brew install tesseract`
  - Windows: [Download from GitHub](https://github.com/UB-Mannheim/tesseract/wiki)

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd insight-scan-dialog
```

2. **Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
mkdir uploads
```

3. **Setup Frontend**
```bash
cd ..  # Back to root
npm install
```

### Development

1. **Start Backend Server**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Start Frontend Development Server**
```bash
# In a new terminal, from project root
npm run dev
```

3. **Access Application**
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Demo Video

Add your Loom or YouTube demo link here:

- Demo: https://your-demo-link-here

If sharing publicly, ensure any sensitive documents are redacted or use the included sample.

## 📚 Usage

1. **Upload Document**: Drag and drop or select a PDF file
2. **Analysis**: The system automatically extracts text and identifies ESG frameworks
3. **Review Results**: Browse detected initiatives with confidence scores
4. **Filter & Sort**: Use category filters and sorting options to focus on specific results
5. **Export**: Download analysis results as JSON for further processing

If no relevant initiatives are found, the app clearly communicates this and suggests next steps (e.g., trying OCR by ensuring Tesseract is installed, uploading a higher-quality PDF, or adjusting search terms).

## 🔧 Tech Stack

### Frontend Dependencies
- **Core**: React 18, TypeScript, Vite
- **UI Components**: @radix-ui/* components, shadcn/ui
- **Styling**: Tailwind CSS, class-variance-authority
- **PDF Viewing**: react-pdf, pdfjs-dist
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Icons**: lucide-react
- **Utilities**: clsx, tailwind-merge, date-fns

### Backend Dependencies
- **Web Framework**: FastAPI, uvicorn
- **PDF Processing**: PyMuPDF (fitz), pdfminer.six
- **OCR**: pytesseract, Pillow (PIL)
- **Text Matching**: rapidfuzz
- **Database**: sqlite3 (built-in)
- **Validation**: pydantic
- **HTTP**: httpx, requests

## 📖 API Documentation

The FastAPI backend provides comprehensive API documentation:
- **Interactive Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

### Key Endpoints
- `POST /api/upload` - Upload PDF for analysis
- `GET /api/results/{doc_id}` - Get analysis results
- `GET /api/pdf/{doc_id}` - Download original PDF
- `GET /api/export/{doc_id}` - Export analysis as JSON
- `GET /api/health` - Health check

## 🚀 Deployment

### Development
```bash
# Frontend
npm run dev

# Backend
uvicorn main:app --reload
```

### Production Build
```bash
# Frontend
npm run build
npm run preview

# Backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Production Considerations
- Use PostgreSQL instead of SQLite
- Implement authentication and authorization
- Add file storage service (AWS S3)
- Set up reverse proxy (nginx)
- Configure proper logging and monitoring
- Use Docker containers for deployment
- Implement background task processing

## DECISIONS

See `DECISIONS.md` for a concise write-up on product choices and tradeoffs.

## 🔍 ESG Frameworks Supported

The system can detect and classify initiatives from 15+ major ESG frameworks:

- **Science Based Targets initiative (SBTi)**
- **Social & Labor Convergence Program (SLCP)**
- **Higg Facility Environmental Module (FEM)**
- **Zero Discharge of Hazardous Chemicals (ZDHC)**
- **Global Reporting Initiative (GRI)**
- **Task Force on Climate-related Financial Disclosures (TCFD)**
- **Fair Labor Association (FLA)**
- **UN Global Compact**
- **Sustainable Apparel Coalition**
- **WRAP (Worldwide Responsible Accredited Production)**
- **And more...**

## 📄 Decisions & Next Steps

See `DECISIONS.md` for key product choices, tradeoffs, and what to tackle next.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [backend README](./backend/README.md) for detailed API documentation
- Review the troubleshooting section in backend documentation
- Open an issue for bugs or feature requests

## 🔗 Links

- **Lovable Project**: https://lovable.dev/projects/f0b5db6b-3061-45c0-bc0e-fc3f79eca748
- **Documentation**: [Setting up custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
