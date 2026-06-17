'use strict';

/**
 * A "pretend backend" demo for pict-section-checklist. It swaps in a custom ChecklistDataProvider that
 * puts every read and write behind a short delay, the way a real REST round-trip would. The point is to
 * show the data seam: the section drives a fully asynchronous provider with no change to the control.
 *
 * A real host's provider would call fetch() inside each primitive and map its rows to the neutral
 * { List, Item } shapes (see plansheet's PlansheetCommentProvider for that exact pattern). Here we just
 * delay the in-memory default so the demo needs no server.
 */

const libPictApplication = require('pict-application');
const libPict = require('pict');
const libChecklist = require('../../../source/Pict-Section-Checklist.js');

const _LATENCY_MS = 260;
const _CONTEXT = { OwnerType: 'WorkItem', IDOwner: '4012' };

class SlowChecklistProvider extends libChecklist.InMemoryChecklistProvider
{
	_slow(pFactory) { return new Promise((resolve, reject) => { setTimeout(() => { pFactory().then(resolve, reject); }, _LATENCY_MS); }); }
	getList(pContext) { return this._slow(() => super.getList(pContext)); }
	updateList(pKey, pPatch) { return this._slow(() => super.updateList(pKey, pPatch)); }
	listItems(pListKey) { return this._slow(() => super.listItems(pListKey)); }
	createItem(pDraft) { return this._slow(() => super.createItem(pDraft)); }
	updateItem(pKey, pPatch) { return this._slow(() => super.updateItem(pKey, pPatch)); }
	deleteItem(pKey) { return this._slow(() => super.deleteItem(pKey)); }
}

function seedStore()
{
	let tmpListKey = 'list-acc';
	let tmpItems = {};
	let tmpSort = 0;
	function add(pKey, pParent, pTitle, pDone)
	{
		tmpItems[pKey] = { Key: pKey, ListKey: tmpListKey, ParentKey: pParent, Title: pTitle, Done: !!pDone, Sort: tmpSort++, Collapsed: false, Deleted: false };
	}
	add('a', null, 'Happy path returns 200', true);
	add('b', null, 'Validation', false);
	add('b1', 'b', 'Rejects an empty name', true);
	add('b2', 'b', 'Rejects a malformed email', false);
	add('b3', 'b', 'Rejects a duplicate', false);
	add('c', null, 'Docs updated', false);
	return { Lists: { 'list-acc': { Key: tmpListKey, OwnerType: _CONTEXT.OwnerType, IDOwner: _CONTEXT.IDOwner, Title: 'Acceptance checks' } }, Items: tmpItems };
}

class ChecklistBackendDemoApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this._provider = new SlowChecklistProvider({ Store: seedStore() });
		this.pict.addView('Checklist', Object.assign({}, libChecklist.default_configuration,
			{
				Context: _CONTEXT,
				Title: 'Acceptance checks',
				DataProvider: this._provider
			}), libChecklist);
	}

	onAfterInitializeAsync(fCallback)
	{
		this.pict.views['Checklist'].render();
		return super.onAfterInitializeAsync(fCallback);
	}
}

if (typeof window !== 'undefined' && !window.Pict) { window.Pict = libPict; }

module.exports = ChecklistBackendDemoApplication;
