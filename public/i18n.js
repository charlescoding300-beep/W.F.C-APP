/*
 * WFC language compatibility bridge.
 *
 * The real language engine lives in /wfc-language.js.
 * This file exists only so older pages/scripts that still load
 * /i18n.js continue working without creating a second language system.
 */

(() => {
    "use strict";

    if (window.WFC_I18N) {
        window.WFC_I18N.apply();
        return;
    }

    console.warn("WFC_I18N is not loaded yet. Load /wfc-language.js first.");
})();
