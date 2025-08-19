# Product Decisions & Next Steps

## Goal
Help sustainability analysts quickly extract grounded ESG initiatives from company PDF reports with evidence and deep links.

## Key Product Decisions
- Evidence-first results: Every item shows a short citation snippet and a link to jump to the exact page and highlighted region.
- Transparent failure modes: If nothing is found, the UI communicates next steps (try higher-quality PDF, enable OCR, try another report).
- Simple MVP, fast iteration: Local file storage, SQLite metadata, synchronous processing to reduce moving parts.

## Technical Choices
- Frontend: React + Vite + TypeScript + shadcn/ui for speed, polish, and maintainability. `react-pdf` for viewing with overlay highlights.
- Backend: FastAPI for quick APIs. PyMuPDF for text + layout. Optional Tesseract OCR for scans. RapidFuzz for framework matching.
- Deep links: `GET /api/pdf/{id}` served file with `#page=N` anchors and overlay highlights in-app.

## Tradeoffs
- Matching uses deterministic keyword + fuzzy matching instead of full RAG/LLM. Pros: predictable, fast, no external dependency. Cons: may miss paraphrases.
- Bounding boxes are heuristic; good enough to guide the user, but not pixel-perfect. Can be refined with text-span mapping.
- Synchronous pipeline simplifies UX, but processing large scans can block; background workers are a next step.

## What I’d Tackle Next
- Improve recall with hybrid semantic search or LLM scoring (grounded by extracted text spans).
- Better bbox by mapping exact text spans to PDF coordinates, multi-line highlight merging.
- Async processing + progress polling; queue for OCR-heavy docs.
- Persistent storage (S3) and auth for multi-user.
- Add a short grounded chat over the document as a stretch goal.

## Testing
- Verified upload → process → results → deep link flow locally.
- Manual tests for selectable and scanned PDFs; graceful OCR-disabled behavior when Tesseract not installed.


