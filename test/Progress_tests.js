'use strict';

/**
 * Tests for the pure tree + progress math (ChecklistModel). No browser, no provider -- just the
 * function that turns a flat item list into a nested tree with weighted completion at every tier.
 */

const libChai = require('chai');
const libExpect = libChai.expect;

const libModel = require('../source/ChecklistModel.js');

suite('ChecklistModel', function ()
{
	suite('buildTree', function ()
	{
		test('nests children under parents, ordered by Sort', function ()
		{
			let tmpItems =
			[
				{ Key: 'a', ParentKey: null, Title: 'A', Sort: 0 },
				{ Key: 'b', ParentKey: null, Title: 'B', Sort: 1 },
				{ Key: 'a2', ParentKey: 'a', Title: 'A2', Sort: 1 },
				{ Key: 'a1', ParentKey: 'a', Title: 'A1', Sort: 0 }
			];
			let tmpRoots = libModel.buildTree(tmpItems);
			libExpect(tmpRoots.map((pNode) => pNode.Key)).to.deep.equal(['a', 'b']);
			libExpect(tmpRoots[0].Children.map((pNode) => pNode.Key)).to.deep.equal(['a1', 'a2']);
			libExpect(tmpRoots[0].Depth).to.equal(0);
			libExpect(tmpRoots[0].Children[0].Depth).to.equal(1);
		});

		test('does not mutate the input items', function ()
		{
			let tmpItems = [{ Key: 'a', ParentKey: null, Title: 'A', Sort: 0 }];
			libModel.buildTree(tmpItems);
			libExpect(tmpItems[0]).to.not.have.property('Children');
		});

		test('an empty list builds an empty tree', function ()
		{
			libExpect(libModel.buildTree([])).to.deep.equal([]);
		});
	});

	suite('decorate / progress', function ()
	{
		test('a single leaf is one unit of work', function ()
		{
			let tmpResult = libModel.decorate([{ Key: 'a', ParentKey: null, Done: false, Sort: 0 }]);
			libExpect(tmpResult.Overall).to.include({ LeafCount: 1, DoneCount: 0, Percent: 0, Complete: false });
		});

		test('a group reports the share of its leaves that are done', function ()
		{
			let tmpItems =
			[
				{ Key: 'g', ParentKey: null, Sort: 0 },
				{ Key: 'g1', ParentKey: 'g', Done: true, Sort: 0 },
				{ Key: 'g2', ParentKey: 'g', Done: false, Sort: 1 },
				{ Key: 'g3', ParentKey: 'g', Done: false, Sort: 2 }
			];
			let tmpGroup = libModel.decorate(tmpItems).Roots[0];
			libExpect(tmpGroup.IsGroup).to.equal(true);
			libExpect(tmpGroup.LeafCount).to.equal(3);
			libExpect(tmpGroup.DoneCount).to.equal(1);
			libExpect(tmpGroup.Percent).to.equal(33);
		});

		test('progress rolls up through tiers by weight, not by leaf count', function ()
		{
			// top has two children: a sub-group "mid" (two done leaves) and a plain undone leaf "sib".
			// Weighted, mid and sib are 50% each, so top is 50% done -- not the 67% a flat 2-of-3 gives.
			let tmpItems =
			[
				{ Key: 'top', ParentKey: null, Sort: 0 },
				{ Key: 'mid', ParentKey: 'top', Sort: 0 },
				{ Key: 'l1', ParentKey: 'mid', Done: true, Sort: 0 },
				{ Key: 'l2', ParentKey: 'mid', Done: true, Sort: 1 },
				{ Key: 'sib', ParentKey: 'top', Done: false, Sort: 1 }
			];
			let tmpResult = libModel.decorate(tmpItems);
			libExpect(tmpResult.Overall).to.include({ LeafCount: 3, DoneCount: 2, Percent: 50 });
			let tmpTop = tmpResult.Roots[0];
			libExpect(tmpTop.Percent).to.equal(50);
			libExpect(tmpTop.Children[0].Percent).to.equal(100);
		});

		test('nested items are weighted as a share of their parent, not flat by leaf count', function ()
		{
			// Two top-level items: one a group with two children, the other a plain leaf. Each top-level
			// item is worth 50%; the group splits its 50% into 25% per child.
			let tmpItems =
			[
				{ Key: 'p1', ParentKey: null, Sort: 0 },
				{ Key: 'p2', ParentKey: null, Done: false, Sort: 1 },
				{ Key: 'c1', ParentKey: 'p1', Done: false, Sort: 0 },
				{ Key: 'c2', ParentKey: 'p1', Done: false, Sort: 1 }
			];
			let tmpResult = libModel.decorate(tmpItems);
			libExpect(tmpResult.Roots[0].Weight).to.equal(0.5);
			libExpect(tmpResult.Roots[1].Weight).to.equal(0.5);
			libExpect(tmpResult.Roots[0].Children[0].Weight).to.equal(0.25);
			libExpect(tmpResult.Roots[0].Children[1].Weight).to.equal(0.25);
		});

		test('completion sums the weighted shares of the done items', function ()
		{
			// c1 (25%) and p2 (50%) done -> 75% overall, even though that is 2 of 3 tasks (67% by count).
			let tmpItems =
			[
				{ Key: 'p1', ParentKey: null, Sort: 0 },
				{ Key: 'p2', ParentKey: null, Done: true, Sort: 1 },
				{ Key: 'c1', ParentKey: 'p1', Done: true, Sort: 0 },
				{ Key: 'c2', ParentKey: 'p1', Done: false, Sort: 1 }
			];
			let tmpResult = libModel.decorate(tmpItems);
			libExpect(tmpResult.Overall.Percent).to.equal(75);
			libExpect(tmpResult.Overall).to.include({ LeafCount: 3, DoneCount: 2 });
			libExpect(tmpResult.Roots[0].Percent).to.equal(50);
		});

		test('all leaves done marks the list complete', function ()
		{
			let tmpResult = libModel.decorate([{ Key: 'a', Done: true, Sort: 0 }, { Key: 'b', Done: true, Sort: 1 }]);
			libExpect(tmpResult.Overall.Complete).to.equal(true);
			libExpect(tmpResult.Overall.Percent).to.equal(100);
		});

		test('an empty list is 0% and not complete', function ()
		{
			libExpect(libModel.decorate([]).Overall).to.include({ LeafCount: 0, DoneCount: 0, Percent: 0, Complete: false });
		});
	});
});
