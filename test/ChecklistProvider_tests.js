'use strict';

/**
 * Tests for the data seam: the InMemoryChecklistProvider default and the loadChecklist convenience
 * every provider inherits. These run without a browser or a pict app -- the provider is plain logic on
 * purpose, so the override seam is easy to reason about and test.
 */

const libChai = require('chai');
const libExpect = libChai.expect;

const libProvider = require('../source/providers/ChecklistProvider-Base.js');
const libInMemory = libProvider.InMemoryChecklistProvider;
const libBase = libProvider.ChecklistDataProvider;

// A deterministic provider: fixed clock and counter keys, so assertions are stable.
function freshProvider(pExtra)
{
	let tmpClock = { t: 1000 };
	let tmpCounter = { n: 0 };
	return new libInMemory(Object.assign(
	{
		Now: function () { return tmpClock.t++; },
		KeyGenerator: function () { tmpCounter.n++; return 'k' + tmpCounter.n; }
	}, pExtra || {}));
}

const CTX = { OwnerType: 'WorkItem', IDOwner: '7' };

suite('ChecklistProvider', function ()
{
	suite('base', function ()
	{
		test('a primitive rejects until a subclass implements it', function ()
		{
			return new libBase({}).listItems('x').then(
				function () { throw new Error('should have rejected'); },
				function (pError) { libExpect(pError.message).to.match(/not implemented/); });
		});
	});

	suite('lists', function ()
	{
		test('getList implicitly creates an empty list for a context', function ()
		{
			return freshProvider().getList(CTX).then(function (pList)
			{
				libExpect(pList.OwnerType).to.equal('WorkItem');
				libExpect(pList.IDOwner).to.equal('7');
				libExpect(pList.Key).to.be.a('string');
			});
		});

		test('getList returns the same list on a second call', function ()
		{
			let tmpProvider = freshProvider();
			return tmpProvider.getList(CTX).then((pFirst) => tmpProvider.getList(CTX).then((pSecond) => libExpect(pSecond.Key).to.equal(pFirst.Key)));
		});

		test('updateList renames', function ()
		{
			let tmpProvider = freshProvider();
			return tmpProvider.getList(CTX).then((pList) => tmpProvider.updateList(pList.Key, { Title: 'Renamed' })).then((pList) => libExpect(pList.Title).to.equal('Renamed'));
		});
	});

	suite('items', function ()
	{
		test('createItem requires a real list', function ()
		{
			return freshProvider().createItem({ Title: 'orphan' }).then(
				function () { throw new Error('should have rejected'); },
				function (pError) { libExpect(pError.message).to.match(/ListKey/); });
		});

		test('create then list returns items ordered by Sort', function ()
		{
			let tmpProvider = freshProvider();
			return tmpProvider.getList(CTX).then((pList) => Promise.all(
				[
					tmpProvider.createItem({ ListKey: pList.Key, Title: 'second', Sort: 1 }),
					tmpProvider.createItem({ ListKey: pList.Key, Title: 'first', Sort: 0 })
				]).then(() => tmpProvider.listItems(pList.Key)).then((pItems) => libExpect(pItems.map((pItem) => pItem.Title)).to.deep.equal(['first', 'second'])));
		});

		test('updateItem toggles Done', function ()
		{
			let tmpProvider = freshProvider();
			return tmpProvider.getList(CTX)
				.then((pList) => tmpProvider.createItem({ ListKey: pList.Key, Title: 'x' }))
				.then((pItem) => tmpProvider.updateItem(pItem.Key, { Done: true }))
				.then((pItem) => libExpect(pItem.Done).to.equal(true));
		});

		test('deleteItem removes the item and its whole subtree', function ()
		{
			let tmpProvider = freshProvider();
			return tmpProvider.getList(CTX).then(function (pList)
			{
				let tmpListKey = pList.Key;
				return tmpProvider.createItem({ ListKey: tmpListKey, Key: 'parent', Title: 'P' })
					.then(() => tmpProvider.createItem({ ListKey: tmpListKey, Key: 'child', ParentKey: 'parent', Title: 'C' }))
					.then(() => tmpProvider.createItem({ ListKey: tmpListKey, Key: 'grand', ParentKey: 'child', Title: 'G' }))
					.then(() => tmpProvider.createItem({ ListKey: tmpListKey, Key: 'other', Title: 'O' }))
					.then(() => tmpProvider.deleteItem('parent'))
					.then(() => tmpProvider.listItems(tmpListKey))
					.then((pItems) => libExpect(pItems.map((pItem) => pItem.Key)).to.deep.equal(['other']));
			});
		});

		test('reads are deep copies (mutating a result does not change the store)', function ()
		{
			let tmpProvider = freshProvider();
			return tmpProvider.getList(CTX).then((pList) => tmpProvider.createItem({ ListKey: pList.Key, Title: 'x' }).then(function (pItem)
			{
				pItem.Title = 'mutated';
				return tmpProvider.listItems(pList.Key).then((pItems) => libExpect(pItems[0].Title).to.equal('x'));
			}));
		});
	});

	suite('loadChecklist', function ()
	{
		test('returns the list and its items together', function ()
		{
			let tmpProvider = freshProvider();
			return tmpProvider.getList(CTX)
				.then((pList) => tmpProvider.createItem({ ListKey: pList.Key, Title: 'x' }))
				.then(() => tmpProvider.loadChecklist(CTX))
				.then(function (pLoaded) { libExpect(pLoaded.List).to.be.an('object'); libExpect(pLoaded.Items).to.have.length(1); });
		});
	});
});
