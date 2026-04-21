# STYLE-RULES — Design-System Referenz

## ZWECK DIESER DATEI

Diese Datei ist die verbindliche, maschinenlesbare Referenz für alle Angular-HTML-Komponenten.
Jede Klasse, jeder SVG-Pfad und jede Regel muss **exakt** so verwendet werden wie hier definiert.
Abweichungen, Erfindungen oder Ergänzungen sind verboten.

### Vorrang-Regel bei bestehenden Komponenten

Wenn dir eine bestehende Angular-Komponente zum Redesign oder zur Anpassung übergeben wird:

1. **Diese Datei hat absoluten Vorrang.** Jede Klasse im bestehenden Code muss gegen die Definitionen in dieser Datei geprüft und bei Abweichung ersetzt werden. Bestehender Code ist **keine gültige Quelle** für Design-Entscheidungen.
2. **Prüfe jedes Element systematisch:** Schriftgrößen (§3), Button-Stile (§4), Formular-Klassen (§5), Card-Rundungen (§6), Icons (§13), Verbote (§16).
3. **Übernimm nichts ungeprüft.** Auch wenn der bestehende Code eine Tailwind-Klasse verwendet die „ähnlich" aussieht (z.B. `text-[11px]`, `rounded-lg` auf Buttons, `italic`, `uppercase`, Chevron-Pfeile statt Sort-Icon) — wenn diese Klasse nicht exakt so in dieser Datei definiert ist, ersetze sie durch die korrekte Definition.
4. **Logik und Funktionalität bleiben erhalten.** Alle `(click)`, `@if`, `@for`, `[ngClass]`, Bindings und Event-Handler werden 1:1 übernommen. Nur die Tailwind-Klassen und SVG-Pfade werden korrigiert.

---

## 1. GLOBALE REGELN

- Framework: **Tailwind CSS** (CDN)
- Icons: bevorzugt Inline-SVG aus Abschnitt 13 — wenn ein benötigtes Icon dort nicht vorhanden ist, wird der SVG-Pfad **ausschließlich** von https://fonts.google.com/icons bezogen. Keine andere Quelle ist erlaubt (keine Heroicons, Lucide, Font Awesome etc.)
- Schrift: System-Font (`font-sans`) — kein Google Fonts Import
- Sprache: alle sichtbaren Texte auf **Deutsch**
- `cursor-pointer` ist auf allen klickbaren Elementen (`<button>`, `<a>`, `<div>` als Button) **immer** zu setzen
- **Button-Rundung:** Alle Standard-Buttons (4.1), Buttons mit Icon (4.2) und Pagination-Buttons verwenden `rounded-xl` (12px). Kompakte Pill-Buttons (4.4) verwenden `rounded-full`. Kompakt-Icons (size-7) verwenden `rounded-lg`. Kein `rounded-lg` auf Standard-Buttons.
- **Focus-Ring nur auf Buttons:** Alle Buttons verwenden `focus-visible:ring-*` für Tastatur-Fokus. Formularelemente (Inputs, Textareas, Selects) verwenden **nur** `focus:border-[#006db7]` — keinen Ring. Der Ring erzeugt einen `box-shadow` der bei `overflow-hidden` auf dem Parent-Container abgeschnitten wird. Checkboxen, Radios und Toggles behalten ihren Ring, da sie nie am Container-Rand sitzen.
- **Kein ungewolltes Scrolling in Texten:** Textelemente in festen Containern (Buttons, Badges, Tabellenzellen, Labels, Card-Header) müssen mit `overflow-hidden` und ggf. `truncate` (= `overflow-hidden text-ellipsis whitespace-nowrap`) versehen werden, damit kein Micro-Scroll entsteht. `overflow-auto` / `overflow-scroll` ist **nur** für explizit scrollbare Bereiche erlaubt (z.B. Tabellen-Body, Modal-Inhalt, lange Listen).
- Kein `[(ngModel)]` — ausschließlich Reactive Forms (`[formGroup]`, `formControlName`)
- Kein `*ngIf`, `*ngFor` — ausschließlich Angular 17+ Block-Syntax (`@if`, `@for`, `@switch`)
- Keine eigenen CSS-Klassen erfinden
- Kein `italic` — kein kursiver Text im gesamten Design-System
- Kein `uppercase` — alle Texte in normaler Groß-/Kleinschreibung. Text-Inhalte niemals in GROSSBUCHSTABEN schreiben.
- **SVG-Positionierung:** Positionierungsklassen (`absolute`, `inset-y-0`, `flex items-center`) gehören IMMER auf einen `<div>`-Wrapper um das SVG — NIEMALS direkt auf das `<svg>`-Element. SVG ist kein Flex-Container. Das SVG selbst bekommt nur Größe (`w-5 h-5`) und Farbe (`text-slate-500`).
- **Overflow-hidden und drehbare Icons:** Cards und Container mit `overflow-hidden` dürfen keine Chevron-Icons mit `rotate-180`-Animation direkt am Rand enthalten. Drehbare SVGs (`w-5 h-5`) müssen in einem größeren Wrapper-Div (`w-7 h-7 flex items-center justify-center shrink-0`) sitzen, weil die Rotations-Diagonale bei 135° ca. 28px beträgt und sonst abgeschnitten wird.
- Keine Inline-Styles außer für dynamische Werte (z.B. `[style.width]="strength.width"`)
- Kein `<header>`, kein `<body>`, kein App-Wrapper — Komponente beginnt direkt mit ihrem Root-Element

### Layout-Kontext

Komponenten werden im Main-Content-Bereich eines App-Shells gerendert. Der Shell liefert bereits Header, Sidebar, äußeres Padding und den vertikalen Scroll-Container. Jede Komponente muss sich darin einfügen, ohne Shell-Verhalten zu duplizieren.

**Shell-Maße (fix):**

| Element             | Maß                                                    |
| ------------------- | ------------------------------------------------------ |
| Header-Höhe         | `3rem` (48px), fixed top                               |
| Sidebar ausgeklappt | `w-56` (224px)                                         |
| Sidebar eingeklappt | `w-14` (56px)                                          |
| Content-Padding     | `p-4` (16px allseitig) — vom Shell gesetzt             |
| Content-Scroll      | `overflow-y-auto` — vom Shell gesetzt                  |
| Outer Wrapper       | `h-screen w-screen overflow-hidden` — kein Page-Scroll |

**Daraus folgende Regeln für Komponenten:**

- **Kein äußeres Padding am Root-Element** — `p-4` ist bereits vom Shell gesetzt, eigenes Padding würde verdoppeln. Innere Abschnitte dürfen selbstverständlich eigenes Padding haben.
- **Kein `min-h-screen` / `h-screen` auf Root** — die Komponente lebt bereits in einem begrenzten Fenster. Wenn maximale Content-Höhe gewünscht ist: `h-full` verwenden.
- **Kein eigener Root-Scrollcontainer** (`overflow-y-auto` / `overflow-scroll` auf Root) — der Shell scrollt bereits. Scrollbare Bereiche sind nur _innerhalb_ der Komponente erlaubt (z.B. Tabellen-Body, Modal-Inhalt, lange Listen).
- **Keine Fixed/Sticky-Positionierung am oberen Viewport-Rand** (`fixed top-0`, `sticky top-0` relativ zum Viewport) — überlappt den Shell-Header. `sticky top-0` ist nur _innerhalb_ eines Scroll-Containers der Komponente erlaubt (z.B. Tabellen-Header, der beim Scrollen der Tabelle stehen bleibt).
- **Responsive für beide Sidebar-Zustände planen** — zwischen eingeklappt und ausgeklappt liegen 168px Breiten-Schwankung. Grid-Layouts, Card-Reihen und Tabellen dürfen nicht nur im einen Zustand funktionieren. Faustregel: getestet wird gedanklich immer bei `calc(100vw − 224px − 32px)` (ausgeklappt) und `calc(100vw − 56px − 32px)` (eingeklappt).
- **Desktop-first responsive** — Breakpoints (`md:`, `sm:`) werden als Verkleinerung eingesetzt, nicht als Vergrößerung. Basis-Layout ist die Desktop-Variante; `md:`/`sm:` passen für engere Content-Bereiche an.

**Ausnahme:** App-Chrome-Komponenten (Header, Sidebar, Notification-Leiste, Login-Shell) sind nicht Teil dieser Regeln und dürfen abweichen (fixe Positionierung, eigene Höhe, eigener Scroll, `uppercase`-Labels etc.). Sie existieren pro Anwendung einmal und werden nicht generiert.

### Daten-Handling

| Typ                                                                | Regel                    | Beispiel                          |
| ------------------------------------------------------------------ | ------------------------ | --------------------------------- |
| Echte dynamische Daten (Namen, IDs, Zahlen aus der DB)             | `{{ variable }}`         | `{{ mitarbeiter.name }}`          |
| Statische Werte die sich nie ändern (Schichtarten, feste Optionen) | Hartcodieren             | `<option value="1">Früh</option>` |
| Platzhalter die noch dynamisiert werden müssen                     | Mit `**...**` umklammern | `**Max Mustermann**`              |

> Faustregel: Könnte dieser Wert in einer anderen Umgebung anders sein? Ja → `{{ variable }}`. Nein → hartcodieren.

---

## 2. FARBTOKENS

### Primärfarben

| Token-Name          | Wert      | Verwendung                                                            |
| ------------------- | --------- | --------------------------------------------------------------------- |
| primary             | `#006db7` | Primäre Buttons, Links, Fokus-Ringe (nur focus-visible), aktive Icons |
| primary-hover       | `#005a99` | Hover-Zustand aller primären Buttons                                  |
| primary-light       | `#e0f2fe` | Hintergrund bei Hover auf Icons, sekundäre Buttons, Badge-BG          |
| primary-light-hover | `#cce4f7` | Hover auf sekundären Buttons                                          |

### Neutrale Farben

| Token-Name     | Tailwind-Klasse    | Verwendung                                    |
| -------------- | ------------------ | --------------------------------------------- |
| bg-page        | `bg-slate-50`      | Seitenhintergrund                             |
| bg-card        | `bg-white`         | Card-, Modal-, Input-Hintergrund              |
| bg-subtle      | `bg-slate-50`      | Card-Footer, Tabellen-Header, Input read-only |
| bg-muted       | `bg-slate-100`     | Deaktivierte Elemente, neutrale Badges        |
| border-default | `border-slate-200` | Standard-Rahmen für Cards, Sections           |
| border-input   | `border-slate-300` | Rahmen für Inputs, Selects, Textareas         |
| text-main      | `text-slate-700`   | Haupttext, Labels, Überschriften              |
| text-secondary | `text-slate-500`   | Hilfstexte, Untertitel, Metainfos             |
| text-muted     | `text-slate-400`   | Platzhalter, deaktivierte Texte               |
| text-strong    | `text-slate-800`   | Fette Überschriften, Modale                   |

### Semantische Farben

| Semantik | BG-Klasse      | Border-Klasse       | Text-Klasse       | Icon-Farbe        |
| -------- | -------------- | ------------------- | ----------------- | ----------------- |
| Erfolg   | `bg-green-50`  | `border-green-200`  | `text-green-700`  | `text-green-600`  |
| Fehler   | `bg-rose-50`   | `border-rose-200`   | `text-rose-700`   | `text-rose-600`   |
| Warnung  | `bg-orange-50` | `border-orange-200` | `text-orange-700` | `text-orange-600` |
| Hinweis  | `bg-amber-50`  | `border-amber-200`  | `text-amber-700`  | `text-amber-600`  |
| Info     | `bg-slate-50`  | `border-slate-100`  | `text-slate-500`  | `text-slate-400`  |

---

## 3. TYPOGRAFIE

Alle Klassen exakt so verwenden — keine eigenen Kombinationen erfinden.

| Verwendung                   | Klassen                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Seiten-H1                    | `text-xl font-bold text-slate-800`                                                            |
| Card-/Modal-Titel (h2)       | `font-bold text-slate-700 text-lg leading-tight`                                              |
| Abschnitts-Untertitel (h3)   | `text-base font-semibold text-slate-700`                                                      |
| Formular-Abschnittstitel     | `text-xs font-bold text-slate-400 tracking-wider border-b border-slate-100 pb-1`              |
| Seiten-Sektions-Label        | `text-xs font-semibold text-slate-400`                                                        |
| Formular-Label               | `text-xs font-semibold text-slate-500`                                                        |
| Großes Label / Card-Label    | `text-sm font-semibold text-slate-700`                                                        |
| Fließtext                    | `text-sm text-slate-600`                                                                      |
| Hilfstext / Metainfo         | `text-xs text-slate-500`                                                                      |
| Tabellenheader               | `text-xs font-medium text-slate-500 tracking-wider`                                           |
| Tabellenzelle (Hauptwert)    | `text-sm font-medium text-slate-700`                                                          |
| Tabellenzelle (Sekundärwert) | `text-sm text-slate-500`                                                                      |
| Monospace (Code, Token, ID)  | `font-mono text-sm text-slate-800`                                                            |
| Monospace klein              | `font-mono text-xs text-slate-600`                                                            |
| Pflichtfeld-Marker           | `<span class="text-red-500">*</span>`                                                         |
| Optional-Badge               | `text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tracking-wider` |

---

## 4. KLASSEN-STRINGS — BUTTONS

### 4.1 Standard-Buttons (Text)

```
PRIMÄR:
bg-[#006db7] hover:bg-[#005a99] text-white font-medium py-2.5 px-6 rounded-xl
shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1

SEKUNDÄR (filled light):
bg-[#e0f2fe] hover:bg-[#cce4f7] text-[#006db7] font-medium py-2.5 px-6 rounded-xl
transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1

TERTIÄR (ghost):
text-[#006db7] hover:bg-[#e0f2fe] font-medium py-2.5 px-4 rounded-xl
transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1

OUTLINE (neutral):
bg-white border border-slate-300 text-slate-700 font-medium py-2.5 px-6 rounded-xl
hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1

GEFÄHRLICH (Löschen):
bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-6 rounded-xl
shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1

GEFÄHRLICH LEICHT (z.B. in Modal):
bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors
shadow-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1

ABBRECHEN (neutral, Modal-Footer):
bg-white border border-slate-300 text-slate-700 font-medium rounded-xl
hover:bg-slate-50 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1

NEUTRAL KLEIN (Card-Footer):
text-slate-500 hover:bg-slate-200 font-medium py-2 px-4 rounded-xl
transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2

DEAKTIVIERT:
bg-slate-100 text-slate-400 font-medium py-2.5 px-6 rounded-xl cursor-not-allowed

MEHR LADEN (Tabelle, volle Breite):
w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#006db7]
hover:bg-[#e0f2fe] rounded-xl transition-all border border-dashed border-[#006db7]/30
```

### 4.2 Buttons mit Icon (flex-Wrapper zwingend)

```
PRIMÄR MIT ICON:
bg-[#006db7] hover:bg-[#005a99] text-white font-medium py-2.5 px-5 rounded-xl
shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1
flex items-center gap-2

SEKUNDÄR MIT ICON:
bg-[#e0f2fe] hover:bg-[#cce4f7] text-[#006db7] font-medium py-2.5 px-5 rounded-xl
transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1
flex items-center gap-2

TERTIÄR KLEIN MIT ICON:
text-[#006db7] hover:bg-[#e0f2fe] font-medium py-2 px-4 rounded-xl
transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1
flex items-center gap-2 text-sm
```

### 4.3 Icon-Buttons (ohne Text)

**STIL A — Squircle Outline** (Standard, auf weißem Hintergrund)

```
Neutral (blau bei hover):
w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center
text-slate-500 transition-colors duration-200
hover:shadow-md hover:border-[#006db7]/30 hover:text-[#006db7] hover:bg-[#e0f2fe] active:scale-95

Neutral (grau bei hover, für System-Aktionen wie Einstellungen, Menü):
w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center
text-slate-500 transition-colors duration-200
hover:shadow-md hover:border-slate-300 hover:text-slate-800 hover:bg-slate-100 active:scale-95

Positiv (grün bei hover, für Hinzufügen, Bestätigen):
w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center
text-slate-500 transition-colors duration-200
hover:shadow-md hover:border-green-200 hover:text-green-700 hover:bg-green-50 active:scale-95

Destruktiv (rot bei hover, für Löschen, Fehler):
w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center
text-slate-500 transition-colors duration-200
hover:shadow-md hover:border-red-200 hover:text-red-700 hover:bg-red-50 active:scale-95

Warnung (amber bei hover):
w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center
text-slate-500 transition-colors duration-200
hover:shadow-md hover:border-amber-200 hover:text-amber-700 hover:bg-amber-50 active:scale-95
```

**STIL B — Minimal Ghost** (kein Hintergrund im Ruhezustand)

```
Blau bei hover:
w-12 h-12 flex items-center justify-center rounded-full text-slate-500
transition-colors duration-200 hover:text-[#006db7] hover:bg-[#e0f2fe] active:scale-95

Grau bei hover:
w-12 h-12 flex items-center justify-center rounded-full text-slate-500
transition-colors duration-200 hover:text-slate-800 hover:bg-slate-100 active:scale-95

Grün bei hover:
w-12 h-12 flex items-center justify-center rounded-full text-slate-500
transition-colors duration-200 hover:text-green-700 hover:bg-green-50 active:scale-95

Rot bei hover:
w-12 h-12 flex items-center justify-center rounded-full text-slate-500
transition-colors duration-200 hover:text-red-700 hover:bg-red-50 active:scale-95

Amber bei hover:
w-12 h-12 flex items-center justify-center rounded-full text-slate-500
transition-colors duration-200 hover:text-amber-700 hover:bg-amber-50 active:scale-95
```

**STIL C — Filled Round** (ausgefüllter Kreis, für hervorgehobene Aktionen)

```
Primär (blau):
w-14 h-14 flex items-center justify-center rounded-full bg-[#e0f2fe] text-[#006db7]
transition-colors duration-200 hover:bg-blue-100 active:scale-95

Neutral (grau):
w-14 h-14 flex items-center justify-center rounded-full bg-slate-100 text-slate-700
transition-colors duration-200 hover:bg-slate-200 active:scale-95

Positiv (grün):
w-14 h-14 flex items-center justify-center rounded-full bg-green-50 text-green-700
transition-colors duration-200 hover:bg-green-100 active:scale-95

Destruktiv (rot):
w-14 h-14 flex items-center justify-center rounded-full bg-red-50 text-red-700
transition-colors duration-200 hover:bg-red-100 active:scale-95

Warnung (amber):
w-14 h-14 flex items-center justify-center rounded-full bg-amber-50 text-amber-700
transition-colors duration-200 hover:bg-amber-100 active:scale-95
```

**STIL D — Tonal Pill** (ovale Pille, für kompakte Toolbars)

```
Primär:
w-[64px] h-[40px] flex items-center justify-center rounded-full bg-[#e0f2fe] text-[#006db7]
transition-colors duration-200 hover:bg-blue-100 active:scale-95

Neutral:
w-[64px] h-[40px] flex items-center justify-center rounded-full bg-slate-100 text-slate-700
transition-colors duration-200 hover:bg-slate-200 active:scale-95

Positiv:
w-[64px] h-[40px] flex items-center justify-center rounded-full bg-green-50 text-green-700
transition-colors duration-200 hover:bg-green-100 active:scale-95

Destruktiv:
w-[64px] h-[40px] flex items-center justify-center rounded-full bg-red-50 text-red-700
transition-colors duration-200 hover:bg-red-100 active:scale-95
```

**Inline-Aktions-Icons** (in Tabellen-Zeilen, Cards — klein)

```
Primär (Bearbeiten, Anzeigen, Öffnen):
p-1.5 text-[#006db7] hover:bg-[#e0f2fe] rounded-md transition-colors
focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7]

Destruktiv (Löschen):
p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors
focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600

Kompakt Primär (size-7, für enge Tabellen):
size-7 p-1 rounded-lg bg-[#e0f2fe] flex items-center justify-center cursor-pointer
→ SVG: class="size-5 text-[#006db7]"

Kompakt Destruktiv:
size-7 p-1 rounded-lg bg-red-50 flex items-center justify-center cursor-pointer
→ SVG: class="size-5 text-red-600"

Kompakt Erfolg (Speichern/Bestätigen):
size-7 p-1 rounded-lg bg-green-100 flex items-center justify-center cursor-pointer
→ SVG: class="size-5 text-green-600"
```

### 4.4 Kompakte Pill-Action-Buttons (Card-Footer)

Kleine, abgerundete Aktions-Buttons mit Icon + Text für Card-Footer-Bereiche.
Immer `flex-1` innerhalb eines `flex items-center gap-2`-Wrappers verwenden.
SVG-Icon: `class="w-4 h-4"` — steht links vom Text.

```
NEUTRAL (Standard-Aktion, z.B. Zuweisen):
flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold
text-[#006db7] bg-[#e0f2fe] hover:bg-[#006db7] hover:text-white
rounded-full transition-all cursor-pointer

BESTÄTIGEN (Positiv, z.B. Bestätigen, Freigeben):
flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold
text-green-700 bg-green-50 hover:bg-green-600 hover:text-white
rounded-full transition-all cursor-pointer

WARNUNG (z.B. Ausnahme, Hinweis):
flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold
text-slate-500 hover:text-orange-600 bg-slate-50 hover:bg-orange-50
border border-slate-100 rounded-full transition-all cursor-pointer

DESTRUKTIV (z.B. Löschen, Entfernen):
flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold
text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50
border border-slate-100 rounded-full transition-all cursor-pointer
```

---

## 5. KLASSEN-STRINGS — FORMULARELEMENTE

### 5.1 Inputs

```
STANDARD INPUT:
w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900
placeholder:text-slate-400 focus:border-[#006db7]
outline-none transition-colors

KOMPAKT INPUT (in Formularen mit mehreren Feldern, h-8):
w-full px-2 py-1 rounded border focus:border-[#006db7] outline-none text-sm h-8
→ border-Klasse dynamisch via [ngClass]:
  gültig:   border-slate-200
  ungültig: border-rose-500 border-2

UNGÜLTIG (Validierungsfehler):
border-rose-500 border-2
→ Fehlermeldung darunter: <p class="text-xs text-rose-500 mt-1">...</p>

READ-ONLY MIT KOPIEREN (Input + Button):
Input:   w-full pl-4 pr-12 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700
         focus:outline-none focus:border-[#006db7] transition-all
Button:  absolute right-2 p-1.5 text-[#006db7] hover:bg-[#e0f2fe] rounded-md transition-colors
         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7]

ANZEIGEFELD (read-only, gefüllt, kein Input):
w-full px-1 py-1 rounded border border-slate-300 bg-slate-50 text-xs h-8
flex items-center justify-center text-slate-700

DATEPICKER (mit Icon links):
Wrapper: relative
Icon:    absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none → SVG text-slate-400
Input:   w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-700
         placeholder:text-slate-400 focus:border-[#006db7]
         outline-none transition-all

PASSWORT-INPUT (mit Icon links):
Wrapper: relative
Icon:    absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 → SVG w-4 h-4
Input:   w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-700
         placeholder:text-slate-400 focus:border-[#006db7]
         outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed
```

### 5.2 Textarea

```
w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700
placeholder:text-slate-400 focus:border-[#006db7]
outline-none transition-all resize-none

MONOSPACE (für Code/Secrets):
...gleiche Klassen... + font-mono text-sm
```

### 5.3 Select / Dropdown

```
Wrapper: relative
Select:  cursor-pointer appearance-none w-full px-4 py-2 bg-white border border-slate-300
         text-slate-900 rounded-lg focus:outline-none
         focus:border-[#006db7] outline-none transition-colors pr-10
Pfeil:   <div> mit: pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500
         → SVG (Kind-Element): w-5 h-5 chevron-down (→ siehe Icon-Bibliothek: chevron_down)
         ⚠ Positionierung IMMER auf dem <div>-Wrapper, NIEMALS direkt auf dem <svg>.
           SVG ist kein Flex-Container — `flex items-center` auf <svg> hat keinen Effekt.
```

### 5.4 Checkbox

```
EINFACH:
Input:  peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white
        checked:border-[#006db7] checked:bg-[#006db7] transition-all hover:border-[#006db7]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-2
Haken:  pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity
        → SVG: viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
               <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
Label:  text-sm text-slate-700 cursor-pointer select-none

MIT BESCHREIBUNG (in Box):
Box:    flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200
Input:  w-4 h-4 text-[#006db7] border-slate-300 rounded focus-visible:ring-[#006db7] cursor-pointer
Label-Titel:  block text-sm font-bold text-slate-700
Label-Text:   block text-xs text-slate-500 leading-tight mt-0.5
```

### 5.5 Radio Button

```
peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 bg-white
checked:border-[#006db7] checked:border-[5px] transition-all hover:border-[#006db7]
focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-2
```

### 5.6 Toggle Switch

```
Wrapper: inline-flex items-center cursor-pointer
Input:   sr-only peer
Track:   relative w-11 h-6 bg-slate-200 peer-focus-visible:outline-none peer-focus-visible:ring-4
         peer-focus-visible:ring-[#006db7]/20 rounded-full peer
         peer-checked:after:translate-x-full peer-checked:after:border-white
         after:content-[''] after:absolute after:top-[2px] after:start-[2px]
         after:bg-white after:border-gray-300 after:border after:rounded-full
         after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006db7]
Label:   ms-3 text-sm font-medium text-slate-700
```

### 5.7 Formular-Abschnittstitel

```html
<h3
  class="text-xs font-bold text-slate-400 tracking-wider border-b border-slate-100 pb-1"
>
  Abschnittstitel
</h3>
```

---

## 6. KLASSEN-STRINGS — CARDS & CONTAINER

### 6.1 Standard-Card

```
Außen:   bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden

HEADER (mit Icon):
  Wrapper: px-6 py-5 border-b border-slate-100 bg-white flex items-center gap-3
  Icon-Block: w-10 h-10 rounded-lg bg-[FARBE] flex items-center justify-center flex-shrink-0
    → Primär: bg-[#e0f2fe] → SVG: text-[#006db7]
    → Erfolg: bg-green-100 → SVG: text-green-600
    → Fehler: bg-rose-100  → SVG: text-rose-600
    → Warnung: bg-orange-100 → SVG: text-orange-600
    → Neutral: bg-slate-100 → SVG: text-slate-500
  Titel: font-bold text-slate-700 text-lg leading-tight
  Untertitel: text-xs text-slate-500

HEADER (einfach, ohne Icon):
  px-6 py-4 border-b border-slate-100 flex items-center justify-between
  Titel: font-semibold text-lg text-slate-700
  Tag: text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded

BODY:
  p-6

FOOTER:
  bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3

ACCORDION-CARD (auf-/zuklappbar):
  Außen:   bg-white border border-slate-200 rounded-xl shadow-sm
           ⚠ KEIN overflow-hidden auf dem äußeren Container — der Chevron wird sonst bei rotate-180 abgeschnitten.
  Header:  flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors
  Chevron: ⚠ SVG muss in einem Wrapper-Div sitzen, das die Rotations-Diagonale auffängt.
           Ein w-5 h-5 SVG hat bei 135° eine Diagonale von ~28px — der 20px-Flex-Container clippt sonst.
           Wrapper: w-7 h-7 flex items-center justify-center shrink-0
           SVG:     w-5 h-5 text-slate-400 transition-transform duration-300
           → Rotation via [class.rotate-180]="expanded"
  Content: border-t border-slate-100 (nur sichtbar wenn aufgeklappt)
```

### 6.2 Modale / Dialoge

```
Backdrop:  fixed inset-0 z-50 flex items-center justify-center
Blur:      absolute inset-0 bg-slate-900/40 backdrop-blur-sm
Container: relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center

Icon-Kreis (Löschen-Modal): w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4
Titel:    text-lg font-bold text-slate-800
Text:     text-slate-500 text-sm mt-2 mb-6
Buttons:  flex gap-3
```

---

## 7. KLASSEN-STRINGS — ALERTS & HINWEISE

```
WARNUNG (orange):
bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-4 items-start
→ Icon: flex-shrink-0 mt-0.5 → SVG: text-orange-600 w-5 h-5
→ Titel: text-sm font-bold text-orange-800
→ Text:  text-sm text-orange-700 mt-1

FEHLER (rose):
bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-4 items-start
→ Icon: flex-shrink-0 mt-0.5 → SVG: text-rose-600 w-5 h-5
→ Titel: text-sm font-bold text-rose-800
→ Text:  text-sm text-rose-700 mt-1

ERFOLG INLINE (kleine Zeile):
flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 p-2 rounded-lg
→ SVG: w-4 h-4 flex-shrink-0
→ Text: text-xs font-medium

NEUTRAL INFO:
flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100
→ SVG: text-slate-400 flex-shrink-0 (w-5 h-5)
→ Text: text-xs text-slate-500 leading-relaxed
```

---

## 8. KLASSEN-STRINGS — STATUS PILLS & BADGES

```
STATUS PILL — Aktiv/Abgeschlossen:
inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#006db7] font-medium text-sm
→ Dot: w-2 h-2 rounded-full bg-green-500

STATUS PILL — Inaktiv:
inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-sm
→ Dot: w-2 h-2 rounded-full bg-slate-400

STATUS PILL — Fehler:
inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium text-sm
→ Dot: w-2 h-2 rounded-full bg-red-500

STATUS PILL — Ausstehend:
inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-medium text-sm
→ Dot: w-2 h-2 rounded-full bg-amber-500

STATUS-FILTER-PILL — Klickbare Toggle-Pills zum Filtern (z.B. Statusfilter):
Aktiv (ausgewählt):
px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors select-none
bg-[#006db7] border-[#006db7] text-white shadow-sm

Inaktiv (nicht ausgewählt):
px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors select-none
bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#006db7] hover:border-[#006db7]

SORT-BUTTON — Klickbarer Sortier-Toggle (Balken-Icon, 3 Zustände):
Icon: sort (→ Icon-Bibliothek #37), SVG w-3.5 h-3.5
Richtung: Absteigend = Icon normal, Aufsteigend = Icon mit style="transform:scaleY(-1)"
Cycled: unsortiert → absteigend → aufsteigend → unsortiert

Aktiv (sortiert):
flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors select-none
bg-[#006db7] text-white shadow-sm

Inaktiv (unsortiert):
flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors select-none
bg-slate-100 text-slate-500 hover:bg-slate-200

BADGE — Primär (Neu):
inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#e0f2fe] text-[#006db7]

BADGE — Neutral (Intern):
inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700

BADGE — Warnung (Kritisch):
inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200

BADGE — Lila (Admin/Sonderrolle):
inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200

BADGE — Tabelle Aktiv:
px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800

BADGE — Tabelle Abgelaufen/Inaktiv:
px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-600
```

---

## 9. KLASSEN-STRINGS — TABELLEN

```
Container:    border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm
Table:        min-w-full divide-y divide-slate-200
THEAD:        bg-slate-50
TH:           px-6 py-3 text-left text-xs font-medium text-slate-500 tracking-wider
TBODY:        bg-white divide-y divide-slate-200
TR:           hover:bg-slate-50/50 transition-colors
TD Haupt:     px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700
TD Sekundär:  px-6 py-4 whitespace-nowrap text-sm text-slate-500
TD Zentriert: px-6 py-3 text-center whitespace-nowrap
TD Aktionen:  px-6 py-4 whitespace-nowrap text-right text-sm font-medium
  → Wrapper: flex items-center justify-end gap-2
```

---

## 10. KLASSEN-STRINGS — TOASTS / POPUPS

```
Container: bg-white rounded-xl shadow-lg border border-slate-100 p-4 flex items-start gap-4
Icon-Block: w-10 h-10 rounded-lg bg-[FARBE] flex items-center justify-center flex-shrink-0
Titel:     font-semibold text-slate-700
Text:      text-sm text-slate-500 mt-1

Laden:   bg-[#e0f2fe] → Spinner (animate-spin, text-[#006db7])
Erfolg:  bg-green-100 → SVG text-green-600
Fehler:  bg-red-100   → SVG text-red-600
```

---

## 11. KLASSEN-STRINGS — PAGINATION & NAVIGATION

```
BREADCRUMB:
nav: flex text-sm font-medium text-slate-500
ol:  flex items-center space-x-2
a:   hover:text-[#006db7] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] rounded
Trenner: SVG chevron_right (w-4 h-4 text-slate-400)
Aktiv: text-slate-800 font-semibold

PAGINATION:
Wrapper: flex items-center gap-1
Vor/Zurück: p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50
            hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1 transition-colors
Aktiv:      px-3.5 py-2 rounded-xl border border-[#006db7] bg-[#e0f2fe] text-[#006db7] font-medium text-sm
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1
Inaktiv:    px-3.5 py-2 rounded-xl border border-transparent text-slate-600 hover:bg-slate-100
            font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus-visible:ring-offset-1 transition-colors
Dots:       px-2 text-slate-400
```

---

## 12. KLASSEN-STRINGS — SONSTIGE ELEMENTE

### 12.1 Fortschrittsbalken / Passwortstärke

```
Wrapper: w-full bg-slate-200 rounded-full h-1.5
Balken:  h-1.5 rounded-full transition-all duration-300
→ Farbe dynamisch: [style.width]="strength.width" [style.background-color]="strength.color"
→ Statisch Gering: bg-red-500 (width: 25%)
→ Statisch Sicher: bg-green-500 (width: 90%)
Label-Reihe: flex justify-between mb-1
  → text-xs font-medium text-slate-700 (links)
  → text-xs font-medium text-[FARBE] (rechts)
```

### 12.2 Skeleton Loader

```
Außen:   w-full max-w-sm p-4 border border-slate-200 rounded-xl shadow-sm bg-white
Puls:    animate-pulse flex space-x-4
Kreis:   rounded-full bg-slate-200 h-10 w-10
Linien:  flex-1 space-y-3 py-1
  → h-2 bg-slate-200 rounded w-3/4
  → h-2 bg-slate-200 rounded
  → h-2 bg-slate-200 rounded w-5/6
```

### 12.3 Empty State

```
Außen:     max-w-lg border border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-12
           text-center flex flex-col items-center
Icon-Bg:   bg-slate-100 p-4 rounded-full mb-4 → SVG: text-slate-400 w-8 h-8
Titel:     text-slate-900 font-semibold mb-1
Text:      text-slate-500 text-sm mb-6 max-w-xs
Button:    → TERTIÄR KLEIN MIT ICON (siehe 4.2)
```

### 12.4 Tooltip

```
Trigger-Wrapper: relative group flex items-center justify-center
Box:    absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800
        text-white text-xs rounded shadow-lg text-center z-10
Pfeil:  absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800
```

### 12.5 Lade-Spinner (in Buttons)

```html
<svg
  class="w-5 h-5 animate-spin"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
>
  <circle
    class="opacity-25"
    cx="12"
    cy="12"
    r="10"
    stroke="currentColor"
    stroke-width="4"
  ></circle>
  <path
    class="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  ></path>
</svg>
```

### 12.6 Unterschrift-Canvas

```
Außen:   border border-slate-300 rounded-lg bg-white overflow-hidden shadow-sm
Header:  bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center
  Label: text-sm font-semibold text-slate-700 flex items-center gap-2
  Reset: text-xs text-[#006db7] hover:text-[#005a99] hover:underline transition-colors
         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] rounded px-1
Canvas:  relative h-40 bg-white cursor-crosshair
Linie:   absolute bottom-6 left-6 right-6 border-b border-dashed border-slate-300
Hint:    text-xs text-slate-400 mt-2 ml-1
```

### 12.7 Dokument-Upload

```
DROPZONE:
border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center
text-center hover:bg-slate-50 hover:border-[#006db7]/50 transition-all cursor-pointer group
focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7] focus:border-transparent
→ Icon-BG: bg-[#e0f2fe] p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors → SVG text-[#006db7]
→ Titel:   font-medium text-slate-700
→ Sub:     text-xs text-slate-400 mt-1

DATEI-EINTRAG:
flex items-center p-3 border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow
→ Typ-Badge: h-10 w-10 bg-red-50 rounded flex items-center justify-center text-red-600 font-bold text-xs mr-3 flex-shrink-0 border border-red-100
→ Name: text-sm font-medium text-slate-700 truncate
→ Meta: text-xs text-slate-500
→ Aktionen: flex items-center gap-2 pl-2
```

### 12.8 Benutzer-Profil-Block

```
Wrapper: flex items-center gap-4
Text-Wrapper: text-right flex flex-col justify-center
Name: font-bold text-slate-700 text-base leading-tight
Rolle: text-sm text-slate-500 leading-tight mt-0.5
Avatar-Button: → STIL C Filled Round Primär (w-14 h-14)
```

### 12.9 User-Search (Personen-Auswahl mit Autocomplete)

Autocomplete-Eingabefeld für die Auswahl einer Person (z.B. Verantwortlicher, Zuweisung, Supervisor). Nach Auswahl wird die Person als Chip mit Avatar, Name und Entfernen-Button angezeigt. Das Dropdown ist `fixed` positioniert, um nicht von Modal-`overflow-hidden` abgeschnitten zu werden.

**Struktur:**

- **Root-Wrapper:** `space-y-0.5`
- **Label (optional):** `text-xs font-semibold text-slate-500` (§3 Formular-Label)

**Zustand A — Eingabefeld (keine Person gewählt):**

```
Wrapper:  relative
Icon:     absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none
          → SVG Lupe (Icon #13 search) w-4 h-4
Input:    w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900
          placeholder:text-slate-400 focus:border-[#006db7] outline-none transition-colors
Placeholder: "Name oder E-Mail eingeben..."
```

**Zustand B — Ausgewählte Person (Chip):**

```
Wrapper:  flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50
Avatar:   → Avatar-Komponente size="sm" (w-7 h-7) mit Initialen oder Profilbild
Name:     flex-1 text-sm text-slate-700 truncate overflow-hidden
Entfernen-Button:
  cursor-pointer p-1 text-slate-400 hover:text-red-600 hover:bg-red-50
  rounded transition-colors shrink-0
  → SVG Icon #29 close, w-4 h-4
```

**Dropdown (Autocomplete-Liste):**

```
Positionierung: fixed (NICHT absolute) — verhindert Clipping in Modals mit overflow-hidden
Styles: fixed bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto
Inline-Styles (dynamisch): [style.top], [style.left], [style.width]
z-index: style="z-index: 1000" (über Modal-Backdrop z-50)

EINTRAG (Button):
  cursor-pointer w-full flex items-center gap-3 px-3 py-2
  hover:bg-[#e0f2fe]/40 transition-colors text-left
  border-b border-slate-100 last:border-b-0
  → Avatar: size="sm"
  → Text-Wrapper: min-w-0 flex-1
    → Name:     text-sm font-medium text-slate-700 truncate overflow-hidden
    → Subtitel: text-xs text-slate-400 truncate overflow-hidden (z.B. Jobtitel)
```

**Verhaltens-Regeln:**

- Dropdown öffnet bei Input-Fokus **nur wenn** bereits Vorschläge geladen sind (`suggestions().length > 0`)
- Dropdown schließt bei Auswahl, Escape oder Klick außerhalb
- Eingabe wird debounced (empfohlen: 250ms) bevor die Such-API aufgerufen wird
- Bei gewählter Person wird das Eingabefeld durch den Chip ersetzt — kein paralleles Nebeneinander
- Der Entfernen-Button setzt die Auswahl zurück und zeigt wieder das Eingabefeld

**Integration in Formulare:**

- In Reactive Forms wird der Schlüssel (z.B. User-ID / UPN) im `FormControl` gehalten, der Anzeigename wird separat als Property der Komponente geführt
- Bei Pflichtfeldern folgt die Validierungs-Optik §5.1 (UNGÜLTIG): `border-rose-500 border-2` auf dem Eingabefeld in Zustand A
- In Grid-Layouts `grid grid-cols-1 md:grid-cols-2 gap-4` nutzbar wie jedes andere Formularfeld

**Komponenten-Signatur (Selector: `app-user-search`):**

```
Inputs:
  label         (string, optional) — Label-Text über dem Feld
  selectedKey   (string | null)    — eindeutiger Schlüssel der gewählten Person
  selectedName  (string | null)    — Anzeigename der gewählten Person

Outputs:
  userSelected  (EventEmitter<{ id, displayName, jobTitle? }>)
  cleared       (EventEmitter<void>)
```

---

## 13. SVG ICON-BIBLIOTHEK

> **WICHTIG:** Dies sind die einzigen 37 vordefinierten Icons. Kein anderes Icon darf verwendet werden.
> Wird ein Icon benötigt das hier nicht aufgeführt ist, wird der SVG-Pfad **ausschließlich** von
> https://fonts.google.com/icons bezogen — niemals von einer anderen Quelle.

**Vorlage für alle Icons:**

```html
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
  <path d="[PATH]" />
</svg>
```

Größe via Tailwind: `w-5 h-5` / `w-4 h-4` / `w-6 h-6`
Farbe via Tailwind: `text-[#006db7]` / `text-slate-500` / `text-red-600` etc.

---

| #   | Deutsch       | Name             | path d="..."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Home          | `home`           | `M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2   | Profil        | `person`         | `M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 7c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm6 5H6v-.99c.2-.72 3.3-2.01 6-2.01s5.8 1.29 6 2.01V18z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 3   | Grid          | `grid_view`      | `M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 4   | Suche         | `search`         | `M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 5   | Editieren     | `edit`           | `M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 6   | Speichern     | `save`           | `M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 7   | Kopieren      | `content_copy`   | `M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 8   | Datum         | `calendar_today` | `M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 9   | Anzeigen      | `visibility`     | `M12 6.5c3.79 0 7.17 2.13 8.82 5.5-1.65 3.37-5.02 5.5-8.82 5.5S4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5m0-2C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 5c1.38 0 2.5 1.12 2.5 2.5S13.38 14.5 12 14.5 9.5 13.38 9.5 12s1.12-2.5 2.5-2.5m0-2c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 10  | Zeichnen      | `draw`           | `M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 11  | Zurück        | `arrow_back`     | `M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 12  | Weiter        | `arrow_forward`  | `M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 13  | Öffnen        | `open_in_new`    | `M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 14  | Mail          | `mail`           | `M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 15  | Download      | `download`       | `M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 16  | Upload        | `upload`         | `M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 17  | Cloud Upload  | `cloud_upload`   | `M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3zM8 13h2.55v3h2.9v-3H16l-4-4-4 4z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 18  | Link          | `link`           | `M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 19  | Archiv        | `archive`        | `M20 2H4c-1.1 0-2 .9-2 2v3.01c0 .72.38 1.34.96 1.7L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2l.04-11.27c.58-.36.96-.98.96-1.7V4c0-1.1-.9-2-2-2zm-1 5H5V4h14v3zm-4 4h-6v2h6v-2zm4 9H5l-.04-9H20v9z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 20  | Info          | `info`           | `M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 21  | Laden         | `refresh`        | `M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 22  | Einstellungen | `settings`       | `M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27-.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z` |
| 23  | Menü          | `menu`           | `M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 24  | Mehr          | `more_vert`      | `M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 25  | Ausklappen    | `chevron_down`   | `M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 26  | Links         | `chevron_left`   | `M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 27  | Rechts        | `chevron_right`  | `M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 28  | Hilfe         | `help`           | `M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 29  | Schließen     | `close`          | `M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 30  | Hinzufügen    | `add`            | `M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 31  | Bestätigen    | `check`          | `M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 32  | Erfolg        | `check_circle`   | `M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 33  | Löschen       | `delete`         | `M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 34  | Fehler        | `error`          | `M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 35  | Benachricht.  | `notifications`  | `M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 36  | Warnung       | `warning`        | `M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 37  | Sortieren     | `sort`           | `M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

---

### Sonderfall: Checkbox-Haken (stroke-basiert, kein fill)

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
</svg>
```

---

## 14. KONTEXT-REGELN — WAS WANN VERWENDEN

### 14.1 Button-Typ-Wahl: Welcher Abschnitt?

| Situation                                                   | Verwende Abschnitt | Erklärung                                               |
| ----------------------------------------------------------- | ------------------ | ------------------------------------------------------- |
| Hauptaktion, Formular-Submit, Bestätigung                   | **4.1** Standard   | Großer, klar sichtbarer Button mit Text                 |
| Aktion mit beschreibendem Icon + Text (z.B. „+ Hinzufügen") | **4.2** Mit Icon   | Wie 4.1 aber mit SVG links vom Text                     |
| Toolbar-/Header-Aktion ohne Text, nur Icon                  | **4.3** Icon-Only  | Nur Icon, verschiedene Stile je nach Platzierung        |
| Card-Footer mit 2–3 gleichwertigen Kurz-Aktionen            | **4.4** Pill       | Kompakte Pills mit Icon+Text, flex-1 für gleiche Breite |
| Inline-Aktion in Tabellenzeile oder Card-Detail             | **4.3** Inline     | Kleine Aktions-Icons (p-1.5 oder size-7)                |

**Faustregel:** Je wichtiger und eigenständiger die Aktion, desto höher der Abschnitt (4.1 > 4.2 > 4.3 > 4.4). Pill-Buttons (4.4) sind für sekundäre Aktionen innerhalb von Cards — niemals als Hauptaktion einer Seite.

### 14.2 Button-Varianten-Wahl (innerhalb 4.1 / 4.2)

| Kontext                                         | Variante          | Farbe                            |
| ----------------------------------------------- | ----------------- | -------------------------------- |
| Hauptaktion der Seite/Ansicht (max. 1×)         | PRIMÄR            | bg-[#006db7] → weiß              |
| Sekundäre Aktion neben Primär                   | SEKUNDÄR          | bg-[#e0f2fe] → blau              |
| Hilfslink / Zusatzaktion ohne Gewichtung        | TERTIÄR (ghost)   | text-[#006db7], kein BG          |
| Alternative / Zurück / Nebeneinander mit Primär | OUTLINE           | bg-white, border-slate-300       |
| Löschen / Entfernen (irreversibel)              | GEFÄHRLICH        | bg-red-500 → weiß                |
| Löschen in Modal (leichter)                     | GEFÄHRLICH LEICHT | bg-red-500, kein py/px           |
| Abbrechen in Modal-Footer                       | ABBRECHEN         | bg-white, border-slate-300       |
| Unwichtige Aktion in Card-Footer                | NEUTRAL KLEIN     | text-slate-500, kein Border      |
| Gesperrte / nicht verfügbare Aktion             | DEAKTIVIERT       | bg-slate-100, cursor-not-allowed |
| Nachladen von Listeneinträgen                   | MEHR LADEN        | w-full, border-dashed            |

### 14.3 Pill-Button-Varianten-Wahl (4.4)

| Kontext                                        | Variante   | Ruhezustand             | Hover                     |
| ---------------------------------------------- | ---------- | ----------------------- | ------------------------- |
| Standard-Aktion (Zuweisen, Öffnen, Auswählen)  | NEUTRAL    | bg-[#e0f2fe], text blau | bg-[#006db7], text weiß   |
| Positive Aktion (Bestätigen, Freigeben, OK)    | BESTÄTIGEN | bg-green-50, text grün  | bg-green-600, text weiß   |
| Hinweis-Aktion (Ausnahme, Sonderfall, Warnung) | WARNUNG    | bg-slate-50 + border    | bg-orange-50, text orange |
| Negative Aktion (Entfernen, Ablehnen)          | DESTRUKTIV | bg-slate-50 + border    | bg-red-50, text rot       |

### 14.4 Icon-Button-Stil-Wahl (4.3 — A / B / C / D)

| Platzierung / Kontext                                | Stil                      | Warum                                                          |
| ---------------------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| Auf weißem Card-Hintergrund, eigenständige Aktion    | **A — Squircle Outline**  | Border + Shadow heben den Button vom Hintergrund ab            |
| In Navigation / Header / neben Text, dezent          | **B — Minimal Ghost**     | Kein Hintergrund im Ruhezustand, stört Layout nicht            |
| Hervorgehobene Aktion, z.B. Profil-Avatar, FAB-artig | **C — Filled Round**      | Farbiger Kreis zieht Aufmerksamkeit, signalisiert Wichtigkeit  |
| In kompakter Toolbar / Aktionsleiste mit wenig Platz | **D — Tonal Pill**        | Ovale Pille spart Platz, passt in horizontale Reihen           |
| In Tabellenzeile / Card-Detail, klein und inline     | **Inline-Aktions-Icon**   | Minimal (p-1.5), stört Zeilenhöhe nicht                        |
| In enger Tabelle mit wenig Platz pro Zeile           | **Kompakt-Icon (size-7)** | Noch kleiner als Inline, farbiger Hintergrund für Sichtbarkeit |

### 14.5 Icon-Button-Farb-Wahl (gilt für A / B / C / D)

| Aktion / Bedeutung                          | Hover-Farbe | Beispiele                                  |
| ------------------------------------------- | ----------- | ------------------------------------------ |
| Standard-Aktion, Primär, Bearbeiten, Öffnen | **Blau**    | Editieren, Anzeigen, Zuweisen, Profil      |
| System-Aktion, neutral, Einstellungen       | **Grau**    | Menü, Einstellungen, Sortieren, Filter     |
| Positive Aktion, Hinzufügen, Bestätigen     | **Grün**    | Neuen Eintrag erstellen, Speichern, OK     |
| Destruktive Aktion, Löschen, Fehler         | **Rot**     | Löschen, Entfernen, Abbrechen (destruktiv) |
| Warnung, Hinweis, Aufmerksamkeit            | **Amber**   | Warnung anzeigen, Ausnahme, Kritisch       |

### 14.6 Formular-Element-Wahl

| Kontext                                        | Verwende                        | Abschnitt |
| ---------------------------------------------- | ------------------------------- | --------- |
| Einzelnes Feld, genug Platz (Modal, Card-Body) | STANDARD INPUT (py-2, px-4)     | 5.1       |
| Formular mit vielen Feldern / Grid-Layout      | KOMPAKT INPUT (h-8, py-1, px-2) | 5.1       |
| Wert nur anzeigen, nicht editieren             | ANZEIGEFELD (bg-slate-50)       | 5.1       |
| Wert anzeigen + kopierbar                      | READ-ONLY MIT KOPIEREN          | 5.1       |
| Datums-Eingabe                                 | DATEPICKER (Icon links, pl-10)  | 5.1       |
| Passwort / sensible Eingabe                    | PASSWORT-INPUT (Icon links)     | 5.1       |
| Mehrzeiliger Text                              | TEXTAREA (resize-none)          | 5.2       |
| Auswahl aus fester Liste                       | SELECT mit Custom-Pfeil         | 5.3       |
| Ja/Nein-Option                                 | CHECKBOX einfach                | 5.4       |
| Ja/Nein mit Erklärungstext                     | CHECKBOX MIT BESCHREIBUNG       | 5.4       |
| Auswahl genau einer Option aus Gruppe          | RADIO BUTTON                    | 5.5       |
| Ein/Aus-Schalter, sofortige Wirkung            | TOGGLE SWITCH                   | 5.6       |

### 14.7 Feedback-Element-Wahl

| Situation                                         | Element                     | Abschnitt |
| ------------------------------------------------- | --------------------------- | --------- |
| Asynchrone Aktion erfolgreich (API-Aufruf ok)     | Toast ERFOLG (bg-green-100) | 10        |
| Asynchrone Aktion fehlgeschlagen (API-Fehler)     | Toast FEHLER (bg-red-100)   | 10        |
| Asynchrone Aktion läuft                           | Toast LADEN (Spinner)       | 10        |
| Clipboard-Kopie bestätigen, kleine Inline-Meldung | Alert ERFOLG INLINE         | 7         |
| Wichtige Warnung im Seitenkontext (persistent)    | Alert WARNUNG (orange)      | 7         |
| Formular-Validierungsfehler (persistent)          | Alert FEHLER (rose)         | 7         |
| Neutrale Zusatzinfo / Hinweis                     | Alert NEUTRAL INFO          | 7         |
| Irreversible Aktion bestätigen lassen             | Modal (Lösch-Dialog)        | 6.2       |
| Einzelnes Feld ungültig                           | border-rose-500 + text      | 5.1       |
| Button-Aktion läuft                               | Spinner im Button (4px)     | 12.5      |
| Seiteninhalt wird geladen                         | Skeleton Loader             | 12.2      |
| Liste/Tabelle hat keine Einträge                  | Empty State                 | 12.3      |

### 14.8 Status-Anzeige-Wahl

| Kontext                                     | Element                               | Abschnitt |
| ------------------------------------------- | ------------------------------------- | --------- |
| Status einer Entität (Aktiv/Inaktiv/Fehler) | STATUS PILL (mit Dot)                 | 8         |
| Klickbarer Statusfilter (Toggle-Auswahl)    | STATUS-FILTER-PILL (aktiv/inaktiv)    | 8         |
| Sortier-Toggle neben Sektions-Label         | SORT-BUTTON (Balken-Icon, 3 Zustände) | 8         |
| Kategorie-Label (Neu, Intern, Admin)        | BADGE (ohne Dot, rounded-md)          | 8         |
| Status in Tabellenzeile                     | BADGE Tabelle (rounded-full)          | 8         |

### 14.9 Überschriften- und Label-Wahl

| Kontext                                                           | Verwende                            | Abschnitt |
| ----------------------------------------------------------------- | ----------------------------------- | --------- |
| Hauptüberschrift der Seite (1× pro Ansicht)                       | Seiten-H1 (`text-xl`)               | 3         |
| Titel in Card oder Modal                                          | Card-/Modal-Titel (`text-lg`)       | 3         |
| Untertitel innerhalb einer Card/Section                           | Abschnitts-Untertitel (`text-base`) | 3         |
| Abschnitt innerhalb eines Formulars (mit Trennlinie)              | Formular-Abschnittstitel (border-b) | 3         |
| Bereichs-Label auf der Seite (z.B. „Nach Vorgesetzten gruppiert") | Seiten-Sektions-Label               | 3         |
| Beschriftung eines Formularfelds                                  | Formular-Label (`text-slate-500`)   | 3         |
| Label auf einer Card (größer als Formular-Label)                  | Großes Label (`text-sm`)            | 3         |

**Unterschied Formular-Abschnittstitel vs. Seiten-Sektions-Label:**
Formular-Abschnittstitel hat `border-b` + `pb-1` + `font-bold` + `tracking-wider` — er gliedert Formulare visuell.
Seiten-Sektions-Label hat keine Linie, nur `font-semibold` — er beschriftet Bereiche auf der Seite (Spalten, Listen, Panels).

---

## 15. ANGULAR-SYNTAX (VERBINDLICH)

### 15.1 Grundregeln

```
✅ ERLAUBT:               ❌ VERBOTEN:
@if (bedingung) { }       *ngIf="bedingung"
@for (x of list; ...) { } *ngFor="let x of list"
@switch / @case           ngSwitch / *ngSwitchCase
[formGroup]               [(ngModel)]
formControlName           ngModel
(ngSubmit)                (submit) auf <form>
{{ variable }}            hartcodierte Beispieldaten
(click)="fn()"            onclick="fn()"
[ngClass]="{ ... }"       style="..." (außer dynamische Werte)
(observable$ | async)     .subscribe() im Template
```

### 15.2 @if / @else

```html
@if (isLoading) {
<svg class="w-5 h-5 animate-spin ...">...</svg>
} @else if (hasError) {
<div class="bg-rose-50 border border-rose-200 ...">{{ errorMessage }}</div>
} @else {
<span>Inhalt</span>
}
```

### 15.3 @for

```html
@for (item of items; track item.id) {
<tr class="hover:bg-slate-50/50 transition-colors">
  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
    {{ item.name }}
  </td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
    {{ item.datum }}
  </td>
</tr>
} @empty {
<tr>
  <td colspan="99" class="px-6 py-8 text-center text-slate-400 text-sm">
    Keine Einträge vorhanden.
  </td>
</tr>
}
```

### 15.4 Reactive Forms mit Validierung

```html
<form [formGroup]="formular" (ngSubmit)="submitForm()">
  <div class="space-y-0.5">
    <label class="text-xs font-semibold text-slate-500">
      Bezeichnung <span class="text-red-500">*</span>
    </label>
    <input
      type="text"
      formControlName="bezeichnung"
      placeholder="Eingabe..."
      class="w-full px-2 py-1 rounded border focus:border-[#006db7] outline-none text-sm h-8"
      [ngClass]="
        formular.controls.bezeichnung.invalid &&
        (formular.controls.bezeichnung.touched || submitted)
          ? 'border-rose-500 border-2'
          : 'border-slate-200'
      "
    />
  </div>

  <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
    <button
      type="button"
      (click)="cancel()"
      class="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
    >
      Abbrechen
    </button>
    <button
      type="submit"
      class="px-4 py-2 bg-[#006db7] hover:bg-[#005a99] text-white font-medium rounded-xl transition-colors flex items-center gap-2"
    >
      @if (isLoading) {
      <svg
        class="w-4 h-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      } @else { Speichern }
    </button>
  </div>
</form>
```

### 15.5 Async Pipe

```html
@for (eintrag of (eintraege$ | async) ?? []; track eintrag.ID) {
<tr class="hover:bg-slate-50/50 transition-colors">
  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
    {{ eintrag.Name }}
  </td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
    {{ eintrag.Datum }}
  </td>
  <td class="px-6 py-4 whitespace-nowrap text-right">
    <div class="flex items-center justify-end gap-2">
      <button
        (click)="onEdit(eintrag)"
        class="p-1.5 text-[#006db7] hover:bg-[#e0f2fe] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006db7]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"
          />
        </svg>
      </button>
      <button
        (click)="onDelete(eintrag)"
        class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"
          />
        </svg>
      </button>
    </div>
  </td>
</tr>
}
```

### 15.6 Lösch-Modal Muster

```html
@if (itemToDelete) {
<div class="fixed inset-0 z-50 flex items-center justify-center">
  <div
    class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
    (click)="itemToDelete = undefined"
  ></div>
  <div
    class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center"
  >
    <div
      class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"
    >
      <svg
        width="24"
        height="24"
        class="text-red-600"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"
        />
      </svg>
    </div>
    <h3 class="text-lg font-bold text-slate-800">
      {{ itemToDelete.name }} löschen?
    </h3>
    <p class="text-slate-500 text-sm mt-2 mb-6">
      Diese Aktion kann nicht rückgängig gemacht werden.
    </p>
    <div class="flex gap-3">
      <button
        (click)="itemToDelete = undefined"
        class="cursor-pointer flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
      >
        Abbrechen
      </button>
      <button
        (click)="deleteItem(itemToDelete)"
        class="cursor-pointer flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
      >
        Löschen
      </button>
    </div>
  </div>
</div>
}
```

---

## 16. VERBOTE (ABSOLUT)

```
❌ Keine eigenen CSS-Klassen (.meine-klasse { ... })
❌ Keine Inline-Styles außer [style.width] / [style.background-color] für dynamische Werte
❌ Keine anderen Blautöne als #006db7 / #005a99 / #e0f2fe / #cce4f7
❌ Keine Material Icons (<span class="material-symbols-outlined">)
❌ Keine externen Icon-Bibliotheken einbinden (Font Awesome, Lucide CDN etc.) — nur Inline-SVG
❌ Custom Icons nur von https://fonts.google.com/icons — niemals von einer anderen Quelle
❌ Keine externen Fonts (kein Google Fonts Import)
❌ Kein *ngIf / *ngFor / ngSwitch / [(ngModel)]
❌ Kein max-w-4xl, space-y-12 oder andere Dokumentations-Layout-Klassen aus der style.html
❌ Kein <header>, <body>, <html> — nur die Komponente selbst
❌ Keine Kommentare im Ausgabe-Code
❌ Kein h1 außer wenn explizit eine Seitenüberschrift gefordert ist
❌ Niemals mehr als einen primären Button pro Ansicht
❌ Kein `focus:ring-*` — ausschließlich `focus-visible:ring-*` verwenden (Ring nur bei Tastatur, nicht bei Mausklick)
❌ Kein `focus-visible:ring-*` auf Inputs, Textareas oder Selects — diese verwenden nur `focus:border-[#006db7]` (Ring wird bei overflow-hidden abgeschnitten)
❌ Kein `rounded-lg` auf Standard-Buttons (4.1/4.2) — diese verwenden `rounded-xl` (12px). Nur Kompakt-Icons (size-7) behalten `rounded-lg`
❌ Kein `overflow-auto` / `overflow-scroll` auf Textelementen (Buttons, Labels, Badges, Zellen) — nur auf explizit scrollbaren Containern
❌ Kein `italic` / `font-style: italic` — nirgends im gesamten Design-System. Kein kursiver Text.
❌ Kein `uppercase` / `text-transform: uppercase` — alle Texte in normaler Groß-/Kleinschreibung (Sentence case). Auch Text-Inhalte niemals manuell in GROSSBUCHSTABEN schreiben.
❌ Keine Positionierungsklassen (`absolute`, `inset-y-0`, `flex items-center`) direkt auf `<svg>` — immer einen `<div>`-Wrapper verwenden
❌ Kein `overflow-hidden` auf Accordion-Cards oder Containern mit drehbaren Chevron-Icons
❌ Keine neuen Variablen/Properties erfinden die nicht aus der Aufgabenbeschreibung hervorgehen
```

---

## 17. AUSGABE-FORMAT

- Nur der reine HTML-Block der Komponente
- Kein Markdown drumherum (keine Backticks, kein ```html)
- Keine Erklärungen, keine Kommentare im Code
- Keine Leerzeilen zwischen den Abschnitten, die nicht strukturell notwendig sind
- Root-Element direkt ohne umgebenden Wrapper
