(() => {
    "use strict";

    function goBack(fallback = "/") {
        const currentUrl = window.location.href;

        if (window.history.length > 1) {
            window.history.back();

            // If the browser did not actually navigate, use fallback.
            setTimeout(() => {
                if (window.location.href === currentUrl) {
                    window.location.replace(fallback);
                }
            }, 350);

            return;
        }

        window.location.replace(fallback);
    }

    window.WFC_BACK = {
        goBack
    };
})();
