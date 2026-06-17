'use strict';

/**
 * ChecklistModel
 * --------------
 * Pure tree + progress helpers for a checklist. A checklist is a flat list of items linked by
 * ParentKey; these turn that into a nested tree and compute how complete each branch is. No DOM, no
 * provider, no Pict -- just data, so the view and the tests lean on the same math.
 *
 * Progress is hierarchically weighted: each node splits its share of the whole equally among its
 * children. A root is worth 1 / (number of roots); a child is worth its parent's share / (number of
 * siblings). So two top-level items are 50% each, and if one of them holds two children those are
 * 25% each (half of the parent's 50%) no matter how many leaves the other branch carries. A leaf
 * (no children, the only thing with a checkbox) contributes its full weight when done; a group's
 * completion is the mean of its children, so a child counts the same however deep its own subtree runs.
 *
 * Each node carries Weight (its share of the whole, 0..1; leaf weights sum to 1), Fraction (its own
 * completion, 0..1), Percent (Math.round(Fraction * 100), for display), and LeafCount / DoneCount
 * (the raw task tally under it, for the "X of Y" readout).
 */

// Build a nested tree (roots, each with a Children array) from a flat item list. Items are linked by
// ParentKey (null or '' for a root) and ordered by Sort then by their original position. Each returned
// node is a shallow copy of its item plus Children and Depth; the input array is not mutated.
function buildTree(pItems)
{
	let tmpItems = Array.isArray(pItems) ? pItems : [];
	let tmpByParent = {};
	for (let i = 0; i < tmpItems.length; i++)
	{
		let tmpParent = _parentKey(tmpItems[i]);
		if (!tmpByParent[tmpParent]) { tmpByParent[tmpParent] = []; }
		tmpByParent[tmpParent].push({ Item: tmpItems[i], Index: i });
	}

	let fChildrenOf = (pParentKey, pDepth) =>
	{
		let tmpChildren = (tmpByParent[pParentKey] || []).slice()
			.sort((pA, pB) => (_sort(pA.Item) - _sort(pB.Item)) || (pA.Index - pB.Index));
		return tmpChildren.map((pEntry) =>
		{
			let tmpNode = Object.assign({}, pEntry.Item);
			tmpNode.Depth = pDepth;
			tmpNode.Children = fChildrenOf(String(pEntry.Item.Key), pDepth + 1);
			return tmpNode;
		});
	};

	return fChildrenOf('', 0);
}

// Annotate one node and its subtree with IsGroup / LeafCount / DoneCount / Fraction / Percent,
// post-order. A group's Fraction is the mean of its children's, so each child counts the same
// regardless of how many leaves it holds; LeafCount / DoneCount stay the raw task tally.
function annotateProgress(pNode)
{
	if (!pNode.Children || pNode.Children.length === 0)
	{
		pNode.IsGroup = false;
		pNode.LeafCount = 1;
		pNode.DoneCount = pNode.Done ? 1 : 0;
		pNode.Fraction = pNode.Done ? 1 : 0;
		pNode.Percent = pNode.Done ? 100 : 0;
		return pNode;
	}
	pNode.IsGroup = true;
	let tmpLeaves = 0;
	let tmpDone = 0;
	let tmpFractionSum = 0;
	for (let i = 0; i < pNode.Children.length; i++)
	{
		annotateProgress(pNode.Children[i]);
		tmpLeaves += pNode.Children[i].LeafCount;
		tmpDone += pNode.Children[i].DoneCount;
		tmpFractionSum += pNode.Children[i].Fraction;
	}
	pNode.LeafCount = tmpLeaves;
	pNode.DoneCount = tmpDone;
	pNode.Fraction = tmpFractionSum / pNode.Children.length;
	pNode.Percent = Math.round(pNode.Fraction * 100);
	return pNode;
}

// Distribute a node's completion weight down the tree: each node hands its share to its children in
// equal parts. Top-down, so it runs after the tree is built; pWeight is the node's share of the whole.
function assignWeights(pNode, pWeight)
{
	pNode.Weight = pWeight;
	let tmpChildren = pNode.Children || [];
	if (tmpChildren.length)
	{
		let tmpShare = pWeight / tmpChildren.length;
		for (let i = 0; i < tmpChildren.length; i++) { assignWeights(tmpChildren[i], tmpShare); }
	}
	return pNode;
}

// The one call the view uses: a flat item list in, { Roots, Overall } out. The roots split the whole
// 1.0 equally, so Overall completion is the mean of the roots' Fractions (a weighted roll-up), while
// LeafCount / DoneCount stay the raw count for the "X of Y" readout.
function decorate(pItems)
{
	let tmpRoots = buildTree(pItems);
	let tmpRootShare = tmpRoots.length ? (1 / tmpRoots.length) : 0;
	let tmpLeaves = 0;
	let tmpDone = 0;
	let tmpFractionSum = 0;
	for (let i = 0; i < tmpRoots.length; i++)
	{
		annotateProgress(tmpRoots[i]);
		assignWeights(tmpRoots[i], tmpRootShare);
		tmpLeaves += tmpRoots[i].LeafCount;
		tmpDone += tmpRoots[i].DoneCount;
		tmpFractionSum += tmpRoots[i].Fraction;
	}
	let tmpFraction = tmpRoots.length ? (tmpFractionSum / tmpRoots.length) : 0;
	return {
		Roots: tmpRoots,
		Overall:
		{
			Weight: tmpRoots.length ? 1 : 0,
			LeafCount: tmpLeaves,
			DoneCount: tmpDone,
			Fraction: tmpFraction,
			Percent: Math.round(tmpFraction * 100),
			Complete: (tmpLeaves > 0 && tmpDone === tmpLeaves)
		}
	};
}

function _parentKey(pItem) { return (pItem && pItem.ParentKey != null && pItem.ParentKey !== '') ? String(pItem.ParentKey) : ''; }
function _sort(pItem) { return (pItem && typeof pItem.Sort === 'number') ? pItem.Sort : 0; }

module.exports = { buildTree: buildTree, annotateProgress: annotateProgress, assignWeights: assignWeights, decorate: decorate };
