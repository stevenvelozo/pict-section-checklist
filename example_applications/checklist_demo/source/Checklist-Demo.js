'use strict';

/**
 * Standalone, in-browser demo for pict-section-checklist. It uses the default in-memory provider, seeds
 * a nested sample list, and persists the store to localStorage on every change -- no backend at all.
 * The page chrome adds a read-only toggle and a dark-mode toggle so you can see the control respond to
 * its host's theme tokens.
 */

const libPictApplication = require('pict-application');
const libPict = require('pict');
const libChecklist = require('../../../source/Pict-Section-Checklist.js');

const _STORAGE_KEY = 'pict-checklist-demo';
const _CONTEXT = { OwnerType: 'Standalone', IDOwner: '1' };

// A nested sample with varied done states so progress reads as something interesting on first load.
function seedStore()
{
	let tmpListKey = 'list-1';
	let tmpItems = {};
	let tmpSort = 0;
	function add(pKey, pParent, pTitle, pDone)
	{
		tmpItems[pKey] = { Key: pKey, ListKey: tmpListKey, ParentKey: pParent, Title: pTitle, Done: !!pDone, Sort: tmpSort++, Collapsed: false, Deleted: false };
	}
	add('a', null, 'Book the venue', true);
	add('b', null, 'Catering', false);
	add('b1', 'b', 'Confirm the headcount', true);
	add('b2', 'b', 'Pick the menu', false);
	add('b3', 'b', 'Note dietary restrictions', false);
	add('c', null, 'Invitations', false);
	add('c1', 'c', 'Design the card', true);
	add('c2', 'c', 'Send the list', false);
	add('d', null, 'Build the run-of-show', false);
	return { Lists: { 'list-1': { Key: tmpListKey, OwnerType: _CONTEXT.OwnerType, IDOwner: _CONTEXT.IDOwner, Title: 'Event checklist' } }, Items: tmpItems };
}

function loadStore()
{
	try { let tmpRaw = window.localStorage.getItem(_STORAGE_KEY); if (tmpRaw) { return JSON.parse(tmpRaw); } }
	catch (pError) { /* fall through to the seed */ }
	return seedStore();
}

class ChecklistDemoApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this._provider = new libChecklist.InMemoryChecklistProvider({ Store: loadStore() });
		let tmpSelf = this;
		this.pict.addView('Checklist', Object.assign({}, libChecklist.default_configuration,
			{
				Context: _CONTEXT,
				Title: 'Event checklist',
				DataProvider: this._provider,
				onChange: function () { tmpSelf._persist(); }
			}), libChecklist);
	}

	_persist()
	{
		try { window.localStorage.setItem(_STORAGE_KEY, JSON.stringify(this._provider.store)); }
		catch (pError) { /* storage unavailable -- the demo still works in-memory for the session */ }
	}

	onAfterInitializeAsync(fCallback)
	{
		this.pict.views['Checklist'].render();
		return super.onAfterInitializeAsync(fCallback);
	}
}

// Page chrome (the demo's own buttons, like a host app would own).
if (typeof window !== 'undefined')
{
	window.checklistDemoToggleReadOnly = function ()
	{
		let tmpView = window._Pict && window._Pict.views ? window._Pict.views.Checklist : null;
		if (!tmpView) { return; }
		let tmpNext = !tmpView.options.ReadOnly;
		tmpView.setReadOnly(tmpNext);
		let tmpButton = document.getElementById('Demo-ReadOnly');
		if (tmpButton) { tmpButton.textContent = tmpNext ? 'Switch to edit' : 'Switch to read-only'; }
	};
	window.checklistDemoToggleTheme = function () { document.body.classList.toggle('pchk-dark'); };
	window.checklistDemoReset = function ()
	{
		try { window.localStorage.removeItem(_STORAGE_KEY); } catch (pError) { /* ignore */ }
		window.location.reload();
	};
	if (!window.Pict) { window.Pict = libPict; }
}

module.exports = ChecklistDemoApplication;
