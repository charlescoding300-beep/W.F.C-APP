(() => {
    "use strict";

    const languageSelector =
        document.getElementById("languageSelector");

    const languagePanel =
        document.getElementById("languagePanel");

    const closeLanguage =
        document.getElementById("closeLanguage");

    const currentLanguage =
        document.getElementById("currentLanguage");

    const getStarted =
        document.getElementById("getStarted");

    const languageOptions =
        document.querySelectorAll("[data-language]");


    function openLanguagePanel() {
        languagePanel.classList.add("open");

        languagePanel.setAttribute(
            "aria-hidden",
            "false"
        );

        languageSelector.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.style.overflow = "hidden";
    }


    function closeLanguagePanel() {
        languagePanel.classList.remove("open");

        languagePanel.setAttribute(
            "aria-hidden",
            "true"
        );

        languageSelector.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.style.overflow = "";
    }


    function updateLanguageDisplay() {

        if (!window.WFC_I18N) {
            return;
        }

        const language =
            window.WFC_I18N.getLanguage();

        const dictionary =
            window.WFC_I18N.translations[language];

        if (dictionary) {
            currentLanguage.textContent =
                dictionary.name;
        }

        window.WFC_I18N.apply();
    }


    languageSelector.addEventListener(
        "click",
        openLanguagePanel
    );


    closeLanguage.addEventListener(
        "click",
        closeLanguagePanel
    );


    languageOptions.forEach(option => {

        option.addEventListener("click", () => {

            const names = {
                "English": "en",
                "Français": "fr",
                "Español": "es",
                "Português": "pt",
                "Deutsch": "de",
                "Italiano": "it",
                "Nederlands": "nl",
                "Türkçe": "tr",
                "العربية": "ar",
                "हिन्दी": "hi",
                "বাংলা": "bn",
                "中文": "zh",
                "日本語": "ja",
                "한국어": "ko"
            };

            const language =
                names[option.dataset.language];

            if (language && window.WFC_I18N) {
                window.WFC_I18N.setLanguage(language);
                updateLanguageDisplay();
            }

            closeLanguagePanel();
        });

    });


    getStarted.addEventListener(
        "click",
        () => {
            window.location.href = "/phone.html";
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                languagePanel.classList.contains("open")
            ) {
                closeLanguagePanel();
            }

        }
    );


    window.addEventListener(
        "wfc-language-change",
        updateLanguageDisplay
    );


    updateLanguageDisplay();

})();
