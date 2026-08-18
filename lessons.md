# Lessons

## Basics: what the curly braces actually mean

`{}` is the most overloaded symbol in JavaScript. It does **six unrelated jobs**, and the
only thing distinguishing them is *where* it appears. This is the single most confusing
thing about reading TS/React early on. Here is the decoder:

| Where you see it | What it means | Python equivalent |
|---|---|---|
| `import { X } from "m"` | named import | `from m import X` |
| `const { a } = obj` | destructuring (unpacking) | `a = obj["a"]` |
| `{ ssr: false }` as a value | object literal | `dict` |
| `<C prop={x} />` in JSX | "escape into JavaScript" | f-string `{}` |
| `{x}` inside JSX text | "escape into JavaScript" | f-string `{}` |
| `() => { ... }` | function body block | `def` body |

Read the position first, *then* the braces. Same symbol, six meanings.

### 1. Import braces: named vs default — the one that bit you

A module can export things in two ways, and each has its own import syntax. Getting them
crossed is the most common early TypeScript error.

```tsx
// ---- Canvas.tsx ----
export default function Canvas() { ... }   // THE default export — at most one per file
export const HELPER = 42;                  // a named export — as many as you like
export function otherThing() { ... }       // another named export
```

```tsx
// ---- importing it ----
import Canvas from "./Canvas";              // default: NO braces
import { HELPER } from "./Canvas";          // named: braces, name must match exactly
import { HELPER, otherThing } from "./Canvas";   // several named at once
import Canvas, { HELPER } from "./Canvas";  // default AND named together
```

The rule in one line: **braces mean "reach inside the module and pull out this specific
name." No braces means "give me the one thing this module is mainly about."**

Because the default export has no name attached to it, *you* choose what to call it:

```tsx
import Canvas from "./Canvas";      // these two are
import Sketchpad from "./Canvas";   // exactly identical
```

Whereas a named import must match the exported name character for character (you can rename
with `as`: `import { HELPER as h } from "./Canvas"`).

Python analogy: named imports are `from module import thing` — the name must match, and you
can rename with `as`, exactly like Python. Where it breaks down: **Python has no concept of
a default export.** There is no `from module import <the main one>`. That idea simply
doesn't exist in Python, which is why the no-braces form feels alien.

How to tell which one a file needs: open the file and look for the word `default`. If you
see `export default`, import it without braces. If you only see `export const` / `export
function`, use braces. TypeScript will tell you when you're wrong, but the error message
("has no exported member 'Canvas'") doesn't spell out the fix.

**Key takeaway:** Braces in an import mean "named export, name must match"; no braces means
"default export, and I can call it whatever I want."

### 2. Destructuring: braces on the LEFT of `=`

When `{}` appears on the *receiving* side, it's pulling fields out of an object.

```tsx
const user = { name: "Ada", age: 36, city: "London" };

const { name, age } = user;    // creates two variables: name = "Ada", age = 36
// equivalent to:
const name = user.name;
const age = user.age;
```

Square brackets do the same for arrays, by position:

```tsx
const [first, second] = ["a", "b"];   // first = "a", second = "b"
```

You'll see this constantly in React, because hooks return arrays:

```tsx
const [count, setCount] = useState(0);   // just array destructuring, nothing special
```

Python analogy: array destructuring is exactly tuple unpacking — `first, second = ["a", "b"]`
works in Python too. Object destructuring is the one Python lacks; the closest thing is
`name, age = user["name"], user["age"]`, or `**kwargs` in a function signature.

It also works in function parameters, which is how React components receive props:

```tsx
function Greeting({ name, age }) { ... }        // unpack the props object inline
// instead of:
function Greeting(props) { const name = props.name; ... }
```

Python analogy: this is close to `def greeting(*, name, age)` — keyword-only arguments. The
caller writes `<Greeting name="Ada" age={36} />`, which is the same shape as
`greeting(name="Ada", age=36)`.

**Key takeaway:** Braces on the left of `=` (or in a parameter list) *take apart* an object;
braces on the right *build* one.

### 3. Object literals: braces as a value

```tsx
const options = { ssr: false, loading: "spinner" };
```

Python analogy: a `dict`. Two differences that trip people up: keys are written as bare
words rather than strings (`ssr:` not `"ssr":`), and you read them with a dot
(`options.ssr`) instead of brackets. It's much more like a Python object/dataclass to use,
even though it's built like a dict.

There's a shorthand you'll see everywhere — if the key and the variable have the same name,
write it once:

```tsx
const name = "Ada";
const user = { name };        // means { name: name }
```

### 4. JSX braces: the escape hatch into JavaScript

Inside JSX, you are writing something that *looks* like HTML. `{}` means "stop treating this
as markup, evaluate it as JavaScript, and drop the result in here."

```tsx
const name = "Ada";
const items = ["a", "b"];

return (
  <div>
    <h1>Hello {name}</h1>              {/* insert a variable */}
    <p>{items.length} items</p>        {/* any expression works */}
    <Canvas height={600} />            {/* a number prop needs braces */}
    <Canvas title="Sketch" />          {/* a plain string does NOT */}
  </div>
);
```

Python analogy: this is an **f-string**. `<h1>Hello {name}</h1>` is doing exactly what
`f"Hello {name}"` does — literal text with escape hatches into real code. That analogy is
close to exact, and it's the fastest way to read JSX.

Where it breaks down: an f-string produces a string, whereas JSX produces a React element (a
description of UI). And JSX braces accept only **expressions**, not statements — you can put
`items.length` or a ternary `{x ? "a" : "b"}` inside, but not an `if` block or a `for` loop.
That constraint is why React code uses `.map()` and ternaries so heavily instead of loops
and if-statements.

`prop="text"` vs `prop={x}`: quotes for a literal string, braces for anything else — a
number, a boolean, a variable, an object. `height={600}` passes the number 600;
`height="600"` passes the string "600".

**Key takeaway:** JSX braces are f-string interpolation — "evaluate this bit as JavaScript" —
and they hold expressions only, never statements.

### 5. Arrow functions and their braces

```tsx
(mod) => mod.Excalidraw          // no braces: the expression IS the return value
(mod) => { return mod.Excalidraw; }   // braces: a real body, you must write `return`
(mod) => { mod.Excalidraw; }     // BUG: braces with no `return` returns undefined
```

`=>` defines a function. If the body has braces, it's a block and you need an explicit
`return`. If it has no braces, the single expression is returned automatically.

Python analogy: `lambda mod: mod.Excalidraw` is the brace-less form — one expression,
implicit return. The braced form is a full `def` with a body and a `return` statement. The
useful difference: Python's `lambda` is restricted to a single expression, whereas a JS
arrow function can be either, which is why the same `=>` shows up for both one-liners and
20-line functions.

That third line is a genuinely common bug: adding braces to an arrow function silently turns
off the implicit return.

**Key takeaway:** `=>` with braces needs an explicit `return`; without braces, the single
expression is the return value.

### 6. One more you'll see: `import type`

```tsx
import type { Metadata } from "next";
```

The `type` keyword means "I only need this for type checking; delete it from the compiled
output." Types don't exist at runtime in TypeScript at all — they're erased.

Python analogy: it's the same instinct as putting imports under `if TYPE_CHECKING:` so a
type hint doesn't cost you a real import. TypeScript makes it a first-class keyword because
*every* type is erased, not just the awkward ones.

---

## npm audit warnings are usually not your problem

**Key takeaway:** `npm audit` reports vulnerabilities anywhere in the whole dependency tree, including packages you never installed directly — so the count alone tells you nothing about your risk, and `npm audit fix` can silently downgrade a package to a version that breaks your app.

### Why

npm installs the *transitive* dependency tree: your deps, their deps, and so on. `npm audit` walks that entire tree. "9 vulnerabilities" typically means one deep library (here `lodash-es`, `nanoid`) is flagged and every package above it in the chain gets counted too.

Python analogy: it's like `pip-audit` on a fully resolved `requirements.txt` lockfile. Where the analogy breaks: pip installs one flat version of each package, so a conflict is an error you must resolve. npm lets each package keep its *own* nested copy of a dependency — that's why you can see `nanoid` listed twice under two different parents.

### Reusable diagnostic recipe

```bash
# 1. Who actually pulls in the flagged package? (the chain, not the count)
npm ls lodash-es

# 2. What would "fix" actually do? NEVER run audit fix blind.
npm audit fix --dry-run

# 3. Does a genuinely patched version exist upstream?
npm view <package> version peerDependencies
```

Step 2 is the one people skip. In this project it revealed that `npm audit fix` wanted to *downgrade* `@excalidraw/excalidraw` from 0.18.1 to 0.17.6 — a version whose peer range is `^17.0.2 || ^18.2.0`, i.e. it does not support our React 19. The "fix" would have broken the app to silence a warning.

### Peer dependencies

```json
"peerDependencies": { "react": "^17.0.2 || ^18.2.0 || ^19.0.0" }
```

A peer dependency means "I don't install React myself — *you* must provide one, and it must be in this range." It exists so a library and your app share one single React instance (two copies of React in one page breaks hooks).

Python analogy: closest thing is a plugin declaring it works with `Django>=4,<6` while expecting the host project to install Django. Python has no real enforcement mechanism for this; npm does, and it will refuse the install with `ERESOLVE` rather than let you end up with two Reacts.

**Key takeaway:** A peer dependency is a compatibility *contract* — the library is telling you which version of a shared package it can work alongside, and you are the one who must install it.

### Pin your versions

```json
"@excalidraw/excalidraw": "*"        // bad: any version, including future breaking ones
"@excalidraw/excalidraw": "^0.18.1"  // good: 0.18.1 up to (not including) 0.19.0
```

`*` means "whatever npm feels like resolving today," so two machines can end up on different versions from the same `package.json`.

**Key takeaway:** Never ship `"*"` as a version range — use `^x.y.z`, which is npm's equivalent of pip's `~=x.y`.

---

## Server Components, Client Components, and browser-only libraries

This is the single biggest conceptual shift in modern React frameworks, and almost every
confusing error in a Next.js App Router project traces back to it.

### The mental model

In the App Router, **every component is a Server Component by default.** It runs on the
server, during the request, and only its rendered *output* is sent to the browser. Its
source code never ships. That means it can do things a browser never could — read a file,
query a database, use a secret API key — but it cannot use `useState`, `onClick`, or
anything that touches `window`, because none of that exists on a server.

A **Client Component** is the opt-in escape hatch: it ships its actual JavaScript to the
browser, so it can hold state and respond to clicks.

Python analogy: think of a Django or Jinja template rendering HTML on the server versus the
JavaScript you separately hand-write for interactivity. Server Components are the template
half, Client Components are the interactive half.

**Where the analogy breaks down, and this is the important part:** in Django those are two
different languages in two different files, and the boundary is obvious. Here they're the
same language, the same JSX, in the same folder, and the *only* thing distinguishing them is
a magic string at the top of the file. You have to hold the boundary in your head; nothing
about the syntax reminds you where you are.

### `"use client"`

```tsx
"use client";   // must be the very first line, before all imports
```

It marks a **boundary, not a single file.** Everything this file imports also becomes part
of the client bundle, transitively. So one `"use client"` near the top of your tree can
accidentally drag your whole app into the browser. The rule of thumb: push `"use client"`
as far *down* the tree as you can — put it on the small interactive leaf, not the page.

Python analogy: it behaves like a module-level `from __future__ import ...` — a declaration
about the whole file, positioned before anything else. Where it breaks down: `__future__`
affects only its own module, whereas `"use client"` infects everything downstream of it.

### The trap: `"use client"` does NOT mean "browser only"

This is the mistake nearly everyone makes. A Client Component is still **pre-rendered on
the server** to produce the initial HTML, so the user sees content before the JavaScript
finishes downloading. It runs in *both* places: once on the server to make HTML, then again
in the browser to become interactive.

So a library that calls `window` at import time will still crash a Client Component, because
the server-side pass has no `window`. `"use client"` was never the fix for that.

**There are three states, not two:**

| | Runs on server | Ships JS to browser |
|---|---|---|
| Server Component (default) | yes | no |
| Client Component | yes (pre-render) | yes |
| Client Component + `ssr: false` | no | yes |

### `ssr: false` — the actual fix for browser-only libraries

```tsx
"use client";

import dynamic from "next/dynamic";

const HeavyBrowserThing = dynamic(
  () => import("some-browser-only-lib").then((mod) => mod.TheComponent),
  { ssr: false },
);

export default function Wrapper() {
  return (
    <div className="h-screen w-full">
      <HeavyBrowserThing />
    </div>
  );
}
```

This is the **reusable pattern**: any time a library touches `window`, `document`,
`localStorage`, or `navigator` at import time, wrap it in exactly this shape. Canvas
libraries, chart libraries, map libraries, rich-text editors, drag-and-drop libraries —
they nearly all need it.

Two rules that are easy to get wrong:

1. **`ssr: false` only works inside a Client Component.** You cannot put it in a Server
   Component. That's why the wrapper file needs `"use client"` *and* `ssr: false` — they
   fix different halves of the problem. `"use client"` says *where the code lives*;
   `ssr: false` says *when it's allowed to run*.
2. **Give the wrapper an explicit height.** Many of these libraries fill their container,
   and a container with no height renders as invisible nothing. This produces a silent
   failure with no error message, which is far more confusing than a crash.

### Why `.then((mod) => mod.TheComponent)`

`dynamic()` wants a promise that resolves to *the component*. But `import()` resolves to the
whole **module object**, so you have to reach in and pull the export out. You only need the
`.then()` when the component is a *named* export; if it's the default export, `dynamic(() =>
import("lib"))` is enough, because `dynamic` unwraps `.default` for you.

Python analogy: `import()` is roughly `importlib.import_module("lib")` — it hands you a
module, and `.then(mod => mod.TheComponent)` is the `getattr(module, "TheComponent")` step.
Where it breaks down: `importlib` is synchronous and returns the module immediately, while
JS's `import()` returns a **promise**, because the browser may have to fetch that code over
the network first. `.then()` is how you say "once it arrives, do this with it."

The bonus you get for free: because the import is deferred, that library lands in its own
JavaScript file and is only downloaded when this component actually renders. That's called
code splitting, and it keeps a heavy dependency out of your initial page load.

### One more boundary rule you will hit

When a Server Component passes props *down* into a Client Component, those props have to be
**serializable** — they get converted to JSON to cross the network. Strings, numbers,
arrays, plain objects are fine. **Functions are not.** Passing a callback from a Server
Component to a Client Component is a common early error.

Python analogy: the same constraint as anything you'd put through `json.dumps`, or send to
a `multiprocessing` worker via pickle — the data crosses a process boundary, so it has to
survive being flattened.

**Key takeaway:** Every component is server-rendered by default; `"use client"` adds browser
interactivity but the component *still* pre-renders on the server, and only
`dynamic(..., { ssr: false })` inside a Client Component stops server execution entirely —
which is the one thing a `window`-touching library actually needs.

---

## Full-height layouts: the definite-height rule and the flex fill pattern

The bug that produced this lesson: the canvas disappeared completely. No console error, no
build failure, `tsc` clean. The element was in the DOM, rendering at **zero pixels tall**.

### The rule

`height: 100%` (Tailwind's `h-full`) is **recursive**. It means "100% of my parent's
height," so the browser asks the parent, which asks *its* parent, and so on up the tree. If
nothing up that chain ever states a real height, there's no base case — the browser gives up
and falls back to content-sized, which for a library that fills its container means zero.

Python analogy: it's a recursive function with no base case. `h-full` is the recursive step;
something like `h-screen` is the base case that terminates it. Where the analogy is kind:
Python raises `RecursionError` and tells you exactly what went wrong. CSS just silently
returns zero and renders nothing, which is why this bug is so much harder than it deserves
to be.

**Critically: `min-height` does NOT satisfy the rule.** A parent with `min-h-full` still has
an indefinite height, so a `h-full` child collapses. This is the exact trap that bit us —
create-next-app's `layout.tsx` ships `<body className="min-h-full">`, which *looks* like it
establishes full height but doesn't.

| Establishes a definite height? | |
|---|---|
| `h-screen` / `height: 100vh` | yes — self-contained, needs no parent |
| `h-full` / `height: 100%` | only if the parent already has one |
| `min-h-full` / `min-height: 100%` | **no** |
| height from being a flex item that grew | yes |

### The reusable pattern: header + fill-the-rest body

This is the standard "toolbar on top, big thing below" layout. Memorize this shape; you will
use it for canvases, editors, maps, chat windows, and dashboards.

```tsx
<div className="flex flex-col h-screen">      {/* base case: definite height */}
  <header className="px-6 py-4 border-b">
    ...                                        {/* no flex-1: stays its natural size */}
  </header>

  <div className="flex-1 min-h-0">             {/* absorbs ALL leftover space */}
    <TheBigThing />                            {/* can now safely use h-full */}
  </div>
</div>
```

Three parts, each load-bearing:

1. **`h-screen` on the outermost container.** The base case. Without it the whole chain is
   indefinite. Don't rely on `<body>` for this unless you've checked that body has a real
   height rather than a `min-height`.
2. **`flex flex-col`** stacks children vertically; **`flex-1`** on exactly one child means
   "you take whatever space is left after the others have taken what they need." The header
   deliberately has no `flex-1`, so it sizes to its content.
3. **`min-h-0`** — the obscure one. By default a flex item **refuses to shrink below its
   content's natural size**, so a child with large content will blow out of its parent and
   cause a scrollbar instead of being clipped to the available space. `min-h-0` removes that
   floor. (`min-w-0` is the same fix for horizontal overflow, which is what you need when a
   long unbroken string stretches a flex row.)

Once the parent's height is definite, `h-full` on the inner component finally resolves:

```tsx
export default function Wrapper() {
  return (
    <div className="h-full w-full">   {/* 100% of a now-definite parent */}
      <TheBigThing />
    </div>
  );
}
```

### Debugging checklist for "my component vanished"

The distinguishing symptom of a CSS collapse versus a React problem:

- build passes, `tsc` clean, **no console error** → almost certainly CSS, not React
- inspect the element in devtools; if computed height is `0px`, stop looking at your
  JavaScript entirely
- walk *up* the tree from the collapsed element and find the first ancestor without a
  definite height — that's where the chain broke
- fix it at the top by anchoring with `h-screen`, not at the bottom by hardcoding pixels

**Key takeaway:** `height: 100%` is a recursive rule that needs a base case; `min-height`
never provides one, so anchor full-height layouts with `h-screen` at the top and use
`flex-1 min-h-0` to hand the leftover space down.

---

## Reaching into a library imperatively: the `useState`-as-a-handle pattern

Most of React is **declarative**: you describe what should be on screen for a given piece of
state, and React figures out how to make the DOM match. But some things aren't a
description of UI at all — they're an *action* you want to trigger later, on demand. "Export
the current drawing as a PNG" is one of those. There's no JSX for "flatten the canvas";
you need an actual object with a method to call.

Libraries expose that escape hatch through a callback prop:

```tsx
const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

<Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
```

`excalidrawAPI` isn't a value you pass in — it's a function Excalidraw calls once it has
mounted, handing you an object full of methods (`getSceneElements()`, `getAppState()`,
`getFiles()`, and others). Stashing that object in state means any other part of the
component — a button's `onClick`, fired much later — can reach into the live canvas.

Python analogy: this is holding onto a `subprocess.Popen` object so you can call
`.terminate()` on it whenever you decide to, instead of just describing "run this command"
once and being done. Most of React's job is the declarative half (describe the desired
result); this pattern is the deliberate opt-out into "grab a direct handle, call methods on
it imperatively," which you need whenever an action, not a render, is the goal.

**Key takeaway:** When a library needs to be *commanded* rather than merely *rendered*, it
hands you a live object through a callback prop — store it in state, then call its methods
from event handlers whenever the action should actually happen.

### Sharing logic between two handlers

`handleExport` and `handleRefine` both need the exact same three-step sequence — ask the API
for the current elements/appState/files, flatten them into a blob. Rather than duplicating
that sequence in each handler, it's pulled into its own function that both call:

```tsx
async function getExportBlob() {
  if (!excalidrawAPI) return null;
  const { exportToBlob } = await import("@excalidraw/excalidraw");
  return exportToBlob({
    elements: excalidrawAPI.getSceneElements(),
    appState: excalidrawAPI.getAppState(),
    files: excalidrawAPI.getFiles(),
  });
}
```

This is the line between a real abstraction and a premature one: one call site never earns a
helper function, but the moment a *second* real call site needs the same steps, factoring it
out removes duplication that would otherwise drift out of sync as the code changes.

---

## Centering an absolutely-positioned element

```css
absolute bottom-4 left-1/2 -translate-x-1/2
```

`left-1/2` alone puts the element's **left edge** at the horizontal center of its
container — which pushes the element itself off-center to the right, by half its own width.
`-translate-x-1/2` corrects for that: it shifts the element left by 50% of *its own* width
(not the container's), landing it exactly centered.

This is the standard trick for centering something whose width isn't fixed — like a button
whose label might change length. If you hardcoded a pixel offset instead, it would drift
out of center the moment the text changed. `translate` percentages are relative to the
element itself, which is what makes this pattern reusable regardless of content.

**Key takeaway:** To truly center an absolutely-positioned element of unknown width, combine
`left: 50%` (center the left edge) with `translate-x: -50%` (pull it back by half of its own
width) — one alone is not enough.

---

## Sending a file to a server: `FormData`, and why `fetch` needs a manual status check

### `FormData` for binary uploads

A JSON body can't hold binary image data directly — you'd have to base64-encode it, which
bloats the payload by ~33%. The browser's native answer is `FormData`: the same format an
HTML `<form>` uses when it has a file input (`multipart/form-data`).

```tsx
const formData = new FormData();
formData.append("sketch", blob, "sketch.png");

await fetch(url, { method: "POST", body: formData });
```

The string `"sketch"` is the field name the server reads the file back by — it has to match
what the backend expects (in FastAPI, a parameter named `sketch: UploadFile`). Don't set a
`Content-Type` header yourself when sending `FormData` — the browser sets it, including a
random boundary string the server needs to parse the multipart body, and overriding it
manually breaks that.

Python analogy: this is `requests.post(url, files={"sketch": blob})` — same wire format
(`multipart/form-data`), just built by the browser instead of by `requests`.

### `fetch` does not throw on a 404 or 500

This is a genuinely common trap. `fetch`'s promise only rejects on a true network failure —
DNS lookup failed, connection refused, you're offline. A server that responds with 404 or
500 still counts as a **successful** fetch as far as the promise is concerned; you get a
normal `response` object back, not an exception.

```tsx
const response = await fetch(url, { ... });

if (!response.ok) {                          // true for status 200–299
  throw new Error(`Backend responded with ${response.status}`);
}
```

Skipping the `response.ok` check is how people accidentally treat a server error as success —
the `try` block doesn't catch it, because nothing threw.

Python analogy: identical behavior in `requests` — `requests.post(...)` doesn't raise on a
500 either. You call `.raise_for_status()` yourself, or inspect `.status_code` manually.
`fetch` makes you write the `if` by hand instead of providing that one-line helper.

**Key takeaway:** `fetch` only rejects on network-level failure — always check `response.ok`
(or `response.status`) yourself and throw explicitly, or server errors will silently fall
through your `catch` block as if nothing went wrong.
