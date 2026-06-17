'use strict';

/**
 * ChecklistModel
 * --------------
 * Pure tree + progress helpers for a checklist. A checklist is a flat list of items linked by
 * ParentKey; these turn that into a nested tree and compute how complete each branch is. No DOM, no
 * provider, no Pict -- just data, so the view and the tests lean on the same math.
 *
 * Progress is leaf-based: a leaf (an item with no children) is one unit of work, done or not; a group
 * (an item with children) has no checkbox of its own, it shows the share of its leaf descendants that
 * are done. So "how far through this tier" always means "how many of the actual tasks under it are
 * checked," at every level and overall.
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

// Annotate one node and its subtree with IsGroup / LeafCount / DoneCount / Percent, post-order.
function annotateProgress(pNode)
{
	if (!pNode.Children || pNode.Children.length === 0)
	{
		pNode.IsGroup = false;
		pNode.LeafCount = 1;
		pNode.DoneCount = pNode.Done ? 1 : 0;
		pNode.Percent = pNode.Done ? 100 : 0;
		return pNode;
	}
	pNode.IsGroup = true;
	let tmpLeaves = 0;
	let tmpDone = 0;
	for (let i = 0; i < pNode.Children.length; i++)
	{
		annotateProgress(pNode.Children[i]);
		tmpLeaves += pNode.Children[i].LeafCount;
		tmpDone += pNode.Children[i].DoneCount;
	}
	pNode.LeafCount = tmpLeaves;
	pNode.DoneCount = tmpDone;
	pNode.Percent = tmpLeaves ? Math.round((tmpDone / tmpLeaves) * 100) : 0;
	return pNode;
}

// The one call the view uses: a flat item list in, { Roots, Overall } out.
function decorate(pItems)
{
	let tmpRoots = buildTree(pItems);
	let tmpLeaves = 0;
	let tmpDone = 0;
	for (let i = 0; i < tmpRoots.length; i++)
	{
		annotateProgress(tmpRoots[i]);
		tmpLeaves += tmpRoots[i].LeafCount;
		tmpDone += tmpRoots[i].DoneCount;
	}
	return {
		Roots: tmpRoots,
		Overall:
		{
			LeafCount: tmpLeaves,
			DoneCount: tmpDone,
			Percent: tmpLeaves ? Math.round((tmpDone / tmpLeaves) * 100) : 0,
			Complete: (tmpLeaves > 0 && tmpDone === tmpLeaves)
		}
	};
}

function _parentKey(pItem) { return (pItem && pItem.ParentKey != null && pItem.ParentKey !== '') ? String(pItem.ParentKey) : ''; }
function _sort(pItem) { return (pItem && typeof pItem.Sort === 'number') ? pItem.Sort : 0; }

module.exports = { buildTree: buildTree, annotateProgress: annotateProgress, decorate: decorate };
