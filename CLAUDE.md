# CLAUDE.md — **PROJECT_NAME**

## Projekt-Kontext

**PROJECT_TITLE** — siehe README.md für fachlichen Überblick.

Produktiv-URL: **PROD_URL**
Frontend: **FRONTEND_DIR** (Port **FRONTEND_PORT**)
Backend: **BACKEND_DIR** (Port **BACKEND_PORT**)

## Verbindliche Regeln

Claude berücksichtigt vor jeder Code-Änderung diese Dateien:

1. **`style-rules.md`** — HTML/Template-Styling (Tailwind, Farben, Layout).
   Hoher Vorrang für visuelle Fragen, wenig Ausnahmen.

2. **`architecture-rules.md`** — TypeScript/Struktur (Komponenten, Stores, Services, Auth).
   Patterns mit begründbaren Abweichungen.

Bei Konflikt:

- Visuell/Layout → `style-rules.md`
- Struktur/Pattern → `architecture-rules.md`
- Modal-vs-Navigation → `style-rules.md §6.3` (detailliert begründet dort)

## Projekt-spezifische Ergänzungen

<!-- Hier projektspezifische Regeln ergänzen, die über die allgemeinen Rules hinausgehen -->
