# pict-section-checklist

Inline-editable, nestable checklists for [Pict](https://github.com/stevenvelozo/pict). Leaf checkboxes,
per-tier and overall progress, a read-only view, and a pluggable data provider that defaults to
in-memory so the control works in the browser with no backend.

## Install

```
npm install pict-section-checklist
```

## Quick start

```javascript
const libChecklist = require('pict-section-checklist');

pict.addView('MyChecklist', Object.assign({}, libChecklist.default_configuration,
{
    Context: { OwnerType: 'WorkItem', IDOwner: 4012 },
    Title: 'Acceptance checks'
}), libChecklist);

pict.views['MyChecklist'].render();
```

With nothing else wired the control stores everything in an in-memory provider backed by `AppData`. It
works the moment it mounts; pass a `DataProvider` to persist.

## Editing

- Type in an item to name it.
- **Enter** adds a sibling below.
- **Tab** nests the item under the one above it, **Shift+Tab** promotes it.
- **Backspace** on an empty item removes it.
- Check leaves off. An item with children becomes a group and shows the share of its leaves that are
  done, at every tier and overall.

## The data seam

Every read and write goes through a `ChecklistDataProvider`. The default is
`InMemoryChecklistProvider`. To persist, subclass `ChecklistDataProvider`, implement six
Promise-returning primitives, and pass the instance as `DataProvider`:

```javascript
class MyProvider extends libChecklist.ChecklistDataProvider
{
    getList(pContext)        { /* -> Promise<List>   */ }
    updateList(pKey, pPatch) { /* -> Promise<List>   */ }
    listItems(pListKey)      { /* -> Promise<Item[]> */ }
    createItem(pDraft)       { /* -> Promise<Item>   */ }
    updateItem(pKey, pPatch) { /* -> Promise<Item>   */ }
    deleteItem(pKey)         { /* -> Promise<void>   */ }
}

pict.addView('MyChecklist', Object.assign({}, libChecklist.default_configuration,
    { Context: { OwnerType: 'WorkItem', IDOwner: 4012 }, DataProvider: new MyProvider() }), libChecklist);
```

Record shapes (neutral; a backend provider maps its own rows to and from these):

```
Context { OwnerType, IDOwner }
List    { Key, OwnerType, IDOwner, Title }
Item    { Key, ListKey, ParentKey|null, Title, Done, Sort, Notes, Collapsed }
```

## Options

| Option | Default | Notes |
|---|---|---|
| `Context` | `{ OwnerType:'Standalone', IDOwner:'1' }` | What the checklist is attached to. |
| `DataProvider` | `null` | Null makes an in-memory one backed by AppData. |
| `Title` | `'Checklist'` | Used when the provider first creates the list. |
| `ReadOnly` | `false` | Renders the tree and progress with no editing affordances. |
| `ShowProgress` | `true` | The overall progress bar in the header. |
| `ShowGroupProgress` | `true` | A small progress readout on each group. |
| `EditableTitle` | `true` | Allow renaming the list title inline. |

## Events

Pass any of these as options; each receives its payload and the view:
`onChange`, `onItemAdded`, `onItemEdited`, `onItemToggled`, `onItemDeleted`, `onListRenamed`.

## Theming

The control reads only `var(--theme-color-*)` tokens (the background, text, brand, border, and status
families), so an active [pict-section-theme](https://github.com/fable-retold/pict-section-theme)
recolors all of it, light or dark. Nothing is hard-coded; the only literals are fallback hexes. Delete
confirmations use [pict-section-modal](https://github.com/fable-retold/pict-section-modal), which the
view registers for you.

## Demos

```
npm run build
```

then serve either dist folder:

- `example_applications/checklist_demo` -- standalone, in-memory, persisted to localStorage, with
  read-only and dark-mode toggles.
- `example_applications/checklist_backend_demo` -- the same control over a custom async provider with
  simulated latency, the shape a real backend takes.

## License

MIT
