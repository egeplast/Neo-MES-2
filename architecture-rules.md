# architecture-rules.md

Verbindliche Architektur- und Code-Konventionen für Angular-Projekte bei egeplast.  
Gilt zusammen mit `style-rules.md` (HTML/Template-Styling). Bei Konflikt hat `style-rules.md` für visuelle Fragen Vorrang, diese Datei für strukturelle.

---

## §1 Zweck & Anwendungsbereich

Diese Regeln gelten für neue Angular-Projekte ab Angular 21 und für Weiterentwicklungen bestehender Projekte. Abweichungen sind erlaubt, müssen aber begründet sein — die jeweilige Regel nennt wo das besonders relevant ist.

Prinzip: **Konsistenz über Eleganz.** Wenn mehrere Lösungswege gleich gut sind, zählt der im Projekt etablierte.

---

## §2 Tech-Stack (verbindlich)

| Schicht          | Technologie                                         | Version |
| ---------------- | --------------------------------------------------- | ------- |
| Framework        | Angular                                             | 21.1+   |
| Change Detection | Zoneless (`provideZonelessChangeDetection()`)       | —       |
| Styling          | Tailwind CSS 4 (PostCSS-Plugin, kein Config-File)   | 4.2+    |
| State            | NgRx SignalStore                                    | 21.1+   |
| Forms            | Reactive Forms, typed, `nonNullable: true`          | —       |
| Routing          | Standalone Router, `loadComponent`                  | —       |
| HTTP             | `provideHttpClient(withInterceptors([...]))`        | —       |
| Auth             | MSAL (`@azure/msal-angular`, `@azure/msal-browser`) | 5.x     |
| Tests            | Vitest + jsdom                                      | 4.x     |
| Shared Types     | Path-Alias `@shared/*` → `../libs/*`                | —       |
| Audit            | AuditService + Interceptor (optional)               | —       |
| Theming          | ThemeStore (Light/Dark/System via @custom-variant)  | —       |

**Nicht verwendet:**

- Kein klassisches NgRx (kein `@ngrx/store`, kein `@ngrx/effects`)
- Kein Karma / Jasmine
- Keine HTTP-Kommunikation über `Promise`-Services (nur `Observable<T>`)
- Kein `[(ngModel)]` für Formulare (siehe §8)

---

## §3 Projekt-Struktur

Monorepo-Root:

```
<projekt>/
├── libs/
│   ├── dto/              (Request-DTOs, Backend-geteilt)
│   ├── return-dto/       (Response-DTOs, Backend-geteilt)
│   └── interfaces/       (gemeinsame Interfaces, Frontend+Backend)
├── <projekt>-frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── environments/
│   │   └── styles.css
│   ├── public/
│   ├── nginx/
│   ├── Dockerfile
│   └── angular.json
├── <projekt>-rest-api/   (NestJS, separat)
└── docker-compose.yml
```

Frontend `src/app/`:

```
app/
├── app.ts / .html / .css
├── app.config.ts
├── app.routes.ts
├── header/
│   ├── header.ts
│   ├── header.html
│   └── header.css
├── sidebar/
├── notification/
├── services/
│   ├── <feature>/
│   │   └── <feature>.service.ts
│   ├── msal-graph.service.ts
│   └── auth.guard.ts
├── store/
│   ├── <Feature>/              (PascalCase Folder)
│   │   └── <Feature>.store.ts
│   └── notification/
│       └── notification.store.ts
└── <feature>/                  (ein Feature = ein Folder)
    ├── <feature>.ts
    ├── <feature>.html
    ├── <feature>.css
    └── <feature>.spec.ts
```

**Regeln:**

- Ein Feature = ein Folder mit `.ts`, `.html`, `.css`, `.spec.ts`. Keine `components/`-Sub-Folder pro Feature, keine `smart/` vs. `presentational/`-Trennung.
- Services leben in `services/<feature>/<feature>.service.ts`. Ausnahme: querschnittliche Services direkt in `services/<name>.service.ts` (z.B. `msal-graph.service.ts`, `auth.guard.ts`).
- Stores leben in `store/<Feature>/<Feature>.store.ts`. Ordnername und Datei in PascalCase.
- `@shared/*` ist der einzige erlaubte Alias für Libs. Keine relativen `../../../libs/...`-Pfade.

---

## §4 Naming-Konventionen

### Dateien

| Artefakt             | Datei                                 | Klasse/Export                                  |
| -------------------- | ------------------------------------- | ---------------------------------------------- |
| Komponente (Feature) | `extruder-detail.ts`                  | `ExtruderDetailComponent`                      |
| Shell-Komponente     | `app.ts` / `header.ts` / `sidebar.ts` | `App` / `HeaderComponent` / `SidebarComponent` |
| Service              | `extruder.service.ts`                 | `ExtruderService`                              |
| SignalStore          | `Extruder.store.ts`                   | `ExtruderStore`                                |
| Guard                | `auth.guard.ts`                       | `authGuard` (functional)                       |
| Interceptor          | `auth.interceptor.ts`                 | `authInterceptor` (functional)                 |
| Interface (lokal)    | `extruder.model.ts`                   | `export interface Extruder { ... }`            |

**Regeln:**

- Komponenten-Dateien **ohne** `.component`-Suffix (Angular 17+). Selector `app-<kebab>`.
- Komponenten-Klassen **mit** `Component`-Suffix. Ausnahme: die Shell-Root-Komponente heißt `App`.
- Service-Dateien **mit** `.service`-Suffix.
- Store-Dateien **mit** `.store`-Suffix, Ordner in PascalCase.
- Guards und Interceptors: functional (kein `@Injectable`-basierter Guard mehr).

### Symbole

- Methoden: `camelCase`, Verb zuerst. `loadX` / `createX` / `updateX` / `deleteX` / `reload`. **Nie** `getX` für einen Mutations- oder Lade-Vorgang — `get` ist Getter.
- Boolean-Signals / Felder: `isX`, `hasX`, `canX`. Nie `xFlag`.
- Private Felder: `private readonly name` — auch wenn TypeScript es nicht erzwingt.
- Konstanten auf Modul-Ebene: `SCREAMING_SNAKE_CASE`.

---

## §5 Komponenten-Pattern

### §5.1 Grundgerüst

```typescript
import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ExtruderStore } from "../store/Extruder/Extruder.store";

@Component({
  selector: "app-extruder-list",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./extruder-list.html",
  styleUrl: "./extruder-list.css",
})
export class ExtruderListComponent implements OnInit {
  readonly store = inject(ExtruderStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.loadAll();
  }

  navigateToDetail(id: string): void {
    this.router.navigate(["/extruder", id]);
  }
}
```

### §5.2 Verbindliche Regeln

**Standalone, immer.** Kein `@NgModule` in Neuentwicklung. `standalone: true` ist seit Angular 19 Default, muss nicht explizit gesetzt werden.

**`inject()` überall.** Kein Constructor-DI mehr — weder in Komponenten, Stores, Services noch Guards. Einzige Ausnahme: `@Injectable`-Services des Scaffolding-Templates, die werden bei Gelegenheit migriert.

```typescript
✓ readonly store = inject(ExtruderStore);
✓ private readonly router = inject(Router);

✗ constructor(private store: ExtruderStore, private router: Router) {}
```

**Sichtbarkeiten:**

- Stores und NotificationStore → `readonly` und **public** (Template-Zugriff).
- Services, Router, andere Infrastruktur → `private readonly`.
- Reine Form-Felder → ohne Modifier.

**Lifecycle:**

- `ngOnInit` für Daten-Ladung beim Mount.
- `ngOnDestroy` nur wenn tatsächlich Cleanup nötig (z.B. Chart-Destroy, Subject-Completion, Store-Reset).
- `ngAfterViewInit` vermeiden — stattdessen `afterNextRender()` oder `viewChild()`-Signal.

### §5.3 Template-Bindings

**Block-Syntax ausschließlich.** Siehe auch `style-rules.md §1`.

```
✓ @if (store.loading()) { ... } @else { ... }
✓ @for (item of store.items(); track item.id) { ... } @empty { ... }
✓ @switch (order.status) { @case ('open') { ... } @default { ... } }
✓ @let name = store.currentUser()?.firstName ?? '—';

✗ *ngIf="store.loading()"
✗ *ngFor="let item of items"
✗ <ng-container *ngSwitchCase="...">
```

**Signals im Template als Funktionen aufrufen:** `store.items()`, nicht `store.items`.

**Kein `$any()`.** Typisiere den State oder nutze `@let`:

```
✗ {{ $any(ex.status).forecast.dueDate }}
✓ @let forecast = ex.status?.forecast;
  @if (forecast) { {{ formatDate(forecast.dueDate) }} }
```

**Event-Handler-Parameter typisieren:**

```
✓ (change)="onFileSelected($event)"       methode: onFileSelected(event: Event)
✗ (change)="onFileSelected($any($event))"
```

### §5.4 ViewChild → `viewChild()` Signal-API

```typescript
✓ readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chart');

✗ @ViewChild('chart') chartCanvas!: ElementRef<HTMLCanvasElement>;
```

### §5.5 Router-Inputs statt ActivatedRoute

Die App-Config aktiviert `withComponentInputBinding()`. Route-Parameter kommen als `input()`-Signals:

```typescript
✓ readonly id = input.required<string>();
  ngOnInit() { this.store.load(this.id()); }

✗ private readonly route = inject(ActivatedRoute);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.store.load(id);
  }
```

---

## §6 State-Management mit NgRx SignalStore

### §6.1 Grundstruktur

Jeder Store folgt strikt diesem Aufbau:

```typescript
import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { firstValueFrom } from "rxjs";
import { v4 } from "uuid";
import { ExtruderService } from "../../services/extruder/extruder.service";
import { NotificationStore } from "../notification/notification.store";
import { Extruder } from "@shared/interfaces";

type ExtruderState = {
  items: Extruder[];
  selectedId: string | null;
};

const initialState: ExtruderState = {
  items: [],
  selectedId: null,
};

export const ExtruderStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withComputed((store) => ({
    selected: computed(
      () => store.items().find((e) => e.id === store.selectedId()) ?? null,
    ),
    itemCount: computed(() => store.items().length),
  })),

  withMethods(
    (
      store,
      service = inject(ExtruderService),
      notif = inject(NotificationStore),
    ) => ({
      async loadAll(): Promise<void> {
        const id = v4();
        notif.addLoading(id, "Extruder laden...");
        try {
          const items = await firstValueFrom(service.getAll());
          patchState(store, { items });
          notif.addSuccess(id, "");
        } catch {
          notif.addError(id, "Extruder konnten nicht geladen werden");
        }
      },

      select(id: string): void {
        patchState(store, { selectedId: id });
      },
    }),
  ),
);
```

### §6.2 Verbindliche Regeln

**Alle Stores `{ providedIn: 'root' }`.** Singleton via Angular-DI, kein Feature-Scoping. Bei Bedarf wird das in Komponenten via `clear()`-Methode beim `ngOnDestroy` zurückgesetzt.

**Dependencies per `inject()` im `withMethods`-Default-Parameter.**

```typescript
✓ withMethods((store, service = inject(XService)) => ({ ... }))
✗ withMethods((store) => {
    const service = inject(XService);
    return { ... };
  })
```

**State-Updates ausschließlich via `patchState`.** Kein direktes Zuweisen, kein Spread außerhalb von `patchState`.

```typescript
✓ patchState(store, { items, loading: false });
✓ patchState(store, (state) => ({ items: [...state.items, newItem] }));

✗ store.items.set(items);
```

**Async-Methoden nutzen `firstValueFrom()` statt `.subscribe()`.** `.subscribe()` gehört in Stores grundsätzlich nicht hin — dort wo es ausnahmsweise nötig ist (Streams, die nie abschließen), bitte explizit kommentieren warum.

**Rückgabewerte:**

- Lade-Methoden (`loadX`) → `Promise<void>`
- Mutations-Methoden (`createX`, `updateX`, `deleteX`) → `Promise<boolean>` für UI-Branching (z.B. Form zurücksetzen nur bei Erfolg) ODER `Promise<string | null>` wenn die ID gebraucht wird (typisch bei Create).

### §6.3 Notification-Wrap-Pattern

Jede asynchrone Store-Methode folgt genau diesem Muster:

```typescript
async createItem(data: CreateItemDto): Promise<boolean> {
  const id = v4();
  notif.addLoading(id, 'Artikel anlegen...');
  try {
    await firstValueFrom(service.create(data));
    notif.addSuccess(id, `Artikel "${data.name}" angelegt`);
    await this.loadAll();
    return true;
  } catch (err: any) {
    const msg = err?.status === 409
      ? 'Artikel existiert bereits'
      : 'Artikel konnte nicht angelegt werden';
    notif.addError(id, msg);
    return false;
  }
}
```

**Wichtige Details:**

- `v4()` aus `uuid` erzeugt die Notification-ID. Loading, Success und Error sind über diese ID verknüpft — `addSuccess(id, ...)` und `addError(id, ...)` entfernen den zugehörigen Loading-Eintrag.
- `addSuccess(id, '')` mit **leerem String** entfernt den Loading-Eintrag, ohne eine Success-Notification zu zeigen. Für Background-Reloads und stille Erfolge.
- HTTP 409 wird explizit auf Uniqueness-Konflikte gemappt (`${name} existiert bereits`). Andere Status-Codes nur dann spezifisch behandeln wenn das Backend sie dokumentiert zurückgibt.
- Nach erfolgreicher Mutation `await this.loadAll()` oder `await this.reload()` — nie optimistic Updates mit anschließendem Refresh.

### §6.4 Computed über Selectors

Abgeleiteter State gehört in `withComputed`, nicht in Komponenten.

```typescript
✓ withComputed((store) => ({
    overdueCount: computed(() =>
      store.items().filter((i) => i.dueDate < new Date()).length,
    ),
  }))

✗ In Komponente:
  get overdueCount() {
    return this.store.items().filter(...).length;
  }
```

### §6.5 Store-Reset beim Verlassen

Detail-Stores werden beim Route-Wechsel zurückgesetzt:

```typescript
withMethods((store) => ({
  clear(): void {
    patchState(store, { current: null });
  },
})),
```

```typescript
ngOnDestroy(): void {
  this.store.clear();
}
```

---

## §7 Services (HTTP)

### §7.1 Grundgerüst

```typescript
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Extruder } from "@shared/interfaces";

@Injectable({ providedIn: "root" })
export class ExtruderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/extruder`;

  getAll(includeDeleted = false): Observable<Extruder[]> {
    const params: Record<string, string> = {};
    if (includeDeleted) params["includeDeleted"] = "true";
    return this.http.get<Extruder[]>(this.baseUrl, { params });
  }

  getOne(id: string): Observable<Extruder> {
    return this.http.get<Extruder>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Extruder>): Observable<Extruder> {
    return this.http.post<Extruder>(this.baseUrl, data);
  }

  update(id: string, data: Partial<Extruder>): Observable<Extruder> {
    return this.http.patch<Extruder>(`${this.baseUrl}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  restore(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/restore`, {});
  }
}
```

### §7.2 Verbindliche Regeln

**Immer `@Injectable({ providedIn: 'root' })`.**

**`inject()` statt Constructor-DI** — auch in Services. Das Scaffolding-Template ist hier noch nicht migriert, neue Services folgen aber der Regel.

**Rückgabe immer `Observable<T>`**, nie `Promise`. Die Konvertierung zu Promise passiert **im Store** via `firstValueFrom()`.

**`baseUrl` via Environment, nie hartcodiert:**

```typescript
✓ private readonly baseUrl = `${environment.apiBaseUrl}/extruder`;
✗ private readonly baseUrl = 'http://localhost:11010/api/extruder';
```

### §7.3 Standardisierte REST-Methoden-Namen

Jeder CRUD-Service bietet wo sinnvoll:

| Methode                   | HTTP   | Pfad               | Rückgabe           |
| ------------------------- | ------ | ------------------ | ------------------ |
| `getAll(includeDeleted?)` | GET    | `/x`               | `Observable<X[]>`  |
| `getOne(id)`              | GET    | `/x/:id`           | `Observable<X>`    |
| `search(query)`           | GET    | `/x/search?q=...`  | `Observable<X[]>`  |
| `create(data)`            | POST   | `/x`               | `Observable<X>`    |
| `update(id, data)`        | PATCH  | `/x/:id`           | `Observable<X>`    |
| `duplicate(id, newName?)` | POST   | `/x/:id/duplicate` | `Observable<X>`    |
| `remove(id)`              | DELETE | `/x/:id`           | `Observable<void>` |
| `restore(id)`             | POST   | `/x/:id/restore`   | `Observable<void>` |

**Domain-Actions** als zusätzliche Methoden mit sprechendem Namen: `toggleIgnoreSample`, `execute`, `complete`, `assign`. Nicht in `update` einbauen.

**Uniform PATCH** — `update` nutzt IMMER `PATCH`, nie `PUT`. Teil-Updates sind Standard.

### §7.4 File-Uploads

FormData mit Feldnamen `file` (generisch) oder `image` (für Bilder/Plates):

```typescript
uploadPlate(extruderId: string, file: File): Observable<ExtruderPlate> {
  const formData = new FormData();
  formData.append('image', file);
  return this.http.post<ExtruderPlate>(
    `${this.baseUrl}/${extruderId}/plate`,
    formData,
  );
}
```

### §7.5 Keine Business-Logik in Services

Services sind **dumme HTTP-Wrapper**. Keine Transformation, keine Error-Handling-Logik, keine Caching-Schicht. Error-Handling gehört in den Store (via `try/catch`). Caching über SignalStore-State, nicht im Service.

```typescript
✗ getAll(): Observable<Extruder[]> {
    return this.http.get<Extruder[]>(this.baseUrl).pipe(
      map((items) => items.map(transformAndEnrich)),
      catchError((err) => {
        console.error(err);
        return of([]);
      }),
    );
  }

✓ getAll(): Observable<Extruder[]> {
    return this.http.get<Extruder[]>(this.baseUrl);
  }
```

---

## §8 Reactive Forms

### §8.1 Grundmuster

```typescript
form = new FormGroup({
  title: new FormControl<string>("", {
    nonNullable: true,
    validators: [Validators.required],
  }),
  description: new FormControl<string>("", { nonNullable: true }),
  dueDate: new FormControl<string>("", { nonNullable: true }),
  assignedUserId: new FormControl<string>("", { nonNullable: true }),
  hours: new FormControl<number | null>(null, {
    validators: [Validators.required],
  }),
  isMaintenance: new FormControl<boolean>(false, { nonNullable: true }),
  groupIds: new FormControl<string[]>([], { nonNullable: true }),
});
```

### §8.2 Regeln

**Kein `[(ngModel)]`.** Alle Formulare sind Reactive Forms. Einzelne `FormControl`s dürfen via `[formControl]` gebunden werden:

```html
✓ <input [formControl]="searchControl" /> ✓ <input formControlName="title" /> ✗
<input [(ngModel)]="searchQuery" />
```

**Typing-Regeln:**

| Feld-Typ                  | Initial          | Declaration                                              |
| ------------------------- | ---------------- | -------------------------------------------------------- |
| String (Pflicht/Optional) | `''`             | `FormControl<string>('', { nonNullable: true, ... })`    |
| Zahl nullable             | `null`           | `FormControl<number \| null>(null)` — ohne `nonNullable` |
| Zahl mit Default          | `0`              | `FormControl<number>(0, { nonNullable: true })`          |
| Boolean                   | `false` / `true` | `FormControl<boolean>(false, { nonNullable: true })`     |
| String-Array              | `[]`             | `FormControl<string[]>([], { nonNullable: true })`       |

**Nullable-Number ist bewusst** — unterscheidet "leer gelassen" von "explizit 0".

**Submit-Pattern:**

```typescript
async onSubmit(): Promise<void> {
  if (this.form.invalid) {
    this.notificationStore.addError(v4(), 'Bitte fülle alle Felder aus');
    return;
  }
  const raw = this.form.getRawValue();
  const success = await this.store.createItem({
    title: raw.title,
    description: raw.description || undefined,
    hours: raw.hours ?? undefined,
  });
  if (success) this.form.reset();
}
```

- `getRawValue()` auslesen, nie `.value` direkt (Disabled-Felder!)
- Leere Strings zu `undefined` mappen (`raw.x || undefined`) wenn das Backend das so erwartet.
- Nullable-Numbers mit `?? undefined` mappen.

### §8.3 Custom Validators

Statische Methoden der Komponente. Verwendung via Group-Level-Validator:

```typescript
export class PinFormComponent {
  pinForm = new FormGroup(
    {
      pin: new FormControl<string>("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
      pinConfirm: new FormControl<string>("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: [PinFormComponent.pinsMatch] },
  );

  private static pinsMatch(group: AbstractControl): ValidationErrors | null {
    const pin = group.get("pin")?.value;
    const confirm = group.get("pinConfirm")?.value;
    return pin && confirm && pin !== confirm ? { pinsMismatch: true } : null;
  }
}
```

### §8.4 Suche mit Debounce

Einziger Fall wo `rxjs` in Komponenten vorkommt:

```typescript
searchControl = new FormControl<string>('', { nonNullable: true });
private readonly destroy$ = new Subject<void>();

ngOnInit(): void {
  this.searchControl.valueChanges
    .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
    .subscribe((query) => this.store.search(query));
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## §9 Routing

### §9.1 Routes-Datei

```typescript
import { Routes } from "@angular/router";
import { authGuard } from "./services/auth.guard";

export const routes: Routes = [
  { path: "", redirectTo: "linien", pathMatch: "full" },
  {
    path: "linien",
    loadComponent: () =>
      import("./linien/linien").then((m) => m.LinienComponent),
  },
  {
    path: "extruder/:id",
    loadComponent: () =>
      import("./extruder-detail/extruder-detail").then(
        (m) => m.ExtruderDetailComponent,
      ),
  },
  {
    path: "auftraege",
    loadComponent: () =>
      import("./auftraege-list/auftraege-list").then(
        (m) => m.AuftraegeListComponent,
      ),
  },
  {
    path: "auftraege/neu",
    loadComponent: () =>
      import("./auftraege-create/auftraege-create").then(
        (m) => m.AuftraegeCreateComponent,
      ),
  },
  {
    path: "auftraege/:id",
    loadComponent: () =>
      import("./auftraege-detail/auftraege-detail").then(
        (m) => m.AuftraegeDetailComponent,
      ),
  },
  {
    path: "config",
    loadComponent: () =>
      import("./config/config").then((m) => m.ConfigComponent),
    canActivate: [authGuard],
    data: {
      requiredGroups: [
        "4c42008e-b32d-4d7b-a113-e2d4ab854365",
        "6abe6ba7-ee4d-4a66-9031-cd9b150b4981",
      ],
    },
  },
  { path: "**", redirectTo: "" },
];
```

### §9.2 Regeln

**Immer `loadComponent` (lazy)**, nie eager Import. Auch für kleine Komponenten.

**URL-Schema:**

| Zweck               | Pfad                      |
| ------------------- | ------------------------- |
| Liste               | `/resource`               |
| Erstellen           | `/resource/neu`           |
| Detail              | `/resource/:id`           |
| Settings/Stammdaten | `/resource/einstellungen` |
| Subressource-Liste  | `/resource/bestellliste`  |

Deutsche Pfad-Segmente (`neu`, `einstellungen`, `kalender`) — konsistent mit UI-Sprache.

**Wildcard** `**` redirected auf Dashboard oder Login (je nach Auth-Setup). Kein `404`-Content bei Internen Apps.

**`withComponentInputBinding()`** in der App-Config aktiv — Route-Params kommen als `input()` in die Komponente (siehe §5.5).

### §9.3 Guards (Gruppen-basiert)

Das Scaffolding liefert bei MSAL-Setup einen standardmäßig generierten `authGuard` unter `src/app/services/auth.guard.ts`. Er prüft Azure-AD-Gruppenmitgliedschaft gegen eine Liste von Group-IDs in `route.data.requiredGroups`. Bei fehlender Berechtigung wird auf die Root-Route (`''`) umgeleitet.

**Implementierung (aus dem Scaffolding, nicht anfassen):**

```typescript
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { forkJoin, map, tap } from "rxjs";
import { MsalGraphService } from "./msal-graph.service";

export const authGuard: CanActivateFn = (route) => {
  const msalGraphService = inject(MsalGraphService);
  const router = inject(Router);

  const requiredGroupIds = (route.data["requiredGroups"] as string[]) ?? [];
  if (requiredGroupIds.length === 0) return true;

  return forkJoin(
    requiredGroupIds.map((id) => msalGraphService.isMemberOf(id)),
  ).pipe(
    map((results) => results.some((isMember) => isMember === true)),
    tap((allowed) => {
      if (!allowed) router.navigate([""]);
    }),
  );
};
```

**Verwendung in Routes:**

```typescript
import { authGuard } from './services/auth.guard';

{
  path: 'config',
  loadComponent: () => import('./config/config').then((m) => m.ConfigComponent),
  canActivate: [authGuard],
  data: {
    requiredGroups: [
      '4c42008e-b32d-4d7b-a113-e2d4ab854365',
      '6abe6ba7-ee4d-4a66-9031-cd9b150b4981',
    ],
  },
},
```

**Semantik:**

- `requiredGroups` ist ein Array — der User braucht Mitgliedschaft in **mindestens einer** dieser Gruppen (**OR-Semantik**).
- Fehlt `requiredGroups` oder ist leer, lässt der Guard durch. Der Guard kann also unbedenklich an jeder Route angehängt werden — ohne Gruppen-Data hat er keinen Effekt.
- Bei fehlender Berechtigung: Redirect auf Root-Route `''`.

**Konsistenz mit der Sidebar:**

Die gleichen Group-IDs gehören in `sidebar.ts` unter `NavElement.requiredGroupIds`, damit Navigation und Zugriffsschutz übereinstimmen:

```typescript
elements: NavElement[] = [
  { title: 'Linien', link: '/linien', icon: '...' },
  {
    title: 'Config',
    link: '/config',
    icon: '...',
    requiredGroupIds: [
      '4c42008e-b32d-4d7b-a113-e2d4ab854365',
      '6abe6ba7-ee4d-4a66-9031-cd9b150b4981',
    ],
  },
];
```

Die Sidebar filtert automatisch:

- Einträge ohne `requiredGroupIds` bleiben immer sichtbar.
- Einträge mit `requiredGroupIds` erscheinen erst, wenn die User-Gruppen geladen sind **und** mindestens eine ID übereinstimmt (kurzer Flicker ist akzeptiert, damit geschützte Links nie sichtbar sind solange der Auth-Zustand unklar ist).
- Parent-Einträge ohne eigene `requiredGroupIds`, deren sämtliche Children aber gesperrt sind, werden ebenfalls ausgeblendet (leere Parents verschwinden).

**Anti-Pattern:** Gruppen-IDs in der Komponente selbst prüfen (via `MsalGraphService.isMemberOf()` in der Komponente) statt über den Guard oder die Sidebar-Konfiguration. Der Guard ist Single-Source-of-Truth für den Zugriffsschutz, die Sidebar für die Sichtbarkeit.

---

## §10 Auth mit MSAL (On-Behalf-Of-Flow)

### §10.1 Prinzip

Das Frontend fordert **einen Backend-Scope-Token** an — keinen Graph-Token. Das Backend tauscht diesen Token per OBO-Flow gegen einen Graph-Token. Vorteil: Backend kann im Namen des Users Graph-/SharePoint-Aufrufe machen.

```
Frontend ──── customScope-Token ────▶ Backend
                                        │
                                        ▼ OBO-Flow
                                     Graph API
```

### §10.2 App-Config (`app.config.ts`)

Die MSAL-Config kommt aus dem Scaffolding-Template und wird nur in Einzelfällen angepasst. Zentral ist die `protectedResourceMap`:

```typescript
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(environment.MSAL_me, environment.MSAL_scopes);
  if (environment.apiBaseUrl && environment.customScope) {
    protectedResourceMap.set(environment.apiBaseUrl, [environment.customScope]);
  }
  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap,
  };
}
```

- Graph-URL bekommt Graph-Scopes (`user.read`).
- Backend-API-URL bekommt `customScope` (`api://<BACKEND_CLIENT_ID>/User.Read`).
- Der Interceptor hängt automatisch den passenden Token an — keine manuelle Token-Extraktion im Komponenten-Code.

### §10.3 `MsalGraphService` — nur für Anzeige-Daten

Der Service hält User-Daten, Profilbild und SecurityGroups. **Nicht** als State-Store missbrauchen.

```typescript
@Component({...})
export class HeaderComponent {
  private readonly graph = inject(MsalGraphService);
  readonly userData = toSignal(this.graph.userData$, { initialValue: null });
  readonly profilePicture = toSignal(this.graph.profilePicture$, { initialValue: '' });
}
```

**Verbindlich:**

- `BehaviorSubject` (Service intern) → `toSignal()` (Komponente) — nicht `| async`.
- `isMemberOf(groupId)` nur im `authGuard` und in der Sidebar — nicht in Feature-Komponenten.
- Logout geht über `graph.logout()` (MSAL-Popup), nicht eigene Implementierung.

### §10.4 App-Start

Die Root-Komponente triggert den MSAL-Redirect-Handler und lädt User-Daten:

```typescript
ngOnInit() {
  this.msalService
    .handleRedirectObservable()
    .pipe(takeUntil(this.destroy$))
    .subscribe();

  combineLatest([
    this.msalBroadcastService.inProgress$.pipe(
      filter((status) => status === InteractionStatus.None),
    ),
    this.route.queryParams,
  ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.msalGraphService.setActiveAccountAndLoadData());
}
```

Dieser Teil kommt aus dem Template und wird nur angefasst wenn zusätzliche Init-Schritte nötig sind. `setActiveAccountAndLoadData()` lädt implizit auch die SecurityGroups, die der `authGuard` und die Sidebar benötigen.

---

## §11 Globale Services: Notification

### §11.1 Store

Der `NotificationStore` ist global verfügbar und wird überall wo asynchrone UX-Feedback nötig ist verwendet:

```typescript
notif.addLoading(id, "Label..."); // zeigt Spinner, bleibt sichtbar
notif.addSuccess(id, "Erfolgs-Text"); // ersetzt Loading durch Success-Toast
notif.addSuccess(id, ""); // entfernt Loading ohne Toast (silent)
notif.addError(id, "Fehler-Text"); // ersetzt Loading durch Error-Toast
notif.removeNotification(id); // manuell entfernen
```

- Success/Error verschwinden nach 5 Sekunden automatisch.
- IDs werden mit `v4()` aus `uuid` erzeugt.

### §11.2 Wann verwenden

**Immer** für:

- Alle async Store-Operationen (siehe §6.3)
- Globale Fehlermeldungen die der User sehen soll

**Nicht** für:

- Lokale Form-Validierung (das macht `Validators` + `<span class="text-red-500">` im Template)
- Inline-Bestätigungen (z.B. "Kopiert!") — das sind lokale Mini-Toasts pro Button

### §11.3 Render-Komponente

`<app-notification>` wird einmal im `app.html` gerendert:

```html
<app-header></app-header>
<app-sidebar></app-sidebar>
<main>
  <router-outlet></router-outlet>
</main>
<app-notification></app-notification>
```

Die Komponente läuft gegen den globalen Store, keine Props, kein Config.

### §11.4 ThemeStore

Der `ThemeStore` ist global verfügbar und steuert Light/Dark/System-Mode.

**API:**

- `mode()` — aktueller Modus (`'light' | 'dark' | 'system'`)
- `resolvedIsDark()` — tatsächlich gerenderter Zustand (System → auflösung via matchMedia)
- `setMode(mode)` — Modus explizit setzen
- `cycleMode()` — Light → Dark → System → Light

Der Store setzt automatisch die `dark`-Klasse auf `<html>` (Angular bindet darüber Tailwinds `@custom-variant dark`, siehe `styles.css`). Persistenz via `sessionStorage` — **nicht** `localStorage`, damit beim Browser-Neustart die Systempräferenz wieder greift.

Das Toggle-UI ist bereits in der Sidebar integriert — nichts weiter tun.

---

## §12 Shared Types via `@shared/*`

### §12.1 Organisation

Typen die Frontend **und** Backend teilen leben in `/libs`:

```
libs/
├── interfaces/
│   ├── extruder.interface.ts
│   ├── order.interface.ts
│   └── index.ts                (re-exports alles)
├── dto/
│   └── create-extruder.dto.ts  (Request-Validierung)
└── return-dto/
    └── extruder.dto.ts         (Response-Shape)
```

### §12.2 Import-Regel

```typescript
✓ import { Extruder, OilChangeOrder } from '@shared/interfaces';
✗ import { Extruder } from '../../../../libs/interfaces/extruder.interface';
```

Der Alias wird in `tsconfig.json` konfiguriert (macht das Scaffolding-Script automatisch).

### §12.3 Frontend-spezifische Typen

Bleiben im Frontend-Projekt, nicht in `/libs`:

- Komponenten-interne View-Models (z.B. `DueExtruder` im `FaelligkeitenStore`)
- Store-State-Types
- Form-Types

Nur was **wirklich** shared werden muss (API-Contracts) gehört in `libs/`.

---

## §13 Environment & Config

### §13.1 Drei Environment-Dateien

```
src/environments/
├── environment.ts          (Default / Fallback — leere Strings)
├── environment.dev.ts      (ng serve)
└── environment.prod.ts     (ng build)
```

Ersetzung via `fileReplacements` in `angular.json` (macht das Scaffolding-Script).

### §13.2 Environment-Interface

Für Type-Safety:

```typescript
export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  MSAL_clientId: string;
  MSAL_authority: string;
  MSAL_redirectUri: string;
  MSAL_postLogoutRedirectUri: string;
  MSAL_scopes: string[];
  MSAL_me: string;
  MSAL_loginFailedRoute: string;
  customScope: string;
}
```

### §13.3 Locale

App-Config setzt `de-DE`:

```typescript
registerLocaleData(localeDe);

providers: [
  { provide: LOCALE_ID, useValue: "de-DE" },
  // ...
];
```

Alle Datums-/Zahlen-Pipes verwenden automatisch deutsches Format.

---

## §14 Testing

### §14.1 Vitest, nicht Karma

Das Scaffolding setzt Vitest + jsdom auf (Angular 21 Test-Builder `@angular/build:unit-test`).

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ExtruderListComponent } from "./extruder-list";

describe("ExtruderListComponent", () => {
  let component: ExtruderListComponent;
  let fixture: ComponentFixture<ExtruderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtruderListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtruderListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
```

### §14.2 Prioritäten

In dieser Reihenfolge:

1. **Store-Tests** (Business-Logik in `withMethods`) — höchster Nutzen
2. **Service-Tests** nur wenn nicht-triviale Logik drin ist (z.B. URL-Building)
3. **Komponenten-Tests** nur für kritische User-Flows — Snapshot-Tests vermeiden

"Smoke"-Tests (`should create`) sind pro Komponente akzeptabel, liefern aber kaum Wert — nicht über den Standard hinaus erweitern wenn keine echte Logik da ist.

---

## §15 Anti-Patterns

Hart verboten:

1. **`*ngIf` / `*ngFor` / `*ngSwitch`** — nur neue Block-Syntax (`@if` / `@for` / `@switch`).
2. **`[(ngModel)]`** in neuen Formularen. Reactive Forms Pflicht.
3. **`.subscribe()` in Komponenten** (Ausnahme: Search-Debounce, siehe §8.4). In Stores nie.
4. **`any`-Typen** in neuem Code. Unbekannt → `unknown`. `$any()` im Template nie.
5. **Constructor-DI in neuem Code** — siehe §5.2.
6. **`Promise`-Rückgaben in Services** — `Observable<T>` ist Pflicht.
7. **Business-Logik im Template** — `getRawValue()`, `.filter()`, Datums-Rechnung gehören in TS (Komponente oder besser Store-Computed).
8. **Direkte HttpClient-Nutzung in Komponenten** — Store → Service → HttpClient.
9. **Hartcodierte URLs / Ports** — immer via `environment.*`.
10. **`localStorage` für Auth-Tokens** — MSAL-BrowserCache managed das selbst (`sessionStorage`).
11. **Eigene Error-Interceptor-Logik** für MSAL-geschützte Requests — der MSAL-Interceptor behandelt 401/403 inkl. Token-Refresh. Kein eigener Retry.
12. **Inline-SVGs dupliziert** — mehr als 3× dasselbe SVG → Icon-Component oder `sanitizeIcon()`-Pattern wie in der Sidebar.
13. **`confirm()` / `alert()` / `prompt()`** — für Bestätigungen ein Modal, für Eingaben ein Formular. Siehe `style-rules.md §6.3`.
14. **Global gespeicherte Credentials / Secrets** — im Frontend **niemals**.
15. **`MsalGraphService.isMemberOf()` in Feature-Komponenten** — Zugriffsschutz gehört in den `authGuard` (§9.3), Sichtbarkeit in `NavElement.requiredGroupIds`.

---

## §16 Anwendung der Regeln

Bei neuen Features:

1. Scaffolding via `create-workspace.sh` (generiert Grundstruktur konform).
2. Für jedes Feature: Service → Store → Komponente — in dieser Reihenfolge implementieren.
3. Jede Regel dieses Dokuments ist Default. Abweichungen werden im Code-Kommentar begründet.

Bei bestehenden Projekten:

- Code der gegen Regeln verstößt wird bei **Anfassen** migriert, nicht präventiv umgeschrieben.
- Neue Komponenten in Alt-Projekten folgen diesen Regeln, auch wenn das Alt-Projekt drift zeigt.

Bei Konflikten:

- Style-Fragen (Layout, Klassen, Farben) → `style-rules.md` hat Vorrang.
- Struktur-/Pattern-Fragen → diese Datei hat Vorrang.
- Eng verwobene Fragen (z.B. "wann Modal, wann Router-Seite") → `style-rules.md §6.3` (dort ist es detailliert begründet).

---

## §17 Auditing (optional, bei `USE_AUDIT=1`)

### §17.1 Prinzip

Standardmäßig werden **alle Mutations** (`POST` / `PATCH` / `PUT` / `DELETE`) automatisch protokolliert. Kein Code pro Endpunkt nötig — der globale `AuditInterceptor` hängt sich an jeden Controller.

### §17.2 Decorators

```typescript
import { Audited, SkipAudit, AuditResource, AuditAction } from './services/audit/audit.decorators';

@Controller('extruder')
export class ExtruderController {
  @Post()
  create(@Body() dto: CreateExtruderDto) { ... }                 // auto-audit: CREATE

  @Get(':id')
  @Audited()
  getOne(@Param('id') id: string) { ... }                        // auch GET wird geloggt

  @Delete(':id')
  @SkipAudit()
  softRemove(@Param('id') id: string) { ... }                    // nicht geloggt

  @Post(':id/assign')
  @AuditAction('ASSIGN')
  assign(@Param('id') id: string) { ... }                        // action=ASSIGN statt CREATE
}

@Controller('internal')
@SkipAudit()
export class InternalController { ... }                          // gesamter Controller ausgenommen
```

### §17.3 User-Auflösung

Bei aktivem MSAL löst der Interceptor den Bearer-Token über `GraphService.getMe()` in `azureId`, `email`, `displayName` auf und schreibt alle drei redundant ins Log. Bei Nicht-MSAL-Projekten oder ungültigen Tokens steht `displayName = "system"`, IDs bleiben `null`.

### §17.4 Payload-Grenzen

Der Service clampt Payload und Response auf **64 KB** pro Feld. Bei Überschreitung wird das Feld durch `{ _truncated: true, _originalSize: <n>, preview: "…" }` ersetzt — keine Exception.

### §17.5 Lese-API

`GET /api/audit` mit Query-Params `resource`, `resourceId`, `userAzureId`, `take` (max 500), `skip`. Rückgabe `{ items, total, take, skip }`. Der Endpunkt ist selbst `@SkipAudit()`-markiert (keine Zirkel-Logs).

### §17.6 Was NICHT im Audit landet

- Passwörter, Tokens, API-Keys (aktuell nicht automatisch redacted — in Zukunft per Feldnamen-Blacklist, bis dahin: `@SkipAudit()` auf sensitive Endpoints oder Felder vor dem Controller-Call aus dem DTO entfernen)
- File-Uploads (Binary-Body wird in JSON zu `{}`; Metadaten kommen durch)
- Auth-Endpoints (sollten generell `@SkipAudit()` tragen)

### §17.7 Retention

**Nicht** im Interceptor/Service vorgesehen. Wenn die Tabelle zu groß wird: Cron-Job im Backend oder DB-Level-Policy (z.B. Partitioning nach Monat). Bei Bedarf ins Projekt ergänzen — kein Default-Verhalten erzwingen.
