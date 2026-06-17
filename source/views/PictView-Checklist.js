'use strict';

/**
 * PictView-Checklist
 * ------------------
 * An inline-editable, nestable checklist. Mount it on a Context (OwnerType + IDOwner) and it renders
 * that context's one checklist: a title, a tree of items, leaf checkboxes, per-group and overall
 * progress, and a read-only mode.
 *
 * It never touches storage itself: every read and write goes through a ChecklistDataProvider (see
 * providers/ChecklistProvider-Base.js). With nothing wired it uses an InMemoryChecklistProvider backed
 * by a slice of AppData, so it works the moment it mounts; a host swaps in its own provider to persist.
 *
 * Editing is the outliner flow people expect: type a title, Enter adds a sibling below, Tab nests
 * under the item above, Shift+Tab promotes, Backspace on an empty item removes it. A leaf carries a
 * checkbox; an item with children becomes a group that shows the share of its leaves that are done.
 *
 * Rendering follows the pict conventions: data lives in AppData (the active instance's shaped state is
 * published to AppData.ChecklistActive just before each render, so templates read it and the engine
 * bakes the correct per-instance view hash into every inline handler), iteration is {~TS:~} (the item
 * template recurses into its own Children), and every interaction is an inline handler. All colors are
 * theme tokens, so an active pict-section-theme recolors the whole control.
 *
 * @author Steven Velozo <steven@velozo.com>
 * @license MIT
 */

const libPictView = require('pict-view');
const libModal = require('pict-section-modal');

const libChecklistProvider = require('../providers/ChecklistProvider-Base.js');
const libModel = require('../ChecklistModel.js');

const _InMemoryChecklistProvider = libChecklistProvider.InMemoryChecklistProvider;

const _DefaultConfiguration =
{
	ViewIdentifier: 'Checklist',
	DefaultRenderable: 'Checklist-Section',
	DefaultDestinationAddress: '#Checklist-Container',
	AutoRender: false,

	// ---- options a host overrides ----
	// The Context this checklist is bound to (what it is "attached to"). Standalone lists just pick a
	// stable synthetic context.
	Context: { OwnerType: 'Standalone', IDOwner: '1' },
	// The data provider. Null means "make an in-memory one backed by AppData".
	DataProvider: null,
	// Title used when the provider first creates the list for a context.
	Title: 'Checklist',
	// Read-only renders the tree and progress with no editing affordances.
	ReadOnly: false,
	// Show the overall progress bar in the header, and a small progress readout on each group.
	ShowProgress: true,
	ShowGroupProgress: true,
	// Allow renaming the list title inline.
	EditableTitle: true,
	AddPlaceholder: 'Add an item',
	EmptyMessage: 'Nothing here yet. Add the first item below.',
	// Indent per nesting level, in px.
	IndentPixels: 22,

	CSSPriority: 500,
	CSS: /*css*/`
		.pict-checklist { font-family: var(--theme-typography-family-body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif); font-size: 14px; color: var(--theme-color-text-primary, #1f2430); }

		.pchk-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
		.pchk-list-title { font-size: 15px; font-weight: 600; color: var(--theme-color-text-primary, #1f2430); outline: none; border-radius: 4px; padding: 2px 5px; min-width: 40px; }
		.pchk-list-title:focus { background: var(--theme-color-background-tertiary, #eef2f6); }

		.pchk-overall { display: flex; align-items: center; gap: 8px; margin-left: auto; min-width: 170px; }
		.pchk-bar { flex: 1; height: 6px; border-radius: 3px; background: var(--theme-color-background-tertiary, #e7ecf0); overflow: hidden; }
		.pchk-bar-fill { height: 100%; width: 0; background: var(--theme-color-brand-primary, #2880a6); border-radius: 3px; transition: width 0.18s ease; }
		.pict-checklist.pchk-complete .pchk-bar-fill { background: var(--theme-color-status-success, #2e7d4f); }
		.pchk-overall-label { font-size: 12px; color: var(--theme-color-text-secondary, #5b6470); white-space: nowrap; font-variant-numeric: tabular-nums; }

		.pchk-list, .pchk-children { list-style: none; margin: 0; padding: 0; }
		.pchk-children { padding-left: 22px; }
		.pchk-children:empty { display: none; }

		.pchk-row { display: flex; align-items: center; gap: 7px; padding: 3px 4px; border-radius: 6px; }
		.pchk-row:hover { background: var(--theme-color-background-secondary, #f7f9fb); }

		.pchk-caret { width: 18px; height: 18px; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--theme-color-text-muted, #97a1ab); border: none; background: none; padding: 0; font-size: 15px; }
		.pchk-caret:hover { color: var(--theme-color-text-secondary, #5b6470); }
		.pchk-leaf .pchk-caret { visibility: hidden; cursor: default; }
		.pchk-caret-closed { display: none; }
		.pchk-item.pchk-collapsed > .pchk-row > .pchk-caret .pchk-caret-open { display: none; }
		.pchk-item.pchk-collapsed > .pchk-row > .pchk-caret .pchk-caret-closed { display: inline-flex; }

		.pchk-check { width: 18px; height: 18px; flex: 0 0 auto; border: 1.5px solid var(--theme-color-border-strong, #a0a0a0); border-radius: 5px; background: var(--theme-color-background-panel, #fff); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: var(--theme-color-text-on-brand, #fff); font-size: 12px; padding: 0; }
		.pchk-group > .pchk-row > .pchk-check { display: none; }
		.pchk-check .pict-icon { opacity: 0; transform: scale(0.5); transition: opacity 0.1s ease, transform 0.1s ease; }
		.pchk-item.pchk-done > .pchk-row > .pchk-check { background: var(--theme-color-brand-primary, #2880a6); border-color: var(--theme-color-brand-primary, #2880a6); }
		.pchk-item.pchk-done > .pchk-row > .pchk-check .pict-icon { opacity: 1; transform: scale(1); }
		.pict-checklist.pchk-readonly .pchk-check { cursor: default; }

		.pchk-title { flex: 1; min-width: 0; outline: none; padding: 2px 4px; border-radius: 4px; line-height: 1.4; word-break: break-word; }
		.pchk-title:focus { background: var(--theme-color-background-tertiary, #eef2f6); box-shadow: inset 0 0 0 2px var(--theme-color-brand-primary, #2880a6); }
		.pchk-item.pchk-done > .pchk-row > .pchk-title { color: var(--theme-color-text-muted, #97a1ab); text-decoration: line-through; }

		.pchk-group-progress { display: inline-flex; align-items: center; gap: 6px; margin-left: 6px; flex: 0 0 auto; }
		.pchk-leaf .pchk-group-progress { display: none; }
		.pchk-minibar { width: 46px; height: 5px; border-radius: 3px; background: var(--theme-color-background-tertiary, #e7ecf0); overflow: hidden; }
		.pchk-minibar-fill { height: 100%; width: 0; background: var(--theme-color-brand-primary, #2880a6); border-radius: 3px; transition: width 0.18s ease; }
		.pchk-item.pchk-group-done > .pchk-row > .pchk-group-progress .pchk-minibar-fill { background: var(--theme-color-status-success, #2e7d4f); }
		.pchk-pct { font-size: 11px; color: var(--theme-color-text-secondary, #5b6470); min-width: 30px; text-align: right; font-variant-numeric: tabular-nums; }

		.pchk-actions { display: inline-flex; gap: 2px; opacity: 0; transition: opacity 0.1s ease; margin-left: 2px; flex: 0 0 auto; }
		.pchk-row:hover .pchk-actions { opacity: 1; }
		.pict-checklist.pchk-readonly .pchk-actions { display: none; }
		.pchk-actions button { border: none; background: none; cursor: pointer; color: var(--theme-color-text-muted, #97a1ab); width: 22px; height: 22px; border-radius: 5px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; padding: 0; }
		.pchk-actions button:hover { background: var(--theme-color-background-hover, #eef2f6); color: var(--theme-color-text-secondary, #5b6470); }
		.pchk-actions .pchk-del:hover { color: var(--theme-color-status-error, #c0392b); }

		.pchk-add { display: flex; align-items: center; gap: 7px; padding: 5px 4px; margin-top: 2px; }
		.pchk-add-icon { width: 18px; flex: 0 0 auto; display: inline-flex; justify-content: center; color: var(--theme-color-text-muted, #97a1ab); }
		.pchk-add-btn { align-items: center; border: none; background: none; padding: 0; cursor: pointer; border-radius: 4px; }
		.pchk-add-btn:hover { color: var(--theme-color-brand-primary, #2880a6); }
		.pchk-add-input { flex: 1; border: none; outline: none; background: none; font: inherit; color: var(--theme-color-text-primary, #1f2430); padding: 2px 4px; }
		.pchk-add-input::placeholder { color: var(--theme-color-text-muted, #97a1ab); }
		.pict-checklist.pchk-readonly .pchk-add { display: none; }

		.pchk-empty { color: var(--theme-color-text-muted, #97a1ab); font-size: 13px; padding: 8px 4px; }
	`,

	Templates:
	[
		{
			Hash: 'Checklist-Section',
			Template: /*html*/`
<div class="{~D:AppData.ChecklistActive.ContainerClass~}" id="Checklist-Root-{~D:AppData.ChecklistActive.ViewHash~}">
	<div class="pchk-header">
		<span class="pchk-list-title" id="{~D:AppData.ChecklistActive.TitleInputId~}" {~D:AppData.ChecklistActive.List.EditAttr~} onkeydown="if (event.key === 'Enter') { event.preventDefault(); this.blur(); }" onblur="_Pict.views['{~D:AppData.ChecklistActive.ViewHash~}'].commitListTitle(this)">{~D:AppData.ChecklistActive.List.Title~}</span>
		{~TS:Checklist-Progress:AppData.ChecklistActive.ProgressSlot~}
	</div>
	<ul class="pchk-list">{~TS:Checklist-Item:AppData.ChecklistActive.Roots~}</ul>
	{~TS:Checklist-Empty:AppData.ChecklistActive.EmptySlot~}
	{~TS:Checklist-Add:AppData.ChecklistActive.AddSlot~}
</div>`
		},
		{
			Hash: 'Checklist-Progress',
			Template: /*html*/`<div class="pchk-overall"><div class="pchk-bar"><div class="pchk-bar-fill" style="width:{~D:Record.Percent~}%"></div></div><span class="pchk-overall-label">{~D:Record.Label~}</span></div>`
		},
		{
			Hash: 'Checklist-Item',
			Template: /*html*/`
<li class="{~D:Record.RowClass~}" data-key="{~D:Record.Key~}">
	<div class="pchk-row">
		<button class="pchk-caret" type="button" title="Collapse / expand" onclick="_Pict.views['{~D:Record.ViewHash~}'].toggleCollapse('{~D:Record.Key~}')"><span class="pchk-caret-open">{~I:ChevronDown~}</span><span class="pchk-caret-closed">{~I:ChevronRight~}</span></button>
		<button class="pchk-check" type="button" title="Toggle done" onclick="_Pict.views['{~D:Record.ViewHash~}'].toggleItem('{~D:Record.Key~}')">{~I:Check~}</button>
		<span class="pchk-title" id="{~D:Record.InputId~}" {~D:Record.EditAttr~} onkeydown="_Pict.views['{~D:Record.ViewHash~}'].onTitleKeydown('{~D:Record.Key~}', event, this)" onblur="_Pict.views['{~D:Record.ViewHash~}'].commitTitle('{~D:Record.Key~}', this)">{~D:Record.Title~}</span>
		<span class="pchk-group-progress"><span class="pchk-minibar"><span class="pchk-minibar-fill" style="width:{~D:Record.Percent~}%"></span></span><span class="pchk-pct">{~D:Record.Percent~}%</span></span>
		<span class="pchk-actions"><button type="button" class="pchk-addchild" title="Add sub-item" onclick="_Pict.views['{~D:Record.ViewHash~}'].addChild('{~D:Record.Key~}')">{~I:Plus~}</button><button type="button" class="pchk-del" title="Delete" onclick="_Pict.views['{~D:Record.ViewHash~}'].confirmDelete('{~D:Record.Key~}')">{~I:Trash~}</button></span>
	</div>
	<ul class="pchk-children">{~TS:Checklist-Item:Record.Children~}</ul>
</li>`
		},
		{
			Hash: 'Checklist-Add',
			Template: /*html*/`<div class="pchk-add"><button type="button" class="pchk-add-icon pchk-add-btn" title="Add an item" onclick="_Pict.views['{~D:Record.ViewHash~}'].addRootEmpty()">{~I:Plus~}</button><input class="pchk-add-input" id="{~D:Record.AddInputId~}" type="text" placeholder="{~D:Record.AddPlaceholder~}" autocomplete="off" onkeydown="if (event.key === 'Enter') { event.preventDefault(); _Pict.views['{~D:Record.ViewHash~}'].addItem(); } else if (event.key === 'Escape') { this.value = ''; this.blur(); }"></div>`
		},
		{
			Hash: 'Checklist-Empty',
			Template: /*html*/`<div class="pchk-empty">{~D:Record.Message~}</div>`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Checklist-Section',
			TemplateHash: 'Checklist-Section',
			ContentDestinationAddress: '#Checklist-Container',
			RenderMethod: 'replace'
		}
	]
};

class PictViewChecklist extends libPictView
{
	onBeforeInitialize()
	{
		this._context = libChecklistProvider.normalizeContext(this.options.Context);
		this._list = null;
		this._items = [];
		this._active = this._emptyActive();
		this._ui = { FocusKey: null };
		this._provider = null;
		return super.onBeforeInitialize();
	}

	_initProvider()
	{
		if (this.options.DataProvider)
		{
			this._provider = this.options.DataProvider;
			return;
		}
		// Default: in-memory, backed by a slice of AppData keyed by this instance so multiple checklists
		// on a page keep separate stores and the data stays observable / serializable.
		if (!this.pict.AppData.ChecklistStores) { this.pict.AppData.ChecklistStores = {}; }
		if (!this.pict.AppData.ChecklistStores[this.Hash]) { this.pict.AppData.ChecklistStores[this.Hash] = {}; }
		this._provider = new _InMemoryChecklistProvider({ Store: this.pict.AppData.ChecklistStores[this.Hash], Title: this.options.Title });
	}

	onAfterInitializeAsync(fCallback)
	{
		this.mount().then(() => fCallback()).catch(() => fCallback());
	}

	// Bring the control fully up: register the modal, wire the data provider, load + paint. The async
	// init calls this for the normal (standalone) case. A host that adds the view DYNAMICALLY -- after
	// the app has initialized, when pict's addView does not run the async lifecycle -- should call
	// initialize() then mount() itself.
	mount()
	{
		this._ensureModal();
		this._initProvider();
		return this._reload();
	}

	onBeforeRender(pRenderable)
	{
		// Publish this instance's shaped state so the templates read it and the engine bakes THIS view's
		// hash into every inline handler (matches the multi-instance pattern in pict-section-comments).
		this.pict.AppData.ChecklistActive = this._active;
		return super.onBeforeRender(pRenderable);
	}

	onAfterRender(pRenderable, pAddress, pRecord, pContent)
	{
		if (this.pict.CSSMap) { this.pict.CSSMap.injectCSS(); }
		this._restoreFocus();
		return super.onAfterRender(pRenderable, pAddress, pRecord, pContent);
	}

	// ---- data flow -------------------------------------------------------------------------------

	_reload()
	{
		if (!this._provider)
		{
			this._list = null; this._items = [];
			this._shape(); this.render();
			return Promise.resolve();
		}
		return this._provider.loadChecklist(this._context).then((pLoaded) =>
		{
			this._list = (pLoaded && pLoaded.List) || null;
			this._items = (pLoaded && pLoaded.Items) || [];
			this._shape();
			this.render();
		}).catch((pError) =>
		{
			if (this.log) { this.log.error('pict-section-checklist load failed: ' + (pError && pError.message), pError); }
		});
	}

	_shape()
	{
		let tmpReadOnly = !!this.options.ReadOnly;
		let tmpEditable = !tmpReadOnly;
		let tmpDecorated = libModel.decorate(this._items);
		let tmpOverall = tmpDecorated.Overall;

		let tmpContainerClass = 'pict-checklist'
			+ (tmpReadOnly ? ' pchk-readonly' : '')
			+ (tmpOverall.Complete ? ' pchk-complete' : '');

		let tmpEditAttr = tmpEditable ? 'contenteditable="true"' : '';
		let tmpTitleEditAttr = (tmpEditable && this.options.EditableTitle !== false) ? 'contenteditable="true"' : '';

		this._active =
		{
			ViewHash: this.Hash,
			Editable: tmpEditable,
			ContainerClass: tmpContainerClass,
			TitleInputId: 'pchk-title-' + this.Hash,
			AddInputId: 'pchk-add-' + this.Hash,
			List:
			{
				Key: this._list ? this._list.Key : '',
				Title: this._list ? (this._list.Title || '') : (this.options.Title || ''),
				EditAttr: tmpTitleEditAttr
			},
			Overall:
			{
				Percent: tmpOverall.Percent,
				DoneCount: tmpOverall.DoneCount,
				LeafCount: tmpOverall.LeafCount,
				Complete: tmpOverall.Complete
			},
			Roots: tmpDecorated.Roots.map((pNode) => this._shapeNode(pNode, tmpEditAttr)),
			// single-element-array slots drive the conditional template sections
			ProgressSlot: (this.options.ShowProgress !== false) ? [{ Percent: tmpOverall.Percent, Label: tmpOverall.DoneCount + ' of ' + tmpOverall.LeafCount + ' · ' + tmpOverall.Percent + '%' }] : [],
			AddSlot: tmpEditable ? [{ ViewHash: this.Hash, AddInputId: 'pchk-add-' + this.Hash, AddPlaceholder: this.options.AddPlaceholder || 'Add an item' }] : [],
			EmptySlot: (tmpDecorated.Roots.length === 0) ? [{ Message: this.options.EmptyMessage || 'Nothing here yet.' }] : []
		};
	}

	_shapeNode(pNode, pEditAttr)
	{
		let tmpRowClass = 'pchk-item'
			+ (pNode.IsGroup ? ' pchk-group' : ' pchk-leaf')
			+ (pNode.Done ? ' pchk-done' : '')
			+ (pNode.Collapsed ? ' pchk-collapsed' : '')
			+ ((pNode.IsGroup && pNode.Percent === 100) ? ' pchk-group-done' : '');
		return {
			ViewHash: this.Hash,
			Key: pNode.Key,
			Title: pNode.Title || '',
			IsGroup: pNode.IsGroup,
			Done: !!pNode.Done,
			Percent: pNode.Percent,
			RowClass: tmpRowClass,
			InputId: 'pchk-input-' + this.Hash + '-' + pNode.Key,
			EditAttr: pEditAttr,
			// A collapsed group hides its children (still in the tree, just not rendered).
			Children: pNode.Collapsed ? [] : (pNode.Children || []).map((pChild) => this._shapeNode(pChild, pEditAttr))
		};
	}

	_emptyActive()
	{
		return { ViewHash: this.Hash, ContainerClass: 'pict-checklist', List: { Title: '', EditAttr: '' }, Overall: { Percent: 0, DoneCount: 0, LeafCount: 0 }, Roots: [], ProgressSlot: [], AddSlot: [], EmptySlot: [] };
	}

	// ---- item helpers (read from the flat list) --------------------------------------------------

	_itemByKey(pKey) { return this._items.find((pItem) => String(pItem.Key) === String(pKey)) || null; }

	_parentKeyOf(pItem) { return (pItem && pItem.ParentKey != null && pItem.ParentKey !== '') ? String(pItem.ParentKey) : ''; }

	_siblingsOf(pItem)
	{
		let tmpParent = this._parentKeyOf(pItem);
		return this._items
			.filter((pOther) => this._parentKeyOf(pOther) === tmpParent)
			.sort((pA, pB) => (pA.Sort - pB.Sort));
	}

	_childrenOf(pKey)
	{
		return this._items
			.filter((pItem) => String(this._parentKeyOf(pItem)) === String(pKey))
			.sort((pA, pB) => (pA.Sort - pB.Sort));
	}

	// ---- interactions ----------------------------------------------------------------------------

	toggleItem(pKey)
	{
		if (this.options.ReadOnly) { return Promise.resolve(); }
		let tmpItem = this._itemByKey(pKey);
		// Only leaves carry a checkbox; ignore a toggle on a group.
		if (!tmpItem || this._childrenOf(pKey).length > 0) { return Promise.resolve(); }
		let tmpNext = !tmpItem.Done;
		return this._provider.updateItem(pKey, { Done: tmpNext })
			.then(() => { this._fire('onItemToggled', { Key: pKey, Done: tmpNext }); return this._reloadAndChange(); });
	}

	toggleCollapse(pKey)
	{
		let tmpItem = this._itemByKey(pKey);
		if (!tmpItem) { return Promise.resolve(); }
		return this._provider.updateItem(pKey, { Collapsed: !tmpItem.Collapsed }).then(() => this._reload());
	}

	addItem()
	{
		if (this.options.ReadOnly || !this._list) { return Promise.resolve(); }
		let tmpInput = (typeof document !== 'undefined') ? document.getElementById(this._active.AddInputId) : null;
		let tmpTitle = tmpInput ? String(tmpInput.value || '').trim() : '';
		if (!tmpTitle) { return Promise.resolve(); }
		if (tmpInput) { tmpInput.value = ''; }
		this._ui.FocusKey = '__add__';
		return this._provider.createItem({ ListKey: this._list.Key, ParentKey: null, Title: tmpTitle })
			.then((pItem) => { this._fire('onItemAdded', pItem); return this._reloadAndChange(); });
	}

	// The "+" beside the add input: drop an empty item at the end of the list and put the cursor in it,
	// so a click-then-type flow works alongside typing in the input and pressing Enter to continue.
	addRootEmpty()
	{
		if (this.options.ReadOnly || !this._list) { return Promise.resolve(); }
		return this._provider.createItem({ ListKey: this._list.Key, ParentKey: null, Title: '' })
			.then((pItem) => { this._ui.FocusKey = pItem.Key; this._fire('onItemAdded', pItem); return this._reloadAndChange(); });
	}

	addChild(pKey)
	{
		if (this.options.ReadOnly || !this._list) { return Promise.resolve(); }
		let tmpChildren = this._childrenOf(pKey);
		let tmpSort = tmpChildren.length ? (tmpChildren[tmpChildren.length - 1].Sort + 1) : 0;
		return this._provider.createItem({ ListKey: this._list.Key, ParentKey: pKey, Title: '', Sort: tmpSort })
			.then((pItem) =>
			{
				this._ui.FocusKey = pItem.Key;
				// A new child also expands the (now) group so it is visible.
				let tmpParent = this._itemByKey(pKey);
				if (tmpParent && tmpParent.Collapsed) { return this._provider.updateItem(pKey, { Collapsed: false }).then(() => { this._fire('onItemAdded', pItem); return this._reloadAndChange(); }); }
				this._fire('onItemAdded', pItem);
				return this._reloadAndChange();
			});
	}

	addSibling(pKey)
	{
		if (this.options.ReadOnly || !this._list) { return Promise.resolve(); }
		let tmpItem = this._itemByKey(pKey);
		if (!tmpItem) { return this.addItem(); }
		let tmpSiblings = this._siblingsOf(tmpItem);
		let tmpIndex = tmpSiblings.findIndex((pOther) => String(pOther.Key) === String(pKey));
		let tmpNext = (tmpIndex >= 0 && tmpIndex < tmpSiblings.length - 1) ? tmpSiblings[tmpIndex + 1] : null;
		let tmpSort = tmpNext ? ((tmpItem.Sort + tmpNext.Sort) / 2) : (tmpItem.Sort + 1);
		return this._provider.createItem({ ListKey: this._list.Key, ParentKey: tmpItem.ParentKey, Title: '', Sort: tmpSort })
			.then((pItem) => { this._ui.FocusKey = pItem.Key; this._fire('onItemAdded', pItem); return this._reloadAndChange(); });
	}

	commitTitle(pKey, pElement)
	{
		if (this.options.ReadOnly) { return Promise.resolve(); }
		let tmpItem = this._itemByKey(pKey);
		let tmpTitle = pElement ? String(pElement.textContent || '').trim() : '';
		if (!tmpItem || tmpItem.Title === tmpTitle) { return Promise.resolve(); }
		// Keep the local copy current so a following structural action does not re-render the old title.
		tmpItem.Title = tmpTitle;
		return this._provider.updateItem(pKey, { Title: tmpTitle })
			.then(() => { this._fire('onItemEdited', { Key: pKey, Title: tmpTitle }); this._fire('onChange', { Event: 'onItemEdited', Payload: { Key: pKey } }); });
	}

	commitListTitle(pElement)
	{
		if (this.options.ReadOnly || this.options.EditableTitle === false || !this._list) { return Promise.resolve(); }
		let tmpTitle = pElement ? String(pElement.textContent || '').trim() : '';
		if (this._list.Title === tmpTitle) { return Promise.resolve(); }
		this._list.Title = tmpTitle;
		return this._provider.updateList(this._list.Key, { Title: tmpTitle })
			.then(() => { this._fire('onListRenamed', { Key: this._list.Key, Title: tmpTitle }); this._fire('onChange', { Event: 'onListRenamed', Payload: { Title: tmpTitle } }); });
	}

	onTitleKeydown(pKey, pEvent, pElement)
	{
		if (!pEvent) { return; }
		if (pEvent.key === 'Enter' && !pEvent.shiftKey)
		{
			pEvent.preventDefault();
			this.commitTitle(pKey, pElement);
			this.addSibling(pKey);
			return;
		}
		if (pEvent.key === 'Tab')
		{
			pEvent.preventDefault();
			this.commitTitle(pKey, pElement);
			if (pEvent.shiftKey) { this.outdentItem(pKey); } else { this.indentItem(pKey); }
			return;
		}
		if (pEvent.key === 'Backspace' && String(pElement.textContent || '') === '')
		{
			pEvent.preventDefault();
			this._deleteAndFocusPrev(pKey);
		}
	}

	indentItem(pKey)
	{
		if (this.options.ReadOnly) { return Promise.resolve(); }
		let tmpItem = this._itemByKey(pKey);
		if (!tmpItem) { return Promise.resolve(); }
		let tmpSiblings = this._siblingsOf(tmpItem);
		let tmpIndex = tmpSiblings.findIndex((pOther) => String(pOther.Key) === String(pKey));
		if (tmpIndex <= 0) { return Promise.resolve(); }                 // nothing to nest under
		let tmpNewParent = tmpSiblings[tmpIndex - 1];
		let tmpParentChildren = this._childrenOf(tmpNewParent.Key);
		let tmpSort = tmpParentChildren.length ? (tmpParentChildren[tmpParentChildren.length - 1].Sort + 1) : 0;
		this._ui.FocusKey = pKey;
		return this._provider.updateItem(pKey, { ParentKey: tmpNewParent.Key, Sort: tmpSort })
			.then(() => { if (tmpNewParent.Collapsed) { return this._provider.updateItem(tmpNewParent.Key, { Collapsed: false }); } })
			.then(() => this._reloadAndChange());
	}

	outdentItem(pKey)
	{
		if (this.options.ReadOnly) { return Promise.resolve(); }
		let tmpItem = this._itemByKey(pKey);
		if (!tmpItem) { return Promise.resolve(); }
		let tmpParentKey = this._parentKeyOf(tmpItem);
		if (!tmpParentKey) { return Promise.resolve(); }                 // already at the root
		let tmpParent = this._itemByKey(tmpParentKey);
		let tmpGrandKey = tmpParent ? tmpParent.ParentKey : null;
		let tmpSort = tmpParent ? (tmpParent.Sort + 0.5) : 0;            // drop in just after the old parent
		this._ui.FocusKey = pKey;
		return this._provider.updateItem(pKey, { ParentKey: tmpGrandKey, Sort: tmpSort })
			.then(() => this._reloadAndChange());
	}

	confirmDelete(pKey)
	{
		if (this.options.ReadOnly) { return Promise.resolve(); }
		let tmpItem = this._itemByKey(pKey);
		let tmpHasChildren = this._childrenOf(pKey).length > 0;
		let tmpLabel = (tmpItem && tmpItem.Title) ? ('"' + tmpItem.Title + '"') : 'this item';
		let tmpMessage = tmpHasChildren ? ('Delete ' + tmpLabel + ' and everything nested under it?') : ('Delete ' + tmpLabel + '?');
		return this._confirm(tmpMessage, { title: 'Delete item', confirmLabel: 'Delete', dangerous: true })
			.then((pOk) =>
			{
				if (!pOk) { return; }
				return this._provider.deleteItem(pKey).then(() => { this._fire('onItemDeleted', { Key: pKey }); return this._reloadAndChange(); });
			});
	}

	_deleteAndFocusPrev(pKey)
	{
		let tmpItem = this._itemByKey(pKey);
		if (!tmpItem) { return Promise.resolve(); }
		// Only fast-delete an empty leaf via Backspace; a group with children goes through the dialog.
		if (this._childrenOf(pKey).length > 0) { return Promise.resolve(); }
		let tmpSiblings = this._siblingsOf(tmpItem);
		let tmpIndex = tmpSiblings.findIndex((pOther) => String(pOther.Key) === String(pKey));
		let tmpPrev = (tmpIndex > 0) ? tmpSiblings[tmpIndex - 1] : null;
		this._ui.FocusKey = tmpPrev ? tmpPrev.Key : null;
		return this._provider.deleteItem(pKey).then(() => { this._fire('onItemDeleted', { Key: pKey }); return this._reloadAndChange(); });
	}

	// ---- public API ------------------------------------------------------------------------------

	setReadOnly(pReadOnly) { this.options.ReadOnly = !!pReadOnly; this._shape(); this.render(); }

	getItems() { return JSON.parse(JSON.stringify(this._items)); }

	reload() { return this._reload(); }

	// ---- internals -------------------------------------------------------------------------------

	_reloadAndChange() { return this._reload().then(() => this._fire('onChange', { Event: 'onChange' })); }

	_restoreFocus()
	{
		if (!this._ui.FocusKey || typeof document === 'undefined') { return; }
		let tmpId = (this._ui.FocusKey === '__add__') ? this._active.AddInputId : ('pchk-input-' + this.Hash + '-' + this._ui.FocusKey);
		this._ui.FocusKey = null;
		let tmpElement = document.getElementById(tmpId);
		if (!tmpElement) { return; }
		tmpElement.focus();
		if (tmpElement.tagName === 'INPUT') { return; }
		// contenteditable: drop the caret at the end.
		try
		{
			let tmpRange = document.createRange();
			tmpRange.selectNodeContents(tmpElement);
			tmpRange.collapse(false);
			let tmpSelection = window.getSelection();
			tmpSelection.removeAllRanges();
			tmpSelection.addRange(tmpRange);
		}
		catch (pError) { /* selection APIs absent (non-browser) -- focus is enough */ }
	}

	_fire(pName, pPayload)
	{
		let tmpHandler = this.options[pName];
		if (typeof tmpHandler === 'function') { try { tmpHandler(pPayload, this); } catch (pError) { if (this.log) { this.log.error('checklist ' + pName + ' handler threw: ' + (pError && pError.message), pError); } } }
	}

	// Make sure the modal section the delete confirm uses is registered + initialized, so a host gets
	// the dialog for free (mirrors pict-section-comments). A host that already registered it is left alone.
	_ensureModal()
	{
		if (!this.pict.views['Pict-Section-Modal'])
		{
			this.pict.addView('Pict-Section-Modal', libModal.default_configuration, libModal);
		}
		let tmpModalView = this.pict.views['Pict-Section-Modal'];
		if (tmpModalView && typeof document !== 'undefined' && document.body && typeof tmpModalView.initialize === 'function')
		{
			tmpModalView.initialize();
		}
	}

	_confirm(pMessage, pOptions)
	{
		let tmpModal = this.pict.views['Pict-Section-Modal'];
		if (tmpModal && typeof tmpModal.confirm === 'function') { return tmpModal.confirm(pMessage, pOptions || {}); }
		// No modal section registered: fall back to resolving true so a host without it is not blocked.
		return Promise.resolve(true);
	}
}

module.exports = PictViewChecklist;
module.exports.default_configuration = _DefaultConfiguration;
