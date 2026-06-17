'use strict';

/**
 * pict-section-checklist entry point.
 *
 * Exports the Checklist view (with its default_configuration) plus the data-provider classes and the
 * tree/progress model, so a host can register the view and, if it wants, subclass the provider to talk
 * to its own backend or reuse the progress math.
 *
 * Typical use (in-memory by default; pass a DataProvider to persist):
 *
 *   const libChecklist = require('pict-section-checklist');
 *   pict.addView('WorkItem-Checklist', Object.assign({}, libChecklist.default_configuration,
 *       { Context: { OwnerType: 'WorkItem', IDOwner: 4012 }, Title: 'Acceptance checks' }),
 *       libChecklist);
 *   pict.views['WorkItem-Checklist'].render();
 *
 * @author Steven Velozo <steven@velozo.com>
 * @license MIT
 */

const libChecklistView = require('./views/PictView-Checklist.js');
const libChecklistProvider = require('./providers/ChecklistProvider-Base.js');
const libChecklistModel = require('./ChecklistModel.js');

module.exports = libChecklistView;
module.exports.default_configuration = libChecklistView.default_configuration;

// The data seam: the interface a host implements to override all reading and writing, and the
// in-memory default the section uses when nothing is wired.
module.exports.ChecklistDataProvider = libChecklistProvider.ChecklistDataProvider;
module.exports.InMemoryChecklistProvider = libChecklistProvider.InMemoryChecklistProvider;
module.exports.normalizeContext = libChecklistProvider.normalizeContext;

// The pure tree + progress helpers, exported for hosts and tests.
module.exports.Model = libChecklistModel;
