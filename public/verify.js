(() => {
    "use strict";

    const phone =
        sessionStorage.getItem("wfc_phone");

    const phoneDisplay =
        document.getElementById("phoneDisplay");

    const codeInput =
        document.getElementById("verificationCode");

    const verifyButton =
        document.getElementById("verifyButton");

    const verifyError =
        document.getElementById("verifyError");

    const changeNumber =
        document.getElementById("changeNumber");

    const resendButton =
        document.getElementById("resendButton");

    const resendTimer =
        document.getElementById("resendTimer");

    const backButton =
        document.getElementById("backButton");


    const t = key => {
        return window.WFC_I18N
            ? window.WFC_I18N.t(key)
            : key;
    };


    if (!phone) {
        window.location.replace("/phone.html");
        return;
    }


    phoneDisplay.textContent = maskPhone(phone);


    function maskPhone(value) {

        const digits =
            String(value).replace(/\D/g, "");

        if (digits.length <= 7) {
            return value;
        }

        return (
            "+" +
            digits.slice(0, 3) +
            " ••••••" +
            digits.slice(-3)
        );
    }


    function updateButton() {

        const code =
            codeInput.value.replace(/\D/g, "");

        verifyButton.disabled =
            code.length !== 8;
    }


    codeInput.addEventListener(
        "input",
        () => {

            codeInput.value =
                codeInput.value
                    .replace(/\D/g, "")
                    .slice(0, 8);

            verifyError.textContent = "";

            updateButton();
        }
    );


    codeInput.addEventListener(
        "paste",
        event => {

            event.preventDefault();

            const pasted =
                (
                    event.clipboardData ||
                    window.clipboardData
                )
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 8);

            codeInput.value = pasted;

            verifyError.textContent = "";

            updateButton();
        }
    );


    verifyButton.addEventListener(
        "click",
        async () => {

            const code =
                codeInput.value
                    .replace(/\D/g, "");

            if (code.length !== 8) {
                return;
            }

            verifyButton.disabled = true;

            verifyButton.innerHTML =
                `<span>${escapeHtml(t("verifying") || "Verifying...")}</span>`;

            verifyError.textContent = "";

            try {

                const response =
                    await fetch(
                        "/api/v1/auth/verify-code",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                phone,
                                code
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.error?.message ||
                        "Incorrect verification code"
                    );
                }


                if (!data.token) {
                    throw new Error(
                        "Authentication token was not returned."
                    );
                }


                sessionStorage.removeItem(
                    "wfc_development_code"
                );


                localStorage.setItem(
                    "wfc_token",
                    data.token
                );


                if (data.user) {

                    localStorage.setItem(
                        "wfc_user",
                        JSON.stringify(data.user)
                    );
                }


                sessionStorage.removeItem(
                    "wfc_phone"
                );


                if (
                    data.next === "profile"
                ) {

                    window.location.replace(
                        "/chat.html"
                    );

                    return;
                }


                window.location.replace(
                    "/chat.html"
                );

            } catch (error) {

                verifyError.textContent =
                    error.message;

                verifyButton.disabled =
                    false;

                verifyButton.innerHTML =
                    `<span>${escapeHtml(t("verify") || "Verify")}</span><span aria-hidden="true">→</span>`;
            }
        }
    );


    changeNumber.addEventListener(
        "click",
        () => {

            sessionStorage.removeItem(
                "wfc_phone"
            );

            sessionStorage.removeItem(
                "wfc_development_code"
            );

            window.location.replace(
                "/phone.html"
            );
        }
    );


    resendButton.addEventListener(
        "click",
        requestNewCode
    );


    async function requestNewCode() {

        if (!phone) {
            return;
        }

        resendButton.disabled = true;

        resendTimer.textContent =
            " • 60s";

        verifyError.textContent = "";

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
                            phone
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data?.error?.message ||
                    "Unable to resend verification code."
                );
            }


            if (data.development_code) {

                sessionStorage.setItem(
                    "wfc_development_code",
                    data.development_code
                );
            }


            startResendTimer();

            codeInput.focus();

        } catch (error) {

            verifyError.textContent =
                error.message;

            resendButton.disabled = false;

            resendTimer.textContent = "";
        }
    }


    let resendInterval = null;


    function startResendTimer() {

        let seconds = 60;

        resendButton.disabled = true;

        resendTimer.textContent =
            ` • ${seconds}s`;


        clearInterval(resendInterval);


        resendInterval =
            setInterval(() => {

                seconds -= 1;

                if (seconds <= 0) {

                    clearInterval(
                        resendInterval
                    );

                    resendTimer.textContent = "";

                    resendButton.disabled = false;

                    return;
                }

                resendTimer.textContent =
                    ` • ${seconds}s`;

            }, 1000);
    }


    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                if (
                    window.WFC_BACK &&
                    typeof window.WFC_BACK.goBack === "function"
                ) {
                    window.WFC_BACK.goBack(
                        "/phone.html"
                    );

                    return;
                }

                window.location.replace(
                    "/phone.html"
                );
            }
        );
    }


    updateButton();

    setTimeout(
        () => codeInput.focus(),
        150
    );

})();
