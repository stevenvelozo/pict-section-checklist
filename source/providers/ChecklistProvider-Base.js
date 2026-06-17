'use strict';

/**
 * ChecklistProvider-Base
 * ----------------------
 * The data seam for pict-section-checklist. A checklist is a List (a title bound to a context) plus a
 * flat set of Items linked by ParentKey. A host overrides this to persist to a real backend; with no
 * override the section uses InMemoryChecklistProvider, so it works entirely in the browser.
 *
 * Record shapes (neutral; a backend provider maps its own rows to and from these):
 *   Context { OwnerType, IDOwner }                          -- what the checklist is attached to
 *   List    { Key, OwnerType, IDOwner, Title }
 *   Item    { Key, ListKey, ParentKey|null, Title, Done, Sort, Notes, Collapsed }
 *
 * Every primitive returns a Promise. Reads return deep copies, so a caller can never mutate the store
 * out from under the provider -- the view holds data, the provider owns truth.
 */

const _DEFAULT_TITLE = 'Checklist';

function normalizeContext(pContext)
{
	let tmpContext = pContext || {};
	return { OwnerType: String(tmpContext.OwnerType || ''), IDOwner: String(tmpContext.IDOwner || '') };
}

// Lowest free Sort within a list (so a new item lands at the end).
function _nextSort(pItemsMap, pListKey)
{
	let tmpMax = -1;
	let tmpKeys = Object.keys(pItemsMap);
	for (let i = 0; i < tmpKeys.length; i++)
	{
		let tmpItem = pItemsMap[tmpKeys[i]];
		if (String(tmpItem.ListKey) === String(pListKey) && typeof tmpItem.Sort === 'number' && tmpItem.Sort > tmpMax) { tmpMax = tmpItem.Sort; }
	}
	return tmpMax + 1;
}

class ChecklistDataProvider
{
	constructor(pOptions)
	{
		this.options = pOptions || {};
		this._now = (typeof this.options.Now === 'function') ? this.options.Now : function () { return Date.now(); };
		let tmpCounter = 0;
		this._key = (typeof this.options.KeyGenerator === 'function') ? this.options.KeyGenerator : (() =>
		{
			tmpCounter++;
			return 'chk_' + this._now().toString(36) + '_' + tmpCounter.toString(36) + '_' + Math.floor(Math.random() * 0x7fffffff).toString(36);
		});
	}

	// ---- primitives (subclasses MUST implement) ----
	getList(pContext) { return Promise.reject(new Error('ChecklistDataProvider.getList not implemented')); }
	updateList(pKey, pPatch) { return Promise.reject(new Error('ChecklistDataProvider.updateList not implemented')); }
	listItems(pListKey) { return Promise.reject(new Error('ChecklistDataProvider.listItems not implemented')); }
	createItem(pItemDraft) { return Promise.reject(new Error('ChecklistDataProvider.createItem not implemented')); }
	updateItem(pKey, pPatch) { return Promise.reject(new Error('ChecklistDataProvider.updateItem not implemented')); }
	deleteItem(pKey) { return Promise.reject(new Error('ChecklistDataProvider.deleteItem not implemented')); }

	// ---- convenience built on the primitives (every provider gets this for free) ----

	/** Load a context in one call: its list plus the list's items. @returns {Promise<{List, Items}>} */
	loadChecklist(pContext)
	{
		return this.getList(pContext).then((pList) =>
		{
			if (!pList) { return { List: null, Items: [] }; }
			return this.listItems(pList.Key).then((pItems) => ({ List: pList, Items: pItems || [] }));
		});
	}
}

/**
 * The default, self-contained provider. Holds lists and items in a plain object so the section works
 * with no backend. Pass a slice of AppData as Store to keep the state observable / serializable.
 */
class InMemoryChecklistProvider extends ChecklistDataProvider
{
	constructor(pOptions)
	{
		super(pOptions);
		let tmpStore = (this.options && this.options.Store) ? this.options.Store : {};
		if (!tmpStore.Lists) { tmpStore.Lists = {}; }
		if (!tmpStore.Items) { tmpStore.Items = {}; }
		this.store = tmpStore;
		this._title = this.options.Title || _DEFAULT_TITLE;
	}

	_clone(pValue) { return (pValue == null) ? pValue : JSON.parse(JSON.stringify(pValue)); }

	getList(pContext)
	{
		let tmpContext = normalizeContext(pContext);
		let tmpExisting = Object.keys(this.store.Lists)
			.map((pKey) => this.store.Lists[pKey])
			.find((pList) => String(pList.OwnerType) === tmpContext.OwnerType && String(pList.IDOwner) === tmpContext.IDOwner);
		if (tmpExisting) { return Promise.resolve(this._clone(tmpExisting)); }
		// First load of a context implicitly creates its (empty) list, so the view always has one.
		let tmpNow = this._now();
		let tmpList = { Key: this._key(), OwnerType: tmpContext.OwnerType, IDOwner: tmpContext.IDOwner, Title: this._title, CreatedAt: tmpNow, UpdatedAt: tmpNow };
		this.store.Lists[tmpList.Key] = tmpList;
		return Promise.resolve(this._clone(tmpList));
	}

	updateList(pKey, pPatch)
	{
		let tmpList = this.store.Lists[pKey];
		if (!tmpList) { return Promise.reject(new Error('updateList: no list ' + pKey)); }
		if (pPatch && Object.prototype.hasOwnProperty.call(pPatch, 'Title')) { tmpList.Title = String(pPatch.Title); }
		tmpList.UpdatedAt = this._now();
		return Promise.resolve(this._clone(tmpList));
	}

	listItems(pListKey)
	{
		let tmpItems = Object.keys(this.store.Items)
			.map((pKey) => this.store.Items[pKey])
			.filter((pItem) => String(pItem.ListKey) === String(pListKey) && !pItem.Deleted)
			.sort((pA, pB) => (pA.Sort - pB.Sort));
		return Promise.resolve(this._clone(tmpItems));
	}

	createItem(pItemDraft)
	{
		let tmpDraft = pItemDraft || {};
		if (!tmpDraft.ListKey || !this.store.Lists[tmpDraft.ListKey]) { return Promise.reject(new Error('createItem requires a ListKey of an existing list')); }
		let tmpNow = this._now();
		let tmpItem =
		{
			Key: tmpDraft.Key || this._key(),
			ListKey: tmpDraft.ListKey,
			ParentKey: (tmpDraft.ParentKey != null && tmpDraft.ParentKey !== '') ? String(tmpDraft.ParentKey) : null,
			Title: (tmpDraft.Title != null) ? String(tmpDraft.Title) : '',
			Done: !!tmpDraft.Done,
			Sort: (typeof tmpDraft.Sort === 'number') ? tmpDraft.Sort : _nextSort(this.store.Items, tmpDraft.ListKey),
			Notes: tmpDraft.Notes ? String(tmpDraft.Notes) : '',
			Collapsed: !!tmpDraft.Collapsed,
			CreatedAt: tmpNow,
			UpdatedAt: tmpNow,
			Deleted: false
		};
		this.store.Items[tmpItem.Key] = tmpItem;
		return Promise.resolve(this._clone(tmpItem));
	}

	updateItem(pKey, pPatch)
	{
		let tmpItem = this.store.Items[pKey];
		if (!tmpItem || tmpItem.Deleted) { return Promise.reject(new Error('updateItem: no item ' + pKey)); }
		let tmpPatch = pPatch || {};
		let tmpAllowed = ['Title', 'Done', 'Sort', 'ParentKey', 'Notes', 'Collapsed'];
		for (let i = 0; i < tmpAllowed.length; i++)
		{
			let tmpField = tmpAllowed[i];
			if (!Object.prototype.hasOwnProperty.call(tmpPatch, tmpField)) { continue; }
			if (tmpField === 'ParentKey') { tmpItem.ParentKey = (tmpPatch.ParentKey != null && tmpPatch.ParentKey !== '') ? String(tmpPatch.ParentKey) : null; }
			else if (tmpField === 'Title' || tmpField === 'Notes') { tmpItem[tmpField] = String(tmpPatch[tmpField]); }
			else if (tmpField === 'Done' || tmpField === 'Collapsed') { tmpItem[tmpField] = !!tmpPatch[tmpField]; }
			else { tmpItem[tmpField] = tmpPatch[tmpField]; }
		}
		tmpItem.UpdatedAt = this._now();
		return Promise.resolve(this._clone(tmpItem));
	}

	deleteItem(pKey)
	{
		// Remove the item and its whole subtree (depth-first collect, then drop).
		let tmpToDelete = {};
		let fCollect = (pItemKey) =>
		{
			tmpToDelete[pItemKey] = true;
			let tmpKeys = Object.keys(this.store.Items);
			for (let i = 0; i < tmpKeys.length; i++)
			{
				let tmpChild = this.store.Items[tmpKeys[i]];
				if (tmpChild.ParentKey != null && String(tmpChild.ParentKey) === String(pItemKey) && !tmpToDelete[tmpChild.Key]) { fCollect(tmpChild.Key); }
			}
		};
		if (this.store.Items[pKey]) { fCollect(pKey); }
		Object.keys(tmpToDelete).forEach((pDelKey) => { delete this.store.Items[pDelKey]; });
		return Promise.resolve();
	}
}

module.exports =
{
	ChecklistDataProvider: ChecklistDataProvider,
	InMemoryChecklistProvider: InMemoryChecklistProvider,
	normalizeContext: normalizeContext,
	DEFAULT_TITLE: _DEFAULT_TITLE
};
