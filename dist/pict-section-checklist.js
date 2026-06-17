"use strict";

function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.PictSectionChecklist = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      module.exports = {
        "name": "fable-serviceproviderbase",
        "version": "3.0.19",
        "description": "Simple base classes for fable services.",
        "main": "source/Fable-ServiceProviderBase.js",
        "scripts": {
          "start": "node source/Fable-ServiceProviderBase.js",
          "test": "npx quack test",
          "tests": "npx quack test -g",
          "coverage": "npx quack coverage",
          "build": "npx quack build",
          "types": "tsc -p ./tsconfig.build.json",
          "check": "tsc -p . --noEmit"
        },
        "types": "types/source/Fable-ServiceProviderBase.d.ts",
        "mocha": {
          "diff": true,
          "extension": ["js"],
          "package": "./package.json",
          "reporter": "spec",
          "slow": "75",
          "timeout": "5000",
          "ui": "tdd",
          "watch-files": ["source/**/*.js", "test/**/*.js"],
          "watch-ignore": ["lib/vendor"]
        },
        "repository": {
          "type": "git",
          "url": "https://github.com/stevenvelozo/fable-serviceproviderbase.git"
        },
        "keywords": ["entity", "behavior"],
        "author": "Steven Velozo <steven@velozo.com> (http://velozo.com/)",
        "license": "MIT",
        "bugs": {
          "url": "https://github.com/stevenvelozo/fable-serviceproviderbase/issues"
        },
        "homepage": "https://github.com/stevenvelozo/fable-serviceproviderbase",
        "devDependencies": {
          "@types/mocha": "^10.0.10",
          "fable": "^3.1.62",
          "quackage": "^1.0.58",
          "typescript": "^5.9.3"
        }
      };
    }, {}],
    2: [function (require, module, exports) {
      /**
      * Fable Service Base
      * @author <steven@velozo.com>
      */

      const libPackage = require('../package.json');
      class FableServiceProviderBase {
        /**
         * The constructor can be used in two ways:
         * 1) With a fable, options object and service hash (the options object and service hash are optional)a
         * 2) With an object or nothing as the first parameter, where it will be treated as the options object
         *
         * @param {import('fable')|Record<string, any>} [pFable] - (optional) The fable instance, or the options object if there is no fable
         * @param {Record<string, any>|string} [pOptions] - (optional) The options object, or the service hash if there is no fable
         * @param {string} [pServiceHash] - (optional) The service hash to identify this service instance
         */
        constructor(pFable, pOptions, pServiceHash) {
          /** @type {import('fable')} */
          this.fable;
          /** @type {string} */
          this.UUID;
          /** @type {Record<string, any>} */
          this.options;
          /** @type {Record<string, any>} */
          this.services;
          /** @type {Record<string, any>} */
          this.servicesMap;

          // Check if a fable was passed in; connect it if so
          if (typeof pFable === 'object' && pFable.isFable) {
            this.connectFable(pFable);
          } else {
            this.fable = false;
          }

          // Initialize the services map if it wasn't passed in
          /** @type {Record<string, any>} */
          this._PackageFableServiceProvider = libPackage;

          // initialize options and UUID based on whether the fable was passed in or not.
          if (this.fable) {
            this.UUID = pFable.getUUID();
            this.options = typeof pOptions === 'object' ? pOptions : {};
          } else {
            // With no fable, check to see if there was an object passed into either of the first two
            // Parameters, and if so, treat it as the options object
            this.options = typeof pFable === 'object' && !pFable.isFable ? pFable : typeof pOptions === 'object' ? pOptions : {};
            this.UUID = "CORE-SVC-".concat(Math.floor(Math.random() * (99999 - 10000) + 10000));
          }

          // It's expected that the deriving class will set this
          this.serviceType = "Unknown-".concat(this.UUID);

          // The service hash is used to identify the specific instantiation of the service in the services map
          this.Hash = typeof pServiceHash === 'string' ? pServiceHash : !this.fable && typeof pOptions === 'string' ? pOptions : "".concat(this.UUID);
        }

        /**
         * @param {import('fable')} pFable
         */
        connectFable(pFable) {
          if (typeof pFable !== 'object' || !pFable.isFable) {
            let tmpErrorMessage = "Fable Service Provider Base: Cannot connect to Fable, invalid Fable object passed in.  The pFable parameter was a [".concat(typeof pFable, "].}");
            console.log(tmpErrorMessage);
            return new Error(tmpErrorMessage);
          }
          if (!this.fable) {
            this.fable = pFable;
          }
          if (!this.log) {
            this.log = this.fable.Logging;
          }
          if (!this.services) {
            this.services = this.fable.services;
          }
          if (!this.servicesMap) {
            this.servicesMap = this.fable.servicesMap;
          }
          return true;
        }
      }
      _defineProperty(FableServiceProviderBase, "isFableService", true);
      module.exports = FableServiceProviderBase;

      // This is left here in case we want to go back to having different code/base class for "core" services
      module.exports.CoreServiceProviderBase = FableServiceProviderBase;
    }, {
      "../package.json": 1
    }],
    3: [function (require, module, exports) {
      /**
       * Pict-Modal-Confirm
       *
       * Builds confirm and double-confirm dialog DOM, returns Promises.
       */
      class PictModalConfirm {
        constructor(pModal) {
          this._modal = pModal;
        }

        /**
         * Show a single-step confirmation dialog.
         *
         * @param {string} pMessage - The confirmation message
         * @param {object} [pOptions] - Options (title, confirmLabel, cancelLabel, dangerous)
         * @returns {Promise<boolean>}
         */
        confirm(pMessage, pOptions) {
          let tmpOptions = Object.assign({}, this._modal.options.DefaultConfirmOptions, pOptions);
          return new Promise(fResolve => {
            let tmpDialog = this._buildDialog(tmpOptions.title, pMessage, fResolve, tmpOptions);
            this._showDialog(tmpDialog, fResolve);
          });
        }

        /**
         * Show a two-step confirmation dialog.
         *
         * If confirmPhrase is provided, user must type it to enable the confirm button.
         * Otherwise, first click changes button text, second click confirms.
         *
         * @param {string} pMessage - The confirmation message
         * @param {object} [pOptions] - Options (title, confirmPhrase, phrasePrompt, confirmLabel, cancelLabel)
         * @returns {Promise<boolean>}
         */
        doubleConfirm(pMessage, pOptions) {
          let tmpOptions = Object.assign({}, this._modal.options.DefaultDoubleConfirmOptions, pOptions);
          return new Promise(fResolve => {
            let tmpDialog = this._buildDoubleConfirmDialog(tmpOptions.title, pMessage, fResolve, tmpOptions);
            this._showDialog(tmpDialog, fResolve);
          });
        }

        /**
         * Build a standard confirm dialog element.
         *
         * @param {string} pTitle
         * @param {string} pMessage
         * @param {function} fResolve - Promise resolver
         * @param {object} pOptions
         * @returns {HTMLElement}
         */
        _buildDialog(pTitle, pMessage, fResolve, pOptions) {
          let tmpId = this._modal._nextId();
          let tmpBtnStyle = pOptions.dangerous ? 'danger' : 'primary';
          let tmpDialog = document.createElement('div');
          tmpDialog.className = 'pict-modal-dialog';
          if (pOptions.unbounded) {
            tmpDialog.className += ' pict-modal-dialog--unbounded';
          }
          tmpDialog.id = 'pict-modal-' + tmpId;
          tmpDialog.setAttribute('role', 'dialog');
          tmpDialog.setAttribute('aria-modal', 'true');
          tmpDialog.style.width = '420px';
          tmpDialog.innerHTML = '<div class="pict-modal-dialog-header">' + '<span class="pict-modal-dialog-title">' + this._escapeHTML(pTitle) + '</span>' + '<button class="pict-modal-dialog-close" aria-label="Close">&times;</button>' + '</div>' + '<div class="pict-modal-dialog-body">' + '<p>' + this._escapeHTML(pMessage) + '</p>' + '</div>' + '<div class="pict-modal-dialog-footer">' + '<button class="pict-modal-btn" data-action="cancel">' + this._escapeHTML(pOptions.cancelLabel) + '</button>' + '<button class="pict-modal-btn pict-modal-btn--' + tmpBtnStyle + '" data-action="confirm">' + this._escapeHTML(pOptions.confirmLabel) + '</button>' + '</div>';
          let tmpCloseBtn = tmpDialog.querySelector('.pict-modal-dialog-close');
          let tmpCancelBtn = tmpDialog.querySelector('[data-action="cancel"]');
          let tmpConfirmBtn = tmpDialog.querySelector('[data-action="confirm"]');
          let tmpDismiss = pResult => {
            this._dismissDialog(tmpDialog, pResult, fResolve);
          };
          tmpCloseBtn.addEventListener('click', () => {
            tmpDismiss(false);
          });
          tmpCancelBtn.addEventListener('click', () => {
            tmpDismiss(false);
          });
          tmpConfirmBtn.addEventListener('click', () => {
            tmpDismiss(true);
          });
          tmpDialog._dismiss = tmpDismiss;
          tmpDialog._focusTarget = tmpCancelBtn;
          return tmpDialog;
        }

        /**
         * Build a double-confirm dialog element.
         *
         * @param {string} pTitle
         * @param {string} pMessage
         * @param {function} fResolve - Promise resolver
         * @param {object} pOptions
         * @returns {HTMLElement}
         */
        _buildDoubleConfirmDialog(pTitle, pMessage, fResolve, pOptions) {
          let tmpId = this._modal._nextId();
          let tmpHasPhrase = typeof pOptions.confirmPhrase === 'string' && pOptions.confirmPhrase.length > 0;
          let tmpDialog = document.createElement('div');
          tmpDialog.className = 'pict-modal-dialog';
          if (pOptions.unbounded) {
            tmpDialog.className += ' pict-modal-dialog--unbounded';
          }
          tmpDialog.id = 'pict-modal-' + tmpId;
          tmpDialog.setAttribute('role', 'dialog');
          tmpDialog.setAttribute('aria-modal', 'true');
          tmpDialog.style.width = '420px';
          let tmpBodyContent = '<p>' + this._escapeHTML(pMessage) + '</p>';
          if (tmpHasPhrase) {
            let tmpPromptText = pOptions.phrasePrompt.replace('{phrase}', pOptions.confirmPhrase);
            tmpBodyContent += '<div class="pict-modal-confirm-prompt">' + this._escapeHTML(tmpPromptText) + '</div>' + '<input type="text" class="pict-modal-confirm-input" autocomplete="off" spellcheck="false" />';
          }
          tmpDialog.innerHTML = '<div class="pict-modal-dialog-header">' + '<span class="pict-modal-dialog-title">' + this._escapeHTML(pTitle) + '</span>' + '<button class="pict-modal-dialog-close" aria-label="Close">&times;</button>' + '</div>' + '<div class="pict-modal-dialog-body">' + tmpBodyContent + '</div>' + '<div class="pict-modal-dialog-footer">' + '<button class="pict-modal-btn" data-action="cancel">' + this._escapeHTML(pOptions.cancelLabel) + '</button>' + '<button class="pict-modal-btn pict-modal-btn--danger" data-action="confirm" disabled>' + this._escapeHTML(pOptions.confirmLabel) + '</button>' + '</div>';
          let tmpCloseBtn = tmpDialog.querySelector('.pict-modal-dialog-close');
          let tmpCancelBtn = tmpDialog.querySelector('[data-action="cancel"]');
          let tmpConfirmBtn = tmpDialog.querySelector('[data-action="confirm"]');
          let tmpDismiss = pResult => {
            this._dismissDialog(tmpDialog, pResult, fResolve);
          };
          tmpCloseBtn.addEventListener('click', () => {
            tmpDismiss(false);
          });
          tmpCancelBtn.addEventListener('click', () => {
            tmpDismiss(false);
          });
          if (tmpHasPhrase) {
            // Phrase-based: enable confirm button when input matches
            let tmpInput = tmpDialog.querySelector('.pict-modal-confirm-input');
            tmpInput.addEventListener('input', () => {
              tmpConfirmBtn.disabled = tmpInput.value !== pOptions.confirmPhrase;
            });
            tmpConfirmBtn.addEventListener('click', () => {
              if (!tmpConfirmBtn.disabled) {
                tmpDismiss(true);
              }
            });
            tmpDialog._focusTarget = tmpInput;
          } else {
            // Two-click: first click changes label, second click confirms
            let tmpClickCount = 0;
            let tmpOriginalLabel = pOptions.confirmLabel;
            tmpConfirmBtn.disabled = false;
            tmpConfirmBtn.addEventListener('click', () => {
              tmpClickCount++;
              if (tmpClickCount === 1) {
                tmpConfirmBtn.textContent = 'Click again to confirm';
              } else {
                tmpDismiss(true);
              }
            });
            tmpDialog._focusTarget = tmpCancelBtn;
          }
          tmpDialog._dismiss = tmpDismiss;
          return tmpDialog;
        }

        /**
         * Show a dialog element: append to body, show overlay, animate in.
         *
         * @param {HTMLElement} pDialog
         * @param {function} fResolve - Promise resolver (for overlay click dismiss)
         */
        _showDialog(pDialog, fResolve) {
          let tmpModalEntry = {
            element: pDialog,
            dismiss: pDialog._dismiss,
            type: 'confirm'
          };

          // Show overlay
          let tmpOverlayClickHandler = null;
          if (this._modal.options.OverlayClickDismisses) {
            tmpOverlayClickHandler = () => {
              pDialog._dismiss(false);
            };
          }
          this._modal._overlay.show(tmpOverlayClickHandler);

          // Append to body
          document.body.appendChild(pDialog);

          // Track active modal
          this._modal._activeModals.push(tmpModalEntry);

          // Animate in
          void pDialog.offsetHeight;
          pDialog.classList.add('pict-modal-visible');

          // Focus
          if (pDialog._focusTarget) {
            pDialog._focusTarget.focus();
          }

          // Keyboard handler
          pDialog._keyHandler = pEvent => {
            if (pEvent.key === 'Escape') {
              pDialog._dismiss(false);
            }
          };
          document.addEventListener('keydown', pDialog._keyHandler);
        }

        /**
         * Dismiss a dialog: animate out, remove from DOM, hide overlay.
         *
         * @param {HTMLElement} pDialog
         * @param {*} pResult - Value to resolve the promise with
         * @param {function} fResolve - Promise resolver
         */
        _dismissDialog(pDialog, pResult, fResolve) {
          // Prevent double-dismiss
          if (pDialog._dismissed) {
            return;
          }
          pDialog._dismissed = true;

          // Remove keyboard handler
          if (pDialog._keyHandler) {
            document.removeEventListener('keydown', pDialog._keyHandler);
          }

          // Animate out
          pDialog.classList.remove('pict-modal-visible');

          // Remove from active modals
          this._modal._activeModals = this._modal._activeModals.filter(pEntry => {
            return pEntry.element !== pDialog;
          });

          // Update overlay click handler to point to new topmost modal
          if (this._modal._activeModals.length > 0) {
            let tmpTopModal = this._modal._activeModals[this._modal._activeModals.length - 1];
            this._modal._overlay.updateClickHandler(this._modal.options.OverlayClickDismisses ? tmpTopModal.dismiss : null);
          }

          // Hide overlay
          this._modal._overlay.hide();

          // Remove from DOM after transition
          setTimeout(() => {
            if (pDialog.parentNode) {
              pDialog.parentNode.removeChild(pDialog);
            }
          }, 220);

          // Resolve promise
          fResolve(pResult);
        }

        /**
         * Escape HTML special characters.
         *
         * @param {string} pText
         * @returns {string}
         */
        _escapeHTML(pText) {
          if (typeof pText !== 'string') {
            return '';
          }
          return pText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
      }
      module.exports = PictModalConfirm;
    }, {}],
    4: [function (require, module, exports) {
      /**
       * Pict-Modal-Dropdown
       *
       * Anchor-positioned menu that behaves like a dropdown / popover. Handy for:
       *   - nav menus that hang off a header link or button
       *   - "split button" style addenda (a primary action paired with a chevron
       *     that opens a list of related/alternate actions)
       *   - any "more options" affordance where a full modal would be heavy
       *
       * Differences from the modal Window helper:
       *   - No backdrop overlay — the rest of the page stays interactive.
       *   - Positioned next to the anchor element, not centered.
       *   - Auto-flips above when there isn't room below; clamps inside the viewport.
       *   - Click outside or Escape dismisses (matches native menu conventions).
       *
       * Usage:
       *     modal.dropdown(anchorEl, {
       *         items:
       *         [
       *             { Hash: 'edit',   Label: 'Edit'                    },
       *             { Hash: 'rename', Label: 'Rename...'                },
       *             { Separator: true                                   },
       *             { Hash: 'delete', Label: 'Delete', Style: 'danger'  },
       *             { Hash: 'archive',Label: 'Archive', Disabled: true,
       *               Tooltip: 'Already archived'                       }
       *         ],
       *         align: 'left'        // 'left' | 'right' (relative to anchor)
       *     }).then((pChoice) => { ... });
       *
       * Returns a Promise that resolves with `{ Hash, Item }` on selection or
       * `null` on dismiss.
       */
      class PictModalDropdown {
        constructor(pModal) {
          this._modal = pModal;
          this._activeMenu = null;
        }

        /**
         * Open a dropdown menu anchored to an element.
         *
         * @param {HTMLElement|string|object} pAnchor - Element, CSS selector, or
         *   a rect-like { left, top, width, height } anchor (handy for context menus).
         * @param {object} pOptions
         * @param {Array}    pOptions.items     - [{ Hash, Label, Style?, Disabled?, Tooltip?, Icon?, Separator? }]
         * @param {string}   [pOptions.align]   - 'left'|'right' (default 'left')
         * @param {string}   [pOptions.position]- 'auto'|'below'|'above' (default 'auto')
         * @param {string}   [pOptions.minWidth]- CSS minWidth (default: anchor width if known, else '160px')
         * @param {string}   [pOptions.maxHeight]- CSS maxHeight (default '60vh')
         * @param {string}   [pOptions.className]- extra class(es) for the menu element
         * @param {boolean}  [pOptions.closeOnSelect] - default true
         * @param {function} [pOptions.onSelect]- called with (Hash, Item) on selection
         * @param {function} [pOptions.onClose] - called after dismiss
         * @returns {Promise<{Hash: string, Item: object}|null>}
         */
        dropdown(pAnchor, pOptions) {
          let tmpOptions = Object.assign({
            align: 'left',
            position: 'auto',
            maxHeight: '60vh',
            closeOnSelect: true
          }, pOptions || {});
          let tmpAnchorEl = this._resolveAnchor(pAnchor);
          let tmpAnchorRect = this._anchorRect(pAnchor, tmpAnchorEl);
          if (!tmpAnchorRect) {
            return Promise.resolve(null);
          }

          // Re-opening the same menu is a no-op; closing-then-reopening is a
          // caller decision (just call dismissDropdown() first).
          if (this._activeMenu && this._activeMenu.anchor === tmpAnchorEl) {
            return this._activeMenu.promise;
          }

          // Only one dropdown at a time keeps focus / keyboard handling sane.
          this.dismissAll();
          let tmpItems = Array.isArray(tmpOptions.items) ? tmpOptions.items : [];
          let tmpResolveOuter;
          let tmpPromise = new Promise(fResolve => {
            tmpResolveOuter = fResolve;
          });
          let tmpMenu = this._buildMenu(tmpItems, tmpOptions);
          document.body.appendChild(tmpMenu);
          this._positionMenu(tmpMenu, tmpAnchorRect, tmpOptions);

          // Animate in on the next frame.
          void tmpMenu.offsetHeight;
          tmpMenu.classList.add('pict-modal-visible');
          let tmpDismiss = pResult => {
            if (tmpMenu._dismissed) {
              return;
            }
            tmpMenu._dismissed = true;
            document.removeEventListener('mousedown', tmpOutsideHandler, true);
            document.removeEventListener('keydown', tmpKeyHandler, true);
            window.removeEventListener('resize', tmpRepositionHandler);
            window.removeEventListener('scroll', tmpRepositionHandler, true);
            tmpMenu.classList.remove('pict-modal-visible');
            setTimeout(() => {
              if (tmpMenu.parentNode) {
                tmpMenu.parentNode.removeChild(tmpMenu);
              }
            }, 180);
            if (this._activeMenu && this._activeMenu.element === tmpMenu) {
              this._activeMenu = null;
            }
            if (typeof tmpOptions.onClose === 'function') {
              tmpOptions.onClose(pResult);
            }
            tmpResolveOuter(pResult);
          };

          // Wire item clicks (each item element carries a data-hash; separators
          // and disabled items are skipped).
          let tmpItemEls = tmpMenu.querySelectorAll('[data-pict-modal-dropdown-item]');
          for (let i = 0; i < tmpItemEls.length; i++) {
            let tmpEl = tmpItemEls[i];
            tmpEl.addEventListener('click', pEvent => {
              if (tmpEl.hasAttribute('data-disabled')) {
                return;
              }
              pEvent.stopPropagation();
              let tmpIdx = parseInt(tmpEl.getAttribute('data-index'), 10);
              let tmpItem = tmpItems[tmpIdx];
              let tmpHash = tmpEl.getAttribute('data-hash');
              if (typeof tmpOptions.onSelect === 'function') {
                tmpOptions.onSelect(tmpHash, tmpItem);
              }
              if (tmpOptions.closeOnSelect !== false) {
                tmpDismiss({
                  Hash: tmpHash,
                  Item: tmpItem
                });
              }
            });
          }

          // Click anywhere outside the menu (and outside the anchor) → dismiss.
          // Use mousedown/capture so we beat any per-element click handlers.
          let tmpOutsideHandler = pEvent => {
            if (tmpMenu.contains(pEvent.target)) {
              return;
            }
            if (tmpAnchorEl && tmpAnchorEl.contains && tmpAnchorEl.contains(pEvent.target)) {
              return;
            }
            tmpDismiss(null);
          };
          document.addEventListener('mousedown', tmpOutsideHandler, true);

          // Esc dismisses; arrow keys navigate items (skipping disabled/separator).
          let tmpKeyHandler = pEvent => {
            if (pEvent.key === 'Escape') {
              pEvent.stopPropagation();
              tmpDismiss(null);
              return;
            }
            if (pEvent.key === 'ArrowDown' || pEvent.key === 'ArrowUp') {
              pEvent.preventDefault();
              this._focusNeighbor(tmpMenu, pEvent.key === 'ArrowDown' ? 1 : -1);
            } else if (pEvent.key === 'Enter' || pEvent.key === ' ') {
              let tmpFocused = document.activeElement;
              if (tmpFocused && tmpMenu.contains(tmpFocused) && tmpFocused.hasAttribute('data-pict-modal-dropdown-item')) {
                pEvent.preventDefault();
                tmpFocused.click();
              }
            }
          };
          document.addEventListener('keydown', tmpKeyHandler, true);

          // Reposition on viewport resize / scroll so the menu doesn't drift
          // off the anchor.
          let tmpRepositionHandler = () => {
            let tmpRect = this._anchorRect(pAnchor, tmpAnchorEl);
            if (tmpRect) {
              this._positionMenu(tmpMenu, tmpRect, tmpOptions);
            }
          };
          window.addEventListener('resize', tmpRepositionHandler);
          window.addEventListener('scroll', tmpRepositionHandler, true);

          // Move keyboard focus to the first enabled item so arrows / Enter work
          // without an extra click.
          setTimeout(() => {
            this._focusFirstEnabled(tmpMenu);
          }, 0);
          this._activeMenu = {
            element: tmpMenu,
            anchor: tmpAnchorEl,
            promise: tmpPromise,
            dismiss: tmpDismiss
          };
          return tmpPromise;
        }

        /**
         * Dismiss the currently-open dropdown (if any).
         */
        dismissAll() {
          if (this._activeMenu) {
            let tmpDismiss = this._activeMenu.dismiss;
            this._activeMenu = null;
            tmpDismiss(null);
          }
        }

        // ─────────────────────────────────────────────
        //  Internals
        // ─────────────────────────────────────────────

        _resolveAnchor(pAnchor) {
          if (!pAnchor) {
            return null;
          }
          if (typeof pAnchor === 'string') {
            return document.querySelector(pAnchor);
          }
          if (pAnchor.nodeType === 1) {
            return pAnchor;
          }
          // rect-like — no element to attach focus / outside-click ignore to,
          // but that's fine, the caller knows what they're doing.
          return null;
        }
        _anchorRect(pAnchor, pAnchorEl) {
          if (pAnchorEl && typeof pAnchorEl.getBoundingClientRect === 'function') {
            return pAnchorEl.getBoundingClientRect();
          }
          if (pAnchor && typeof pAnchor === 'object' && typeof pAnchor.left === 'number' && typeof pAnchor.top === 'number') {
            return {
              left: pAnchor.left,
              top: pAnchor.top,
              width: pAnchor.width || 0,
              height: pAnchor.height || 0,
              right: pAnchor.left + (pAnchor.width || 0),
              bottom: pAnchor.top + (pAnchor.height || 0)
            };
          }
          return null;
        }
        _buildMenu(pItems, pOptions) {
          let tmpId = this._modal._nextId();
          let tmpMenu = document.createElement('div');
          tmpMenu.className = 'pict-modal-dropdown';
          if (pOptions.className) {
            tmpMenu.className += ' ' + pOptions.className;
          }
          tmpMenu.id = 'pict-modal-dropdown-' + tmpId;
          tmpMenu.setAttribute('role', 'menu');
          tmpMenu.style.maxHeight = pOptions.maxHeight;
          let tmpHtml = '';
          for (let i = 0; i < pItems.length; i++) {
            let tmpItem = pItems[i];
            if (tmpItem.Separator) {
              tmpHtml += '<div class="pict-modal-dropdown-separator" role="separator"></div>';
              continue;
            }
            if (tmpItem.Header) {
              tmpHtml += '<div class="pict-modal-dropdown-header">' + this._escapeHTML(tmpItem.Header) + '</div>';
              continue;
            }
            let tmpCls = 'pict-modal-dropdown-item';
            if (tmpItem.Style) {
              tmpCls += ' pict-modal-dropdown-item--' + tmpItem.Style;
            }
            if (tmpItem.Disabled) {
              tmpCls += ' pict-modal-dropdown-item--disabled';
            }
            let tmpAttrs = '' + ' data-pict-modal-dropdown-item' + ' data-index="' + i + '"' + ' data-hash="' + this._escapeHTML(tmpItem.Hash || '') + '"' + ' role="menuitem"' + ' tabindex="-1"';
            if (tmpItem.Disabled) {
              tmpAttrs += ' aria-disabled="true" data-disabled';
            }
            if (tmpItem.Tooltip) {
              tmpAttrs += ' title="' + this._escapeHTML(tmpItem.Tooltip) + '"';
            }
            let tmpIcon = tmpItem.Icon ? '<span class="pict-modal-dropdown-item-icon">' + tmpItem.Icon + '</span>' : '';
            let tmpHint = tmpItem.Hint ? '<span class="pict-modal-dropdown-item-hint">' + this._escapeHTML(tmpItem.Hint) + '</span>' : '';
            tmpHtml += '<div class="' + tmpCls + '"' + tmpAttrs + '>' + tmpIcon + '<span class="pict-modal-dropdown-item-label">' + this._escapeHTML(tmpItem.Label || '') + '</span>' + tmpHint + '</div>';
          }
          tmpMenu.innerHTML = tmpHtml;
          return tmpMenu;
        }
        _positionMenu(pMenu, pAnchorRect, pOptions) {
          // Apply min-width before measuring so the menu's natural size accounts
          // for the constraint.
          let tmpMinWidth = pOptions.minWidth || (pAnchorRect.width >= 80 ? Math.ceil(pAnchorRect.width) + 'px' : '160px');
          pMenu.style.minWidth = tmpMinWidth;

          // Measure after attaching.
          let tmpMenuRect = pMenu.getBoundingClientRect();
          let tmpVw = window.innerWidth || document.documentElement.clientWidth;
          let tmpVh = window.innerHeight || document.documentElement.clientHeight;
          let tmpGap = 4; // breathing room between anchor and menu

          // Vertical: prefer below; flip above when not enough room and there's
          // more above. 'below'/'above' overrides force the side.
          let tmpRoomBelow = tmpVh - pAnchorRect.bottom - tmpGap;
          let tmpRoomAbove = pAnchorRect.top - tmpGap;
          let tmpPlaceAbove;
          if (pOptions.position === 'above') {
            tmpPlaceAbove = true;
          } else if (pOptions.position === 'below') {
            tmpPlaceAbove = false;
          } else {
            tmpPlaceAbove = tmpMenuRect.height > tmpRoomBelow && tmpRoomAbove > tmpRoomBelow;
          }

          // Cap height to whichever side we landed on so the menu can scroll
          // internally instead of running off the screen.
          let tmpCap = Math.max(80, (tmpPlaceAbove ? tmpRoomAbove : tmpRoomBelow) - 8);
          pMenu.style.maxHeight = tmpCap + 'px';

          // Horizontal alignment to the anchor, then clamp inside the viewport.
          let tmpLeft;
          if (pOptions.align === 'right') {
            tmpLeft = pAnchorRect.right - tmpMenuRect.width;
          } else if (pOptions.align === 'center') {
            tmpLeft = pAnchorRect.left + (pAnchorRect.width - tmpMenuRect.width) / 2;
          } else {
            tmpLeft = pAnchorRect.left;
          }
          tmpLeft = Math.min(tmpLeft, tmpVw - tmpMenuRect.width - 4);
          tmpLeft = Math.max(4, tmpLeft);
          let tmpTop;
          if (tmpPlaceAbove) {
            tmpTop = Math.max(4, pAnchorRect.top - tmpMenuRect.height - tmpGap);
            pMenu.classList.add('pict-modal-dropdown--above');
          } else {
            tmpTop = pAnchorRect.bottom + tmpGap;
            pMenu.classList.remove('pict-modal-dropdown--above');
          }
          pMenu.style.left = Math.round(tmpLeft) + 'px';
          pMenu.style.top = Math.round(tmpTop) + 'px';
        }
        _focusFirstEnabled(pMenu) {
          let tmpItems = pMenu.querySelectorAll('[data-pict-modal-dropdown-item]:not([data-disabled])');
          if (tmpItems.length) {
            tmpItems[0].focus();
          }
        }
        _focusNeighbor(pMenu, pDirection) {
          let tmpItems = Array.prototype.slice.call(pMenu.querySelectorAll('[data-pict-modal-dropdown-item]:not([data-disabled])'));
          if (!tmpItems.length) {
            return;
          }
          let tmpActive = document.activeElement;
          let tmpIdx = tmpItems.indexOf(tmpActive);
          let tmpNext = tmpIdx === -1 ? pDirection > 0 ? 0 : tmpItems.length - 1 : (tmpIdx + pDirection + tmpItems.length) % tmpItems.length;
          tmpItems[tmpNext].focus();
        }
        _escapeHTML(pText) {
          if (typeof pText !== 'string') {
            return '';
          }
          return pText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
      }
      module.exports = PictModalDropdown;
    }, {}],
    5: [function (require, module, exports) {
      /**
       * Pict-Modal-Overlay
       *
       * Manages a shared backdrop overlay element appended to document.body.
       * Reference-counted — created on first modal open, removed when last closes.
       */
      class PictModalOverlay {
        constructor(pModal) {
          this._modal = pModal;
          this._element = null;
          this._refCount = 0;
        }

        /**
         * Show the overlay (incrementing reference count).
         * Creates the DOM element on first call.
         *
         * @param {function} [fOnClick] - Optional click handler (e.g. dismiss topmost modal)
         */
        show(fOnClick) {
          this._refCount++;
          if (!this._element) {
            this._element = document.createElement('div');
            this._element.className = 'pict-modal-overlay';
            document.body.appendChild(this._element);

            // Force reflow so the transition animates
            void this._element.offsetHeight;
            this._element.classList.add('pict-modal-visible');
          }
          if (fOnClick) {
            // Store the latest click handler (for the topmost modal)
            this._currentClickHandler = fOnClick;
            this._element.onclick = pEvent => {
              if (pEvent.target === this._element && this._currentClickHandler) {
                this._currentClickHandler();
              }
            };
          }
        }

        /**
         * Update the overlay click handler (e.g. when topmost modal changes).
         *
         * @param {function} [fOnClick] - New click handler
         */
        updateClickHandler(fOnClick) {
          this._currentClickHandler = fOnClick || null;
        }

        /**
         * Hide the overlay (decrementing reference count).
         * Removes the DOM element when reference count reaches zero.
         */
        hide() {
          this._refCount--;
          if (this._refCount <= 0) {
            this._refCount = 0;
            if (this._element) {
              this._element.classList.remove('pict-modal-visible');
              let tmpElement = this._element;
              // Remove after transition
              setTimeout(() => {
                if (tmpElement.parentNode) {
                  tmpElement.parentNode.removeChild(tmpElement);
                }
              }, 220);
              this._element = null;
              this._currentClickHandler = null;
            }
          }
        }

        /**
         * Force-remove the overlay regardless of reference count.
         */
        destroy() {
          this._refCount = 0;
          if (this._element && this._element.parentNode) {
            this._element.parentNode.removeChild(this._element);
          }
          this._element = null;
          this._currentClickHandler = null;
        }
      }
      module.exports = PictModalOverlay;
    }, {}],
    6: [function (require, module, exports) {
      /**
       * Pict-Modal-Panel
       *
       * Adds resizable and collapsible panel behavior to any DOM element.
       * Follows the handler composition pattern used by the other modal
       * handlers (confirm, window, toast, tooltip).
       *
       * Usage:
       *   let handle = modal.panel('#my-panel', { position: 'right', width: 340 });
       *   handle.toggle();
       *   handle.destroy();
       */
      class PictModalPanel {
        constructor(pModal) {
          this._modal = pModal;
          this._panels = [];
        }

        /**
         * Attach resizable/collapsible panel behavior to an element.
         *
         * @param {string} pTargetSelector - CSS selector for the panel element
         * @param {object} [pOptions] - Panel options
         * @returns {{ collapse, expand, toggle, setWidth, destroy }} Panel handle
         */
        create(pTargetSelector, pOptions) {
          let tmpDefaults = this._modal && this._modal.options && this._modal.options.DefaultPanelOptions || {};
          let tmpOptions = Object.assign({}, {
            position: 'right',
            width: 340,
            minWidth: 200,
            maxWidth: 600,
            collapsible: true,
            collapsed: false,
            persist: false,
            persistKey: '',
            onResize: null,
            onToggle: null
          }, tmpDefaults, pOptions);
          if (typeof document === 'undefined') return this._nullHandle();
          let tmpTarget = document.querySelector(pTargetSelector);
          if (!tmpTarget) return this._nullHandle();
          let tmpId = this._modal._nextId();
          let tmpIsRight = tmpOptions.position === 'right';
          let tmpIsCollapsed = false;
          let tmpCurrentWidth = tmpOptions.width;
          let tmpDestroyed = false;

          // Restore persisted state
          if (tmpOptions.persist && tmpOptions.persistKey) {
            try {
              let tmpStored = localStorage.getItem('pict-panel-' + tmpOptions.persistKey);
              if (tmpStored) {
                let tmpParsed = JSON.parse(tmpStored);
                if (typeof tmpParsed.width === 'number') tmpCurrentWidth = tmpParsed.width;
                if (typeof tmpParsed.collapsed === 'boolean') tmpOptions.collapsed = tmpParsed.collapsed;
              }
            } catch (e) {/* ignore */}
          }

          // Apply classes and initial width
          tmpTarget.classList.add('pict-panel');
          tmpTarget.classList.add(tmpIsRight ? 'pict-panel-right' : 'pict-panel-left');
          tmpTarget.style.width = tmpCurrentWidth + 'px';

          // Remove display:none if present — panel uses width collapse instead
          if (tmpTarget.style.display === 'none') {
            tmpTarget.style.display = '';
          }

          // ── Create the edge container ───────────────────────
          let tmpEdge = document.createElement('div');
          tmpEdge.className = 'pict-panel-edge ' + (tmpIsRight ? 'pict-panel-edge-right' : 'pict-panel-edge-left');

          // Resize handle
          let tmpResize = document.createElement('div');
          tmpResize.className = 'pict-panel-resize';
          tmpEdge.appendChild(tmpResize);

          // Collapse tab (chevron SVG)
          let tmpTab = null;
          if (tmpOptions.collapsible) {
            tmpTab = document.createElement('div');
            tmpTab.className = 'pict-panel-tab';
            tmpTab.title = 'Toggle panel';
            tmpEdge.appendChild(tmpTab);
          }

          // Insert edge as a sibling so it is not clipped by the
          // panel's own overflow (e.g. overflow-y: auto for scrolling).
          // Right panels: edge goes BEFORE the panel (left side).
          // Left panels: edge goes AFTER the panel (right side).
          if (tmpTarget.parentNode) {
            if (tmpIsRight) {
              tmpTarget.parentNode.insertBefore(tmpEdge, tmpTarget);
            } else {
              tmpTarget.parentNode.insertBefore(tmpEdge, tmpTarget.nextSibling);
            }
          } else {
            tmpTarget.insertBefore(tmpEdge, tmpTarget.firstChild);
          }

          // ── Chevron lookup via pict.providers.Icon ──────────
          // Both directions come from the core registry (`{~I:ChevronLeft~}`
          // / `{~I:ChevronRight~}`).  Resolved per-render so a theme that
          // re-registers the chevron variant picks up automatically.  Empty
          // fallback in the unlikely case pict is missing the Icon provider
          // (very old pict versions; current minimum is 1.0.368).
          let tmpPictHandle = typeof window !== 'undefined' && window.pict ? window.pict : null;
          let tmpIcon = pName => tmpPictHandle && typeof tmpPictHandle.icon === 'function' ? tmpPictHandle.icon(pName) : '';
          let tmpUpdateChevron = () => {
            if (!tmpTab) return;
            let tmpChevronRight = tmpIcon('ChevronRight');
            let tmpChevronLeft = tmpIcon('ChevronLeft');
            if (tmpIsRight) {
              tmpTab.innerHTML = tmpIsCollapsed ? tmpChevronLeft : tmpChevronRight;
            } else {
              tmpTab.innerHTML = tmpIsCollapsed ? tmpChevronRight : tmpChevronLeft;
            }
          };

          // ── Persist helper ──────────────────────────────────
          let tmpPersist = () => {
            if (!tmpOptions.persist || !tmpOptions.persistKey) return;
            try {
              localStorage.setItem('pict-panel-' + tmpOptions.persistKey, JSON.stringify({
                width: tmpCurrentWidth,
                collapsed: tmpIsCollapsed
              }));
            } catch (e) {/* ignore */}
          };

          // ── Collapse / expand ───────────────────────────────
          let tmpCollapse = () => {
            if (tmpIsCollapsed || tmpDestroyed) return;
            tmpIsCollapsed = true;
            tmpTarget.classList.add('pict-panel-collapsed');
            tmpEdge.classList.add('pict-panel-edge-collapsed');
            tmpUpdateChevron();
            tmpPersist();
            if (typeof tmpOptions.onToggle === 'function') tmpOptions.onToggle(true);
          };
          let tmpExpand = () => {
            if (!tmpIsCollapsed || tmpDestroyed) return;
            tmpIsCollapsed = false;
            tmpEdge.classList.remove('pict-panel-edge-collapsed');
            tmpTarget.classList.remove('pict-panel-collapsed');
            tmpTarget.style.width = tmpCurrentWidth + 'px';
            tmpUpdateChevron();
            tmpPersist();
            if (typeof tmpOptions.onToggle === 'function') tmpOptions.onToggle(false);
          };
          let tmpToggle = () => {
            if (tmpIsCollapsed) tmpExpand();else tmpCollapse();
          };
          let tmpSetWidth = pWidth => {
            if (tmpDestroyed) return;
            let tmpWidth = Math.max(tmpOptions.minWidth, Math.min(tmpOptions.maxWidth, pWidth));
            tmpCurrentWidth = tmpWidth;
            if (!tmpIsCollapsed) {
              tmpTarget.style.width = tmpWidth + 'px';
            }
            tmpPersist();
            if (typeof tmpOptions.onResize === 'function') tmpOptions.onResize(tmpWidth);
          };

          // ── Tab click ───────────────────────────────────────
          if (tmpTab) {
            tmpTab.addEventListener('click', pEvent => {
              pEvent.stopPropagation();
              tmpToggle();
            });
          }

          // ── Resize drag ─────────────────────────────────────
          let tmpOnMouseDown = pEvent => {
            if (tmpIsCollapsed) return;
            pEvent.preventDefault();
            let tmpStartX = pEvent.clientX;
            let tmpStartWidth = tmpTarget.offsetWidth;
            tmpResize.classList.add('dragging');
            tmpTarget.style.transition = 'none';
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
            let tmpOnMouseMove = pMoveEvent => {
              let tmpDelta = tmpIsRight ? tmpStartX - pMoveEvent.clientX : pMoveEvent.clientX - tmpStartX;
              let tmpNewWidth = Math.max(tmpOptions.minWidth, Math.min(tmpOptions.maxWidth, tmpStartWidth + tmpDelta));
              tmpTarget.style.width = tmpNewWidth + 'px';
            };
            let tmpOnMouseUp = pUpEvent => {
              document.removeEventListener('mousemove', tmpOnMouseMove);
              document.removeEventListener('mouseup', tmpOnMouseUp);
              tmpResize.classList.remove('dragging');
              tmpTarget.style.transition = '';
              document.body.style.userSelect = '';
              document.body.style.cursor = '';

              // Capture the final width
              tmpCurrentWidth = tmpTarget.offsetWidth;
              tmpPersist();
              if (typeof tmpOptions.onResize === 'function') tmpOptions.onResize(tmpCurrentWidth);
            };
            document.addEventListener('mousemove', tmpOnMouseMove);
            document.addEventListener('mouseup', tmpOnMouseUp);
          };
          tmpResize.addEventListener('mousedown', tmpOnMouseDown);

          // ── Initial state ───────────────────────────────────
          tmpUpdateChevron();
          if (tmpOptions.collapsed) {
            tmpIsCollapsed = true;
            tmpTarget.classList.add('pict-panel-collapsed');
            tmpEdge.classList.add('pict-panel-edge-collapsed');
            tmpUpdateChevron();
          }

          // ── Destroy ─────────────────────────────────────────
          let tmpDestroy = () => {
            if (tmpDestroyed) return;
            tmpDestroyed = true;
            tmpResize.removeEventListener('mousedown', tmpOnMouseDown);
            if (tmpEdge.parentNode) tmpEdge.remove();
            tmpTarget.classList.remove('pict-panel', 'pict-panel-right', 'pict-panel-left', 'pict-panel-collapsed');
            tmpTarget.style.width = '';
            tmpTarget.style.transition = '';
            let tmpIdx = this._panels.indexOf(tmpHandle);
            if (tmpIdx >= 0) this._panels.splice(tmpIdx, 1);
          };

          // ── Return handle ───────────────────────────────────
          let tmpHandle = {
            id: tmpId,
            collapse: tmpCollapse,
            expand: tmpExpand,
            toggle: tmpToggle,
            setWidth: tmpSetWidth,
            destroy: tmpDestroy
          };
          this._panels.push(tmpHandle);
          return tmpHandle;
        }

        /**
         * Return a no-op handle for server-side or missing-element cases.
         */
        _nullHandle() {
          return {
            id: 0,
            collapse: () => {},
            expand: () => {},
            toggle: () => {},
            setWidth: () => {},
            destroy: () => {}
          };
        }

        /**
         * Destroy all active panels.
         */
        destroyAll() {
          let tmpPanels = this._panels.slice();
          for (let i = 0; i < tmpPanels.length; i++) {
            tmpPanels[i].destroy();
          }
        }
      }
      module.exports = PictModalPanel;
    }, {}],
    7: [function (require, module, exports) {
      /**
       * Pict-Modal-Shell — viewport-managing layout system for top / right /
       * bottom / left panels around a center.
       *
       * # What this is for
       *
       * Most apps grow a chrome of stacked bars: a topbar, sometimes a
       * sub-nav, sometimes a bottom status bar, often a left sidebar, maybe
       * a right inspector. Each one has its own collapse / resize / persist
       * concerns, and apps end up reinventing the layout glue + the chrome
       * controls per-app.
       *
       * The Shell solves this once. The host calls `modal.shell(viewport)`,
       * adds panels in the order they should stack from each edge, and the
       * Shell manages:
       *
       *   - DOM structure (a flex tree wrapping the viewport)
       *   - Layout placement (multiple panels per side, each in registration order)
       *   - Collapse / expand chrome (a thin tab strip when collapsed)
       *   - Resize chrome (drag handle on the inner edge)
       *   - Pinned (in-flow) vs overlay (absolutely-positioned) panels
       *   - Persistence (per-panel collapsed + size, scoped by host or custom key)
       *   - Center destination (the workspace area between all panels)
       *
       * # Usage
       *
       *   let tmpShell = modal.shell('#App-Container', { PersistenceKey: 'my-app' });
       *
       *   tmpShell.addPanel({
       *       Hash: 'topbar', Side: 'top', Mode: 'fixed', Size: 60,
       *       ContentDestinationId: 'App-TopBar'
       *   });
       *   tmpShell.addPanel({
       *       Hash: 'statusbar', Side: 'bottom', Mode: 'fixed', Size: 28,
       *       ContentDestinationId: 'App-StatusBar'
       *   });
       *   tmpShell.addPanel({
       *       Hash: 'sidebar', Side: 'left', Mode: 'resizable', Size: 280,
       *       MinSize: 180, MaxSize: 480, Title: 'Modules',
       *       ContentDestinationId: 'App-Sidebar'
       *   });
       *
       *   let tmpCenter = tmpShell.center({ ContentDestinationId: 'App-Workspace' });
       *
       *   // Render into the destinations the same way as any other Pict view.
       *   pict.ContentAssignment.assignContent('#App-Sidebar', tmpHTML);
       *
       * # Panel options
       *
       *   Hash:                 unique id within the shell (auto-generated if omitted).
       *                         Used as the localStorage key suffix and for getPanel().
       *   Side:                 'top' | 'right' | 'bottom' | 'left'.
       *   Mode:                 'fixed' (no chrome), 'collapsible' (collapse tab),
       *                         'resizable' (collapse tab + drag handle).
       *   Position:             'pinned' (default; takes layout space) or 'overlay'
       *                         (absolutely positioned over the center / siblings).
       *   Scope:                'shell' (default) | 'center'.
       *                         When 'shell', the panel mounts in one of the
       *                         outer rows / side stacks (Side decides which).
       *                         When 'center', the panel mounts INSIDE the
       *                         center column instead — useful for bars that
       *                         should align with the content area only, not
       *                         span across the sidebars.  Only Side='top' and
       *                         Side='bottom' are supported with Scope='center'.
       *                         The center auto-switches to a flex-column
       *                         layout so the content destination + inner
       *                         panels stack vertically.
       *   Size:                 initial px (height for top/bottom, width for left/right).
       *                         Default: 200 for sides, 60 for top/bottom.
       *   MinSize, MaxSize:     drag clamp for resizable panels.
       *   Collapsed:            initial state. Persisted state overrides this.
       *   CollapsedSize:        px the panel becomes when collapsed (default 24).
       *   Title:                shown in the collapse tab.
       *   Icon:                 optional inline SVG / HTML for the collapse tab.
       *   ContentDestinationId: id given to the inner content div so the host can
       *                         reach it via #ContentDestinationId selectors.
       *   ContentView:          ViewIdentifier (string) of a registered Pict view
       *                         that owns this panel's content. When set, the
       *                         shell auto-renders the view once at panel creation
       *                         (so the destination is filled before the user
       *                         opens the panel) AND again on every expand
       *                         transition (so freshly-streamed state shows up).
       *                         Centralises the "I created a panel — now I have
       *                         to remember to render the view into it" boilerplate.
       *   Persist:              default true; pass false to skip save/load for this
       *                         panel even when the shell has persistence enabled.
       *   Hidden:               default false. When true, the collapsed state has
       *                         NO visible chrome — no collapse tab, no edge
       *                         affordance, the panel root is display: none. The
       *                         only way to reveal it is a programmatic
       *                         expand()/toggle() from elsewhere (e.g. a topbar
       *                         gear). Mode still controls the EXPANDED chrome —
       *                         pass Mode: 'resizable' to keep the drag handle
       *                         while open, then vanish on collapse.
       *   OnExpand, OnCollapse: callbacks that fire ONLY on transitions
       *                         (collapsed→expanded or expanded→collapsed).
       *                         Cleaner than OnToggle which fires for both
       *                         directions and forces callers to inspect the
       *                         bool. OnToggle is kept for back-compat.
       *
       * # Persistence
       *
       *   Storage key:  'pict-modal-shell:' + <PersistenceKey or hostname or 'default'>
       *   Value shape:  { Version: 1, Panels: { <hash>: { Collapsed: bool, Size: number } } }
       */

      const STORAGE_PREFIX = 'pict-modal-shell:';
      const SCHEMA_VERSION = 1;
      const DEFAULT_COLLAPSED_SIZE = 24;
      const DEFAULT_SIZE_SIDE = 240;
      const DEFAULT_SIZE_TOPBOTTOM = 60;
      class PictModalShell {
        constructor(pModalSection, pViewportEl, pOptions) {
          // Pointer events fire at the device's input rate (often 240 Hz+ on
          // modern trackpads / mice) but we only paint at the display's refresh
          // rate (60–120 Hz). Coalesce multiple pointermoves per frame into a
          // single setSize() call via requestAnimationFrame — this drops the
          // per-frame work to one DOM mutation regardless of pointer rate.
          _defineProperty(this, "_onDragMove", pEvent => {
            if (!this._activeDrag) return;
            let tmpD = this._activeDrag;
            let tmpCoord = tmpD.Axis === 'x' ? pEvent.clientX : pEvent.clientY;
            let tmpDelta = (tmpCoord - tmpD.StartCoord) * tmpD.Direction;
            tmpD.PendingSize = tmpD.StartSize + tmpDelta;
            if (!tmpD.RAFId) {
              let tmpSelf = this;
              tmpD.RAFId = typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame(function () {
                tmpSelf._flushDrag();
              }) : setTimeout(function () {
                tmpSelf._flushDrag();
              }, 16);
            }
          });
          _defineProperty(this, "_onDragEnd", () => {
            if (!this._activeDrag) return;
            let tmpD = this._activeDrag;
            // Flush any pending pointermove that hadn't painted yet so the
            // final size matches the actual cursor position, not the last
            // rAF-aligned value.
            if (tmpD.PendingSize !== null) {
              this._flushDrag();
            }
            if (tmpD.RAFId && typeof window !== 'undefined' && window.cancelAnimationFrame) {
              window.cancelAnimationFrame(tmpD.RAFId);
            }
            document.body.classList.remove('pict-modal-shell-dragging-x');
            document.body.classList.remove('pict-modal-shell-dragging-y');
            tmpD.Panel.El.classList.remove('pict-modal-shell-panel-resizing');
            document.removeEventListener('pointermove', this._onDragMove);
            document.removeEventListener('pointerup', this._onDragEnd);
            // Persist final size.
            tmpD.Panel._persist();
            this._activeDrag = null;
          });
          this._modal = pModalSection;
          this._viewport = pViewportEl;
          this._options = pOptions || {};
          this._panels = [];
          this._panelsByHash = {};
          this._centerDestinationEl = null;
          this._idCounter = 0;
          this._activeDrag = null;
          this._persistenceEnabled = this._options.Persistence !== false;
          this._persistenceKey = this._persistenceEnabled ? this._resolvePersistenceKey(this._options.PersistenceKey) : null;

          // Build the wrapper DOM inside the viewport.
          this._buildSkeleton();
        }

        // ────────────────────────────────────────────────────────────────
        //  Public API
        // ────────────────────────────────────────────────────────────────

        addPanel(pConfig) {
          let tmpPanel = new ShellPanel(this, pConfig || {});
          this._panels.push(tmpPanel);
          this._panelsByHash[tmpPanel.Hash] = tmpPanel;
          this._mountPanel(tmpPanel);
          // Render the bound ContentView once now so the destination has
          // content even before the user opens the panel. This is the
          // "create" half of the unified create-and-popup pattern — hosts
          // no longer need to chase down each panel and call view.render()
          // manually after addPanel().
          tmpPanel._renderContentView();
          return tmpPanel;
        }
        getPanel(pHash) {
          return this._panelsByHash[pHash] || null;
        }
        getPanels() {
          return this._panels.slice();
        }

        /**
         * Convenience for cross-view popup triggers. Equivalent to
         * `shell.getPanel(hash).popup()`. Silently no-ops when the hash
         * doesn't match a registered panel (so callers don't have to
         * null-check during boot races).
         */
        openPanel(pHash) {
          let tmpPanel = this._panelsByHash[pHash];
          if (tmpPanel) {
            tmpPanel.popup();
          }
          return tmpPanel || null;
        }

        /**
         * Configure the center area. Optional; if never called, the center
         * still exists but has no host-supplied destination id (host can
         * still reach it via .pict-modal-shell-center).
         */
        center(pOptions) {
          pOptions = pOptions || {};
          if (pOptions.ContentDestinationId) {
            // Remove any previously-created destination so center() is
            // idempotent across reconfigurations.  We don't blow away
            // the whole center via innerHTML='' anymore: Scope:'center'
            // panels mounted by earlier addPanel() calls need to stay
            // in place.  Find the right insertion point so the
            // destination sits between any top-scoped panels and any
            // bottom-scoped panels.
            if (this._centerDestinationEl && this._centerDestinationEl.parentNode === this._centerEl) {
              this._centerEl.removeChild(this._centerDestinationEl);
            }
            let tmpInner = document.createElement('div');
            tmpInner.id = pOptions.ContentDestinationId;
            tmpInner.className = 'pict-modal-shell-center-content';
            let tmpFirstBottomScoped = null;
            let tmpChildren = this._centerEl.children;
            for (let i = 0; i < tmpChildren.length; i++) {
              let tmpCandidate = tmpChildren[i];
              if (tmpCandidate.classList && tmpCandidate.classList.contains('pict-modal-shell-panel-bottom')) {
                tmpFirstBottomScoped = tmpCandidate;
                break;
              }
            }
            if (tmpFirstBottomScoped) {
              this._centerEl.insertBefore(tmpInner, tmpFirstBottomScoped);
            } else {
              this._centerEl.appendChild(tmpInner);
            }
            this._centerDestinationEl = tmpInner;
          }
          return this._centerEl;
        }
        getCenterEl() {
          return this._centerEl;
        }
        destroy() {
          for (let i = 0; i < this._panels.length; i++) {
            this._panels[i].destroy(true);
          }
          this._panels = [];
          this._panelsByHash = {};
          if (this._wrapperEl && this._wrapperEl.parentNode) {
            this._wrapperEl.parentNode.removeChild(this._wrapperEl);
          }
          this._detachDragHandlers();
        }

        // ────────────────────────────────────────────────────────────────
        //  Persistence
        // ────────────────────────────────────────────────────────────────

        _resolvePersistenceKey(pUserKey) {
          if (typeof pUserKey === 'string' && pUserKey.length > 0) return STORAGE_PREFIX + pUserKey;
          try {
            if (typeof window !== 'undefined' && window.location && window.location.hostname) {
              return STORAGE_PREFIX + window.location.hostname;
            }
          } catch (pErr) {/* fall through */}
          return STORAGE_PREFIX + 'default';
        }
        _loadState() {
          if (!this._persistenceKey) return null;
          try {
            let tmpStore = typeof window !== 'undefined' ? window.localStorage : null;
            if (!tmpStore) return null;
            let tmpRaw = tmpStore.getItem(this._persistenceKey);
            if (!tmpRaw) return null;
            let tmpParsed = JSON.parse(tmpRaw);
            if (!tmpParsed || tmpParsed.Version !== SCHEMA_VERSION) return null;
            return tmpParsed.Panels && typeof tmpParsed.Panels === 'object' ? tmpParsed.Panels : {};
          } catch (pErr) {
            return null;
          }
        }
        _loadPanelState(pHash) {
          let tmpAll = this._loadState();
          if (!tmpAll) return null;
          return tmpAll[pHash] || null;
        }
        _savePanelState(pHash, pState) {
          if (!this._persistenceKey) return;
          try {
            let tmpStore = typeof window !== 'undefined' ? window.localStorage : null;
            if (!tmpStore) return;
            let tmpAll = this._loadState() || {};
            tmpAll[pHash] = pState;
            tmpStore.setItem(this._persistenceKey, JSON.stringify({
              Version: SCHEMA_VERSION,
              Panels: tmpAll,
              SavedAt: new Date().toISOString()
            }));
          } catch (pErr) {/* swallow */}
        }

        // ────────────────────────────────────────────────────────────────
        //  DOM scaffolding
        // ────────────────────────────────────────────────────────────────

        _buildSkeleton() {
          // Wipe whatever was inside the viewport — the host opted into
          // the shell taking ownership of layout.
          this._viewport.innerHTML = '';
          this._viewport.classList.add('pict-modal-shell-host');
          this._wrapperEl = document.createElement('div');
          this._wrapperEl.className = 'pict-modal-shell';
          this._topRow = document.createElement('div');
          this._topRow.className = 'pict-modal-shell-row pict-modal-shell-row-top';
          this._wrapperEl.appendChild(this._topRow);
          this._middleRow = document.createElement('div');
          this._middleRow.className = 'pict-modal-shell-row pict-modal-shell-row-middle';
          this._wrapperEl.appendChild(this._middleRow);
          this._leftStack = document.createElement('div');
          this._leftStack.className = 'pict-modal-shell-side pict-modal-shell-side-left';
          this._middleRow.appendChild(this._leftStack);
          this._centerEl = document.createElement('div');
          this._centerEl.className = 'pict-modal-shell-center';
          this._middleRow.appendChild(this._centerEl);
          this._rightStack = document.createElement('div');
          this._rightStack.className = 'pict-modal-shell-side pict-modal-shell-side-right';
          this._middleRow.appendChild(this._rightStack);
          this._bottomRow = document.createElement('div');
          this._bottomRow.className = 'pict-modal-shell-row pict-modal-shell-row-bottom';
          this._wrapperEl.appendChild(this._bottomRow);

          // Overlay layer for overlay-position panels (absolute over middle row)
          this._overlayLayer = document.createElement('div');
          this._overlayLayer.className = 'pict-modal-shell-overlay-layer';
          this._middleRow.appendChild(this._overlayLayer);
          this._viewport.appendChild(this._wrapperEl);
        }
        _mountPanel(pPanel) {
          if (pPanel.Position === 'overlay') {
            this._overlayLayer.appendChild(pPanel.El);
            return;
          }
          if (pPanel.Scope === 'center') {
            // Center-scoped panels mount inside the center column.
            // The column switches to flex-column so the content
            // destination + the panel(s) stack vertically.
            this._centerEl.classList.add('pict-modal-shell-center-with-inner-panel');
            if (pPanel.Side === 'top') {
              // Top-scoped panels go above the content destination.
              // If center() hasn't run yet, this still works — we
              // insert before whatever's first (or just append to an
              // empty center, which leaves us above any subsequent
              // content destination).
              this._centerEl.insertBefore(pPanel.El, this._centerEl.firstChild);
            } else {
              // Side === 'bottom' (the Scope guard already filtered
              // left/right).  Append to the bottom of the center.
              this._centerEl.appendChild(pPanel.El);
            }
            return;
          }
          let tmpHost;
          if (pPanel.Side === 'top') tmpHost = this._topRow;else if (pPanel.Side === 'bottom') tmpHost = this._bottomRow;else if (pPanel.Side === 'left') tmpHost = this._leftStack;else if (pPanel.Side === 'right') tmpHost = this._rightStack;else tmpHost = this._wrapperEl;
          tmpHost.appendChild(pPanel.El);
        }

        // ────────────────────────────────────────────────────────────────
        //  Drag (resize) machinery — shared across all resizable panels.
        // ────────────────────────────────────────────────────────────────

        _attachDragStart(pPanel, pEvent) {
          pEvent.preventDefault();
          let tmpAxis = pPanel.Side === 'top' || pPanel.Side === 'bottom' ? 'y' : 'x';
          this._activeDrag = {
            Panel: pPanel,
            Axis: tmpAxis,
            StartCoord: tmpAxis === 'x' ? pEvent.clientX : pEvent.clientY,
            StartSize: pPanel.Size,
            Direction: pPanel.Side === 'left' || pPanel.Side === 'top' ? 1 : -1,
            PendingSize: null,
            RAFId: 0
          };
          document.body.classList.add(tmpAxis === 'x' ? 'pict-modal-shell-dragging-x' : 'pict-modal-shell-dragging-y');
          // Suppress the panel's collapse/expand width/height transition for
          // the duration of the drag — without this, every pointermove kicks
          // off a fresh 140ms transition that stacks up and renders the
          // resize as visibly laggy ("choppy"). With the transition off the
          // panel snaps to each new size in the same frame as the pointer.
          pPanel.El.classList.add('pict-modal-shell-panel-resizing');
          // Capture the pointer so dragging works even when the cursor leaves
          // the resize handle (otherwise the user has to keep the cursor
          // exactly on the 6 px strip — feels twitchy).
          try {
            pEvent.target.setPointerCapture && pEvent.target.setPointerCapture(pEvent.pointerId);
          } catch (pErr) {/* not supported in old browsers — fine */}
          document.addEventListener('pointermove', this._onDragMove);
          document.addEventListener('pointerup', this._onDragEnd);
        }
        _flushDrag() {
          let tmpD = this._activeDrag;
          if (!tmpD) return;
          tmpD.RAFId = 0;
          if (tmpD.PendingSize !== null) {
            tmpD.Panel.setSize(tmpD.PendingSize);
            tmpD.PendingSize = null;
          }
        }
        _detachDragHandlers() {
          document.removeEventListener('pointermove', this._onDragMove);
          document.removeEventListener('pointerup', this._onDragEnd);
        }
      }

      // ════════════════════════════════════════════════════════════════════
      //  ShellPanel — one panel within a Shell
      // ════════════════════════════════════════════════════════════════════

      class ShellPanel {
        constructor(pShell, pConfig) {
          this._shell = pShell;
          this._config = pConfig;
          this.Hash = pConfig.Hash || 'panel-' + ++pShell._idCounter;
          this.Side = pConfig.Side === 'right' || pConfig.Side === 'bottom' || pConfig.Side === 'left' ? pConfig.Side : 'top';
          this.Mode = pConfig.Mode === 'collapsible' || pConfig.Mode === 'resizable' ? pConfig.Mode : 'fixed';
          this.Position = pConfig.Position === 'overlay' ? 'overlay' : 'pinned';
          // Scope: 'center' opts the panel into the center column instead
          // of the shell's outer rows.  Only valid for Side='top'/'bottom'
          // (left/right inside center would need a separate axis we don't
          // support).  Invalid combinations silently fall back to 'shell'.
          this.Scope = pConfig.Scope === 'center' && (this.Side === 'top' || this.Side === 'bottom') ? 'center' : 'shell';
          this.Title = pConfig.Title || '';
          this.Icon = pConfig.Icon || '';
          this.MinSize = typeof pConfig.MinSize === 'number' ? pConfig.MinSize : 40;
          this.MaxSize = typeof pConfig.MaxSize === 'number' ? pConfig.MaxSize : 1200;
          // `Hidden: true` is a panel that has NO visible chrome in its collapsed
          // state — no collapse tab sliver, no resize handle, no edge marker, and
          // (via CSS) display: none on the panel root. The only way to reveal it
          // is a programmatic expand()/toggle() called from elsewhere in the app
          // (e.g. a gear button in the topbar). Useful when the host wants a
          // fully-shaped panel but doesn't want an always-visible affordance for
          // discovering it. The Mode is still honoured for the EXPANDED state —
          // pass Mode: 'resizable' to keep the drag handle while the panel is
          // open, while still vanishing entirely when collapsed.
          this.Hidden = !!pConfig.Hidden;
          this.CollapsedSize = typeof pConfig.CollapsedSize === 'number' ? pConfig.CollapsedSize : this.Hidden ? 0 : DEFAULT_COLLAPSED_SIZE;
          this.PersistEnabled = pShell._persistenceEnabled && pConfig.Persist !== false;
          let tmpDefaultSize = this.Side === 'left' || this.Side === 'right' ? DEFAULT_SIZE_SIDE : DEFAULT_SIZE_TOPBOTTOM;
          this.Size = typeof pConfig.Size === 'number' ? pConfig.Size : tmpDefaultSize;
          this.Collapsed = !!pConfig.Collapsed;

          // Persisted state overrides initial Size/Collapsed.
          if (this.PersistEnabled) {
            let tmpSaved = pShell._loadPanelState(this.Hash);
            if (tmpSaved) {
              if (typeof tmpSaved.Size === 'number') this.Size = tmpSaved.Size;
              if (typeof tmpSaved.Collapsed === 'boolean') this.Collapsed = tmpSaved.Collapsed;
            }
          }
          this._clampSize();

          // Build the panel DOM.
          this._buildEl(pConfig);
          this._applySize();
          this._applyCollapsedClass();

          // Responsive drawer — at narrow viewports, flip a docked side
          // panel into a "top drawer" by adding a class to the middle row
          // that toggles flex-direction from row to column. The panel
          // stretches to full width and trades its inline `width` for a
          // configurable drawer `height`. The user's collapse/expand
          // keeps working: collapsed in drawer mode just gives the panel
          // height: 0 (so only the collapse tab remains visible at the
          // top of the content), expanded restores the drawer height.
          // Pass `0` or omit to disable. Mirrors retold-remote's
          // `.content-editor-body { flex-direction: column }` pattern.
          this.ResponsiveDrawer = typeof pConfig.ResponsiveDrawer === 'number' && pConfig.ResponsiveDrawer > 0 ? pConfig.ResponsiveDrawer : 0;
          // Drawer height — applied as `height` to the panel in drawer
          // mode. CSS units (px / vh / %) accepted. Default 33vh which
          // gives the panel roughly a third of the viewport height and
          // leaves comfortable room for the workspace below.
          this.DrawerHeight = typeof pConfig.DrawerHeight === 'string' && pConfig.DrawerHeight ? pConfig.DrawerHeight : '33vh';
          this._mediaQuery = null;
          this._mediaQueryHandler = null;
          if (this.ResponsiveDrawer > 0) {
            this._wireResponsiveDrawer();
          }
        }

        // ───────────── public ─────────────

        getContentEl() {
          return this._contentEl;
        }

        /**
         * Returns the currently-bound ContentView Pict view instance, or
         * null if no ContentView is configured / the view isn't registered
         * yet.
         */
        getContentView() {
          if (!this._config.ContentView) return null;
          let tmpPict = this._shell._modal && this._shell._modal.pict;
          if (!tmpPict || !tmpPict.views) return null;
          return tmpPict.views[this._config.ContentView] || null;
        }
        collapse() {
          this._setCollapsed(true);
        }
        expand() {
          this._setCollapsed(false);
        }
        toggle() {
          this._setCollapsed(!this.Collapsed);
        }

        /**
         * Unified "show this panel" affordance — this is the shared
         * codepath every popup trigger should funnel through. Behavior:
         *
         *   - If collapsed → expand (which fires OnExpand + re-renders the
         *     ContentView via the shared transition machinery).
         *   - If already open → re-render the ContentView (so any newly-
         *     streamed state is visible) AND briefly flash the panel
         *     border so the user notices that the existing panel just
         *     received attention. Avoids the "I clicked a button but
         *     nothing happened" feeling when the panel was already open.
         *
         * Idempotent — safe to call from any number of triggers without
         * stacking effects.
         */
        popup() {
          if (this.Collapsed) {
            this._setCollapsed(false);
          } else {
            // Already open — refresh content + flash for attention.
            this._renderContentView();
            this._flash();
          }
        }
        setSize(pSize) {
          if (typeof pSize !== 'number' || !isFinite(pSize)) return;
          this.Size = pSize;
          this._clampSize();
          this._applySize();
        }
        destroy(pSkipFromShell) {
          this._unwireResponsiveDrawer();
          if (this.El && this.El.parentNode) this.El.parentNode.removeChild(this.El);
          if (!pSkipFromShell) {
            let tmpIdx = this._shell._panels.indexOf(this);
            if (tmpIdx >= 0) this._shell._panels.splice(tmpIdx, 1);
            delete this._shell._panelsByHash[this.Hash];
          }
        }

        // ───────────── internals ─────────────

        _clampSize() {
          if (this.Size < this.MinSize) this.Size = this.MinSize;
          if (this.Size > this.MaxSize) this.Size = this.MaxSize;
        }

        // Responsive drawer — sets up a matchMedia listener for
        // `(max-width: <ResponsiveDrawer>px)`. Each crossing flips the
        // shell's middle row between row layout (wide) and column layout
        // (narrow) by toggling the `pict-modal-shell-drawer-active` class
        // on the middle row. The matching CSS makes side panels expand to
        // full width with a fixed `DrawerHeight`, becoming top/bottom
        // drawers above/below the workspace center. Collapsed in drawer
        // mode collapses to height: 0, leaving only the collapse tab.
        //
        // This pattern is the conventional "responsive sidebar" approach
        // (used by retold-remote's content editor) — the user keeps their
        // sidebar accessible at narrow widths but it gives the workspace
        // room to breathe.
        _wireResponsiveDrawer() {
          if (typeof window === 'undefined' || !window.matchMedia) return;
          this._mediaQuery = window.matchMedia('(max-width: ' + this.ResponsiveDrawer + 'px)');

          // Apply the drawer height as a CSS variable on the panel
          // element so the static CSS rules can read it. Doing this once
          // here avoids per-event JS style writes.
          if (this.El) {
            this.El.style.setProperty('--pict-modal-drawer-height', this.DrawerHeight);
          }
          let tmpSelf = this;
          this._mediaQueryHandler = function (pEvent) {
            let tmpNarrow = pEvent && typeof pEvent.matches === 'boolean' ? pEvent.matches : tmpSelf._mediaQuery.matches;
            tmpSelf._setDrawerMode(tmpNarrow);
          };

          // Apply the current state immediately (handles the case where the
          // page loads already-narrow). Newer browsers use addEventListener;
          // older ones use addListener.
          if (this._mediaQuery.addEventListener) {
            this._mediaQuery.addEventListener('change', this._mediaQueryHandler);
          } else if (this._mediaQuery.addListener) {
            this._mediaQuery.addListener(this._mediaQueryHandler);
          }
          this._mediaQueryHandler({
            matches: this._mediaQuery.matches
          });

          // Belt + suspenders: also listen to window resize and re-sync.
          // `matchMedia.change` is supposed to be reliable on every
          // boundary crossing, but in real-world testing (esp. when the
          // user is dragging DevTools to resize the inner viewport, or
          // going through fast successive crossings) we've seen the
          // change event silently miss. A plain resize listener is
          // cheap and the handler is idempotent — if matches state
          // hasn't actually changed the body of `_setDrawerMode` is a
          // no-op (it short-circuits when classes are already correct).
          this._resizeHandler = function () {
            tmpSelf._setDrawerMode(tmpSelf._mediaQuery.matches);
          };
          window.addEventListener('resize', this._resizeHandler);
        }
        _unwireResponsiveDrawer() {
          if (this._resizeHandler && typeof window !== 'undefined') {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
          }
          if (!this._mediaQuery || !this._mediaQueryHandler) return;
          if (this._mediaQuery.removeEventListener) {
            this._mediaQuery.removeEventListener('change', this._mediaQueryHandler);
          } else if (this._mediaQuery.removeListener) {
            this._mediaQuery.removeListener(this._mediaQueryHandler);
          }
          this._mediaQuery = null;
          this._mediaQueryHandler = null;
        }

        // Toggle drawer mode by adding / removing a class on the shell's
        // middle row. The CSS rule for `.pict-modal-shell-drawer-active`
        // flips flex-direction column, makes side panels full-width, and
        // applies the panel's `--pict-modal-drawer-height` for sizing.
        // Also tags the panel itself so per-panel CSS can target it.
        // Re-applies the inline size at the end so the wide-mode crossing
        // gets a clean width back (drawer mode forced width: 100% via CSS
        // !important; the inline style was stale).
        _setDrawerMode(pDrawer) {
          if (!this._shell || !this._shell._middleRow) return;
          // Idempotent — short-circuit when the panel's drawer state
          // already matches the target. Keeps the resize-event fallback
          // (which fires constantly during drag-resize) from doing
          // pointless DOM thrash + style re-application every frame.
          let tmpCurrentlyDrawer = !!(this.El && this.El.classList.contains('pict-modal-shell-panel-drawer'));
          if (tmpCurrentlyDrawer === !!pDrawer) return;
          if (pDrawer) {
            this._shell._middleRow.classList.add('pict-modal-shell-drawer-active');
            if (this.El) {
              this.El.classList.add('pict-modal-shell-panel-drawer');
            }
          } else {
            // Only remove the row-level class if NO other panel still
            // wants drawer mode. Multi-panel hosts can safely each opt
            // in independently this way.
            let tmpStillNarrow = false;
            let tmpPanels = this._shell._panels || [];
            for (let i = 0; i < tmpPanels.length; i++) {
              let tmpP = tmpPanels[i];
              if (tmpP !== this && tmpP._mediaQuery && tmpP._mediaQuery.matches && tmpP.ResponsiveDrawer > 0) {
                tmpStillNarrow = true;
                break;
              }
            }
            if (!tmpStillNarrow) {
              this._shell._middleRow.classList.remove('pict-modal-shell-drawer-active');
            }
            if (this.El) {
              this.El.classList.remove('pict-modal-shell-panel-drawer');
            }
          }
          // Re-apply inline size. In drawer mode the CSS !important
          // rule overrides this anyway, but on the wide crossing we
          // need the inline width to be correct so the panel shows up
          // at its proper docked / collapsed-docked size rather than
          // inheriting any stale state.
          this._applySize();
        }
        _buildEl(pConfig) {
          let tmpRoot = document.createElement('div');
          tmpRoot.className = 'pict-modal-shell-panel pict-modal-shell-panel-' + this.Side + ' pict-modal-shell-panel-mode-' + this.Mode + (this.Position === 'overlay' ? ' pict-modal-shell-panel-overlay' : '') + (this.Hidden ? ' pict-modal-shell-panel-hidden' : '');
          tmpRoot.setAttribute('data-shell-panel-hash', this.Hash);
          tmpRoot.setAttribute('data-shell-panel-side', this.Side);
          tmpRoot.setAttribute('data-shell-panel-mode', this.Mode);

          // Content area — hosts render their stuff into the inner #id div.
          let tmpContentWrap = document.createElement('div');
          tmpContentWrap.className = 'pict-modal-shell-panel-content';
          this._contentEl = document.createElement('div');
          if (pConfig.ContentDestinationId) {
            this._contentEl.id = pConfig.ContentDestinationId;
          }
          this._contentEl.className = 'pict-modal-shell-panel-content-inner';
          tmpContentWrap.appendChild(this._contentEl);
          tmpRoot.appendChild(tmpContentWrap);

          // Collapse tab — shown when collapsible / resizable. Lives at the
          // inner edge so it's always reachable when the panel is collapsed.
          // Hidden panels skip the tab entirely — the only path back from
          // collapsed → expanded is a programmatic expand() / toggle() call
          // from the host (e.g. a topbar gear button).
          if ((this.Mode === 'collapsible' || this.Mode === 'resizable') && !this.Hidden) {
            this._collapseTab = document.createElement('button');
            this._collapseTab.type = 'button';
            this._collapseTab.className = 'pict-modal-shell-panel-collapse-tab';
            this._collapseTab.setAttribute('aria-label', this.Title ? 'Toggle ' + this.Title : 'Toggle panel');
            this._collapseTab.title = this.Title || 'Toggle';
            this._collapseTab.innerHTML = '' + (this.Icon ? '<span class="pict-modal-shell-panel-collapse-tab-icon">' + this.Icon + '</span>' : '') + (this.Title ? '<span class="pict-modal-shell-panel-collapse-tab-title">' + this._escape(this.Title) + '</span>' : '');
            let tmpSelf = this;
            this._collapseTab.addEventListener('click', function () {
              tmpSelf.toggle();
            });
            tmpRoot.appendChild(this._collapseTab);
          }

          // Resize handle — only when resizable. Positioned via CSS based
          // on side.
          if (this.Mode === 'resizable') {
            this._resizeHandle = document.createElement('div');
            this._resizeHandle.className = 'pict-modal-shell-panel-resize-handle';
            this._resizeHandle.setAttribute('aria-hidden', 'true');
            let tmpSelf = this;
            this._resizeHandle.addEventListener('pointerdown', function (pEvent) {
              if (tmpSelf.Collapsed) return;
              tmpSelf._shell._attachDragStart(tmpSelf, pEvent);
            });
            tmpRoot.appendChild(this._resizeHandle);
          }
          this.El = tmpRoot;
        }
        _applySize() {
          let tmpEffective = this.Collapsed ? this.CollapsedSize : this.Size;
          if (this.Side === 'left' || this.Side === 'right') {
            this.El.style.width = tmpEffective + 'px';
            this.El.style.height = '';
          } else {
            this.El.style.height = tmpEffective + 'px';
            this.El.style.width = '';
          }
        }
        _applyCollapsedClass() {
          if (this.Collapsed) this.El.classList.add('pict-modal-shell-panel-collapsed');else this.El.classList.remove('pict-modal-shell-panel-collapsed');
        }
        _setCollapsed(pBool) {
          if (this.Collapsed === !!pBool) return;
          let tmpWasCollapsed = this.Collapsed;
          this.Collapsed = !!pBool;
          this._applyCollapsedClass();
          this._applySize();
          this._persist();

          // Transition-specific hooks fire BEFORE OnToggle so OnExpand
          // callers can mutate state (e.g. set focus, re-fetch data) and
          // have it reflected by any OnToggle observer that runs after.
          if (tmpWasCollapsed && !this.Collapsed) {
            // collapsed → expanded. Render the bound ContentView so
            // freshly-streamed state shows up the moment the panel
            // becomes visible (replaces the manual view.render() dance
            // hosts used to do in their own runAction-style helpers).
            this._renderContentView();
            this._fireHook('OnExpand');
          } else if (!tmpWasCollapsed && this.Collapsed) {
            this._fireHook('OnCollapse');
          }

          // Back-compat: OnToggle still fires for both directions.
          this._fireHook('OnToggle', this.Collapsed);
        }
        _fireHook(pName, pArg) {
          let tmpFn = this._config[pName];
          if (typeof tmpFn !== 'function') return;
          try {
            if (typeof pArg !== 'undefined') {
              tmpFn(pArg, this);
            } else {
              tmpFn(this);
            }
          } catch (pErr) {/* host hook failure must not break the panel */}
        }

        /**
         * Render the bound ContentView (if any) into this panel's
         * destination. Called by the shell on panel creation + on every
         * collapsed→expanded transition + by popup() when re-flashing an
         * already-open panel. Silently no-ops when no ContentView is
         * configured or the view isn't registered yet (boot races).
         */
        _renderContentView() {
          let tmpView = this.getContentView();
          if (tmpView && typeof tmpView.render === 'function') {
            try {
              tmpView.render();
            } catch (pErr) {/* view render failure shouldn't break the panel chrome */}
          }
        }

        /**
         * Briefly highlight the panel — used by popup() when called on an
         * already-open panel so the user sees that their click landed.
         * The class is removed after the CSS animation completes; safe to
         * re-trigger (timeouts overlap, last one wins on the trailing edge).
         */
        _flash() {
          if (!this.El) return;
          this.El.classList.add('pict-modal-shell-panel-flash');
          let tmpSelf = this;
          clearTimeout(this._flashTimer);
          this._flashTimer = setTimeout(function () {
            if (tmpSelf.El) tmpSelf.El.classList.remove('pict-modal-shell-panel-flash');
          }, 700);
        }
        _persist() {
          if (!this.PersistEnabled) return;
          this._shell._savePanelState(this.Hash, {
            Collapsed: this.Collapsed,
            Size: this.Size
          });
        }
        _escape(pStr) {
          return String(pStr || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }
      }

      // ════════════════════════════════════════════════════════════════════
      //  Module exports — used internally by Pict-Section-Modal.shell()
      // ════════════════════════════════════════════════════════════════════

      class PictModalShellManager {
        constructor(pModalSection) {
          this._modal = pModalSection;
          this._shellsByViewport = new WeakMap();
        }

        /**
         * Idempotent — calling shell() twice with the same viewport returns
         * the same instance.
         */
        shell(pViewportSelectorOrEl, pOptions) {
          let tmpEl = typeof pViewportSelectorOrEl === 'string' ? document.querySelector(pViewportSelectorOrEl) : pViewportSelectorOrEl;
          if (!tmpEl) {
            throw new Error('Pict-Modal-Shell.shell: viewport not found for ' + pViewportSelectorOrEl);
          }
          let tmpExisting = this._shellsByViewport.get(tmpEl);
          if (tmpExisting) return tmpExisting;
          let tmpShell = new PictModalShell(this._modal, tmpEl, pOptions);
          this._shellsByViewport.set(tmpEl, tmpShell);
          return tmpShell;
        }
      }
      module.exports = PictModalShellManager;
      module.exports.PictModalShell = PictModalShell;
      module.exports.ShellPanel = ShellPanel;
      module.exports.STORAGE_PREFIX = STORAGE_PREFIX;
      module.exports.SCHEMA_VERSION = SCHEMA_VERSION;
    }, {}],
    8: [function (require, module, exports) {
      /**
       * Pict-Modal-Toast
       *
       * Manages toast notification elements with auto-dismiss and stacking.
       */
      class PictModalToast {
        constructor(pModal) {
          this._modal = pModal;
          this._containers = {};
        }

        /**
         * Show a toast notification.
         *
         * @param {string} pMessage - Toast message text
         * @param {object} [pOptions] - Options (type, duration, position, dismissible)
         * @returns {{ dismiss: function }} Handle with dismiss method
         */
        toast(pMessage, pOptions) {
          let tmpOptions = Object.assign({}, this._modal.options.DefaultToastOptions, pOptions);
          let tmpContainer = this._getContainer(tmpOptions.position);
          let tmpId = this._modal._nextId();
          let tmpToast = document.createElement('div');
          tmpToast.className = 'pict-modal-toast pict-modal-toast--' + tmpOptions.type;
          tmpToast.id = 'pict-modal-toast-' + tmpId;
          let tmpContent = '<span class="pict-modal-toast-message">' + this._escapeHTML(pMessage) + '</span>';
          if (tmpOptions.dismissible) {
            tmpContent += '<button class="pict-modal-toast-dismiss" aria-label="Dismiss">&times;</button>';
          }
          tmpToast.innerHTML = tmpContent;

          // Create handle
          let tmpDismissed = false;
          let tmpTimeoutHandle = null;
          let tmpDismiss = () => {
            if (tmpDismissed) {
              return;
            }
            tmpDismissed = true;
            if (tmpTimeoutHandle) {
              clearTimeout(tmpTimeoutHandle);
            }

            // Exit animation
            tmpToast.classList.remove('pict-modal-visible');
            tmpToast.classList.add('pict-modal-toast-exit');

            // Remove from active list
            this._modal._activeToasts = this._modal._activeToasts.filter(pEntry => {
              return pEntry.element !== tmpToast;
            });

            // Remove from DOM after transition
            setTimeout(() => {
              if (tmpToast.parentNode) {
                tmpToast.parentNode.removeChild(tmpToast);
              }
              this._cleanupContainer(tmpOptions.position);
            }, 220);
          };
          let tmpHandle = {
            dismiss: tmpDismiss
          };

          // Wire dismiss button
          if (tmpOptions.dismissible) {
            let tmpDismissBtn = tmpToast.querySelector('.pict-modal-toast-dismiss');
            if (tmpDismissBtn) {
              tmpDismissBtn.addEventListener('click', tmpDismiss);
            }
          }

          // Append to container
          tmpContainer.appendChild(tmpToast);

          // Track
          let tmpEntry = {
            element: tmpToast,
            dismiss: tmpDismiss,
            handle: tmpHandle
          };
          this._modal._activeToasts.push(tmpEntry);

          // Animate in
          void tmpToast.offsetHeight;
          tmpToast.classList.add('pict-modal-visible');

          // Auto-dismiss
          if (tmpOptions.duration > 0) {
            tmpTimeoutHandle = setTimeout(tmpDismiss, tmpOptions.duration);
          }
          return tmpHandle;
        }

        /**
         * Get or create a toast container for the given position.
         *
         * @param {string} pPosition - Position key (e.g. 'top-right')
         * @returns {HTMLElement}
         */
        _getContainer(pPosition) {
          if (this._containers[pPosition]) {
            return this._containers[pPosition];
          }
          let tmpContainer = document.createElement('div');
          tmpContainer.className = 'pict-modal-toast-container pict-modal-toast-container--' + pPosition;
          document.body.appendChild(tmpContainer);
          this._containers[pPosition] = tmpContainer;
          return tmpContainer;
        }

        /**
         * Remove a container if it has no more toasts.
         *
         * @param {string} pPosition
         */
        _cleanupContainer(pPosition) {
          let tmpContainer = this._containers[pPosition];
          if (tmpContainer && tmpContainer.children.length === 0) {
            if (tmpContainer.parentNode) {
              tmpContainer.parentNode.removeChild(tmpContainer);
            }
            delete this._containers[pPosition];
          }
        }

        /**
         * Dismiss all active toasts.
         */
        dismissAll() {
          let tmpToasts = this._modal._activeToasts.slice();
          for (let i = 0; i < tmpToasts.length; i++) {
            tmpToasts[i].dismiss();
          }
        }

        /**
         * Destroy all containers.
         */
        destroy() {
          this.dismissAll();
          let tmpPositions = Object.keys(this._containers);
          for (let i = 0; i < tmpPositions.length; i++) {
            let tmpContainer = this._containers[tmpPositions[i]];
            if (tmpContainer && tmpContainer.parentNode) {
              tmpContainer.parentNode.removeChild(tmpContainer);
            }
          }
          this._containers = {};
        }

        /**
         * Escape HTML special characters.
         *
         * @param {string} pText
         * @returns {string}
         */
        _escapeHTML(pText) {
          if (typeof pText !== 'string') {
            return '';
          }
          return pText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
      }
      module.exports = PictModalToast;
    }, {}],
    9: [function (require, module, exports) {
      /**
       * Pict-Modal-Tooltip
       *
       * Manages simple text and rich HTML tooltips with positioning and auto-flip.
       */
      class PictModalTooltip {
        constructor(pModal) {
          this._modal = pModal;
        }

        /**
         * Attach a simple text tooltip to an element.
         *
         * @param {HTMLElement} pElement - Target element
         * @param {string} pText - Tooltip text
         * @param {object} [pOptions] - Options (position, delay, maxWidth)
         * @returns {{ destroy: function }} Handle to remove the tooltip
         */
        tooltip(pElement, pText, pOptions) {
          let tmpOptions = Object.assign({}, this._modal.options.DefaultTooltipOptions, pOptions);
          return this._attachTooltip(pElement, pText, false, tmpOptions);
        }

        /**
         * Attach a rich HTML tooltip to an element.
         *
         * @param {HTMLElement} pElement - Target element
         * @param {string} pHTMLContent - HTML content for the tooltip
         * @param {object} [pOptions] - Options (position, delay, maxWidth, interactive)
         * @returns {{ destroy: function }} Handle to remove the tooltip
         */
        richTooltip(pElement, pHTMLContent, pOptions) {
          let tmpOptions = Object.assign({}, this._modal.options.DefaultTooltipOptions, pOptions);
          return this._attachTooltip(pElement, pHTMLContent, true, tmpOptions);
        }

        /**
         * Internal: attach tooltip event listeners to an element.
         *
         * @param {HTMLElement} pElement
         * @param {string} pContent
         * @param {boolean} pIsHTML
         * @param {object} pOptions
         * @returns {{ destroy: function }}
         */
        _attachTooltip(pElement, pContent, pIsHTML, pOptions) {
          let tmpTooltipElement = null;
          let tmpShowTimeout = null;
          let tmpHideTimeout = null;
          let tmpDestroyed = false;
          let tmpId = this._modal._nextId();
          let tmpShow = () => {
            if (tmpDestroyed || tmpTooltipElement) {
              return;
            }
            tmpTooltipElement = document.createElement('div');
            tmpTooltipElement.className = 'pict-modal-tooltip pict-modal-tooltip--' + pOptions.position;
            tmpTooltipElement.id = 'pict-modal-tooltip-' + tmpId;
            tmpTooltipElement.setAttribute('role', 'tooltip');
            tmpTooltipElement.style.maxWidth = pOptions.maxWidth;
            if (pOptions.interactive) {
              tmpTooltipElement.classList.add('pict-modal-tooltip-interactive');
            }

            // Arrow
            let tmpArrow = document.createElement('div');
            tmpArrow.className = 'pict-modal-tooltip-arrow';

            // Content
            let tmpContentDiv = document.createElement('div');
            if (pIsHTML) {
              tmpContentDiv.innerHTML = pContent;
            } else {
              tmpContentDiv.textContent = pContent;
            }
            tmpTooltipElement.appendChild(tmpArrow);
            tmpTooltipElement.appendChild(tmpContentDiv);
            document.body.appendChild(tmpTooltipElement);

            // Set aria-describedby on target
            pElement.setAttribute('aria-describedby', tmpTooltipElement.id);

            // Position
            this._positionTooltip(tmpTooltipElement, pElement, pOptions.position);

            // Animate in
            void tmpTooltipElement.offsetHeight;
            tmpTooltipElement.classList.add('pict-modal-visible');

            // Track
            this._modal._activeTooltips.push({
              element: tmpTooltipElement,
              targetElement: pElement,
              destroy: tmpDestroy
            });

            // For interactive tooltips, allow hovering over the tooltip itself
            if (pOptions.interactive && tmpTooltipElement) {
              tmpTooltipElement.addEventListener('mouseenter', () => {
                if (tmpHideTimeout) {
                  clearTimeout(tmpHideTimeout);
                  tmpHideTimeout = null;
                }
              });
              tmpTooltipElement.addEventListener('mouseleave', () => {
                tmpHide();
              });
            }
          };
          let tmpHide = () => {
            if (!tmpTooltipElement) {
              return;
            }
            tmpTooltipElement.classList.remove('pict-modal-visible');
            let tmpEl = tmpTooltipElement;
            tmpTooltipElement = null;

            // Remove aria
            pElement.removeAttribute('aria-describedby');

            // Remove from tracking
            this._modal._activeTooltips = this._modal._activeTooltips.filter(pEntry => {
              return pEntry.element !== tmpEl;
            });
            setTimeout(() => {
              if (tmpEl.parentNode) {
                tmpEl.parentNode.removeChild(tmpEl);
              }
            }, 220);
          };
          let tmpOnMouseEnter = () => {
            if (tmpHideTimeout) {
              clearTimeout(tmpHideTimeout);
              tmpHideTimeout = null;
            }
            tmpShowTimeout = setTimeout(tmpShow, pOptions.delay);
          };
          let tmpOnMouseLeave = () => {
            if (tmpShowTimeout) {
              clearTimeout(tmpShowTimeout);
              tmpShowTimeout = null;
            }
            // Small delay before hiding to allow moving to interactive tooltip
            if (pOptions.interactive) {
              tmpHideTimeout = setTimeout(tmpHide, 100);
            } else {
              tmpHide();
            }
          };
          let tmpOnFocusIn = () => {
            tmpShowTimeout = setTimeout(tmpShow, pOptions.delay);
          };
          let tmpOnFocusOut = () => {
            if (tmpShowTimeout) {
              clearTimeout(tmpShowTimeout);
              tmpShowTimeout = null;
            }
            tmpHide();
          };

          // Attach listeners
          pElement.addEventListener('mouseenter', tmpOnMouseEnter);
          pElement.addEventListener('mouseleave', tmpOnMouseLeave);
          pElement.addEventListener('focusin', tmpOnFocusIn);
          pElement.addEventListener('focusout', tmpOnFocusOut);
          let tmpDestroy = () => {
            if (tmpDestroyed) {
              return;
            }
            tmpDestroyed = true;
            if (tmpShowTimeout) {
              clearTimeout(tmpShowTimeout);
            }
            if (tmpHideTimeout) {
              clearTimeout(tmpHideTimeout);
            }
            tmpHide();
            pElement.removeEventListener('mouseenter', tmpOnMouseEnter);
            pElement.removeEventListener('mouseleave', tmpOnMouseLeave);
            pElement.removeEventListener('focusin', tmpOnFocusIn);
            pElement.removeEventListener('focusout', tmpOnFocusOut);
          };
          return {
            destroy: tmpDestroy
          };
        }

        /**
         * Position a tooltip element relative to the target element.
         * Flips direction if the tooltip would overflow the viewport.
         *
         * @param {HTMLElement} pTooltip
         * @param {HTMLElement} pTarget
         * @param {string} pPosition - 'top', 'bottom', 'left', 'right'
         */
        _positionTooltip(pTooltip, pTarget, pPosition) {
          let tmpTargetRect = pTarget.getBoundingClientRect();
          let tmpTooltipRect = pTooltip.getBoundingClientRect();
          let tmpGap = 8;
          let tmpPosition = pPosition;

          // Flip if needed
          if (tmpPosition === 'top' && tmpTargetRect.top < tmpTooltipRect.height + tmpGap) {
            tmpPosition = 'bottom';
          } else if (tmpPosition === 'bottom' && window.innerHeight - tmpTargetRect.bottom < tmpTooltipRect.height + tmpGap) {
            tmpPosition = 'top';
          } else if (tmpPosition === 'left' && tmpTargetRect.left < tmpTooltipRect.width + tmpGap) {
            tmpPosition = 'right';
          } else if (tmpPosition === 'right' && window.innerWidth - tmpTargetRect.right < tmpTooltipRect.width + tmpGap) {
            tmpPosition = 'left';
          }

          // Update class for arrow direction
          pTooltip.className = pTooltip.className.replace(/pict-modal-tooltip--\w+/, 'pict-modal-tooltip--' + tmpPosition);
          let tmpTop = 0;
          let tmpLeft = 0;
          switch (tmpPosition) {
            case 'top':
              tmpTop = tmpTargetRect.top - tmpTooltipRect.height - tmpGap;
              tmpLeft = tmpTargetRect.left + tmpTargetRect.width / 2 - tmpTooltipRect.width / 2;
              break;
            case 'bottom':
              tmpTop = tmpTargetRect.bottom + tmpGap;
              tmpLeft = tmpTargetRect.left + tmpTargetRect.width / 2 - tmpTooltipRect.width / 2;
              break;
            case 'left':
              tmpTop = tmpTargetRect.top + tmpTargetRect.height / 2 - tmpTooltipRect.height / 2;
              tmpLeft = tmpTargetRect.left - tmpTooltipRect.width - tmpGap;
              break;
            case 'right':
              tmpTop = tmpTargetRect.top + tmpTargetRect.height / 2 - tmpTooltipRect.height / 2;
              tmpLeft = tmpTargetRect.right + tmpGap;
              break;
          }

          // Clamp to viewport
          tmpLeft = Math.max(4, Math.min(tmpLeft, window.innerWidth - tmpTooltipRect.width - 4));
          tmpTop = Math.max(4, Math.min(tmpTop, window.innerHeight - tmpTooltipRect.height - 4));
          pTooltip.style.top = tmpTop + 'px';
          pTooltip.style.left = tmpLeft + 'px';
        }

        /**
         * Dismiss all active tooltips.
         */
        dismissAll() {
          let tmpTooltips = this._modal._activeTooltips.slice();
          for (let i = 0; i < tmpTooltips.length; i++) {
            tmpTooltips[i].destroy();
          }
        }
      }
      module.exports = PictModalTooltip;
    }, {}],
    10: [function (require, module, exports) {
      /**
       * Pict-Modal-Window
       *
       * Builds custom floating modal windows with arbitrary content and buttons.
       */
      class PictModalWindow {
        constructor(pModal) {
          this._modal = pModal;
        }

        /**
         * Show a custom modal window.
         *
         * @param {object} [pOptions] - Options
         * @param {string} [pOptions.title] - Dialog title
         * @param {string} [pOptions.content] - HTML content for the body
         * @param {Array} [pOptions.buttons] - Array of { Hash, Label, Style }
         * @param {boolean} [pOptions.closeable] - Whether the close button and overlay dismiss are enabled
         * @param {string} [pOptions.width] - CSS width value
         * @param {boolean} [pOptions.unbounded] - If true, removes the default 90vh/90vw viewport cap. The dialog will grow with its content and may extend beyond the viewport.
         * @param {function} [pOptions.onOpen] - Called after dialog is shown, receives dialog element
         * @param {function} [pOptions.onClose] - Called after dialog is dismissed
         * @returns {Promise<string|null>} Resolves with clicked button Hash, or null on close
         */
        show(pOptions) {
          let tmpOptions = Object.assign({}, this._modal.options.DefaultModalOptions, pOptions);
          return new Promise(fResolve => {
            let tmpDialog = this._buildDialog(tmpOptions, fResolve);
            this._showDialog(tmpDialog, tmpOptions, fResolve);
          });
        }

        /**
         * Build the modal dialog element.
         *
         * @param {object} pOptions
         * @param {function} fResolve
         * @returns {HTMLElement}
         */
        _buildDialog(pOptions, fResolve) {
          let tmpId = this._modal._nextId();
          let tmpDialog = document.createElement('div');
          tmpDialog.className = 'pict-modal-dialog';
          if (pOptions.unbounded) {
            tmpDialog.className += ' pict-modal-dialog--unbounded';
          }
          tmpDialog.id = 'pict-modal-' + tmpId;
          tmpDialog.setAttribute('role', 'dialog');
          tmpDialog.setAttribute('aria-modal', 'true');
          tmpDialog.style.width = pOptions.width;

          // Header
          let tmpHeaderHTML = '';
          if (pOptions.title || pOptions.closeable) {
            tmpHeaderHTML = '<div class="pict-modal-dialog-header">';
            tmpHeaderHTML += '<span class="pict-modal-dialog-title">' + this._escapeHTML(pOptions.title) + '</span>';
            if (pOptions.closeable) {
              tmpHeaderHTML += '<button class="pict-modal-dialog-close" aria-label="Close">&times;</button>';
            }
            tmpHeaderHTML += '</div>';
          }

          // Body
          let tmpBodyHTML = '<div class="pict-modal-dialog-body">' + (pOptions.content || '') + '</div>';

          // Footer with buttons
          let tmpFooterHTML = '';
          if (pOptions.buttons && pOptions.buttons.length > 0) {
            tmpFooterHTML = '<div class="pict-modal-dialog-footer">';
            for (let i = 0; i < pOptions.buttons.length; i++) {
              let tmpButton = pOptions.buttons[i];
              let tmpBtnClass = 'pict-modal-btn';
              if (tmpButton.Style) {
                tmpBtnClass += ' pict-modal-btn--' + tmpButton.Style;
              }
              tmpFooterHTML += '<button class="' + tmpBtnClass + '" data-hash="' + this._escapeHTML(tmpButton.Hash) + '">' + this._escapeHTML(tmpButton.Label) + '</button>';
            }
            tmpFooterHTML += '</div>';
          }
          tmpDialog.innerHTML = tmpHeaderHTML + tmpBodyHTML + tmpFooterHTML;
          let tmpDismiss = pResult => {
            this._dismissDialog(tmpDialog, pResult, fResolve, pOptions);
          };

          // Wire close button
          if (pOptions.closeable) {
            let tmpCloseBtn = tmpDialog.querySelector('.pict-modal-dialog-close');
            if (tmpCloseBtn) {
              tmpCloseBtn.addEventListener('click', () => {
                tmpDismiss(null);
              });
            }
          }

          // Wire action buttons
          let tmpActionButtons = tmpDialog.querySelectorAll('[data-hash]');
          for (let i = 0; i < tmpActionButtons.length; i++) {
            let tmpBtn = tmpActionButtons[i];
            tmpBtn.addEventListener('click', () => {
              tmpDismiss(tmpBtn.getAttribute('data-hash'));
            });
          }
          tmpDialog._dismiss = tmpDismiss;
          return tmpDialog;
        }

        /**
         * Show the dialog: append to body, show overlay, animate in.
         *
         * @param {HTMLElement} pDialog
         * @param {object} pOptions
         * @param {function} fResolve
         */
        _showDialog(pDialog, pOptions, fResolve) {
          let tmpModalEntry = {
            element: pDialog,
            dismiss: pDialog._dismiss,
            type: 'window'
          };

          // Show overlay
          let tmpOverlayClickHandler = null;
          if (this._modal.options.OverlayClickDismisses && pOptions.closeable) {
            tmpOverlayClickHandler = () => {
              pDialog._dismiss(null);
            };
          }
          this._modal._overlay.show(tmpOverlayClickHandler);

          // Append to body
          document.body.appendChild(pDialog);

          // Track
          this._modal._activeModals.push(tmpModalEntry);

          // Animate in
          void pDialog.offsetHeight;
          pDialog.classList.add('pict-modal-visible');

          // Focus first button or close button
          let tmpFocusTarget = pDialog.querySelector('.pict-modal-btn') || pDialog.querySelector('.pict-modal-dialog-close');
          if (tmpFocusTarget) {
            tmpFocusTarget.focus();
          }

          // Keyboard handler
          pDialog._keyHandler = pEvent => {
            if (pEvent.key === 'Escape' && pOptions.closeable) {
              pDialog._dismiss(null);
            }
          };
          document.addEventListener('keydown', pDialog._keyHandler);

          // onOpen callback
          if (typeof pOptions.onOpen === 'function') {
            pOptions.onOpen(pDialog);
          }
        }

        /**
         * Dismiss the dialog: animate out, remove from DOM, hide overlay.
         *
         * @param {HTMLElement} pDialog
         * @param {*} pResult
         * @param {function} fResolve
         * @param {object} pOptions
         */
        _dismissDialog(pDialog, pResult, fResolve, pOptions) {
          if (pDialog._dismissed) {
            return;
          }
          pDialog._dismissed = true;
          if (pDialog._keyHandler) {
            document.removeEventListener('keydown', pDialog._keyHandler);
          }
          pDialog.classList.remove('pict-modal-visible');
          this._modal._activeModals = this._modal._activeModals.filter(pEntry => {
            return pEntry.element !== pDialog;
          });
          if (this._modal._activeModals.length > 0) {
            let tmpTopModal = this._modal._activeModals[this._modal._activeModals.length - 1];
            this._modal._overlay.updateClickHandler(this._modal.options.OverlayClickDismisses ? tmpTopModal.dismiss : null);
          }
          this._modal._overlay.hide();
          setTimeout(() => {
            if (pDialog.parentNode) {
              pDialog.parentNode.removeChild(pDialog);
            }
          }, 220);
          if (typeof pOptions.onClose === 'function') {
            pOptions.onClose(pResult);
          }
          fResolve(pResult);
        }

        /**
         * Escape HTML special characters.
         *
         * @param {string} pText
         * @returns {string}
         */
        _escapeHTML(pText) {
          if (typeof pText !== 'string') {
            return '';
          }
          return pText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
      }
      module.exports = PictModalWindow;
    }, {}],
    11: [function (require, module, exports) {
      module.exports = {
        "AutoInitialize": true,
        "AutoRender": false,
        "AutoSolveWithApp": false,
        "ViewIdentifier": "Pict-Section-Modal",
        "OverlayClickDismisses": true,
        "DefaultConfirmOptions": {
          "title": "Confirm",
          "confirmLabel": "OK",
          "cancelLabel": "Cancel",
          "dangerous": false,
          "unbounded": false
        },
        "DefaultDoubleConfirmOptions": {
          "title": "Are you sure?",
          "confirmLabel": "Confirm",
          "cancelLabel": "Cancel",
          "phrasePrompt": "Type \"{phrase}\" to confirm:",
          "confirmPhrase": "",
          "unbounded": false
        },
        "DefaultModalOptions": {
          "title": "",
          "content": "",
          "buttons": [],
          "closeable": true,
          "width": "480px",
          "unbounded": false
        },
        "DefaultTooltipOptions": {
          "position": "top",
          "delay": 200,
          "maxWidth": "300px",
          "interactive": false
        },
        "DefaultToastOptions": {
          "type": "info",
          "duration": 3000,
          "position": "top-right",
          "dismissible": true
        },
        "DefaultPanelOptions": {
          "position": "right",
          "width": 340,
          "minWidth": 200,
          "maxWidth": 600,
          "collapsible": true,
          "collapsed": false,
          "persist": false,
          "persistKey": ""
        },
        "Templates": [],
        "Renderables": [],
        "CSS": /*css*/"\n/* pict-section-modal */\n.pict-modal-root\n{\n\t/* Defaults are routed through pict-provider-theme tokens so apps\n\t   using the theme provider get themed modals automatically.  Each\n\t   var() carries its original hex as the fallback so apps that don't\n\t   install pict-provider-theme look exactly as before.  Apps may\n\t   still override any --pict-modal-* var directly to layer over the\n\t   theme-driven defaults. */\n\n\t/* Overlay */\n\t--pict-modal-overlay-bg: rgba(0, 0, 0, 0.5);\n\n\t/* Dialog */\n\t--pict-modal-bg:                  var(--theme-color-background-panel,  #ffffff);\n\t--pict-modal-fg:                  var(--theme-color-text-primary,      #1a1a1a);\n\t--pict-modal-border:              var(--theme-color-border-default,    #e0e0e0);\n\t--pict-modal-border-radius:       8px;\n\t--pict-modal-shadow:              0 4px 24px rgba(0, 0, 0, 0.15);\n\t--pict-modal-header-bg:           var(--theme-color-background-secondary, #f5f5f5);\n\t--pict-modal-header-fg:           var(--theme-color-text-primary,      #1a1a1a);\n\t--pict-modal-header-border:       var(--theme-color-border-default,    #e0e0e0);\n\n\t/* Buttons */\n\t--pict-modal-btn-bg:              var(--theme-color-background-secondary, #e0e0e0);\n\t--pict-modal-btn-fg:              var(--theme-color-text-primary,      #1a1a1a);\n\t--pict-modal-btn-hover-bg:        var(--theme-color-background-hover,  #d0d0d0);\n\t--pict-modal-btn-primary-bg:      var(--theme-color-brand-primary,     #2563eb);\n\t--pict-modal-btn-primary-fg:      var(--theme-color-text-on-brand,     #ffffff);\n\t--pict-modal-btn-primary-hover-bg:var(--theme-color-brand-primary-hover,#1d4ed8);\n\t--pict-modal-btn-danger-bg:       var(--theme-color-status-error,      #dc2626);\n\t--pict-modal-btn-danger-fg:       var(--theme-color-text-on-brand,     #ffffff);\n\t--pict-modal-btn-danger-hover-bg: var(--theme-color-status-error,      #b91c1c);\n\t--pict-modal-btn-border-radius:   4px;\n\n\t/* Toast */\n\t--pict-modal-toast-bg:            var(--theme-color-background-panel,  #333333);\n\t--pict-modal-toast-fg:            var(--theme-color-text-primary,      #ffffff);\n\t--pict-modal-toast-success-bg:    var(--theme-color-status-success,    #16a34a);\n\t--pict-modal-toast-warning-bg:    var(--theme-color-status-warning,    #d97706);\n\t--pict-modal-toast-error-bg:      var(--theme-color-status-error,      #dc2626);\n\t--pict-modal-toast-info-bg:       var(--theme-color-status-info,       #2563eb);\n\t--pict-modal-toast-border-radius: 6px;\n\t--pict-modal-toast-shadow:        0 2px 12px rgba(0, 0, 0, 0.15);\n\n\t/* Tooltip */\n\t--pict-modal-tooltip-bg:          var(--theme-color-background-tertiary,#1a1a1a);\n\t--pict-modal-tooltip-fg:          var(--theme-color-text-primary,      #ffffff);\n\t--pict-modal-tooltip-border-radius:4px;\n\t--pict-modal-tooltip-shadow:      0 2px 8px rgba(0, 0, 0, 0.15);\n\n\t/* Dropdown */\n\t--pict-modal-dropdown-bg:                 var(--theme-color-background-panel,  #ffffff);\n\t--pict-modal-dropdown-fg:                 var(--theme-color-text-primary,      #1a1a1a);\n\t--pict-modal-dropdown-border:             var(--theme-color-border-default,    #e0e0e0);\n\t--pict-modal-dropdown-border-radius:      6px;\n\t--pict-modal-dropdown-shadow:             0 6px 18px rgba(0, 0, 0, 0.18);\n\t--pict-modal-dropdown-item-hover-bg:      var(--theme-color-background-hover,  rgba(37, 99, 235, 0.10));\n\t--pict-modal-dropdown-item-hover-fg:      var(--theme-color-text-primary,      #1a1a1a);\n\t--pict-modal-dropdown-item-disabled-fg:   var(--theme-color-text-muted,        #9aa0a6);\n\t--pict-modal-dropdown-separator:          var(--theme-color-border-light,      #e8e8e8);\n\t--pict-modal-dropdown-header-fg:          var(--theme-color-text-secondary,    #6b7280);\n\t--pict-modal-dropdown-danger-fg:          var(--theme-color-status-error,      #dc2626);\n\t--pict-modal-dropdown-primary-fg:         var(--theme-color-brand-primary,     #2563eb);\n\n\t/* Typography */\n\t--pict-modal-font-family:         var(--theme-typography-family-sans,  system-ui, -apple-system, sans-serif);\n\t--pict-modal-font-size:           14px;\n\t--pict-modal-title-font-size:     16px;\n\n\t/* Animation */\n\t--pict-modal-transition-duration: 200ms;\n}\n\n/* Overlay */\n.pict-modal-overlay\n{\n\tposition: fixed;\n\ttop: 0;\n\tleft: 0;\n\twidth: 100%;\n\theight: 100%;\n\tz-index: 1000;\n\tbackground: var(--pict-modal-overlay-bg);\n\topacity: 0;\n\ttransition: opacity var(--pict-modal-transition-duration) ease;\n}\n\n.pict-modal-overlay.pict-modal-visible\n{\n\topacity: 1;\n}\n\n/* Dialog */\n.pict-modal-dialog\n{\n\tposition: fixed;\n\tz-index: 1010;\n\ttop: 50%;\n\tleft: 50%;\n\ttransform: translate(-50%, -50%) translateY(-20px);\n\topacity: 0;\n\ttransition: opacity var(--pict-modal-transition-duration) ease,\n\t            transform var(--pict-modal-transition-duration) ease;\n\n\tmax-width: 90vw;\n\tmax-height: 90vh;\n\tdisplay: flex;\n\tflex-direction: column;\n\n\tbackground: var(--pict-modal-bg);\n\tcolor: var(--pict-modal-fg);\n\tborder: 1px solid var(--pict-modal-border);\n\tborder-radius: var(--pict-modal-border-radius);\n\tbox-shadow: var(--pict-modal-shadow);\n\tfont-family: var(--pict-modal-font-family);\n\tfont-size: var(--pict-modal-font-size);\n}\n\n.pict-modal-dialog.pict-modal-visible\n{\n\topacity: 1;\n\ttransform: translate(-50%, -50%) translateY(0);\n}\n\n/* Unbounded modifier \u2014 lets callers opt out of the 90vh/90vw viewport cap.\n   Use with caution: content taller than the viewport will push buttons\n   below the fold. */\n.pict-modal-dialog.pict-modal-dialog--unbounded\n{\n\tmax-height: none;\n\tmax-width: none;\n}\n\n.pict-modal-dialog-header\n{\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tpadding: 12px 16px;\n\tbackground: var(--pict-modal-header-bg);\n\tcolor: var(--pict-modal-header-fg);\n\tborder-bottom: 1px solid var(--pict-modal-header-border);\n\tborder-radius: var(--pict-modal-border-radius) var(--pict-modal-border-radius) 0 0;\n}\n\n.pict-modal-dialog-title\n{\n\tfont-size: var(--pict-modal-title-font-size);\n\tfont-weight: 600;\n}\n\n.pict-modal-dialog-close\n{\n\tbackground: none;\n\tborder: none;\n\tfont-size: 20px;\n\tcursor: pointer;\n\tcolor: var(--pict-modal-fg);\n\tpadding: 0 4px;\n\tline-height: 1;\n\topacity: 0.6;\n}\n\n.pict-modal-dialog-close:hover\n{\n\topacity: 1;\n}\n\n.pict-modal-dialog-body\n{\n\tpadding: 16px;\n\toverflow-y: auto;\n\tflex: 1;\n}\n\n.pict-modal-dialog-footer\n{\n\tdisplay: flex;\n\tjustify-content: flex-end;\n\tgap: 8px;\n\tpadding: 12px 16px;\n\tborder-top: 1px solid var(--pict-modal-border);\n}\n\n/* Buttons */\n.pict-modal-btn\n{\n\tpadding: 8px 16px;\n\tborder: none;\n\tborder-radius: var(--pict-modal-btn-border-radius);\n\tfont-family: var(--pict-modal-font-family);\n\tfont-size: var(--pict-modal-font-size);\n\tcursor: pointer;\n\tbackground: var(--pict-modal-btn-bg);\n\tcolor: var(--pict-modal-btn-fg);\n\ttransition: background var(--pict-modal-transition-duration) ease;\n}\n\n.pict-modal-btn:hover\n{\n\tbackground: var(--pict-modal-btn-hover-bg);\n}\n\n.pict-modal-btn:disabled\n{\n\topacity: 0.5;\n\tcursor: not-allowed;\n}\n\n.pict-modal-btn--primary\n{\n\tbackground: var(--pict-modal-btn-primary-bg);\n\tcolor: var(--pict-modal-btn-primary-fg);\n}\n\n.pict-modal-btn--primary:hover\n{\n\tbackground: var(--pict-modal-btn-primary-hover-bg);\n}\n\n.pict-modal-btn--danger\n{\n\tbackground: var(--pict-modal-btn-danger-bg);\n\tcolor: var(--pict-modal-btn-danger-fg);\n}\n\n.pict-modal-btn--danger:hover\n{\n\tbackground: var(--pict-modal-btn-danger-hover-bg);\n}\n\n/* Double confirm input */\n.pict-modal-confirm-input\n{\n\twidth: 100%;\n\tpadding: 8px 12px;\n\tmargin-top: 12px;\n\tborder: 1px solid var(--pict-modal-border);\n\tborder-radius: var(--pict-modal-btn-border-radius);\n\tfont-family: var(--pict-modal-font-family);\n\tfont-size: var(--pict-modal-font-size);\n\tbox-sizing: border-box;\n}\n\n.pict-modal-confirm-input:focus\n{\n\toutline: 2px solid var(--pict-modal-btn-primary-bg);\n\toutline-offset: -1px;\n}\n\n.pict-modal-confirm-prompt\n{\n\tmargin-top: 12px;\n\tfont-size: 13px;\n\tcolor: var(--pict-modal-fg);\n\topacity: 0.7;\n}\n\n/* Toast container */\n.pict-modal-toast-container\n{\n\tposition: fixed;\n\tz-index: 1030;\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 8px;\n\tpointer-events: none;\n\tmax-width: 400px;\n}\n\n.pict-modal-toast-container--top-right\n{\n\ttop: 16px;\n\tright: 16px;\n}\n\n.pict-modal-toast-container--top-left\n{\n\ttop: 16px;\n\tleft: 16px;\n}\n\n.pict-modal-toast-container--bottom-right\n{\n\tbottom: 16px;\n\tright: 16px;\n}\n\n.pict-modal-toast-container--bottom-left\n{\n\tbottom: 16px;\n\tleft: 16px;\n}\n\n.pict-modal-toast-container--top-center\n{\n\ttop: 16px;\n\tleft: 50%;\n\ttransform: translateX(-50%);\n}\n\n.pict-modal-toast-container--bottom-center\n{\n\tbottom: 16px;\n\tleft: 50%;\n\ttransform: translateX(-50%);\n}\n\n/* Toast */\n.pict-modal-toast\n{\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 10px;\n\tpadding: 12px 16px;\n\tborder-radius: var(--pict-modal-toast-border-radius);\n\tbox-shadow: var(--pict-modal-toast-shadow);\n\tfont-family: var(--pict-modal-font-family);\n\tfont-size: var(--pict-modal-font-size);\n\tbackground: var(--pict-modal-toast-bg);\n\tcolor: var(--pict-modal-toast-fg);\n\tpointer-events: auto;\n\topacity: 0;\n\ttransform: translateX(100%);\n\ttransition: opacity var(--pict-modal-transition-duration) ease,\n\t            transform var(--pict-modal-transition-duration) ease;\n}\n\n.pict-modal-toast.pict-modal-visible\n{\n\topacity: 1;\n\ttransform: translateX(0);\n}\n\n.pict-modal-toast.pict-modal-toast-exit\n{\n\topacity: 0;\n\ttransform: translateX(100%);\n}\n\n.pict-modal-toast--info\n{\n\tbackground: var(--pict-modal-toast-info-bg);\n}\n\n.pict-modal-toast--success\n{\n\tbackground: var(--pict-modal-toast-success-bg);\n}\n\n.pict-modal-toast--warning\n{\n\tbackground: var(--pict-modal-toast-warning-bg);\n}\n\n.pict-modal-toast--error\n{\n\tbackground: var(--pict-modal-toast-error-bg);\n}\n\n.pict-modal-toast-message\n{\n\tflex: 1;\n}\n\n.pict-modal-toast-dismiss\n{\n\tbackground: none;\n\tborder: none;\n\tcolor: inherit;\n\tfont-size: 18px;\n\tcursor: pointer;\n\tpadding: 0 2px;\n\tline-height: 1;\n\topacity: 0.7;\n}\n\n.pict-modal-toast-dismiss:hover\n{\n\topacity: 1;\n}\n\n/* Tooltip */\n.pict-modal-tooltip\n{\n\tposition: fixed;\n\tz-index: 1020;\n\tpadding: 6px 10px;\n\tborder-radius: var(--pict-modal-tooltip-border-radius);\n\tbox-shadow: var(--pict-modal-tooltip-shadow);\n\tbackground: var(--pict-modal-tooltip-bg);\n\tcolor: var(--pict-modal-tooltip-fg);\n\tfont-family: var(--pict-modal-font-family);\n\tfont-size: 13px;\n\tpointer-events: none;\n\topacity: 0;\n\ttransition: opacity var(--pict-modal-transition-duration) ease;\n\twhite-space: normal;\n\tword-wrap: break-word;\n}\n\n.pict-modal-tooltip.pict-modal-tooltip-interactive\n{\n\tpointer-events: auto;\n}\n\n.pict-modal-tooltip.pict-modal-visible\n{\n\topacity: 1;\n}\n\n.pict-modal-tooltip-arrow\n{\n\tposition: absolute;\n\twidth: 8px;\n\theight: 8px;\n\tbackground: var(--pict-modal-tooltip-bg);\n\ttransform: rotate(45deg);\n}\n\n.pict-modal-tooltip--top .pict-modal-tooltip-arrow\n{\n\tbottom: -4px;\n\tleft: 50%;\n\tmargin-left: -4px;\n}\n\n.pict-modal-tooltip--bottom .pict-modal-tooltip-arrow\n{\n\ttop: -4px;\n\tleft: 50%;\n\tmargin-left: -4px;\n}\n\n.pict-modal-tooltip--left .pict-modal-tooltip-arrow\n{\n\tright: -4px;\n\ttop: 50%;\n\tmargin-top: -4px;\n}\n\n.pict-modal-tooltip--right .pict-modal-tooltip-arrow\n{\n\tleft: -4px;\n\ttop: 50%;\n\tmargin-top: -4px;\n}\n\n/* \u2500\u2500 Dropdown \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   Anchor-positioned menu (no overlay). Used for nav menus and\n   \"split button\" addenda \u2014 see Pict-Modal-Dropdown.js.\n*/\n.pict-modal-dropdown\n{\n\tposition: fixed;\n\tz-index: 1025;\n\tmin-width: 160px;\n\tmax-width: 360px;\n\tmax-height: 60vh;\n\toverflow-y: auto;\n\tbackground: var(--pict-modal-dropdown-bg);\n\tcolor: var(--pict-modal-dropdown-fg);\n\tborder: 1px solid var(--pict-modal-dropdown-border);\n\tborder-radius: var(--pict-modal-dropdown-border-radius);\n\tbox-shadow: var(--pict-modal-dropdown-shadow);\n\tfont-family: var(--pict-modal-font-family);\n\tfont-size: var(--pict-modal-font-size);\n\tpadding: 4px 0;\n\topacity: 0;\n\ttransform: translateY(-4px);\n\ttransition: opacity var(--pict-modal-transition-duration) ease,\n\t            transform var(--pict-modal-transition-duration) ease;\n}\n\n.pict-modal-dropdown.pict-modal-dropdown--above { transform: translateY(4px); }\n\n.pict-modal-dropdown.pict-modal-visible\n{\n\topacity: 1;\n\ttransform: translateY(0);\n}\n\n.pict-modal-dropdown-item\n{\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 8px;\n\tpadding: 7px 14px;\n\tcursor: pointer;\n\tuser-select: none;\n\tcolor: inherit;\n\toutline: none;\n}\n\n.pict-modal-dropdown-item:hover,\n.pict-modal-dropdown-item:focus\n{\n\tbackground: var(--pict-modal-dropdown-item-hover-bg);\n\tcolor: var(--pict-modal-dropdown-item-hover-fg);\n}\n\n.pict-modal-dropdown-item--disabled\n{\n\tcursor: not-allowed;\n\tcolor: var(--pict-modal-dropdown-item-disabled-fg);\n}\n\n.pict-modal-dropdown-item--disabled:hover,\n.pict-modal-dropdown-item--disabled:focus\n{\n\tbackground: transparent;\n\tcolor: var(--pict-modal-dropdown-item-disabled-fg);\n}\n\n.pict-modal-dropdown-item--primary { color: var(--pict-modal-dropdown-primary-fg); }\n.pict-modal-dropdown-item--danger  { color: var(--pict-modal-dropdown-danger-fg); }\n\n.pict-modal-dropdown-item-icon\n{\n\tflex: 0 0 auto;\n\tdisplay: inline-flex;\n\talign-items: center;\n\tjustify-content: center;\n\twidth: 16px;\n\theight: 16px;\n}\n\n.pict-modal-dropdown-item-icon svg { width: 100%; height: 100%; display: block; }\n\n.pict-modal-dropdown-item-label { flex: 1 1 auto; min-width: 0; }\n\n.pict-modal-dropdown-item-hint\n{\n\tflex: 0 0 auto;\n\tfont-size: 11px;\n\topacity: 0.6;\n\tmargin-left: 12px;\n}\n\n.pict-modal-dropdown-separator\n{\n\theight: 1px;\n\tbackground: var(--pict-modal-dropdown-separator);\n\tmargin: 4px 0;\n}\n\n.pict-modal-dropdown-header\n{\n\tpadding: 6px 14px 2px;\n\tfont-size: 11px;\n\tfont-weight: 600;\n\ttext-transform: uppercase;\n\tletter-spacing: 0.04em;\n\tcolor: var(--pict-modal-dropdown-header-fg);\n}\n\n/* \u2500\u2500 Resizable / Collapsible Panels \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.pict-panel\n{\n\tposition: relative;\n\ttransition: width 0.2s ease;\n\tflex-shrink: 0;\n\toverflow: visible;\n}\n.pict-panel-collapsed\n{\n\twidth: 0 !important;\n\tmin-width: 0 !important;\n\toverflow: visible;\n}\n.pict-panel-collapsed > *:not(.pict-panel-edge)\n{\n\tdisplay: none;\n}\n\n/* Edge container \u2014 zero-width flex sibling of the panel.\n   Sits next to the panel in the flex layout; children\n   use absolute positioning to overlap the panel boundary. */\n.pict-panel-edge\n{\n\tposition: relative;\n\twidth: 0;\n\tflex-shrink: 0;\n\tz-index: 50;\n\toverflow: visible;\n}\n\n/* Resize handle \u2014 thin strip on the panel boundary */\n.pict-panel-resize\n{\n\tposition: absolute;\n\ttop: 0;\n\tbottom: 0;\n\twidth: 4px;\n\tcursor: col-resize;\n\tbackground: transparent;\n\ttransition: background 0.15s, width 0.15s;\n}\n.pict-panel-edge-right .pict-panel-resize\n{\n\tright: 0;\n\tborder-right: 1px solid var(--pict-panel-border, #DDD6CA);\n}\n.pict-panel-edge-left .pict-panel-resize\n{\n\tleft: 0;\n\tborder-left: 1px solid var(--pict-panel-border, #DDD6CA);\n}\n.pict-panel-resize:hover,\n.pict-panel-edge:hover .pict-panel-resize\n{\n\twidth: 5px;\n\tbackground: var(--pict-panel-accent, #2E7D74);\n\topacity: 0.5;\n}\n.pict-panel-resize.dragging\n{\n\twidth: 5px;\n\tbackground: var(--pict-panel-accent, #2E7D74);\n\topacity: 1;\n\ttransition: none;\n}\n.pict-panel-edge-collapsed .pict-panel-resize\n{\n\tdisplay: none;\n}\n\n/* Collapse tab \u2014 tucked sliver at rest, slides out on hover */\n.pict-panel-tab\n{\n\tposition: absolute;\n\ttop: 8px;\n\twidth: 8px;\n\theight: 24px;\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\toverflow: hidden;\n\tbackground: var(--pict-panel-border, #DDD6CA);\n\tborder: 1px solid var(--pict-panel-border, #DDD6CA);\n\tcursor: pointer;\n\tcolor: var(--pict-panel-fg, #8A7F72);\n\tfont-size: 10px;\n\tline-height: 1;\n\topacity: 0.5;\n\ttransition: opacity 0.25s, width 0.2s ease, height 0.2s ease, left 0.2s ease, right 0.2s ease, background 0.2s;\n\tz-index: 51;\n}\n.pict-panel-edge:hover .pict-panel-tab,\n.pict-panel-tab:hover\n{\n\twidth: 20px;\n\theight: 32px;\n\topacity: 1;\n\toverflow: visible;\n\tbackground: var(--pict-panel-bg, #FAF8F4);\n}\n/* Right panel: tab to the left of the edge */\n.pict-panel-edge-right .pict-panel-tab\n{\n\tright: 0;\n\tborder-right: none;\n\tborder-radius: 4px 0 0 4px;\n}\n.pict-panel-edge-right:hover .pict-panel-tab,\n.pict-panel-edge-right .pict-panel-tab:hover\n{\n\tright: 0;\n}\n/* Left panel: tab to the right of the edge */\n.pict-panel-edge-left .pict-panel-tab\n{\n\tleft: 0;\n\tborder-left: none;\n\tborder-radius: 0 4px 4px 0;\n}\n.pict-panel-edge-left:hover .pict-panel-tab,\n.pict-panel-edge-left .pict-panel-tab:hover\n{\n\tleft: 0;\n}\n/* When collapsed \u2014 more visible */\n.pict-panel-edge-collapsed .pict-panel-tab\n{\n\twidth: 10px;\n\theight: 28px;\n\topacity: 0.6;\n}\n.pict-panel-edge-collapsed .pict-panel-tab:hover,\n.pict-panel-edge-collapsed:hover .pict-panel-tab\n{\n\twidth: 20px;\n\theight: 32px;\n\topacity: 1;\n\toverflow: visible;\n\tbackground: var(--pict-panel-bg, #FAF8F4);\n}\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n *  Pict-Modal-Shell \u2014 viewport-managing layout for top / right /\n *  bottom / left panels around a center.\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.pict-modal-shell-host { display: block; height: 100%; min-height: 0; }\n.pict-modal-shell\n{\n\tdisplay: flex;\n\tflex-direction: column;\n\twidth: 100%;\n\theight: 100%;\n\tmin-height: 0;\n\tposition: relative;\n\tcolor: var(--pict-modal-fg, var(--theme-color-text-primary, #1a1a1a));\n\tbackground: var(--theme-color-background-primary, transparent);\n}\n.pict-modal-shell-row { display: flex; min-width: 0; min-height: 0; }\n/* \"First added = at the edge\" convention is held by reversing the\n   flex-direction on the bottom row + right side. That way, for ALL\n   four sides, calling addPanel() N times stacks panel #1 against\n   the viewport edge, panel #2 just inside it, panel #3 further in,\n   and so on. Without these reverses, top + left worked that way but\n   bottom + right inverted (first-added at content side, last-added\n   at edge), which surprised callers. */\n.pict-modal-shell-row-top    { flex: 0 0 auto; flex-direction: column; }\n.pict-modal-shell-row-bottom { flex: 0 0 auto; flex-direction: column-reverse; }\n.pict-modal-shell-row-middle\n{\n\tflex: 1 1 0;\n\tflex-direction: row;\n\tmin-height: 0;\n\tposition: relative;\n}\n.pict-modal-shell-side\n{\n\tdisplay: flex;\n\tflex: 0 0 auto;\n\tmin-height: 0;\n}\n.pict-modal-shell-side-left  { flex-direction: row; }\n.pict-modal-shell-side-right { flex-direction: row-reverse; }\n.pict-modal-shell-center\n{\n\tflex: 1 1 0;\n\tmin-width: 0;\n\tmin-height: 0;\n\toverflow: auto;\n\tposition: relative;\n}\n.pict-modal-shell-center-content\n{\n\tmin-height: 100%;\n}\n/* Center column gains this class when at least one Scope:'center'\n   panel is added.  The center stops scrolling internally \u2014 that job\n   moves to the content destination \u2014 and switches to a vertical flex\n   so the destination and any inner panels stack cleanly. */\n.pict-modal-shell-center.pict-modal-shell-center-with-inner-panel\n{\n\tdisplay: flex;\n\tflex-direction: column;\n\toverflow: hidden;\n}\n.pict-modal-shell-center.pict-modal-shell-center-with-inner-panel > .pict-modal-shell-center-content\n{\n\tflex: 1 1 0;\n\tmin-height: 0;\n\toverflow: auto;\n}\n.pict-modal-shell-center.pict-modal-shell-center-with-inner-panel > .pict-modal-shell-panel\n{\n\tflex: 0 0 auto;\n\twidth: 100%;\n}\n\n/* Panels \u2014 base */\n.pict-modal-shell-panel\n{\n\t/* How far the collapse-tab's panel-bg \"merge bar\" extends INTO\n\t   the panel past the tab's geometric edge. Painted via box-shadow\n\t   on the tab (no DOM impact), it masks any 1px theme border on an\n\t   inner element, content padding offset, or resize-handle hover\n\t   bleed in the strip between the tab's panel-facing edge and the\n\t   first real pixel of panel content. Consumers can bump this for\n\t   themes with thicker (2+px) inner borders. */\n\t--pict-modal-collapse-tab-merge: 2px;\n\tposition: relative;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbox-sizing: border-box;\n\tbackground: var(--pict-modal-bg, var(--theme-color-background-panel, #ffffff));\n\tcolor: inherit;\n\tmin-width: 0;\n\tmin-height: 0;\n\ttransition: width 140ms ease, height 140ms ease;\n}\n.pict-modal-shell-panel-content\n{\n\tflex: 1 1 auto;\n\tmin-width: 0;\n\tmin-height: 0;\n\toverflow: auto;\n}\n/* Fixed-mode panels are pure chrome (topbars, status rows). Their\n   content should fit the configured Size exactly \u2014 never scroll. The\n   1px border that .pict-modal-shell-panel-mode-fixed adds on the\n   inner edge shaves 1px off the content's available height, which\n   then triggers a sliver-scrollbar on any inner widget with\n   min-height matching the panel Size. overflow:hidden here suppresses\n   that without affecting resizable/collapsible panels (sidebars,\n   drawers) where scrollable content is the whole point. */\n.pict-modal-shell-panel-mode-fixed > .pict-modal-shell-panel-content\n{\n\toverflow: hidden;\n}\n.pict-modal-shell-panel-content-inner\n{\n\tmin-height: 100%;\n}\n/* Panel boundary \u2014 fixed-mode panels get a hairline border for explicit\n   demarcation. Collapsible / resizable panels DROP the boundary border\n   (background contrast separates them from the center anyway) so the\n   collapse tab can pull out cleanly without a hairline cutting across\n   it. The host stylesheet still gets full control via the panel's own\n   background. */\n.pict-modal-shell-panel-mode-fixed.pict-modal-shell-panel-top    { border-bottom: 1px solid var(--pict-modal-border, var(--theme-color-border-default, #e0e0e0)); }\n.pict-modal-shell-panel-mode-fixed.pict-modal-shell-panel-bottom { border-top:    1px solid var(--pict-modal-border, var(--theme-color-border-default, #e0e0e0)); }\n.pict-modal-shell-panel-mode-fixed.pict-modal-shell-panel-left   { border-right:  1px solid var(--pict-modal-border, var(--theme-color-border-default, #e0e0e0)); }\n.pict-modal-shell-panel-mode-fixed.pict-modal-shell-panel-right  { border-left:   1px solid var(--pict-modal-border, var(--theme-color-border-default, #e0e0e0)); }\n\n/* Resize handle \u2014 absolute on the inner edge of each panel. */\n.pict-modal-shell-panel-resize-handle\n{\n\tposition: absolute;\n\tbackground: transparent;\n\tz-index: 5;\n\ttransition: background-color 120ms ease;\n}\n/* Resize handle hover \u2014 use the active brand's mode-aware primary\n   color (set by pict-section-theme's Brand provider as\n   --brand-color-primary-mode) so the resize affordance picks up the\n   app's wordmark color. Falls back to the theme's brand-primary\n   token if no brand is registered. */\n.pict-modal-shell-panel-resize-handle:hover\n{\n\tbackground: var(--brand-color-primary-mode, var(--theme-color-brand-primary, #2563eb));\n\topacity: 0.4;\n}\n.pict-modal-shell-panel-left   .pict-modal-shell-panel-resize-handle { right: -3px; top: 0; bottom: 0; width: 6px; cursor: col-resize; }\n.pict-modal-shell-panel-right  .pict-modal-shell-panel-resize-handle { left:  -3px; top: 0; bottom: 0; width: 6px; cursor: col-resize; }\n.pict-modal-shell-panel-top    .pict-modal-shell-panel-resize-handle { bottom:-3px; left: 0; right: 0; height: 6px; cursor: row-resize; }\n.pict-modal-shell-panel-bottom .pict-modal-shell-panel-resize-handle { top:   -3px; left: 0; right: 0; height: 6px; cursor: row-resize; }\n\n/* Collapse tab \u2014 slim sliver flush on the panel's OUTER boundary\n   (where the resize handle sits), modelled on retold-content-system's\n   sidebar tab. At rest it's a 6\xD728 px sliver; hover expands to\n   18\xD736 px without overlapping the panel's own content. The tab is\n   positioned with its center on the boundary so half pokes into the\n   adjacent area \u2014 the only place we can safely take over without\n   stepping on app UI inside the panel. Title text only renders in the\n   collapsed state where there's room for it. */\n.pict-modal-shell-panel-collapse-tab\n{\n\tposition: absolute;\n\tdisplay: flex;            /* not inline-flex \u2014 avoids baseline alignment quirks */\n\talign-items: center;\n\tjustify-content: center;\n\toverflow: hidden;\n\tborder: 1px solid var(--pict-modal-border, var(--theme-color-border-default, #d0d7de));\n\tbackground: var(--pict-modal-bg, var(--theme-color-background-panel, #ffffff));\n\tcolor: var(--theme-color-text-muted, #6b7280);\n\tfont: inherit;\n\tfont-size: 10px;\n\tletter-spacing: 0.4px;\n\ttext-transform: uppercase;\n\tcursor: pointer;\n\tz-index: 50;\n\topacity: 0.55;\n\tpadding: 0;\n\tbox-sizing: border-box;\n\tline-height: 0;          /* keep child boxes from inflating around the rotated chevron */\n\t/* Geometry (width/height/right/left) is intentionally NOT animated.\n\t   Sliding the tab's outer edge inward on hover-out makes it look like\n\t   the tab is \"sliding into\" the panel content \u2014 weird visual.\n\t   Snapping the size change instead, and animating only the appearance\n\t   (opacity/color/shadow), gives a clean fade-in/out with no boundary\n\t   weirdness. */\n\ttransition: opacity 160ms ease,\n\t            background-color 160ms ease, color 160ms ease,\n\t            border-color 160ms ease, box-shadow 160ms ease;\n}\n/* Hover state pulls accent color from the active brand (mode-aware,\n   so it's legible in both light + dark) with theme brand-primary as\n   fallback. The whole point of brand colors is that they show up\n   across the app's chrome. */\n.pict-modal-shell-panel-collapse-tab:hover,\n.pict-modal-shell-panel:hover > .pict-modal-shell-panel-collapse-tab\n{\n\topacity: 1;\n\tcolor:        var(--brand-color-primary-mode, var(--theme-color-brand-primary, #2563eb));\n\tborder-color: var(--brand-color-primary-mode, var(--theme-color-brand-primary, #2563eb));\n}\n/* Drop shadow casts AWAY from the panel so the tab feels pulled out\n   (extension of the panel) rather than floating across the boundary.\n   The tab itself is now positioned fully OUTSIDE the panel boundary\n   (see the per-side rules below), so we don't need a merge-bar shadow\n   to mask any in-panel overlap \u2014 only the drop shadow remains. */\n.pict-modal-shell-panel-left:hover    > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-left    > .pict-modal-shell-panel-collapse-tab:hover\n{\n\tbox-shadow: 3px 0 6px -2px rgba(0, 0, 0, 0.18);\n}\n.pict-modal-shell-panel-right:hover   > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-right   > .pict-modal-shell-panel-collapse-tab:hover\n{\n\tbox-shadow: -3px 0 6px -2px rgba(0, 0, 0, 0.18);\n}\n.pict-modal-shell-panel-top:hover     > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-top     > .pict-modal-shell-panel-collapse-tab:hover\n{\n\tbox-shadow: 0 3px 6px -2px rgba(0, 0, 0, 0.18);\n}\n.pict-modal-shell-panel-bottom:hover  > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-bottom  > .pict-modal-shell-panel-collapse-tab:hover\n{\n\tbox-shadow: 0 -3px 6px -2px rgba(0, 0, 0, 0.18);\n}\n\n/* Per-side base positioning \u2014 the tab lives entirely OUTSIDE the\n   panel's outer boundary.  Its panel-facing edge touches the boundary\n   (offset = -tabThickness) and the rest of the tab pokes out into the\n   adjacent area (center / sibling panel).  Border on the panel-facing\n   edge is dropped so the tab looks attached to the panel rather than\n   floating beside it.\n   Why fully-outside?  Earlier iterations had the tab straddling the\n   boundary (1px inside + 4px outside) with a panel-bg-colored merge-bar\n   masking the in-panel half \u2014 that worked geometrically but visually\n   read as \"tab pinned into the panel,\" and any rendering inside the\n   panel (especially custom borders or hover bleeds) could clip against\n   the in-panel half.  Fully-external positioning eliminates the overlap\n   class of bugs and lets the tab live entirely in the adjacent area\n   where there's no app content to step on. */\n.pict-modal-shell-panel-left  > .pict-modal-shell-panel-collapse-tab\n{\n\tright: -6px; top: 14px; width: 6px; height: 28px;\n\tborder-radius: 0 4px 4px 0;\n\tborder-left: 0;\n}\n.pict-modal-shell-panel-right > .pict-modal-shell-panel-collapse-tab\n{\n\tleft:  -6px; top: 14px; width: 6px; height: 28px;\n\tborder-radius: 4px 0 0 4px;\n\tborder-right: 0;\n}\n.pict-modal-shell-panel-top    > .pict-modal-shell-panel-collapse-tab\n{\n\tbottom: -6px; right: 14px; width: 28px; height: 6px;\n\tborder-radius: 0 0 4px 4px;\n\tborder-top: 0;\n}\n.pict-modal-shell-panel-bottom > .pict-modal-shell-panel-collapse-tab\n{\n\ttop:    -6px; right: 14px; width: 28px; height: 6px;\n\tborder-radius: 4px 4px 0 0;\n\tborder-bottom: 0;\n}\n\n/* Hover: tab grows OUTWARD into the adjacent area.  The panel-facing\n   edge stays glued to the boundary (offset = -tabThickness), so the\n   tab still looks attached on hover \u2014 only its outer dimension grows.\n   For side panels the height also grows (28 \u2192 36) downward; for top\n   /bottom panels the width grows (28 \u2192 36) \u2014 see the next block for\n   the perpendicular-axis offsets. */\n.pict-modal-shell-panel-left:hover  > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-left  > .pict-modal-shell-panel-collapse-tab:hover\n{\n\twidth: 18px; height: 36px; right: -18px;\n}\n.pict-modal-shell-panel-right:hover > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-right > .pict-modal-shell-panel-collapse-tab:hover\n{\n\twidth: 18px; height: 36px; left: -18px;\n}\n.pict-modal-shell-panel-top:hover    > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-top    > .pict-modal-shell-panel-collapse-tab:hover\n{\n\twidth: 36px; height: 18px; bottom: -18px;\n}\n.pict-modal-shell-panel-bottom:hover > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-bottom > .pict-modal-shell-panel-collapse-tab:hover\n{\n\twidth: 36px; height: 18px; top: -18px;\n}\n\n.pict-modal-shell-panel-collapse-tab-title { display: none; white-space: nowrap; }\n\n/* Auto-generated chevron glyph inside the tab \u2014 only visible once the\n   tab is wide / tall enough to show it (i.e. hover state, or when the\n   panel is collapsed). Direction follows side + state.\n   Sized 5\xD75 (down from 6) so even with rotation the visual stays\n   well clear of the tab's overflow:hidden bounds at 18\xD736 hover and\n   the 24px collapsed tab strip width. flex-shrink:0 ensures the\n   pseudo never collapses to zero in tight tab dimensions. */\n.pict-modal-shell-panel-collapse-tab::before\n{\n\tcontent: '';\n\tdisplay: block;\n\twidth: 5px; height: 5px;\n\tflex-shrink: 0;\n\topacity: 0;\n\tborder-right: 1.5px solid currentColor;\n\tborder-bottom: 1.5px solid currentColor;\n\ttransform: rotate(135deg);\n\ttransform-origin: center center;\n\ttransition: opacity 160ms ease, transform 160ms ease;\n}\n.pict-modal-shell-panel:hover > .pict-modal-shell-panel-collapse-tab::before,\n.pict-modal-shell-panel-collapse-tab:hover::before,\n.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-collapse-tab::before\n{\n\topacity: 1;\n}\n.pict-modal-shell-panel-right                                       > .pict-modal-shell-panel-collapse-tab::before { transform: rotate(-45deg); }\n.pict-modal-shell-panel-top                                         > .pict-modal-shell-panel-collapse-tab::before { transform: rotate(-135deg); }\n.pict-modal-shell-panel-bottom                                      > .pict-modal-shell-panel-collapse-tab::before { transform: rotate(45deg); }\n.pict-modal-shell-panel-left.pict-modal-shell-panel-collapsed       > .pict-modal-shell-panel-collapse-tab::before { transform: rotate(-45deg); }\n.pict-modal-shell-panel-right.pict-modal-shell-panel-collapsed      > .pict-modal-shell-panel-collapse-tab::before { transform: rotate(135deg); }\n.pict-modal-shell-panel-top.pict-modal-shell-panel-collapsed        > .pict-modal-shell-panel-collapse-tab::before { transform: rotate(45deg); }\n.pict-modal-shell-panel-bottom.pict-modal-shell-panel-collapsed     > .pict-modal-shell-panel-collapse-tab::before { transform: rotate(-135deg); }\n\n/* Collapsed state \u2014 content disappears, only the collapse tab remains. */\n.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-content\n{\n\tdisplay: none;\n}\n.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-resize-handle\n{\n\tdisplay: none;\n}\n.pict-modal-shell-panel-left.pict-modal-shell-panel-collapsed,\n.pict-modal-shell-panel-right.pict-modal-shell-panel-collapsed\n{\n\t/* When collapsed, side panels rotate the title for vertical reading. */\n\toverflow: hidden;\n}\n/* When collapsed: the entire panel becomes the tab strip \u2014 full width\n   for sides, full height for top/bottom \u2014 with the title visible\n   vertically (sides) or horizontally (top/bottom). The little sliver\n   tab on the boundary disappears (we don't need it anymore \u2014 clicking\n   anywhere on the panel toggles it back open). */\n.pict-modal-shell-panel-left.pict-modal-shell-panel-collapsed,\n.pict-modal-shell-panel-right.pict-modal-shell-panel-collapsed,\n.pict-modal-shell-panel-top.pict-modal-shell-panel-collapsed,\n.pict-modal-shell-panel-bottom.pict-modal-shell-panel-collapsed\n{\n\toverflow: hidden;\n}\n.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-collapse-tab\n{\n\t/* Promote the tab to FILL the collapsed panel (not just hug its\n\t   content) so the centered chevron + title group sits in the middle\n\t   of the panel. Without explicit width/height: 100%, the position:\n\t   absolute element shrinks to its natural content size and the\n\t   group ends up flush at the top of the panel \u2014 where the chevron\n\t   gets clipped by the topbar. */\n\tposition: absolute !important;\n\ttop: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important;\n\twidth: 100% !important;\n\theight: 100% !important;\n\tborder: 0;\n\tborder-radius: 0;\n\tbackground: transparent;\n\topacity: 0.85;\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\tgap: 8px;\n\tpadding: 12px 4px;        /* keeps chevron + title clear of edges */\n\tbox-shadow: none;\n\tcolor: var(--theme-color-text-muted, #6b7280);\n\tbox-sizing: border-box;\n\toverflow: hidden;\n}\n.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-collapse-tab:hover\n{\n\tbackground: var(--theme-color-background-hover, var(--pict-modal-bg, #fff));\n\tcolor: var(--brand-color-primary-mode, var(--theme-color-brand-primary, #2563eb));\n\tbox-shadow: none;\n}\n/* Side panels (collapsed): rotate the title for vertical reading. */\n.pict-modal-shell-panel-left.pict-modal-shell-panel-collapsed   > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-right.pict-modal-shell-panel-collapsed  > .pict-modal-shell-panel-collapse-tab\n{\n\twriting-mode: vertical-rl;\n\ttext-orientation: mixed;\n}\n.pict-modal-shell-panel-collapsed .pict-modal-shell-panel-collapse-tab-title\n{\n\tdisplay: inline;\n}\n\n/* Hidden panels \u2014 when Hidden:true is passed to addPanel, the collapsed\n   state has zero footprint: no collapse tab (the tab is never built),\n   the panel root is display:none, and the resize handle vanishes. The\n   only path to the open state is a programmatic expand()/toggle() from\n   somewhere else in the app (e.g. a topbar gear button). When expanded,\n   the panel renders normally \u2014 so resize/drag handles continue to work\n   while the panel is open. */\n.pict-modal-shell-panel-hidden.pict-modal-shell-panel-collapsed\n{\n\tdisplay: none !important;\n}\n\n/* Overlay panels \u2014 float over the middle row instead of taking layout\n   space. The overlay layer is positioned absolutely inside the middle\n   row; individual overlay panels stack with positive z-index. */\n.pict-modal-shell-overlay-layer\n{\n\tposition: absolute;\n\tinset: 0;\n\tpointer-events: none;\n\tz-index: 10;\n}\n.pict-modal-shell-overlay-layer .pict-modal-shell-panel\n{\n\tpointer-events: auto;\n\tposition: absolute;\n\tbox-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);\n}\n.pict-modal-shell-overlay-layer .pict-modal-shell-panel-left   { left:   0; top: 0; bottom: 0; }\n.pict-modal-shell-overlay-layer .pict-modal-shell-panel-right  { right:  0; top: 0; bottom: 0; }\n.pict-modal-shell-overlay-layer .pict-modal-shell-panel-top    { top:    0; left: 0; right: 0; }\n.pict-modal-shell-overlay-layer .pict-modal-shell-panel-bottom { bottom: 0; left: 0; right: 0; }\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   Responsive drawer mode \u2014 .pict-modal-shell-drawer-active toggles\n   onto the middle row when any panel with ResponsiveDrawer crosses\n   below its breakpoint. Flips the row's flex-direction from row to\n   column, stacking side panels above the center and stretching them\n   to full width. Each opted-in panel itself gets the\n   .pict-modal-shell-panel-drawer class so per-panel rules below\n   target only the drawer-mode panels (right + non-drawer panels in\n   the same row are unaffected). The drawer height is read from a\n   per-panel --pict-modal-drawer-height CSS variable (default\n   33vh, set in JS from the DrawerHeight option).\n   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.pict-modal-shell-row-middle.pict-modal-shell-drawer-active\n{\n\tflex-direction: column;\n\t/* The drawer tab lives outside the drawer's bottom edge \u2014 ancestor\n\t   chain MUST allow it to escape clip. */\n\toverflow: visible;\n}\n.pict-modal-shell-row-middle.pict-modal-shell-drawer-active .pict-modal-shell-side\n{\n\t/* Side stacks stretch full-width and lay out their panels as a\n\t   horizontal row of stacked drawers (so two drawers from the same\n\t   side don't end up overlapping). overflow: visible so the\n\t   per-panel tab can extend below the side stack into the workspace. */\n\twidth: 100% !important;\n\tflex-direction: column;\n\toverflow: visible;\n}\n/* The drawer-tagged panel itself: kill the inline width set by\n   _applySize (we override with !important since the inline style has\n   higher specificity than a class selector), then size by height\n   from the CSS variable. Resize handle is hidden in drawer mode\n   because horizontal dragging doesn't translate to vertical sizing\n   and the user already has the collapse tab to dismiss / restore.\n\n   padding-bottom reserves an 18px strip at the bottom of the panel\n   for the tab. The tab sits INSIDE the drawer's footprint \u2014 never\n   below it \u2014 so the workspace header below the drawer is never in\n   the same vertical band as the tab. (Previously the tab hung\n   below the drawer's bottom edge into the workspace's top padding;\n   that made the tab visually compete with the workspace header,\n   even when the tab box-model bounds technically cleared the\n   header.) box-sizing: border-box so the padding eats from the\n   33vh, not adding to it. */\n.pict-modal-shell-panel-drawer\n{\n\twidth: 100% !important;\n\tmax-width: 100% !important;\n\theight: var(--pict-modal-drawer-height, 33vh);\n\ttransition: height 140ms ease;\n\tpadding-bottom: 18px;\n\tbox-sizing: border-box;\n\toverflow: visible !important;\n\t/* Clip the panel bg to its CONTENT area only \u2014 the 18px\n\t   padding-bottom reserve (where the tab lives) becomes\n\t   transparent, so the middle row's primary background shows\n\t   through. Without this the reserve would render with the\n\t   panel's chrome bg, creating a visible \"strip\" between the\n\t   drawer content above and the workspace below \u2014 the tab would\n\t   look like it's sitting on its own miscoloured band rather\n\t   than at the seam between drawer and workspace. */\n\tbackground-clip: content-box;\n}\n.pict-modal-shell-panel-drawer.pict-modal-shell-panel-collapsed\n{\n\t/* Collapsed = \"just the tab strip is visible\". 18px matches the\n\t   panel's tab reserve so the height is consistent across states.\n\t   When this is 0 the tab would have nowhere to render and the\n\t   user couldn't reopen the drawer. */\n\theight: 18px !important;\n\tpadding-bottom: 0 !important;\n\t/* Drop the panel's bg in collapsed state \u2014 without this the 18px\n\t   strip shows the --pict-modal-bg (panel chrome) which doesn't\n\t   match the workspace --theme-color-background-primary below it,\n\t   creating a visible \"drawer band\" around the tab that breaks the\n\t   illusion of the tab belonging to the workspace area. With\n\t   transparent bg the middle row's primary background shows\n\t   through, the strip blends with the workspace, and the tab pill\n\t   reads as a free-floating handle. */\n\tbackground: transparent !important;\n}\n.pict-modal-shell-panel-drawer > .pict-modal-shell-panel-resize-handle\n{\n\tdisplay: none;\n}\n/* The drawer's collapse tab is a horizontal pill protruding from the\n   bottom of the drawer (rather than the inner edge of a side panel).\n   Override the side-panel positioning rules from above so the tab\n   always sits at the drawer's bottom-center seam, in both expanded\n   and collapsed states. The expand-from-zero affordance: when\n   collapsed (height: 0), the tab still hangs below \"where the\n   drawer would be\" \u2014 a small handle the user can click to pull\n   the drawer back down. */\n.pict-modal-shell-panel-drawer > .pict-modal-shell-panel-collapse-tab,\n.pict-modal-shell-panel-drawer.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-collapse-tab\n{\n\tposition: absolute !important;\n\t/* Anchored to the panel's BOTTOM edge \u2014 the tab lives INSIDE the\n\t   drawer's footprint (in the 18px reserve at the bottom), never\n\t   below it into the workspace. This means the workspace below\n\t   the drawer is never sharing a vertical band with the tab, so\n\t   the workspace header doesn't optically compete with it.\n\t   bottom: 4px aligns the tab's top edge exactly with the panel's\n\t   CONTENT-AREA bottom (panel.height \u2212 padding-bottom 18px). With\n\t   border-top: 0 on the tab, the seam between the drawer content\n\t   above and the tab body is invisible \u2014 they share --pict-modal-bg\n\t   and merge into one shape, the tab reading as a labelled\n\t   extension of the drawer hanging downward. Collapsed state\n\t   keeps the smaller offset (overridden below) because its panel\n\t   has no padding-bottom, so the math doesn't apply. */\n\ttop: auto !important;\n\tbottom: 4px !important;\n\tleft: 50% !important;\n\tright: auto !important;\n\ttransform: translate(-50%, 0) !important;\n\twidth: 64px !important;\n\theight: 14px !important;\n\t/* CRITICAL: border-box + padding: 0 \u2014 the collapsed-state base\n\t   rule inherits \"padding: 12px 4px\" (so the chevron clears the\n\t   edges of a tab that fills a 24px-wide side strip). In drawer\n\t   mode the tab is a 14px tall pill, NOT a strip-fill, so that\n\t   12px vertical padding would balloon the tab's outer height to\n\t   ~38px and crash into the workspace header text. The chevron\n\t   is centered via flex anyway. */\n\tbox-sizing: border-box !important;\n\tpadding: 0 !important;\n\t/* Rounded BOTTOM corners + no top border \u2014 the tab looks like a\n\t   traditional drawer-handle/tab hanging from above. Its rounded\n\t   bottom curves face the workspace (the \"open downward\" affordance\n\t   for a top drawer). border-top: 0 lets the tab visually merge\n\t   with whatever's directly above it inside the panel (sidebar\n\t   content when expanded, the panel background when collapsed). */\n\tborder-radius: 0 0 8px 8px;\n\tborder: 1px solid var(--pict-modal-border, var(--theme-color-border-default, #cfd5dd));\n\tborder-top: 0;\n\tbackground: var(--pict-modal-bg, var(--theme-color-background-panel, #fff));\n\topacity: 0.95;\n\tz-index: 20;\n\t/* The default side-panel hover-grow values would yank the tab off\n\t   to the wrong spot in drawer mode \u2014 neutralise. */\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n}\n.pict-modal-shell-panel-drawer > .pict-modal-shell-panel-collapse-tab:hover,\n.pict-modal-shell-panel-drawer.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-collapse-tab:hover\n{\n\topacity: 1;\n\twidth: 96px !important;\n\t/* height stays at 14px \u2014 the tab is anchored with bottom, so any\n\t   height growth would push the tab's TOP edge UPWARD past the\n\t   space available above it. In EXPANDED state that crashes into\n\t   the drawer content above; in COLLAPSED state it crashes into\n\t   the topbar's brand stripes. Width-only growth (64 to 96, +50%)\n\t   still gives the \"tab is reaching toward me\" affordance without\n\t   the encroachment. */\n\tcolor: var(--brand-color-primary-mode, var(--theme-color-brand-primary, #2563eb));\n\tborder-color: var(--brand-color-primary-mode, var(--theme-color-brand-primary, #2563eb));\n\tbox-shadow: 0 3px 6px -2px rgba(0, 0, 0, 0.18);\n}\n/* Collapsed-state bottom-offset override. Expanded panels have an\n   18px padding-bottom reserve, and \"bottom: 4px\" anchors the tab's\n   top edge exactly at the content-area boundary (so it merges\n   visually with the drawer above). Collapsed panels have\n   padding-bottom: 0 and a total height of 18px \u2014 \"bottom: 4px\"\n   there would put the tab's top at the panel's actual top edge,\n   crashing the (border-top: 0) tab into the topbar. The smaller\n   \"bottom: 2px\" keeps the 14px tab vertically centered in the 18px\n   strip with 2px margins on either side. */\n.pict-modal-shell-panel-drawer.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-collapse-tab\n{\n\tbottom: 2px !important;\n}\n/* Chevron inside the tab: point UP when expanded (the drawer\n   collapses UP / out of view, so the arrow indicates \"click me to\n   send the drawer up\"), DOWN when collapsed (the drawer expands DOWN\n   into view). Rotations come from the existing top-panel chevron\n   table: rotate(-135deg) \u2192 UP arrow, rotate(45deg) \u2192 DOWN arrow. */\n.pict-modal-shell-panel-drawer > .pict-modal-shell-panel-collapse-tab::before\n{\n\ttransform: rotate(-135deg) !important;\n}\n.pict-modal-shell-panel-drawer.pict-modal-shell-panel-collapsed > .pict-modal-shell-panel-collapse-tab::before\n{\n\ttransform: rotate(45deg) !important;\n}\n/* The collapse tab's existing title-text span is hidden when reduced\n   to a pill \u2014 there's no horizontal room. The chevron alone reads\n   correctly. */\n.pict-modal-shell-panel-drawer > .pict-modal-shell-panel-collapse-tab .pict-modal-shell-panel-collapse-tab-title,\n.pict-modal-shell-panel-drawer > .pict-modal-shell-panel-collapse-tab .pict-modal-shell-panel-collapse-tab-icon\n{\n\tdisplay: none;\n}\n\n/* Drag-active state \u2014 disable text selection + change cursor globally\n   so resize feels solid even when the cursor briefly leaves the handle. */\n.pict-modal-shell-dragging-x, .pict-modal-shell-dragging-y { user-select: none; }\n.pict-modal-shell-dragging-x * { cursor: col-resize !important; }\n.pict-modal-shell-dragging-y * { cursor: row-resize !important; }\n\n/* Per-panel resize-active state \u2014 kills the panel's collapse/expand\n   width/height transition for the duration of a drag. Without this,\n   every pointermove starts a fresh 140 ms transition and the resize\n   visibly lags behind the cursor (\"choppy\"). With it disabled the\n   panel snaps to the new size on the same frame as the pointer, which\n   feels native. */\n.pict-modal-shell-panel-resizing { transition: none !important; }\n.pict-modal-shell-panel-resizing > .pict-modal-shell-panel-resize-handle\n{\n\tbackground: var(--brand-color-primary-mode, var(--theme-color-brand-primary, #2563eb));\n\topacity: 0.5;\n}\n\n/* Panel popup-attention flash \u2014 fires when popup() is called on an\n   already-open panel. Brief brand-colored inset glow so the user sees\n   that their click landed even though the panel didn't change shape.\n   Class is added by the shell, auto-removed after ~700 ms. */\n@keyframes pict-modal-shell-panel-flash\n{\n\t0%   { box-shadow: inset 0 0 0 0 transparent; }\n\t30%  { box-shadow: inset 0 0 0 3px var(--brand-color-primary-mode, var(--theme-color-brand-primary, #2563eb)); }\n\t100% { box-shadow: inset 0 0 0 0 transparent; }\n}\n.pict-modal-shell-panel-flash\n{\n\tanimation: pict-modal-shell-panel-flash 600ms ease-out;\n}\n"
      };
    }, {}],
    12: [function (require, module, exports) {
      const libPictViewClass = require('pict-view');
      const libPictModalOverlay = require('./Pict-Modal-Overlay.js');
      const libPictModalConfirm = require('./Pict-Modal-Confirm.js');
      const libPictModalWindow = require('./Pict-Modal-Window.js');
      const libPictModalToast = require('./Pict-Modal-Toast.js');
      const libPictModalTooltip = require('./Pict-Modal-Tooltip.js');
      const libPictModalPanel = require('./Pict-Modal-Panel.js');
      const libPictModalDropdown = require('./Pict-Modal-Dropdown.js');
      const libPictModalShell = require('./Pict-Modal-Shell.js');
      const _DefaultConfiguration = require('./Pict-Section-Modal-DefaultConfiguration.js');
      class PictSectionModal extends libPictViewClass {
        constructor(pFable, pOptions, pServiceHash) {
          let tmpOptions = Object.assign({}, _DefaultConfiguration, pOptions);
          super(pFable, tmpOptions, pServiceHash);
          this._activeModals = [];
          this._activeTooltips = [];
          this._activeToasts = [];
          this._idCounter = 0;
          this._overlay = new libPictModalOverlay(this);
          this._confirm = new libPictModalConfirm(this);
          this._window = new libPictModalWindow(this);
          this._toast = new libPictModalToast(this);
          this._tooltip = new libPictModalTooltip(this);
          this._panel = new libPictModalPanel(this);
          this._dropdown = new libPictModalDropdown(this);
          this._shell = new libPictModalShell(this);
        }
        onBeforeInitialize() {
          super.onBeforeInitialize();

          // Ensure the root class is on the body for CSS variable scoping
          if (typeof document !== 'undefined' && document.body) {
            if (!document.body.classList.contains('pict-modal-root')) {
              document.body.classList.add('pict-modal-root');
            }
          }
          return super.onBeforeInitialize();
        }

        /**
         * Generate a unique ID for DOM elements.
         *
         * @returns {number}
         */
        _nextId() {
          this._idCounter++;
          return this._idCounter;
        }

        // -- Confirm API --

        /**
         * Show a confirmation dialog.
         *
         * @param {string} pMessage - The confirmation message
         * @param {object} [pOptions] - Options { title, confirmLabel, cancelLabel, dangerous }
         * @returns {Promise<boolean>}
         */
        confirm(pMessage, pOptions) {
          return this._confirm.confirm(pMessage, pOptions);
        }

        /**
         * Show a two-step confirmation dialog.
         *
         * If confirmPhrase is set, the user must type it to enable the confirm button.
         * If no confirmPhrase, the first click changes the button text and the second click confirms.
         *
         * @param {string} pMessage - The confirmation message
         * @param {object} [pOptions] - Options { title, confirmPhrase, phrasePrompt, confirmLabel, cancelLabel }
         * @returns {Promise<boolean>}
         */
        doubleConfirm(pMessage, pOptions) {
          return this._confirm.doubleConfirm(pMessage, pOptions);
        }

        // -- Modal Window API --

        /**
         * Show a custom modal window.
         *
         * @param {object} [pOptions] - Options { title, content, buttons, closeable, width, onOpen, onClose }
         * @returns {Promise<string|null>} Resolves with the clicked button Hash, or null on close
         */
        show(pOptions) {
          return this._window.show(pOptions);
        }

        // -- Tooltip API --

        /**
         * Attach a simple text tooltip to an element.
         *
         * @param {HTMLElement} pElement - Target element
         * @param {string} pText - Tooltip text
         * @param {object} [pOptions] - Options { position, delay, maxWidth }
         * @returns {{ destroy: function }}
         */
        tooltip(pElement, pText, pOptions) {
          return this._tooltip.tooltip(pElement, pText, pOptions);
        }

        /**
         * Attach a rich HTML tooltip to an element.
         *
         * @param {HTMLElement} pElement - Target element
         * @param {string} pHTMLContent - HTML content
         * @param {object} [pOptions] - Options { position, delay, maxWidth, interactive }
         * @returns {{ destroy: function }}
         */
        richTooltip(pElement, pHTMLContent, pOptions) {
          return this._tooltip.richTooltip(pElement, pHTMLContent, pOptions);
        }

        // -- Toast API --

        /**
         * Show a toast notification.
         *
         * @param {string} pMessage - Toast message
         * @param {object} [pOptions] - Options { type, duration, position, dismissible }
         * @returns {{ dismiss: function }}
         */
        toast(pMessage, pOptions) {
          return this._toast.toast(pMessage, pOptions);
        }

        // -- Dropdown API --

        /**
         * Open an anchor-positioned dropdown menu (no backdrop, click-outside
         * dismisses). Useful for nav menus and split-button addenda.
         *
         * @param {HTMLElement|string|object} pAnchor - Element, CSS selector, or
         *   { left, top, width, height } rect for context-menu style anchoring.
         * @param {object} pOptions - { items, align, position, minWidth, maxHeight,
         *   className, closeOnSelect, onSelect, onClose }
         * @returns {Promise<{Hash, Item}|null>} Selection or null on dismiss.
         */
        dropdown(pAnchor, pOptions) {
          return this._dropdown.dropdown(pAnchor, pOptions);
        }

        /**
         * Dismiss any open dropdown.
         */
        dismissDropdowns() {
          this._dropdown.dismissAll();
        }

        // -- Panel API --

        /**
         * Attach resizable/collapsible panel behavior to a DOM element.
         *
         * @param {string} pTargetSelector - CSS selector for the panel element
         * @param {object} [pOptions] - Options { position, width, minWidth, maxWidth, collapsible, collapsed, persist, persistKey, onResize, onToggle }
         * @returns {{ collapse, expand, toggle, setWidth, destroy }} Panel handle
         */
        panel(pTargetSelector, pOptions) {
          return this._panel.create(pTargetSelector, pOptions);
        }

        // -- Shell API --

        /**
         * Get (or create) a layout shell for a viewport. Idempotent.
         *
         * The shell takes ownership of the viewport's contents and manages
         * top / right / bottom / left panel placement plus a center area.
         * See Pict-Modal-Shell.js for full panel-config semantics.
         *
         * @param {string|HTMLElement} pViewport - selector or element of the
         *   container the shell should fill (commonly the app's root div).
         * @param {object} [pOptions]
         * @param {boolean} [pOptions.Persistence=true]   - autosave panel state to localStorage
         * @param {string}  [pOptions.PersistenceKey=null]- override scope (default: hostname)
         * @returns {PictModalShell}
         */
        shell(pViewport, pOptions) {
          return this._shell.shell(pViewport, pOptions);
        }

        // -- Cleanup API --

        /**
         * Dismiss all open modals.
         */
        dismissModals() {
          let tmpModals = this._activeModals.slice();
          for (let i = tmpModals.length - 1; i >= 0; i--) {
            tmpModals[i].dismiss(null);
          }
        }

        /**
         * Dismiss all active tooltips.
         */
        dismissTooltips() {
          this._tooltip.dismissAll();
        }

        /**
         * Dismiss all active toasts.
         */
        dismissToasts() {
          this._toast.dismissAll();
        }

        /**
         * Dismiss everything: modals, tooltips, and toasts.
         */
        dismissAll() {
          this.dismissModals();
          this.dismissTooltips();
          this.dismissToasts();
          this.dismissDropdowns();
        }

        /**
         * Clean up all DOM elements when the view is destroyed.
         */
        /**
         * Destroy all active panels.
         */
        destroyPanels() {
          this._panel.destroyAll();
        }
        destroy() {
          this.dismissAll();
          this.destroyPanels();
          this._overlay.destroy();
          this._toast.destroy();
          if (typeof super.destroy === 'function') {
            return super.destroy();
          }
        }
      }
      module.exports = PictSectionModal;
      module.exports.default_configuration = _DefaultConfiguration;
    }, {
      "./Pict-Modal-Confirm.js": 3,
      "./Pict-Modal-Dropdown.js": 4,
      "./Pict-Modal-Overlay.js": 5,
      "./Pict-Modal-Panel.js": 6,
      "./Pict-Modal-Shell.js": 7,
      "./Pict-Modal-Toast.js": 8,
      "./Pict-Modal-Tooltip.js": 9,
      "./Pict-Modal-Window.js": 10,
      "./Pict-Section-Modal-DefaultConfiguration.js": 11,
      "pict-view": 14
    }],
    13: [function (require, module, exports) {
      module.exports = {
        "name": "pict-view",
        "version": "1.0.68",
        "description": "Pict View Base Class",
        "main": "source/Pict-View.js",
        "scripts": {
          "test": "npx quack test",
          "tests": "npx quack test -g",
          "start": "node source/Pict-View.js",
          "coverage": "npx quack coverage",
          "build": "npx quack build",
          "docker-dev-build": "docker build ./ -f Dockerfile_LUXURYCode -t pict-view-image:local",
          "docker-dev-run": "docker run -it -d --name pict-view-dev -p 30001:8080 -p 38086:8086 -v \"$PWD/.config:/home/coder/.config\"  -v \"$PWD:/home/coder/pict-view\" -u \"$(id -u):$(id -g)\" -e \"DOCKER_USER=$USER\" pict-view-image:local",
          "docker-dev-shell": "docker exec -it pict-view-dev /bin/bash",
          "types": "tsc -p .",
          "lint": "eslint source/**"
        },
        "types": "types/source/Pict-View.d.ts",
        "repository": {
          "type": "git",
          "url": "git+https://github.com/stevenvelozo/pict-view.git"
        },
        "author": "steven velozo <steven@velozo.com>",
        "license": "MIT",
        "bugs": {
          "url": "https://github.com/stevenvelozo/pict-view/issues"
        },
        "homepage": "https://github.com/stevenvelozo/pict-view#readme",
        "devDependencies": {
          "@eslint/js": "^9.39.1",
          "browser-env": "^3.3.0",
          "eslint": "^9.39.1",
          "pict": "^1.0.363",
          "quackage": "^1.0.65",
          "typescript": "^5.9.3"
        },
        "mocha": {
          "diff": true,
          "extension": ["js"],
          "package": "./package.json",
          "reporter": "spec",
          "slow": "75",
          "timeout": "5000",
          "ui": "tdd",
          "watch-files": ["source/**/*.js", "test/**/*.js"],
          "watch-ignore": ["lib/vendor"]
        },
        "dependencies": {
          "fable": "^3.1.67",
          "fable-serviceproviderbase": "^3.0.19"
        }
      };
    }, {}],
    14: [function (require, module, exports) {
      const libFableServiceBase = require('fable-serviceproviderbase');
      const libPackage = require('../package.json');
      const defaultPictViewSettings = {
        DefaultRenderable: false,
        DefaultDestinationAddress: false,
        DefaultTemplateRecordAddress: false,
        ViewIdentifier: false,
        // If this is set to true, when the App initializes this will.
        // After the App initializes, initialize will be called as soon as it's added.
        AutoInitialize: true,
        AutoInitializeOrdinal: 0,
        // If this is set to true, when the App autorenders (on load) this will.
        // After the App initializes, render will be called as soon as it's added.
        AutoRender: true,
        AutoRenderOrdinal: 0,
        AutoSolveWithApp: true,
        AutoSolveOrdinal: 0,
        CSSHash: false,
        CSS: false,
        CSSProvider: false,
        CSSPriority: 500,
        Templates: [],
        DefaultTemplates: [],
        Renderables: [],
        Manifests: {}
      };

      /** @typedef {(error?: Error) => void} ErrorCallback */
      /** @typedef {number | boolean} PictTimestamp */

      /**
       * @typedef {'replace' | 'append' | 'prepend' | 'append_once' | 'virtual-assignment'} RenderMethod
       */
      /**
       * @typedef {Object} Renderable
       *
       * @property {string} RenderableHash - A unique hash for the renderable.
       * @property {string} TemplateHash - The hash of the template to use for rendering this renderable.
       * @property {string} [DefaultTemplateRecordAddress] - The default address for resolving the data record for this renderable.
       * @property {string} [ContentDestinationAddress] - The default address (DOM CSS selector) for rendering the content of this renderable.
       * @property {RenderMethod} [RenderMethod=replace] - The method to use when projecting the renderable to the DOM ('replace', 'append', 'prepend', 'append_once', 'virtual-assignment').
       * @property {string} [TestAddress] - The address to use for testing the renderable.
       * @property {string} [TransactionHash] - The transaction hash for the root renderable.
       * @property {string} [RootRenderableViewHash] - The hash of the root renderable.
       * @property {string} [Content] - The rendered content for this renderable, if applicable.
       */

      /**
       * Represents a view in the Pict ecosystem.
       */
      class PictView extends libFableServiceBase {
        /**
         * @param {any} pFable - The Fable object that this service is attached to.
         * @param {any} [pOptions] - (optional) The options for this service.
         * @param {string} [pServiceHash] - (optional) The hash of the service.
         */
        constructor(pFable, pOptions, pServiceHash) {
          // Intersect default options, parent constructor, service information
          let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultPictViewSettings)), pOptions);
          super(pFable, tmpOptions, pServiceHash);
          //FIXME: add types to fable and ancillaries
          /** @type {any} */
          this.fable;
          /** @type {any} */
          this.options;
          /** @type {String} */
          this.UUID;
          /** @type {String} */
          this.Hash;
          /** @type {any} */
          this.log;
          const tmpHashIsUUID = this.Hash === this.UUID;
          //NOTE: since many places are using the view UUID as the HTML element ID, we prefix it to avoid starting with a number
          this.UUID = "V-".concat(this.UUID);
          if (tmpHashIsUUID) {
            this.Hash = this.UUID;
          }
          if (!this.options.ViewIdentifier) {
            this.options.ViewIdentifier = "AutoViewID-".concat(this.fable.getUUID());
          }
          this.serviceType = 'PictView';
          /** @type {Record<string, any>} */
          this._Package = libPackage;
          // Convenience and consistency naming
          /** @type {import('pict') & { log: any, instantiateServiceProviderWithoutRegistration: (hash: String) => any, instantiateServiceProviderIfNotExists: (hash: string) => any, TransactionTracking: import('pict/types/source/services/Fable-Service-TransactionTracking') }} */
          this.pict = this.fable;
          // Wire in the essential Pict application state
          this.AppData = this.pict.AppData;
          this.Bundle = this.pict.Bundle;

          /** @type {PictTimestamp} */
          this.initializeTimestamp = false;
          /** @type {PictTimestamp} */
          this.lastSolvedTimestamp = false;
          /** @type {PictTimestamp} */
          this.lastRenderedTimestamp = false;
          /** @type {PictTimestamp} */
          this.lastMarshalFromViewTimestamp = false;
          /** @type {PictTimestamp} */
          this.lastMarshalToViewTimestamp = false;
          this.pict.instantiateServiceProviderIfNotExists('TransactionTracking');

          // Load all templates from the array in the options
          // Templates are in the form of {Hash:'Some-Template-Hash',Template:'Template content',Source:'TemplateSource'}
          for (let i = 0; i < this.options.Templates.length; i++) {
            let tmpTemplate = this.options.Templates[i];
            if (!('Hash' in tmpTemplate) || !('Template' in tmpTemplate)) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not load Template ").concat(i, " in the options array."), tmpTemplate);
            } else {
              if (!tmpTemplate.Source) {
                tmpTemplate.Source = "PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " options object.");
              }
              this.pict.TemplateProvider.addTemplate(tmpTemplate.Hash, tmpTemplate.Template, tmpTemplate.Source);
            }
          }

          // Load all default templates from the array in the options
          // Templates are in the form of {Prefix:'',Postfix:'-List-Row',Template:'Template content',Source:'TemplateSourceString'}
          for (let i = 0; i < this.options.DefaultTemplates.length; i++) {
            let tmpDefaultTemplate = this.options.DefaultTemplates[i];
            if (!('Postfix' in tmpDefaultTemplate) || !('Template' in tmpDefaultTemplate)) {
              this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not load Default Template ").concat(i, " in the options array."), tmpDefaultTemplate);
            } else {
              if (!tmpDefaultTemplate.Source) {
                tmpDefaultTemplate.Source = "PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " options object.");
              }
              this.pict.TemplateProvider.addDefaultTemplate(tmpDefaultTemplate.Prefix, tmpDefaultTemplate.Postfix, tmpDefaultTemplate.Template, tmpDefaultTemplate.Source);
            }
          }

          // Load the CSS if it's available
          if (this.options.CSS) {
            let tmpCSSHash = this.options.CSSHash ? this.options.CSSHash : "View-".concat(this.options.ViewIdentifier);
            let tmpCSSProvider = this.options.CSSProvider ? this.options.CSSProvider : tmpCSSHash;
            this.pict.CSSMap.addCSS(tmpCSSHash, this.options.CSS, tmpCSSProvider, this.options.CSSPriority);
          }

          // Load all renderables
          // Renderables are launchable renderable instructions with templates
          // They look as such: {Identifier:'ContentEntry', TemplateHash:'Content-Entry-Section-Main', ContentDestinationAddress:'#ContentSection', RecordAddress:'AppData.Content.DefaultText', ManifestTransformation:'ManyfestHash', ManifestDestinationAddress:'AppData.Content.DataToTransformContent'}
          // The only parts that are necessary are Identifier and Template
          // A developer can then do render('ContentEntry') and it just kinda works.  Or they can override the ContentDestinationAddress
          /** @type {Record<String, Renderable>} */
          this.renderables = {};
          for (let i = 0; i < this.options.Renderables.length; i++) {
            /** @type {Renderable} */
            let tmpRenderable = this.options.Renderables[i];
            this.addRenderable(tmpRenderable);
          }
        }

        /**
         * Adds a renderable to the view.
         *
         * @param {string | Renderable} pRenderableHash - The hash of the renderable, or a renderable object.
         * @param {string} [pTemplateHash] - (optional) The hash of the template for the renderable.
         * @param {string} [pDefaultTemplateRecordAddress] - (optional) The default data address for the template.
         * @param {string} [pDefaultDestinationAddress] - (optional) The default destination address for the renderable.
         * @param {RenderMethod} [pRenderMethod=replace] - (optional) The method to use when rendering the renderable (ex. 'replace').
         */
        addRenderable(pRenderableHash, pTemplateHash, pDefaultTemplateRecordAddress, pDefaultDestinationAddress, pRenderMethod) {
          /** @type {Renderable} */
          let tmpRenderable;
          if (typeof pRenderableHash == 'object') {
            // The developer passed in the renderable as an object.
            // Use theirs instead!
            tmpRenderable = pRenderableHash;
          } else {
            /** @type {RenderMethod} */
            let tmpRenderMethod = typeof pRenderMethod !== 'string' ? pRenderMethod : 'replace';
            tmpRenderable = {
              RenderableHash: pRenderableHash,
              TemplateHash: pTemplateHash,
              DefaultTemplateRecordAddress: pDefaultTemplateRecordAddress,
              ContentDestinationAddress: pDefaultDestinationAddress,
              RenderMethod: tmpRenderMethod
            };
          }
          if (typeof tmpRenderable.RenderableHash != 'string' || typeof tmpRenderable.TemplateHash != 'string') {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not load Renderable; RenderableHash or TemplateHash are invalid."), tmpRenderable);
          } else {
            if (this.pict.LogNoisiness > 0) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " adding renderable [").concat(tmpRenderable.RenderableHash, "] pointed to template ").concat(tmpRenderable.TemplateHash, "."));
            }
            this.renderables[tmpRenderable.RenderableHash] = tmpRenderable;
          }
        }

        /* -------------------------------------------------------------------------- */
        /*                        Code Section: Initialization                        */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before the view is initialized.
         */
        onBeforeInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeInitialize:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before the view is initialized (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onBeforeInitializeAsync(fCallback) {
          this.onBeforeInitialize();
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers when the view is initialized.
         */
        onInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onInitialize:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers when the view is initialized (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onInitializeAsync(fCallback) {
          this.onInitialize();
          return fCallback();
        }

        /**
         * Performs view initialization.
         */
        initialize() {
          if (this.pict.LogControlFlow) {
            this.log.trace("PICT-ControlFlow VIEW [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialize:"));
          }
          if (!this.initializeTimestamp) {
            this.onBeforeInitialize();
            this.onInitialize();
            this.onAfterInitialize();
            this.initializeTimestamp = this.pict.log.getTimeStamp();
            return true;
          } else {
            this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialize called but initialization is already completed.  Aborting."));
            return false;
          }
        }

        /**
         * Performs view initialization (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        initializeAsync(fCallback) {
          if (this.pict.LogControlFlow) {
            this.log.trace("PICT-ControlFlow VIEW [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initializeAsync:"));
          }
          if (!this.initializeTimestamp) {
            let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');
            if (this.pict.LogNoisiness > 0) {
              this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " beginning initialization..."));
            }
            tmpAnticipate.anticipate(this.onBeforeInitializeAsync.bind(this));
            tmpAnticipate.anticipate(this.onInitializeAsync.bind(this));
            tmpAnticipate.anticipate(this.onAfterInitializeAsync.bind(this));
            tmpAnticipate.wait(/** @param {Error} pError */
            pError => {
              if (pError) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialization failed: ").concat(pError.message || pError), {
                  stack: pError.stack
                });
              }
              this.initializeTimestamp = this.pict.log.getTimeStamp();
              if (this.pict.LogNoisiness > 0) {
                this.log.info("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " initialization complete."));
              }
              return fCallback();
            });
          } else {
            this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " async initialize called but initialization is already completed.  Aborting."));
            // TODO: Should this be an error?
            return fCallback();
          }
        }
        onAfterInitialize() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterInitialize:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after the view is initialized (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onAfterInitializeAsync(fCallback) {
          this.onAfterInitialize();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                            Code Section: Render                            */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before the view is rendered.
         *
         * @param {Renderable} pRenderable - The renderable that will be rendered.
         */
        onBeforeRender(pRenderable) {
          // Overload this to mess with stuff before the content gets generated from the template
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeRender:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before the view is rendered (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that will be rendered.
         */
        onBeforeRenderAsync(fCallback, pRenderable) {
          this.onBeforeRender(pRenderable);
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers before the view is projected into the DOM.
         *
         * @param {Renderable} pRenderable - The renderable that will be projected.
         */
        onBeforeProject(pRenderable) {
          // Overload this to mess with stuff before the content gets generated from the template
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeProject:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before the view is projected into the DOM (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that will be projected.
         */
        onBeforeProjectAsync(fCallback, pRenderable) {
          this.onBeforeProject(pRenderable);
          return fCallback();
        }

        /**
         * Builds the render options for a renderable.
         *
         * For DRY purposes on the three flavors of render.
         *
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         */
        buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress) {
          let tmpRenderOptions = {
            Valid: true
          };
          tmpRenderOptions.RenderableHash = typeof pRenderableHash === 'string' ? pRenderableHash : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;
          if (!tmpRenderOptions.RenderableHash) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not find a suitable RenderableHash ").concat(tmpRenderOptions.RenderableHash, " (param ").concat(pRenderableHash, "because it is not a valid renderable."));
            tmpRenderOptions.Valid = false;
          }
          tmpRenderOptions.Renderable = this.renderables[tmpRenderOptions.RenderableHash];
          if (!tmpRenderOptions.Renderable) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderOptions.RenderableHash, " (param ").concat(pRenderableHash, ") because it does not exist."));
            tmpRenderOptions.Valid = false;
          }
          tmpRenderOptions.DestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderOptions.Renderable.ContentDestinationAddress === 'string' ? tmpRenderOptions.Renderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : false;
          if (!tmpRenderOptions.DestinationAddress) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderOptions.RenderableHash, " (param ").concat(pRenderableHash, ") because it does not have a valid destination address (param ").concat(pRenderDestinationAddress, ")."));
            tmpRenderOptions.Valid = false;
          }
          if (typeof pTemplateRecordAddress === 'object') {
            tmpRenderOptions.RecordAddress = 'Passed in as object';
            tmpRenderOptions.Record = pTemplateRecordAddress;
          } else {
            tmpRenderOptions.RecordAddress = typeof pTemplateRecordAddress === 'string' ? pTemplateRecordAddress : typeof tmpRenderOptions.Renderable.DefaultTemplateRecordAddress === 'string' ? tmpRenderOptions.Renderable.DefaultTemplateRecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
            tmpRenderOptions.Record = typeof tmpRenderOptions.RecordAddress === 'string' ? this.pict.DataProvider.getDataByAddress(tmpRenderOptions.RecordAddress) : undefined;
          }
          return tmpRenderOptions;
        }

        /**
         * Assigns the content to the destination address.
         *
         * For DRY purposes on the three flavors of render.
         *
         * @param {Renderable} pRenderable - The renderable to render.
         * @param {string} pRenderDestinationAddress - The address where the renderable will be rendered.
         * @param {string} pContent - The content to render.
         * @returns {boolean} - Returns true if the content was assigned successfully.
         * @memberof PictView
         */
        assignRenderContent(pRenderable, pRenderDestinationAddress, pContent) {
          return this.pict.ContentAssignment.projectContent(pRenderable.RenderMethod, pRenderDestinationAddress, pContent, pRenderable.TestAddress);
        }

        /**
         * Render a renderable from this view.
         *
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
         * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
         * @return {boolean}
         */
        render(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable) {
          return this.renderWithScope(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable);
        }

        /**
         * Render a renderable from this view, providing a specifici scope for the template.
         *
         * @param {any} pScope - The scope to use for the template rendering.
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object} [pTemplateRecordAddress] - The address where the data for the template is stored.
         * @param {Renderable} [pRootRenderable] - The root renderable for the render operation, if applicable.
         * @return {boolean}
         */
        renderWithScope(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable) {
          let tmpRenderableHash = typeof pRenderableHash === 'string' ? pRenderableHash : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;
          if (!tmpRenderableHash) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it is not a valid renderable."));
            return false;
          }

          /** @type {Renderable} */
          let tmpRenderable;
          if (tmpRenderableHash == '__Virtual') {
            tmpRenderable = {
              RenderableHash: '__Virtual',
              TemplateHash: this.renderables[this.options.DefaultRenderable].TemplateHash,
              ContentDestinationAddress: typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : null,
              RenderMethod: 'virtual-assignment',
              TransactionHash: pRootRenderable && pRootRenderable.TransactionHash,
              RootRenderableViewHash: pRootRenderable && pRootRenderable.RootRenderableViewHash
            };
          } else {
            tmpRenderable = Object.assign({}, this.renderables[tmpRenderableHash]);
            tmpRenderable.ContentDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : null;
          }
          if (!tmpRenderable.TransactionHash) {
            tmpRenderable.TransactionHash = "ViewRender-V-".concat(this.options.ViewIdentifier, "-R-").concat(tmpRenderableHash, "-U-").concat(this.pict.getUUID());
            tmpRenderable.RootRenderableViewHash = this.Hash;
            this.pict.TransactionTracking.registerTransaction(tmpRenderable.TransactionHash);
          }
          if (!tmpRenderable) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it does not exist."));
            return false;
          }
          if (!tmpRenderable.ContentDestinationAddress) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it does not have a valid destination address."));
            return false;
          }
          let tmpRecordAddress;
          let tmpRecord;
          if (typeof pTemplateRecordAddress === 'object') {
            tmpRecord = pTemplateRecordAddress;
            tmpRecordAddress = 'Passed in as object';
          } else {
            tmpRecordAddress = typeof pTemplateRecordAddress === 'string' ? pTemplateRecordAddress : typeof tmpRenderable.DefaultTemplateRecordAddress === 'string' ? tmpRenderable.DefaultTemplateRecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
            tmpRecord = typeof tmpRecordAddress === 'string' ? this.pict.DataProvider.getDataByAddress(tmpRecordAddress) : undefined;
          }

          // Execute the developer-overridable pre-render behavior
          this.onBeforeRender(tmpRenderable);
          if (this.pict.LogControlFlow) {
            this.log.trace("PICT-ControlFlow VIEW [".concat(this.UUID, "]::[").concat(this.Hash, "] Renderable[").concat(tmpRenderableHash, "] Destination[").concat(tmpRenderable.ContentDestinationAddress, "] TemplateRecordAddress[").concat(tmpRecordAddress, "] render:"));
          }
          if (this.pict.LogNoisiness > 0) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " Beginning Render of Renderable[").concat(tmpRenderableHash, "] to Destination [").concat(tmpRenderable.ContentDestinationAddress, "]..."));
          }
          // Generate the content output from the template and data
          tmpRenderable.Content = this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpRecord, null, [this], pScope, {
            RootRenderable: typeof pRootRenderable === 'object' ? pRootRenderable : tmpRenderable
          });
          if (this.pict.LogNoisiness > 0) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " Assigning Renderable[").concat(tmpRenderableHash, "] content length ").concat(tmpRenderable.Content.length, " to Destination [").concat(tmpRenderable.ContentDestinationAddress, "] using render method [").concat(tmpRenderable.RenderMethod, "]."));
          }
          this.onBeforeProject(tmpRenderable);
          this.onProject(tmpRenderable);
          if (tmpRenderable.RenderMethod !== 'virtual-assignment') {
            this.onAfterProject(tmpRenderable);

            // Execute the developer-overridable post-render behavior
            this.onAfterRender(tmpRenderable);
          }
          return true;
        }

        /**
         * Render a renderable from this view.
         *
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address where the data for the template is stored.
         * @param {Renderable|ErrorCallback} [pRootRenderable] - The root renderable for the render operation, if applicable.
         * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
         *
         * @return {void}
         */
        renderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback) {
          return this.renderWithScopeAsync(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback);
        }

        /**
         * Render a renderable from this view.
         *
         * @param {any} pScope - The scope to use for the template rendering.
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object|ErrorCallback} [pTemplateRecordAddress] - The address where the data for the template is stored.
         * @param {Renderable|ErrorCallback} [pRootRenderable] - The root renderable for the render operation, if applicable.
         * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
         *
         * @return {void}
         */
        renderWithScopeAsync(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, pRootRenderable, fCallback) {
          let tmpRenderableHash = typeof pRenderableHash === 'string' ? pRenderableHash : typeof this.options.DefaultRenderable == 'string' ? this.options.DefaultRenderable : false;

          // Allow the callback to be passed in as the last parameter no matter what
          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : typeof pTemplateRecordAddress === 'function' ? pTemplateRecordAddress : typeof pRenderDestinationAddress === 'function' ? pRenderDestinationAddress : typeof pRenderableHash === 'function' ? pRenderableHash : typeof pRootRenderable === 'function' ? pRootRenderable : null;
          if (!tmpCallback) {
            this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " renderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
            tmpCallback = pError => {
              if (pError) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " renderAsync Auto Callback Error: ").concat(pError), pError);
              }
            };
          }
          if (!tmpRenderableHash) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not asynchronously render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, "because it is not a valid renderable."));
            return tmpCallback(new Error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not asynchronously render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, "because it is not a valid renderable.")));
          }

          /** @type {Renderable} */
          let tmpRenderable;
          if (tmpRenderableHash == '__Virtual') {
            tmpRenderable = {
              RenderableHash: '__Virtual',
              TemplateHash: this.renderables[this.options.DefaultRenderable].TemplateHash,
              ContentDestinationAddress: typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : null,
              RenderMethod: 'virtual-assignment',
              TransactionHash: pRootRenderable && typeof pRootRenderable !== 'function' && pRootRenderable.TransactionHash,
              RootRenderableViewHash: pRootRenderable && typeof pRootRenderable !== 'function' && pRootRenderable.RootRenderableViewHash
            };
          } else {
            tmpRenderable = Object.assign({}, this.renderables[tmpRenderableHash]);
            tmpRenderable.ContentDestinationAddress = typeof pRenderDestinationAddress === 'string' ? pRenderDestinationAddress : typeof tmpRenderable.ContentDestinationAddress === 'string' ? tmpRenderable.ContentDestinationAddress : typeof this.options.DefaultDestinationAddress === 'string' ? this.options.DefaultDestinationAddress : null;
          }
          if (!tmpRenderable.TransactionHash) {
            tmpRenderable.TransactionHash = "ViewRender-V-".concat(this.options.ViewIdentifier, "-R-").concat(tmpRenderableHash, "-U-").concat(this.pict.getUUID());
            tmpRenderable.RootRenderableViewHash = this.Hash;
            this.pict.TransactionTracking.registerTransaction(tmpRenderable.TransactionHash);
          }
          if (!tmpRenderable) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it does not exist."));
            return tmpCallback(new Error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it does not exist.")));
          }
          if (!tmpRenderable.ContentDestinationAddress) {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it does not have a valid destination address."));
            return tmpCallback(new Error("Could not render ".concat(tmpRenderableHash)));
          }
          let tmpRecordAddress;
          let tmpRecord;
          if (typeof pTemplateRecordAddress === 'object') {
            tmpRecord = pTemplateRecordAddress;
            tmpRecordAddress = 'Passed in as object';
          } else {
            tmpRecordAddress = typeof pTemplateRecordAddress === 'string' ? pTemplateRecordAddress : typeof tmpRenderable.DefaultTemplateRecordAddress === 'string' ? tmpRenderable.DefaultTemplateRecordAddress : typeof this.options.DefaultTemplateRecordAddress === 'string' ? this.options.DefaultTemplateRecordAddress : false;
            tmpRecord = typeof tmpRecordAddress === 'string' ? this.pict.DataProvider.getDataByAddress(tmpRecordAddress) : undefined;
          }
          if (this.pict.LogControlFlow) {
            this.log.trace("PICT-ControlFlow VIEW [".concat(this.UUID, "]::[").concat(this.Hash, "] Renderable[").concat(tmpRenderableHash, "] Destination[").concat(tmpRenderable.ContentDestinationAddress, "] TemplateRecordAddress[").concat(tmpRecordAddress, "] renderAsync:"));
          }
          if (this.pict.LogNoisiness > 2) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " Beginning Asynchronous Render (callback-style)..."));
          }
          let tmpAnticipate = this.fable.newAnticipate();
          tmpAnticipate.anticipate(fOnBeforeRenderCallback => {
            this.onBeforeRenderAsync(fOnBeforeRenderCallback, tmpRenderable);
          });
          tmpAnticipate.anticipate(fAsyncTemplateCallback => {
            // Render the template (asynchronously)
            this.pict.parseTemplateByHash(tmpRenderable.TemplateHash, tmpRecord, (pError, pContent) => {
              if (pError) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render (asynchronously) ").concat(tmpRenderableHash, " (param ").concat(pRenderableHash, ") because it did not parse the template."), pError);
                return fAsyncTemplateCallback(pError);
              }
              tmpRenderable.Content = pContent;
              return fAsyncTemplateCallback();
            }, [this], pScope, {
              RootRenderable: typeof pRootRenderable === 'object' ? pRootRenderable : tmpRenderable
            });
          });
          tmpAnticipate.anticipate(fNext => {
            this.onBeforeProjectAsync(fNext, tmpRenderable);
          });
          tmpAnticipate.anticipate(fNext => {
            this.onProjectAsync(fNext, tmpRenderable);
          });
          if (tmpRenderable.RenderMethod !== 'virtual-assignment') {
            tmpAnticipate.anticipate(fNext => {
              this.onAfterProjectAsync(fNext, tmpRenderable);
            });

            // Execute the developer-overridable post-render behavior
            tmpAnticipate.anticipate(fNext => {
              this.onAfterRenderAsync(fNext, tmpRenderable);
            });
          }
          tmpAnticipate.wait(tmpCallback);
        }

        /**
         * Renders the default renderable.
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        renderDefaultAsync(fCallback) {
          // Render the default renderable
          this.renderAsync(fCallback);
        }

        /**
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         */
        basicRender(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress) {
          return this.basicRenderWithScope(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
        }

        /**
         * @param {any} pScope - The scope to use for the template rendering.
         * @param {string} [pRenderableHash] - The hash of the renderable to render.
         * @param {string} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|object} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         */
        basicRenderWithScope(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress) {
          let tmpRenderOptions = this.buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
          if (tmpRenderOptions.Valid) {
            this.assignRenderContent(tmpRenderOptions.Renderable, tmpRenderOptions.DestinationAddress, this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash, tmpRenderOptions.Record, null, [this], pScope, {
              RootRenderable: tmpRenderOptions.Renderable
            }));
            return true;
          } else {
            this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not perform a basic render of ").concat(tmpRenderOptions.RenderableHash, " because it is not valid."));
            return false;
          }
        }

        /**
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
         */
        basicRenderAsync(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback) {
          return this.basicRenderWithScopeAsync(this, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback);
        }

        /**
         * @param {any} pScope - The scope to use for the template rendering.
         * @param {string|ErrorCallback} [pRenderableHash] - The hash of the renderable to render.
         * @param {string|ErrorCallback} [pRenderDestinationAddress] - The address where the renderable will be rendered.
         * @param {string|Object|ErrorCallback} [pTemplateRecordAddress] - The address of (or actual obejct) where the data for the template is stored.
         * @param {ErrorCallback} [fCallback] - The callback to call when the async operation is complete.
         */
        basicRenderWithScopeAsync(pScope, pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress, fCallback) {
          // Allow the callback to be passed in as the last parameter no matter what
          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : typeof pTemplateRecordAddress === 'function' ? pTemplateRecordAddress : typeof pRenderDestinationAddress === 'function' ? pRenderDestinationAddress : typeof pRenderableHash === 'function' ? pRenderableHash : null;
          if (!tmpCallback) {
            this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " basicRenderAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
            tmpCallback = pError => {
              if (pError) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " basicRenderAsync Auto Callback Error: ").concat(pError), pError);
              }
            };
          }
          const tmpRenderOptions = this.buildRenderOptions(pRenderableHash, pRenderDestinationAddress, pTemplateRecordAddress);
          if (tmpRenderOptions.Valid) {
            this.pict.parseTemplateByHash(tmpRenderOptions.Renderable.TemplateHash, tmpRenderOptions.Record,
            /**
             * @param {Error} [pError] - The error that occurred during template parsing.
             * @param {string} [pContent] - The content that was rendered from the template.
             */
            (pError, pContent) => {
              if (pError) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not render (asynchronously) ").concat(tmpRenderOptions.RenderableHash, " because it did not parse the template."), pError);
                return tmpCallback(pError);
              }
              this.assignRenderContent(tmpRenderOptions.Renderable, tmpRenderOptions.DestinationAddress, pContent);
              return tmpCallback();
            }, [this], pScope, {
              RootRenderable: tmpRenderOptions.Renderable
            });
          } else {
            let tmpErrorMessage = "PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " could not perform a basic render of ").concat(tmpRenderOptions.RenderableHash, " because it is not valid.");
            this.log.error(tmpErrorMessage);
            return tmpCallback(new Error(tmpErrorMessage));
          }
        }

        /**
         * @param {Renderable} pRenderable - The renderable that was rendered.
         */
        onProject(pRenderable) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onProject:"));
          }
          if (pRenderable.RenderMethod === 'virtual-assignment') {
            this.pict.TransactionTracking.pushToTransactionQueue(pRenderable.TransactionHash, {
              ViewHash: this.Hash,
              Renderable: pRenderable
            }, 'Deferred-Post-Content-Assignment');
          }
          if (this.pict.LogNoisiness > 0) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " Assigning Renderable[").concat(pRenderable.RenderableHash, "] content length ").concat(pRenderable.Content.length, " to Destination [").concat(pRenderable.ContentDestinationAddress, "] using Async render method ").concat(pRenderable.RenderMethod, "."));
          }

          // Assign the content to the destination address
          this.pict.ContentAssignment.projectContent(pRenderable.RenderMethod, pRenderable.ContentDestinationAddress, pRenderable.Content, pRenderable.TestAddress);
          this.lastRenderedTimestamp = this.pict.log.getTimeStamp();
        }

        /**
         * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
         *
         * @param {(error?: Error, content?: string) => void} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that is being projected.
         */
        onProjectAsync(fCallback, pRenderable) {
          this.onProject(pRenderable);
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers after the view is rendered.
         *
         * @param {Renderable} pRenderable - The renderable that was rendered.
         */
        onAfterRender(pRenderable) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterRender:"));
          }
          if (pRenderable && pRenderable.RootRenderableViewHash === this.Hash) {
            const tmpTransactionQueue = this.pict.TransactionTracking.clearTransactionQueue(pRenderable.TransactionHash) || [];
            for (const tmpEvent of tmpTransactionQueue) {
              const tmpView = this.pict.views[tmpEvent.Data.ViewHash];
              if (!tmpView) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterRender: Could not find view for transaction hash ").concat(pRenderable.TransactionHash, " and ViewHash ").concat(tmpEvent.Data.ViewHash, "."));
                continue;
              }
              tmpView.onAfterProject();

              // Execute the developer-overridable post-render behavior
              tmpView.onAfterRender(tmpEvent.Data.Renderable);
            }
            // Queue is drained and nested child renders have each cleaned up
            // their own transactions; remove this root render's entry from
            // the tracking map so it does not leak.
            this.pict.TransactionTracking.unregisterTransaction(pRenderable.TransactionHash);
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after the view is rendered (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that was rendered.
         */
        onAfterRenderAsync(fCallback, pRenderable) {
          // NOTE: this.onAfterRender(pRenderable) will itself clear the
          // transaction queue and unregister the transaction if this view is
          // the root renderable - see onAfterRender above. So by the time the
          // loop below runs, the queue is already empty and there is nothing
          // to drain. Keeping the async queue walk here defensively in case
          // future subclasses override onAfterRender in ways that skip the
          // drain, but the common path is now "sync drain, async no-op".
          this.onAfterRender(pRenderable);
          const tmpAnticipate = this.fable.newAnticipate();
          const tmpIsRootRenderable = pRenderable && pRenderable.RootRenderableViewHash === this.Hash;
          if (tmpIsRootRenderable) {
            const queue = this.pict.TransactionTracking.clearTransactionQueue(pRenderable.TransactionHash) || [];
            for (const event of queue) {
              /** @type {PictView} */
              const tmpView = this.pict.views[event.Data.ViewHash];
              if (!tmpView) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterRenderAsync: Could not find view for transaction hash ").concat(pRenderable.TransactionHash, " and ViewHash ").concat(event.Data.ViewHash, "."));
                continue;
              }
              tmpAnticipate.anticipate(tmpView.onAfterProjectAsync.bind(tmpView));
              tmpAnticipate.anticipate(fNext => {
                tmpView.onAfterRenderAsync(fNext, event.Data.Renderable);
              });

              // Execute the developer-overridable post-render behavior
            }
          }
          return tmpAnticipate.wait(pError => {
            // Nested virtual-assignment children have now settled their own
            // onAfterRenderAsync chains (and unregistered their own
            // transactions along the way). Ensure this root render's entry
            // is also gone - unregisterTransaction is a no-op if the sync
            // onAfterRender above already removed it, so this is safe to
            // call unconditionally on the root path.
            if (tmpIsRootRenderable && pRenderable && pRenderable.TransactionHash) {
              this.pict.TransactionTracking.unregisterTransaction(pRenderable.TransactionHash);
            }
            return fCallback(pError);
          });
        }

        /**
         * Lifecycle hook that triggers after the view is projected into the DOM.
         *
         * @param {Renderable} pRenderable - The renderable that was projected.
         */
        onAfterProject(pRenderable) {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterProject:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after the view is projected into the DOM (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         * @param {Renderable} pRenderable - The renderable that was projected.
         */
        onAfterProjectAsync(fCallback, pRenderable) {
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                            Code Section: Solver                            */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before the view is solved.
         */
        onBeforeSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeSolve:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before the view is solved (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onBeforeSolveAsync(fCallback) {
          this.onBeforeSolve();
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers when the view is solved.
         */
        onSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onSolve:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers when the view is solved (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onSolveAsync(fCallback) {
          this.onSolve();
          return fCallback();
        }

        /**
         * Performs view solving and triggers lifecycle hooks.
         *
         * @return {boolean} - True if the view was solved successfully, false otherwise.
         */
        solve() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " executing solve() function..."));
          }
          this.onBeforeSolve();
          this.onSolve();
          this.onAfterSolve();
          this.lastSolvedTimestamp = this.pict.log.getTimeStamp();
          return true;
        }

        /**
         * Performs view solving and triggers lifecycle hooks (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        solveAsync(fCallback) {
          let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : null;
          if (!tmpCallback) {
            this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " solveAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
            tmpCallback = pError => {
              if (pError) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " solveAsync Auto Callback Error: ").concat(pError), pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeSolveAsync.bind(this));
          tmpAnticipate.anticipate(this.onSolveAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterSolveAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " solveAsync() complete."));
            }
            this.lastSolvedTimestamp = this.pict.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * Lifecycle hook that triggers after the view is solved.
         */
        onAfterSolve() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterSolve:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after the view is solved (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onAfterSolveAsync(fCallback) {
          this.onAfterSolve();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Marshal From View                        */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before data is marshaled from the view.
         *
         * @return {boolean} - True if the operation was successful, false otherwise.
         */
        onBeforeMarshalFromView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeMarshalFromView:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before data is marshaled from the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onBeforeMarshalFromViewAsync(fCallback) {
          this.onBeforeMarshalFromView();
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers when data is marshaled from the view.
         */
        onMarshalFromView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onMarshalFromView:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers when data is marshaled from the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onMarshalFromViewAsync(fCallback) {
          this.onMarshalFromView();
          return fCallback();
        }

        /**
         * Marshals data from the view.
         *
         * @return {boolean} - True if the operation was successful, false otherwise.
         */
        marshalFromView() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " executing solve() function..."));
          }
          this.onBeforeMarshalFromView();
          this.onMarshalFromView();
          this.onAfterMarshalFromView();
          this.lastMarshalFromViewTimestamp = this.pict.log.getTimeStamp();
          return true;
        }

        /**
         * Marshals data from the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        marshalFromViewAsync(fCallback) {
          let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : null;
          if (!tmpCallback) {
            this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " marshalFromViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
            tmpCallback = pError => {
              if (pError) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " marshalFromViewAsync Auto Callback Error: ").concat(pError), pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeMarshalFromViewAsync.bind(this));
          tmpAnticipate.anticipate(this.onMarshalFromViewAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterMarshalFromViewAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " marshalFromViewAsync() complete."));
            }
            this.lastMarshalFromViewTimestamp = this.pict.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * Lifecycle hook that triggers after data is marshaled from the view.
         */
        onAfterMarshalFromView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterMarshalFromView:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after data is marshaled from the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onAfterMarshalFromViewAsync(fCallback) {
          this.onAfterMarshalFromView();
          return fCallback();
        }

        /* -------------------------------------------------------------------------- */
        /*                     Code Section: Marshal To View                          */
        /* -------------------------------------------------------------------------- */
        /**
         * Lifecycle hook that triggers before data is marshaled into the view.
         */
        onBeforeMarshalToView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onBeforeMarshalToView:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers before data is marshaled into the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onBeforeMarshalToViewAsync(fCallback) {
          this.onBeforeMarshalToView();
          return fCallback();
        }

        /**
         * Lifecycle hook that triggers when data is marshaled into the view.
         */
        onMarshalToView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onMarshalToView:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers when data is marshaled into the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onMarshalToViewAsync(fCallback) {
          this.onMarshalToView();
          return fCallback();
        }

        /**
         * Marshals data into the view.
         *
         * @return {boolean} - True if the operation was successful, false otherwise.
         */
        marshalToView() {
          if (this.pict.LogNoisiness > 2) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " executing solve() function..."));
          }
          this.onBeforeMarshalToView();
          this.onMarshalToView();
          this.onAfterMarshalToView();
          this.lastMarshalToViewTimestamp = this.pict.log.getTimeStamp();
          return true;
        }

        /**
         * Marshals data into the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        marshalToViewAsync(fCallback) {
          let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

          /** @type {ErrorCallback} */
          let tmpCallback = typeof fCallback === 'function' ? fCallback : null;
          if (!tmpCallback) {
            this.log.warn("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " marshalToViewAsync was called without a valid callback.  A callback will be generated but this could lead to race conditions."));
            tmpCallback = pError => {
              if (pError) {
                this.log.error("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.Name, " marshalToViewAsync Auto Callback Error: ").concat(pError), pError);
              }
            };
          }
          tmpAnticipate.anticipate(this.onBeforeMarshalToViewAsync.bind(this));
          tmpAnticipate.anticipate(this.onMarshalToViewAsync.bind(this));
          tmpAnticipate.anticipate(this.onAfterMarshalToViewAsync.bind(this));
          tmpAnticipate.wait(pError => {
            if (this.pict.LogNoisiness > 2) {
              this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " marshalToViewAsync() complete."));
            }
            this.lastMarshalToViewTimestamp = this.pict.log.getTimeStamp();
            return tmpCallback(pError);
          });
        }

        /**
         * Lifecycle hook that triggers after data is marshaled into the view.
         */
        onAfterMarshalToView() {
          if (this.pict.LogNoisiness > 3) {
            this.log.trace("PictView [".concat(this.UUID, "]::[").concat(this.Hash, "] ").concat(this.options.ViewIdentifier, " onAfterMarshalToView:"));
          }
          return true;
        }

        /**
         * Lifecycle hook that triggers after data is marshaled into the view (async flow).
         *
         * @param {ErrorCallback} fCallback - The callback to call when the async operation is complete.
         */
        onAfterMarshalToViewAsync(fCallback) {
          this.onAfterMarshalToView();
          return fCallback();
        }

        /** @return {boolean} - True if the object is a PictView. */
        get isPictView() {
          return true;
        }
      }
      module.exports = PictView;
    }, {
      "../package.json": 13,
      "fable-serviceproviderbase": 2
    }],
    15: [function (require, module, exports) {
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
      function buildTree(pItems) {
        let tmpItems = Array.isArray(pItems) ? pItems : [];
        let tmpByParent = {};
        for (let i = 0; i < tmpItems.length; i++) {
          let tmpParent = _parentKey(tmpItems[i]);
          if (!tmpByParent[tmpParent]) {
            tmpByParent[tmpParent] = [];
          }
          tmpByParent[tmpParent].push({
            Item: tmpItems[i],
            Index: i
          });
        }
        let fChildrenOf = (pParentKey, pDepth) => {
          let tmpChildren = (tmpByParent[pParentKey] || []).slice().sort((pA, pB) => _sort(pA.Item) - _sort(pB.Item) || pA.Index - pB.Index);
          return tmpChildren.map(pEntry => {
            let tmpNode = Object.assign({}, pEntry.Item);
            tmpNode.Depth = pDepth;
            tmpNode.Children = fChildrenOf(String(pEntry.Item.Key), pDepth + 1);
            return tmpNode;
          });
        };
        return fChildrenOf('', 0);
      }

      // Annotate one node and its subtree with IsGroup / LeafCount / DoneCount / Percent, post-order.
      function annotateProgress(pNode) {
        if (!pNode.Children || pNode.Children.length === 0) {
          pNode.IsGroup = false;
          pNode.LeafCount = 1;
          pNode.DoneCount = pNode.Done ? 1 : 0;
          pNode.Percent = pNode.Done ? 100 : 0;
          return pNode;
        }
        pNode.IsGroup = true;
        let tmpLeaves = 0;
        let tmpDone = 0;
        for (let i = 0; i < pNode.Children.length; i++) {
          annotateProgress(pNode.Children[i]);
          tmpLeaves += pNode.Children[i].LeafCount;
          tmpDone += pNode.Children[i].DoneCount;
        }
        pNode.LeafCount = tmpLeaves;
        pNode.DoneCount = tmpDone;
        pNode.Percent = tmpLeaves ? Math.round(tmpDone / tmpLeaves * 100) : 0;
        return pNode;
      }

      // The one call the view uses: a flat item list in, { Roots, Overall } out.
      function decorate(pItems) {
        let tmpRoots = buildTree(pItems);
        let tmpLeaves = 0;
        let tmpDone = 0;
        for (let i = 0; i < tmpRoots.length; i++) {
          annotateProgress(tmpRoots[i]);
          tmpLeaves += tmpRoots[i].LeafCount;
          tmpDone += tmpRoots[i].DoneCount;
        }
        return {
          Roots: tmpRoots,
          Overall: {
            LeafCount: tmpLeaves,
            DoneCount: tmpDone,
            Percent: tmpLeaves ? Math.round(tmpDone / tmpLeaves * 100) : 0,
            Complete: tmpLeaves > 0 && tmpDone === tmpLeaves
          }
        };
      }
      function _parentKey(pItem) {
        return pItem && pItem.ParentKey != null && pItem.ParentKey !== '' ? String(pItem.ParentKey) : '';
      }
      function _sort(pItem) {
        return pItem && typeof pItem.Sort === 'number' ? pItem.Sort : 0;
      }
      module.exports = {
        buildTree: buildTree,
        annotateProgress: annotateProgress,
        decorate: decorate
      };
    }, {}],
    16: [function (require, module, exports) {
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
    }, {
      "./ChecklistModel.js": 15,
      "./providers/ChecklistProvider-Base.js": 17,
      "./views/PictView-Checklist.js": 18
    }],
    17: [function (require, module, exports) {
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
      function normalizeContext(pContext) {
        let tmpContext = pContext || {};
        return {
          OwnerType: String(tmpContext.OwnerType || ''),
          IDOwner: String(tmpContext.IDOwner || '')
        };
      }

      // Lowest free Sort within a list (so a new item lands at the end).
      function _nextSort(pItemsMap, pListKey) {
        let tmpMax = -1;
        let tmpKeys = Object.keys(pItemsMap);
        for (let i = 0; i < tmpKeys.length; i++) {
          let tmpItem = pItemsMap[tmpKeys[i]];
          if (String(tmpItem.ListKey) === String(pListKey) && typeof tmpItem.Sort === 'number' && tmpItem.Sort > tmpMax) {
            tmpMax = tmpItem.Sort;
          }
        }
        return tmpMax + 1;
      }
      class ChecklistDataProvider {
        constructor(pOptions) {
          this.options = pOptions || {};
          this._now = typeof this.options.Now === 'function' ? this.options.Now : function () {
            return Date.now();
          };
          let tmpCounter = 0;
          this._key = typeof this.options.KeyGenerator === 'function' ? this.options.KeyGenerator : () => {
            tmpCounter++;
            return 'chk_' + this._now().toString(36) + '_' + tmpCounter.toString(36) + '_' + Math.floor(Math.random() * 0x7fffffff).toString(36);
          };
        }

        // ---- primitives (subclasses MUST implement) ----
        getList(pContext) {
          return Promise.reject(new Error('ChecklistDataProvider.getList not implemented'));
        }
        updateList(pKey, pPatch) {
          return Promise.reject(new Error('ChecklistDataProvider.updateList not implemented'));
        }
        listItems(pListKey) {
          return Promise.reject(new Error('ChecklistDataProvider.listItems not implemented'));
        }
        createItem(pItemDraft) {
          return Promise.reject(new Error('ChecklistDataProvider.createItem not implemented'));
        }
        updateItem(pKey, pPatch) {
          return Promise.reject(new Error('ChecklistDataProvider.updateItem not implemented'));
        }
        deleteItem(pKey) {
          return Promise.reject(new Error('ChecklistDataProvider.deleteItem not implemented'));
        }

        // ---- convenience built on the primitives (every provider gets this for free) ----

        /** Load a context in one call: its list plus the list's items. @returns {Promise<{List, Items}>} */
        loadChecklist(pContext) {
          return this.getList(pContext).then(pList => {
            if (!pList) {
              return {
                List: null,
                Items: []
              };
            }
            return this.listItems(pList.Key).then(pItems => ({
              List: pList,
              Items: pItems || []
            }));
          });
        }
      }

      /**
       * The default, self-contained provider. Holds lists and items in a plain object so the section works
       * with no backend. Pass a slice of AppData as Store to keep the state observable / serializable.
       */
      class InMemoryChecklistProvider extends ChecklistDataProvider {
        constructor(pOptions) {
          super(pOptions);
          let tmpStore = this.options && this.options.Store ? this.options.Store : {};
          if (!tmpStore.Lists) {
            tmpStore.Lists = {};
          }
          if (!tmpStore.Items) {
            tmpStore.Items = {};
          }
          this.store = tmpStore;
          this._title = this.options.Title || _DEFAULT_TITLE;
        }
        _clone(pValue) {
          return pValue == null ? pValue : JSON.parse(JSON.stringify(pValue));
        }
        getList(pContext) {
          let tmpContext = normalizeContext(pContext);
          let tmpExisting = Object.keys(this.store.Lists).map(pKey => this.store.Lists[pKey]).find(pList => String(pList.OwnerType) === tmpContext.OwnerType && String(pList.IDOwner) === tmpContext.IDOwner);
          if (tmpExisting) {
            return Promise.resolve(this._clone(tmpExisting));
          }
          // First load of a context implicitly creates its (empty) list, so the view always has one.
          let tmpNow = this._now();
          let tmpList = {
            Key: this._key(),
            OwnerType: tmpContext.OwnerType,
            IDOwner: tmpContext.IDOwner,
            Title: this._title,
            CreatedAt: tmpNow,
            UpdatedAt: tmpNow
          };
          this.store.Lists[tmpList.Key] = tmpList;
          return Promise.resolve(this._clone(tmpList));
        }
        updateList(pKey, pPatch) {
          let tmpList = this.store.Lists[pKey];
          if (!tmpList) {
            return Promise.reject(new Error('updateList: no list ' + pKey));
          }
          if (pPatch && Object.prototype.hasOwnProperty.call(pPatch, 'Title')) {
            tmpList.Title = String(pPatch.Title);
          }
          tmpList.UpdatedAt = this._now();
          return Promise.resolve(this._clone(tmpList));
        }
        listItems(pListKey) {
          let tmpItems = Object.keys(this.store.Items).map(pKey => this.store.Items[pKey]).filter(pItem => String(pItem.ListKey) === String(pListKey) && !pItem.Deleted).sort((pA, pB) => pA.Sort - pB.Sort);
          return Promise.resolve(this._clone(tmpItems));
        }
        createItem(pItemDraft) {
          let tmpDraft = pItemDraft || {};
          if (!tmpDraft.ListKey || !this.store.Lists[tmpDraft.ListKey]) {
            return Promise.reject(new Error('createItem requires a ListKey of an existing list'));
          }
          let tmpNow = this._now();
          let tmpItem = {
            Key: tmpDraft.Key || this._key(),
            ListKey: tmpDraft.ListKey,
            ParentKey: tmpDraft.ParentKey != null && tmpDraft.ParentKey !== '' ? String(tmpDraft.ParentKey) : null,
            Title: tmpDraft.Title != null ? String(tmpDraft.Title) : '',
            Done: !!tmpDraft.Done,
            Sort: typeof tmpDraft.Sort === 'number' ? tmpDraft.Sort : _nextSort(this.store.Items, tmpDraft.ListKey),
            Notes: tmpDraft.Notes ? String(tmpDraft.Notes) : '',
            Collapsed: !!tmpDraft.Collapsed,
            CreatedAt: tmpNow,
            UpdatedAt: tmpNow,
            Deleted: false
          };
          this.store.Items[tmpItem.Key] = tmpItem;
          return Promise.resolve(this._clone(tmpItem));
        }
        updateItem(pKey, pPatch) {
          let tmpItem = this.store.Items[pKey];
          if (!tmpItem || tmpItem.Deleted) {
            return Promise.reject(new Error('updateItem: no item ' + pKey));
          }
          let tmpPatch = pPatch || {};
          let tmpAllowed = ['Title', 'Done', 'Sort', 'ParentKey', 'Notes', 'Collapsed'];
          for (let i = 0; i < tmpAllowed.length; i++) {
            let tmpField = tmpAllowed[i];
            if (!Object.prototype.hasOwnProperty.call(tmpPatch, tmpField)) {
              continue;
            }
            if (tmpField === 'ParentKey') {
              tmpItem.ParentKey = tmpPatch.ParentKey != null && tmpPatch.ParentKey !== '' ? String(tmpPatch.ParentKey) : null;
            } else if (tmpField === 'Title' || tmpField === 'Notes') {
              tmpItem[tmpField] = String(tmpPatch[tmpField]);
            } else if (tmpField === 'Done' || tmpField === 'Collapsed') {
              tmpItem[tmpField] = !!tmpPatch[tmpField];
            } else {
              tmpItem[tmpField] = tmpPatch[tmpField];
            }
          }
          tmpItem.UpdatedAt = this._now();
          return Promise.resolve(this._clone(tmpItem));
        }
        deleteItem(pKey) {
          // Remove the item and its whole subtree (depth-first collect, then drop).
          let tmpToDelete = {};
          let fCollect = pItemKey => {
            tmpToDelete[pItemKey] = true;
            let tmpKeys = Object.keys(this.store.Items);
            for (let i = 0; i < tmpKeys.length; i++) {
              let tmpChild = this.store.Items[tmpKeys[i]];
              if (tmpChild.ParentKey != null && String(tmpChild.ParentKey) === String(pItemKey) && !tmpToDelete[tmpChild.Key]) {
                fCollect(tmpChild.Key);
              }
            }
          };
          if (this.store.Items[pKey]) {
            fCollect(pKey);
          }
          Object.keys(tmpToDelete).forEach(pDelKey => {
            delete this.store.Items[pDelKey];
          });
          return Promise.resolve();
        }
      }
      module.exports = {
        ChecklistDataProvider: ChecklistDataProvider,
        InMemoryChecklistProvider: InMemoryChecklistProvider,
        normalizeContext: normalizeContext,
        DEFAULT_TITLE: _DEFAULT_TITLE
      };
    }, {}],
    18: [function (require, module, exports) {
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
      const _DefaultConfiguration = {
        ViewIdentifier: 'Checklist',
        DefaultRenderable: 'Checklist-Section',
        DefaultDestinationAddress: '#Checklist-Container',
        AutoRender: false,
        // ---- options a host overrides ----
        // The Context this checklist is bound to (what it is "attached to"). Standalone lists just pick a
        // stable synthetic context.
        Context: {
          OwnerType: 'Standalone',
          IDOwner: '1'
        },
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
        CSS: /*css*/"\n\t\t.pict-checklist { font-family: var(--theme-typography-family-body, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif); font-size: 14px; color: var(--theme-color-text-primary, #1f2430); }\n\n\t\t.pchk-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }\n\t\t.pchk-list-title { font-size: 15px; font-weight: 600; color: var(--theme-color-text-primary, #1f2430); outline: none; border-radius: 4px; padding: 2px 5px; min-width: 40px; }\n\t\t.pchk-list-title:focus { background: var(--theme-color-background-tertiary, #eef2f6); }\n\n\t\t.pchk-overall { display: flex; align-items: center; gap: 8px; margin-left: auto; min-width: 170px; }\n\t\t.pchk-bar { flex: 1; height: 6px; border-radius: 3px; background: var(--theme-color-background-tertiary, #e7ecf0); overflow: hidden; }\n\t\t.pchk-bar-fill { height: 100%; width: 0; background: var(--theme-color-brand-primary, #2880a6); border-radius: 3px; transition: width 0.18s ease; }\n\t\t.pict-checklist.pchk-complete .pchk-bar-fill { background: var(--theme-color-status-success, #2e7d4f); }\n\t\t.pchk-overall-label { font-size: 12px; color: var(--theme-color-text-secondary, #5b6470); white-space: nowrap; font-variant-numeric: tabular-nums; }\n\n\t\t.pchk-list, .pchk-children { list-style: none; margin: 0; padding: 0; }\n\t\t.pchk-children { padding-left: 22px; }\n\t\t.pchk-children:empty { display: none; }\n\n\t\t.pchk-row { display: flex; align-items: center; gap: 7px; padding: 3px 4px; border-radius: 6px; }\n\t\t.pchk-row:hover { background: var(--theme-color-background-secondary, #f7f9fb); }\n\n\t\t.pchk-caret { width: 18px; height: 18px; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--theme-color-text-muted, #97a1ab); border: none; background: none; padding: 0; font-size: 15px; }\n\t\t.pchk-caret:hover { color: var(--theme-color-text-secondary, #5b6470); }\n\t\t.pchk-leaf .pchk-caret { visibility: hidden; cursor: default; }\n\t\t.pchk-caret-closed { display: none; }\n\t\t.pchk-item.pchk-collapsed > .pchk-row > .pchk-caret .pchk-caret-open { display: none; }\n\t\t.pchk-item.pchk-collapsed > .pchk-row > .pchk-caret .pchk-caret-closed { display: inline-flex; }\n\n\t\t.pchk-check { width: 18px; height: 18px; flex: 0 0 auto; border: 1.5px solid var(--theme-color-border-strong, #a0a0a0); border-radius: 5px; background: var(--theme-color-background-panel, #fff); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: var(--theme-color-text-on-brand, #fff); font-size: 12px; padding: 0; }\n\t\t.pchk-group > .pchk-row > .pchk-check { display: none; }\n\t\t.pchk-check .pict-icon { opacity: 0; transform: scale(0.5); transition: opacity 0.1s ease, transform 0.1s ease; }\n\t\t.pchk-item.pchk-done > .pchk-row > .pchk-check { background: var(--theme-color-brand-primary, #2880a6); border-color: var(--theme-color-brand-primary, #2880a6); }\n\t\t.pchk-item.pchk-done > .pchk-row > .pchk-check .pict-icon { opacity: 1; transform: scale(1); }\n\t\t.pict-checklist.pchk-readonly .pchk-check { cursor: default; }\n\n\t\t.pchk-title { flex: 1; min-width: 0; outline: none; padding: 2px 4px; border-radius: 4px; line-height: 1.4; word-break: break-word; }\n\t\t.pchk-title:focus { background: var(--theme-color-background-tertiary, #eef2f6); box-shadow: inset 0 0 0 2px var(--theme-color-brand-primary, #2880a6); }\n\t\t.pchk-item.pchk-done > .pchk-row > .pchk-title { color: var(--theme-color-text-muted, #97a1ab); text-decoration: line-through; }\n\n\t\t.pchk-group-progress { display: inline-flex; align-items: center; gap: 6px; margin-left: 6px; flex: 0 0 auto; }\n\t\t.pchk-leaf .pchk-group-progress { display: none; }\n\t\t.pchk-minibar { width: 46px; height: 5px; border-radius: 3px; background: var(--theme-color-background-tertiary, #e7ecf0); overflow: hidden; }\n\t\t.pchk-minibar-fill { height: 100%; width: 0; background: var(--theme-color-brand-primary, #2880a6); border-radius: 3px; transition: width 0.18s ease; }\n\t\t.pchk-item.pchk-group-done > .pchk-row > .pchk-group-progress .pchk-minibar-fill { background: var(--theme-color-status-success, #2e7d4f); }\n\t\t.pchk-pct { font-size: 11px; color: var(--theme-color-text-secondary, #5b6470); min-width: 30px; text-align: right; font-variant-numeric: tabular-nums; }\n\n\t\t.pchk-actions { display: inline-flex; gap: 2px; opacity: 0; transition: opacity 0.1s ease; margin-left: 2px; flex: 0 0 auto; }\n\t\t.pchk-row:hover .pchk-actions { opacity: 1; }\n\t\t.pict-checklist.pchk-readonly .pchk-actions { display: none; }\n\t\t.pchk-actions button { border: none; background: none; cursor: pointer; color: var(--theme-color-text-muted, #97a1ab); width: 22px; height: 22px; border-radius: 5px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; padding: 0; }\n\t\t.pchk-actions button:hover { background: var(--theme-color-background-hover, #eef2f6); color: var(--theme-color-text-secondary, #5b6470); }\n\t\t.pchk-actions .pchk-del:hover { color: var(--theme-color-status-error, #c0392b); }\n\n\t\t.pchk-add { display: flex; align-items: center; gap: 7px; padding: 5px 4px; margin-top: 2px; }\n\t\t.pchk-add-icon { width: 18px; flex: 0 0 auto; display: inline-flex; justify-content: center; color: var(--theme-color-text-muted, #97a1ab); }\n\t\t.pchk-add-input { flex: 1; border: none; outline: none; background: none; font: inherit; color: var(--theme-color-text-primary, #1f2430); padding: 2px 4px; }\n\t\t.pchk-add-input::placeholder { color: var(--theme-color-text-muted, #97a1ab); }\n\t\t.pict-checklist.pchk-readonly .pchk-add { display: none; }\n\n\t\t.pchk-empty { color: var(--theme-color-text-muted, #97a1ab); font-size: 13px; padding: 8px 4px; }\n\t",
        Templates: [{
          Hash: 'Checklist-Section',
          Template: /*html*/"\n<div class=\"{~D:AppData.ChecklistActive.ContainerClass~}\" id=\"Checklist-Root-{~D:AppData.ChecklistActive.ViewHash~}\">\n\t<div class=\"pchk-header\">\n\t\t<span class=\"pchk-list-title\" id=\"{~D:AppData.ChecklistActive.TitleInputId~}\" {~D:AppData.ChecklistActive.List.EditAttr~} onkeydown=\"if (event.key === 'Enter') { event.preventDefault(); this.blur(); }\" onblur=\"_Pict.views['{~D:AppData.ChecklistActive.ViewHash~}'].commitListTitle(this)\">{~D:AppData.ChecklistActive.List.Title~}</span>\n\t\t{~TS:Checklist-Progress:AppData.ChecklistActive.ProgressSlot~}\n\t</div>\n\t<ul class=\"pchk-list\">{~TS:Checklist-Item:AppData.ChecklistActive.Roots~}</ul>\n\t{~TS:Checklist-Empty:AppData.ChecklistActive.EmptySlot~}\n\t{~TS:Checklist-Add:AppData.ChecklistActive.AddSlot~}\n</div>"
        }, {
          Hash: 'Checklist-Progress',
          Template: /*html*/"<div class=\"pchk-overall\"><div class=\"pchk-bar\"><div class=\"pchk-bar-fill\" style=\"width:{~D:Record.Percent~}%\"></div></div><span class=\"pchk-overall-label\">{~D:Record.Label~}</span></div>"
        }, {
          Hash: 'Checklist-Item',
          Template: /*html*/"\n<li class=\"{~D:Record.RowClass~}\" data-key=\"{~D:Record.Key~}\">\n\t<div class=\"pchk-row\">\n\t\t<button class=\"pchk-caret\" type=\"button\" title=\"Collapse / expand\" onclick=\"_Pict.views['{~D:Record.ViewHash~}'].toggleCollapse('{~D:Record.Key~}')\"><span class=\"pchk-caret-open\">{~I:ChevronDown~}</span><span class=\"pchk-caret-closed\">{~I:ChevronRight~}</span></button>\n\t\t<button class=\"pchk-check\" type=\"button\" title=\"Toggle done\" onclick=\"_Pict.views['{~D:Record.ViewHash~}'].toggleItem('{~D:Record.Key~}')\">{~I:Check~}</button>\n\t\t<span class=\"pchk-title\" id=\"{~D:Record.InputId~}\" {~D:Record.EditAttr~} onkeydown=\"_Pict.views['{~D:Record.ViewHash~}'].onTitleKeydown('{~D:Record.Key~}', event, this)\" onblur=\"_Pict.views['{~D:Record.ViewHash~}'].commitTitle('{~D:Record.Key~}', this)\">{~D:Record.Title~}</span>\n\t\t<span class=\"pchk-group-progress\"><span class=\"pchk-minibar\"><span class=\"pchk-minibar-fill\" style=\"width:{~D:Record.Percent~}%\"></span></span><span class=\"pchk-pct\">{~D:Record.Percent~}%</span></span>\n\t\t<span class=\"pchk-actions\"><button type=\"button\" class=\"pchk-addchild\" title=\"Add sub-item\" onclick=\"_Pict.views['{~D:Record.ViewHash~}'].addChild('{~D:Record.Key~}')\">{~I:Plus~}</button><button type=\"button\" class=\"pchk-del\" title=\"Delete\" onclick=\"_Pict.views['{~D:Record.ViewHash~}'].confirmDelete('{~D:Record.Key~}')\">{~I:Trash~}</button></span>\n\t</div>\n\t<ul class=\"pchk-children\">{~TS:Checklist-Item:Record.Children~}</ul>\n</li>"
        }, {
          Hash: 'Checklist-Add',
          Template: /*html*/"<div class=\"pchk-add\"><span class=\"pchk-add-icon\">{~I:Plus~}</span><input class=\"pchk-add-input\" id=\"{~D:Record.AddInputId~}\" type=\"text\" placeholder=\"{~D:Record.AddPlaceholder~}\" autocomplete=\"off\" onkeydown=\"if (event.key === 'Enter') { event.preventDefault(); _Pict.views['{~D:Record.ViewHash~}'].addItem(); } else if (event.key === 'Escape') { this.value = ''; this.blur(); }\"></div>"
        }, {
          Hash: 'Checklist-Empty',
          Template: /*html*/"<div class=\"pchk-empty\">{~D:Record.Message~}</div>"
        }],
        Renderables: [{
          RenderableHash: 'Checklist-Section',
          TemplateHash: 'Checklist-Section',
          ContentDestinationAddress: '#Checklist-Container',
          RenderMethod: 'replace'
        }]
      };
      class PictViewChecklist extends libPictView {
        onBeforeInitialize() {
          this._context = libChecklistProvider.normalizeContext(this.options.Context);
          this._list = null;
          this._items = [];
          this._active = this._emptyActive();
          this._ui = {
            FocusKey: null
          };
          this._provider = null;
          return super.onBeforeInitialize();
        }
        _initProvider() {
          if (this.options.DataProvider) {
            this._provider = this.options.DataProvider;
            return;
          }
          // Default: in-memory, backed by a slice of AppData keyed by this instance so multiple checklists
          // on a page keep separate stores and the data stays observable / serializable.
          if (!this.pict.AppData.ChecklistStores) {
            this.pict.AppData.ChecklistStores = {};
          }
          if (!this.pict.AppData.ChecklistStores[this.Hash]) {
            this.pict.AppData.ChecklistStores[this.Hash] = {};
          }
          this._provider = new _InMemoryChecklistProvider({
            Store: this.pict.AppData.ChecklistStores[this.Hash],
            Title: this.options.Title
          });
        }
        onAfterInitializeAsync(fCallback) {
          this._ensureModal();
          this._initProvider();
          this._reload().then(() => fCallback()).catch(() => fCallback());
        }
        onBeforeRender(pRenderable) {
          // Publish this instance's shaped state so the templates read it and the engine bakes THIS view's
          // hash into every inline handler (matches the multi-instance pattern in pict-section-comments).
          this.pict.AppData.ChecklistActive = this._active;
          return super.onBeforeRender(pRenderable);
        }
        onAfterRender(pRenderable, pAddress, pRecord, pContent) {
          if (this.pict.CSSMap) {
            this.pict.CSSMap.injectCSS();
          }
          this._restoreFocus();
          return super.onAfterRender(pRenderable, pAddress, pRecord, pContent);
        }

        // ---- data flow -------------------------------------------------------------------------------

        _reload() {
          if (!this._provider) {
            this._list = null;
            this._items = [];
            this._shape();
            this.render();
            return Promise.resolve();
          }
          return this._provider.loadChecklist(this._context).then(pLoaded => {
            this._list = pLoaded && pLoaded.List || null;
            this._items = pLoaded && pLoaded.Items || [];
            this._shape();
            this.render();
          }).catch(pError => {
            if (this.log) {
              this.log.error('pict-section-checklist load failed: ' + (pError && pError.message), pError);
            }
          });
        }
        _shape() {
          let tmpReadOnly = !!this.options.ReadOnly;
          let tmpEditable = !tmpReadOnly;
          let tmpDecorated = libModel.decorate(this._items);
          let tmpOverall = tmpDecorated.Overall;
          let tmpContainerClass = 'pict-checklist' + (tmpReadOnly ? ' pchk-readonly' : '') + (tmpOverall.Complete ? ' pchk-complete' : '');
          let tmpEditAttr = tmpEditable ? 'contenteditable="true"' : '';
          let tmpTitleEditAttr = tmpEditable && this.options.EditableTitle !== false ? 'contenteditable="true"' : '';
          this._active = {
            ViewHash: this.Hash,
            Editable: tmpEditable,
            ContainerClass: tmpContainerClass,
            TitleInputId: 'pchk-title-' + this.Hash,
            AddInputId: 'pchk-add-' + this.Hash,
            List: {
              Key: this._list ? this._list.Key : '',
              Title: this._list ? this._list.Title || '' : this.options.Title || '',
              EditAttr: tmpTitleEditAttr
            },
            Overall: {
              Percent: tmpOverall.Percent,
              DoneCount: tmpOverall.DoneCount,
              LeafCount: tmpOverall.LeafCount,
              Complete: tmpOverall.Complete
            },
            Roots: tmpDecorated.Roots.map(pNode => this._shapeNode(pNode, tmpEditAttr)),
            // single-element-array slots drive the conditional template sections
            ProgressSlot: this.options.ShowProgress !== false ? [{
              Percent: tmpOverall.Percent,
              Label: tmpOverall.DoneCount + ' of ' + tmpOverall.LeafCount + ' · ' + tmpOverall.Percent + '%'
            }] : [],
            AddSlot: tmpEditable ? [{
              ViewHash: this.Hash,
              AddInputId: 'pchk-add-' + this.Hash,
              AddPlaceholder: this.options.AddPlaceholder || 'Add an item'
            }] : [],
            EmptySlot: tmpDecorated.Roots.length === 0 ? [{
              Message: this.options.EmptyMessage || 'Nothing here yet.'
            }] : []
          };
        }
        _shapeNode(pNode, pEditAttr) {
          let tmpRowClass = 'pchk-item' + (pNode.IsGroup ? ' pchk-group' : ' pchk-leaf') + (pNode.Done ? ' pchk-done' : '') + (pNode.Collapsed ? ' pchk-collapsed' : '') + (pNode.IsGroup && pNode.Percent === 100 ? ' pchk-group-done' : '');
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
            Children: pNode.Collapsed ? [] : (pNode.Children || []).map(pChild => this._shapeNode(pChild, pEditAttr))
          };
        }
        _emptyActive() {
          return {
            ViewHash: this.Hash,
            ContainerClass: 'pict-checklist',
            List: {
              Title: '',
              EditAttr: ''
            },
            Overall: {
              Percent: 0,
              DoneCount: 0,
              LeafCount: 0
            },
            Roots: [],
            ProgressSlot: [],
            AddSlot: [],
            EmptySlot: []
          };
        }

        // ---- item helpers (read from the flat list) --------------------------------------------------

        _itemByKey(pKey) {
          return this._items.find(pItem => String(pItem.Key) === String(pKey)) || null;
        }
        _parentKeyOf(pItem) {
          return pItem && pItem.ParentKey != null && pItem.ParentKey !== '' ? String(pItem.ParentKey) : '';
        }
        _siblingsOf(pItem) {
          let tmpParent = this._parentKeyOf(pItem);
          return this._items.filter(pOther => this._parentKeyOf(pOther) === tmpParent).sort((pA, pB) => pA.Sort - pB.Sort);
        }
        _childrenOf(pKey) {
          return this._items.filter(pItem => String(this._parentKeyOf(pItem)) === String(pKey)).sort((pA, pB) => pA.Sort - pB.Sort);
        }

        // ---- interactions ----------------------------------------------------------------------------

        toggleItem(pKey) {
          if (this.options.ReadOnly) {
            return Promise.resolve();
          }
          let tmpItem = this._itemByKey(pKey);
          // Only leaves carry a checkbox; ignore a toggle on a group.
          if (!tmpItem || this._childrenOf(pKey).length > 0) {
            return Promise.resolve();
          }
          let tmpNext = !tmpItem.Done;
          return this._provider.updateItem(pKey, {
            Done: tmpNext
          }).then(() => {
            this._fire('onItemToggled', {
              Key: pKey,
              Done: tmpNext
            });
            return this._reloadAndChange();
          });
        }
        toggleCollapse(pKey) {
          let tmpItem = this._itemByKey(pKey);
          if (!tmpItem) {
            return Promise.resolve();
          }
          return this._provider.updateItem(pKey, {
            Collapsed: !tmpItem.Collapsed
          }).then(() => this._reload());
        }
        addItem() {
          if (this.options.ReadOnly || !this._list) {
            return Promise.resolve();
          }
          let tmpInput = typeof document !== 'undefined' ? document.getElementById(this._active.AddInputId) : null;
          let tmpTitle = tmpInput ? String(tmpInput.value || '').trim() : '';
          if (!tmpTitle) {
            return Promise.resolve();
          }
          if (tmpInput) {
            tmpInput.value = '';
          }
          this._ui.FocusKey = '__add__';
          return this._provider.createItem({
            ListKey: this._list.Key,
            ParentKey: null,
            Title: tmpTitle
          }).then(pItem => {
            this._fire('onItemAdded', pItem);
            return this._reloadAndChange();
          });
        }
        addChild(pKey) {
          if (this.options.ReadOnly || !this._list) {
            return Promise.resolve();
          }
          let tmpChildren = this._childrenOf(pKey);
          let tmpSort = tmpChildren.length ? tmpChildren[tmpChildren.length - 1].Sort + 1 : 0;
          return this._provider.createItem({
            ListKey: this._list.Key,
            ParentKey: pKey,
            Title: '',
            Sort: tmpSort
          }).then(pItem => {
            this._ui.FocusKey = pItem.Key;
            // A new child also expands the (now) group so it is visible.
            let tmpParent = this._itemByKey(pKey);
            if (tmpParent && tmpParent.Collapsed) {
              return this._provider.updateItem(pKey, {
                Collapsed: false
              }).then(() => {
                this._fire('onItemAdded', pItem);
                return this._reloadAndChange();
              });
            }
            this._fire('onItemAdded', pItem);
            return this._reloadAndChange();
          });
        }
        addSibling(pKey) {
          if (this.options.ReadOnly || !this._list) {
            return Promise.resolve();
          }
          let tmpItem = this._itemByKey(pKey);
          if (!tmpItem) {
            return this.addItem();
          }
          let tmpSiblings = this._siblingsOf(tmpItem);
          let tmpIndex = tmpSiblings.findIndex(pOther => String(pOther.Key) === String(pKey));
          let tmpNext = tmpIndex >= 0 && tmpIndex < tmpSiblings.length - 1 ? tmpSiblings[tmpIndex + 1] : null;
          let tmpSort = tmpNext ? (tmpItem.Sort + tmpNext.Sort) / 2 : tmpItem.Sort + 1;
          return this._provider.createItem({
            ListKey: this._list.Key,
            ParentKey: tmpItem.ParentKey,
            Title: '',
            Sort: tmpSort
          }).then(pItem => {
            this._ui.FocusKey = pItem.Key;
            this._fire('onItemAdded', pItem);
            return this._reloadAndChange();
          });
        }
        commitTitle(pKey, pElement) {
          if (this.options.ReadOnly) {
            return Promise.resolve();
          }
          let tmpItem = this._itemByKey(pKey);
          let tmpTitle = pElement ? String(pElement.textContent || '').trim() : '';
          if (!tmpItem || tmpItem.Title === tmpTitle) {
            return Promise.resolve();
          }
          // Keep the local copy current so a following structural action does not re-render the old title.
          tmpItem.Title = tmpTitle;
          return this._provider.updateItem(pKey, {
            Title: tmpTitle
          }).then(() => {
            this._fire('onItemEdited', {
              Key: pKey,
              Title: tmpTitle
            });
            this._fire('onChange', {
              Event: 'onItemEdited',
              Payload: {
                Key: pKey
              }
            });
          });
        }
        commitListTitle(pElement) {
          if (this.options.ReadOnly || this.options.EditableTitle === false || !this._list) {
            return Promise.resolve();
          }
          let tmpTitle = pElement ? String(pElement.textContent || '').trim() : '';
          if (this._list.Title === tmpTitle) {
            return Promise.resolve();
          }
          this._list.Title = tmpTitle;
          return this._provider.updateList(this._list.Key, {
            Title: tmpTitle
          }).then(() => {
            this._fire('onListRenamed', {
              Key: this._list.Key,
              Title: tmpTitle
            });
            this._fire('onChange', {
              Event: 'onListRenamed',
              Payload: {
                Title: tmpTitle
              }
            });
          });
        }
        onTitleKeydown(pKey, pEvent, pElement) {
          if (!pEvent) {
            return;
          }
          if (pEvent.key === 'Enter' && !pEvent.shiftKey) {
            pEvent.preventDefault();
            this.commitTitle(pKey, pElement);
            this.addSibling(pKey);
            return;
          }
          if (pEvent.key === 'Tab') {
            pEvent.preventDefault();
            this.commitTitle(pKey, pElement);
            if (pEvent.shiftKey) {
              this.outdentItem(pKey);
            } else {
              this.indentItem(pKey);
            }
            return;
          }
          if (pEvent.key === 'Backspace' && String(pElement.textContent || '') === '') {
            pEvent.preventDefault();
            this._deleteAndFocusPrev(pKey);
          }
        }
        indentItem(pKey) {
          if (this.options.ReadOnly) {
            return Promise.resolve();
          }
          let tmpItem = this._itemByKey(pKey);
          if (!tmpItem) {
            return Promise.resolve();
          }
          let tmpSiblings = this._siblingsOf(tmpItem);
          let tmpIndex = tmpSiblings.findIndex(pOther => String(pOther.Key) === String(pKey));
          if (tmpIndex <= 0) {
            return Promise.resolve();
          } // nothing to nest under
          let tmpNewParent = tmpSiblings[tmpIndex - 1];
          let tmpParentChildren = this._childrenOf(tmpNewParent.Key);
          let tmpSort = tmpParentChildren.length ? tmpParentChildren[tmpParentChildren.length - 1].Sort + 1 : 0;
          this._ui.FocusKey = pKey;
          return this._provider.updateItem(pKey, {
            ParentKey: tmpNewParent.Key,
            Sort: tmpSort
          }).then(() => {
            if (tmpNewParent.Collapsed) {
              return this._provider.updateItem(tmpNewParent.Key, {
                Collapsed: false
              });
            }
          }).then(() => this._reloadAndChange());
        }
        outdentItem(pKey) {
          if (this.options.ReadOnly) {
            return Promise.resolve();
          }
          let tmpItem = this._itemByKey(pKey);
          if (!tmpItem) {
            return Promise.resolve();
          }
          let tmpParentKey = this._parentKeyOf(tmpItem);
          if (!tmpParentKey) {
            return Promise.resolve();
          } // already at the root
          let tmpParent = this._itemByKey(tmpParentKey);
          let tmpGrandKey = tmpParent ? tmpParent.ParentKey : null;
          let tmpSort = tmpParent ? tmpParent.Sort + 0.5 : 0; // drop in just after the old parent
          this._ui.FocusKey = pKey;
          return this._provider.updateItem(pKey, {
            ParentKey: tmpGrandKey,
            Sort: tmpSort
          }).then(() => this._reloadAndChange());
        }
        confirmDelete(pKey) {
          if (this.options.ReadOnly) {
            return Promise.resolve();
          }
          let tmpItem = this._itemByKey(pKey);
          let tmpHasChildren = this._childrenOf(pKey).length > 0;
          let tmpLabel = tmpItem && tmpItem.Title ? '"' + tmpItem.Title + '"' : 'this item';
          let tmpMessage = tmpHasChildren ? 'Delete ' + tmpLabel + ' and everything nested under it?' : 'Delete ' + tmpLabel + '?';
          return this._confirm(tmpMessage, {
            title: 'Delete item',
            confirmLabel: 'Delete',
            dangerous: true
          }).then(pOk => {
            if (!pOk) {
              return;
            }
            return this._provider.deleteItem(pKey).then(() => {
              this._fire('onItemDeleted', {
                Key: pKey
              });
              return this._reloadAndChange();
            });
          });
        }
        _deleteAndFocusPrev(pKey) {
          let tmpItem = this._itemByKey(pKey);
          if (!tmpItem) {
            return Promise.resolve();
          }
          // Only fast-delete an empty leaf via Backspace; a group with children goes through the dialog.
          if (this._childrenOf(pKey).length > 0) {
            return Promise.resolve();
          }
          let tmpSiblings = this._siblingsOf(tmpItem);
          let tmpIndex = tmpSiblings.findIndex(pOther => String(pOther.Key) === String(pKey));
          let tmpPrev = tmpIndex > 0 ? tmpSiblings[tmpIndex - 1] : null;
          this._ui.FocusKey = tmpPrev ? tmpPrev.Key : null;
          return this._provider.deleteItem(pKey).then(() => {
            this._fire('onItemDeleted', {
              Key: pKey
            });
            return this._reloadAndChange();
          });
        }

        // ---- public API ------------------------------------------------------------------------------

        setReadOnly(pReadOnly) {
          this.options.ReadOnly = !!pReadOnly;
          this._shape();
          this.render();
        }
        getItems() {
          return JSON.parse(JSON.stringify(this._items));
        }
        reload() {
          return this._reload();
        }

        // ---- internals -------------------------------------------------------------------------------

        _reloadAndChange() {
          return this._reload().then(() => this._fire('onChange', {
            Event: 'onChange'
          }));
        }
        _restoreFocus() {
          if (!this._ui.FocusKey || typeof document === 'undefined') {
            return;
          }
          let tmpId = this._ui.FocusKey === '__add__' ? this._active.AddInputId : 'pchk-input-' + this.Hash + '-' + this._ui.FocusKey;
          this._ui.FocusKey = null;
          let tmpElement = document.getElementById(tmpId);
          if (!tmpElement) {
            return;
          }
          tmpElement.focus();
          if (tmpElement.tagName === 'INPUT') {
            return;
          }
          // contenteditable: drop the caret at the end.
          try {
            let tmpRange = document.createRange();
            tmpRange.selectNodeContents(tmpElement);
            tmpRange.collapse(false);
            let tmpSelection = window.getSelection();
            tmpSelection.removeAllRanges();
            tmpSelection.addRange(tmpRange);
          } catch (pError) {/* selection APIs absent (non-browser) -- focus is enough */}
        }
        _fire(pName, pPayload) {
          let tmpHandler = this.options[pName];
          if (typeof tmpHandler === 'function') {
            try {
              tmpHandler(pPayload, this);
            } catch (pError) {
              if (this.log) {
                this.log.error('checklist ' + pName + ' handler threw: ' + (pError && pError.message), pError);
              }
            }
          }
        }

        // Make sure the modal section the delete confirm uses is registered + initialized, so a host gets
        // the dialog for free (mirrors pict-section-comments). A host that already registered it is left alone.
        _ensureModal() {
          if (!this.pict.views['Pict-Section-Modal']) {
            this.pict.addView('Pict-Section-Modal', libModal.default_configuration, libModal);
          }
          let tmpModalView = this.pict.views['Pict-Section-Modal'];
          if (tmpModalView && typeof document !== 'undefined' && document.body && typeof tmpModalView.initialize === 'function') {
            tmpModalView.initialize();
          }
        }
        _confirm(pMessage, pOptions) {
          let tmpModal = this.pict.views['Pict-Section-Modal'];
          if (tmpModal && typeof tmpModal.confirm === 'function') {
            return tmpModal.confirm(pMessage, pOptions || {});
          }
          // No modal section registered: fall back to resolving true so a host without it is not blocked.
          return Promise.resolve(true);
        }
      }
      module.exports = PictViewChecklist;
      module.exports.default_configuration = _DefaultConfiguration;
    }, {
      "../ChecklistModel.js": 15,
      "../providers/ChecklistProvider-Base.js": 17,
      "pict-section-modal": 12,
      "pict-view": 14
    }]
  }, {}, [16])(16);
});
//# sourceMappingURL=pict-section-checklist.js.map
