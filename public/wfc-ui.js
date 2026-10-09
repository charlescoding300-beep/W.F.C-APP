(() => {
    "use strict";

    function ensureNotice() {
        let element =
            document.getElementById("wfcNotice");

        if (element) return element;

        element = document.createElement("div");
        element.id = "wfcNotice";
        element.setAttribute("role", "status");

        Object.assign(element.style, {
            position: "fixed",
            left: "50%",
            bottom: "24px",
            transform: "translate(-50%, 20px)",
            padding: "13px 18px",
            borderRadius: "12px",
            background: "#222",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            zIndex: "99999",
            opacity: "0",
            pointerEvents: "none",
            transition: "opacity .2s, transform .2s",
            maxWidth: "calc(100vw - 40px)",
            textAlign: "center"
        });

        document.body.appendChild(element);

        return element;
    }

    function notice(message, type = "info") {
        const element = ensureNotice();

        element.textContent = message;

        element.style.background =
            type === "error"
                ? "#b42318"
                : type === "success"
                    ? "#087443"
                    : "#222";

        element.style.opacity = "1";
        element.style.transform =
            "translate(-50%, 0)";

        clearTimeout(element._timer);

        element._timer = setTimeout(() => {
            element.style.opacity = "0";
            element.style.transform =
                "translate(-50%, 20px)";
        }, 3000);
    }

    function loading(button, state, text = "Please wait...") {
        if (!button) return;

        if (state) {
            button.dataset.originalText =
                button.textContent;

            button.disabled = true;
            button.setAttribute(
                "aria-busy",
                "true"
            );

            button.textContent = text;
        } else {
            button.disabled = false;
            button.removeAttribute("aria-busy");

            if (button.dataset.originalText) {
                button.textContent =
                    button.dataset.originalText;

                delete button.dataset.originalText;
            }
        }
    }

    window.WFC_UI = {
        notice,
        loading
    };
})();
