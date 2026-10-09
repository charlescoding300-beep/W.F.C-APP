(() => {
    "use strict";

    const countries =
        Array.isArray(window.WFC_COUNTRIES)
            ? window.WFC_COUNTRIES
            : [];

    const backButton =
        document.getElementById("backButton");

    const countrySelector =
        document.getElementById("countrySelector");

    const countryPanel =
        document.getElementById("countryPanel");

    const countryBack =
        document.getElementById("countryBack");

    const countrySearch =
        document.getElementById("countrySearch");

    const countryList =
        document.getElementById("countryList");

    const selectedFlag =
        document.getElementById("selectedFlag");

    const selectedCountryName =
        document.getElementById("selectedCountryName");

    const selectedCallingCode =
        document.getElementById("selectedCallingCode");

    const phoneCode =
        document.getElementById("phoneCode");

    const phoneInput =
        document.getElementById("phoneInput");

    const continueButton =
        document.getElementById("continueButton");

    const phoneError =
        document.getElementById("phoneError");


    let selectedCountry = null;


    /* Nigeria by default */

    selectedCountry =
        countries.find(country =>
            country.code === "NG"
        ) || countries[0];


    function updateSelectedCountry() {

        if (!selectedCountry) {
            return;
        }

        selectedFlag.innerHTML =
            `<img src="/flags/${selectedCountry.code.toLowerCase()}.svg" alt="${selectedCountry.name} flag">`;

        selectedCountryName.textContent =
            selectedCountry.name;

        selectedCallingCode.textContent =
            selectedCountry.callingCode;

        phoneCode.value =
            selectedCountry.callingCode;
    }


    function renderCountries(search = "") {

        const query =
            search.trim().toLowerCase();

        const filtered =
            countries.filter(country => {

                if (!query) {
                    return true;
                }

                return (
                    country.name
                        .toLowerCase()
                        .includes(query)
                    ||
                    country.code
                        .toLowerCase()
                        .includes(query)
                    ||
                    country.callingCode
                        .includes(query)
                );
            });


        countryList.innerHTML = "";


        if (!filtered.length) {

            const empty =
                document.createElement("div");

            empty.className =
                "no-countries";

            empty.textContent =
                window.WFC_I18N ? window.WFC_I18N.t("noCountries") : "No countries found.";

            countryList.appendChild(empty);

            return;
        }


        filtered.forEach(country => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "country-item";


            button.innerHTML = `
                <span class="country-flag">
                    <img
                        src="/flags/${country.code.toLowerCase()}.svg"
                        alt="${country.name} flag"
                    >
                </span>
                </span>

                <span class="country-details">

                    <span class="country-name">
                        ${country.name}
                    </span>

                    <span class="country-calling">
                        ${country.callingCode}
                    </span>

                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    selectedCountry =
                        country;

                    updateSelectedCountry();

                    closeCountryPanel();

                    phoneInput.focus();
                }
            );


            countryList.appendChild(button);
        });
    }


    function openCountryPanel() {

        renderCountries();

        countryPanel.classList.add("open");

        countryPanel.setAttribute(
            "aria-hidden",
            "false"
        );

        countrySelector.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.style.overflow =
            "hidden";

        setTimeout(() => {
            countrySearch.focus();
        }, 100);
    }


    function closeCountryPanel() {

        countryPanel.classList.remove("open");

        countryPanel.setAttribute(
            "aria-hidden",
            "true"
        );

        countrySelector.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.style.overflow = "";

        countrySearch.value = "";

        renderCountries();
    }


    countrySelector.addEventListener(
        "click",
        openCountryPanel
    );


    countryBack.addEventListener(
        "click",
        closeCountryPanel
    );


    countrySearch.addEventListener(
        "input",
        () => {
            renderCountries(
                countrySearch.value
            );
        }
    );


    backButton.addEventListener(
        "click",
        () => {
            window.WFC_BACK.goBack("/");
        }
    );


    function findCountryByCallingCode(value) {

        let code =
            value.trim().replace(/[^0-9+]/g, "");

        if (!code) {
            return null;
        }

        if (!code.startsWith("+")) {
            code = "+" + code;
        }

        // When the user types "1", use United States.
        if (code === "+1") {
            return countries.find(country =>
                country.code === "US"
            ) || null;
        }

        // +44 is shared by several territories.
        // When entered directly, use the United Kingdom as the canonical country.
        if (code === "+44") {
            return countries.find(country =>
                country.code === "GB"
            ) || null;
        }

        return countries.find(country =>
            country.callingCode === code
        ) || null;
    }


    function syncCountryFromCode() {

        const country =
            findCountryByCallingCode(
                phoneCode.value
            );

        if (!country) {
            return false;
        }

        selectedCountry = country;

        selectedFlag.innerHTML =
            `<img src="/flags/${selectedCountry.code.toLowerCase()}.svg" alt="${selectedCountry.name} flag">`;

        selectedCountryName.textContent =
            selectedCountry.name;

        selectedCallingCode.textContent =
            selectedCountry.callingCode;

        phoneCode.value =
            selectedCountry.callingCode;

        return true;
    }


    phoneCode.addEventListener(
        "input",
        () => {

            let value =
                phoneCode.value
                    .replace(/[^0-9+]/g, "");

            if (!value.startsWith("+")) {
                value = "+" + value.replace(/\+/g, "");
            }

            phoneCode.value = value;

            phoneError.textContent = "";

            const country =
                findCountryByCallingCode(value);

            if (country) {

                selectedCountry = country;

                selectedFlag.innerHTML =
                    `<img src="/flags/${country.code.toLowerCase()}.svg" alt="${country.name} flag">`;

                selectedCountryName.textContent =
                    country.name;

                selectedCallingCode.textContent =
                    country.callingCode;
            }
        }
    );


    phoneCode.addEventListener(
        "blur",
        () => {

            if (!syncCountryFromCode()) {

                phoneCode.value =
                    selectedCountry.callingCode;
            }
        }
    );


    phoneInput.addEventListener(
        "input",
        () => {
            phoneError.textContent = "";
        }
    );


    continueButton.addEventListener(
        "click",
        async () => {

            const number =
                phoneInput.value.trim();

            if (!number) {
                phoneError.textContent =
                    window.WFC_I18N ? window.WFC_I18N.t("enterPhone") : "Enter your phone number.";
                phoneInput.focus();
                return;
            }


            let nationalNumber =
                number.replace(/\D/g, "");

            // Follow international-number entry rules:
            // remove a national leading zero when a country
            // calling code is already selected.
            nationalNumber =
                nationalNumber.replace(/^0+/, "");

            const fullPhone =
                `${selectedCountry.callingCode}${nationalNumber}`;


            continueButton.disabled = true;

            continueButton.innerHTML =
                `<span>${window.WFC_I18N ? window.WFC_I18N.t("sendingCode") : "Sending code..."}</span>`;


            phoneError.textContent = "";


            try {

                const response =
                    await fetch(
                        "/api/v1/auth/request-code",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                phone: fullPhone
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data?.error?.message ||
                        (window.WFC_I18N ? window.WFC_I18N.t("sendingCode") : "Unable to send verification code.")
                    );
                }


                sessionStorage.setItem(
                    "wfc_phone",
                    fullPhone
                );


                if (
                    data.development_code
                ) {
                    sessionStorage.setItem(
                        "wfc_development_code",
                        data.development_code
                    );
                }


                window.location.href =
                    "/verify.html";

            } catch (error) {

                phoneError.textContent =
                    error.message;

                continueButton.disabled =
                    false;

                continueButton.innerHTML =
                    `<span>${window.WFC_I18N ? window.WFC_I18N.t("continue") : "Continue"}</span><span>→</span>`;
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                countryPanel.classList.contains("open")
            ) {
                closeCountryPanel();
            }
        }
    );


    updateSelectedCountry();

    renderCountries();

})();
