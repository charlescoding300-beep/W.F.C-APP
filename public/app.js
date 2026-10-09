const getStartedBtn = document.getElementById("getStartedBtn");
const signInBtn = document.getElementById("signInBtn");

const authScreen = document.getElementById("authScreen");
const backBtn = document.getElementById("backBtn");

const phoneStep = document.getElementById("phoneStep");
const codeStep = document.getElementById("codeStep");

const phoneInput = document.getElementById("phoneInput");
const codeInput = document.getElementById("codeInput");

const sendCodeBtn = document.getElementById("sendCodeBtn");
const verifyCodeBtn = document.getElementById("verifyCodeBtn");

const changePhoneBtn = document.getElementById("changePhoneBtn");

const authTitle = document.getElementById("authTitle");
const authDescription = document.getElementById("authDescription");
const authMessage = document.getElementById("authMessage");


let currentPhone = "";


/* OPEN AUTH */

function openAuth() {
    authScreen.classList.remove("hidden");

    phoneStep.classList.remove("hidden");
    codeStep.classList.add("hidden");

    authTitle.textContent = "Enter your phone number";

    authDescription.textContent =
        "We'll send you an 8-digit verification code.";

    authMessage.textContent = "";

    setTimeout(() => {
        phoneInput.focus();
    }, 100);
}


/* CLOSE AUTH */

function closeAuth() {
    authScreen.classList.add("hidden");
}


/* REQUEST CODE */

async function requestCode() {

    const phone = phoneInput.value.trim();

    if (!phone) {
        authMessage.textContent =
            "Enter your phone number.";

        return;
    }

    sendCodeBtn.disabled = true;
    sendCodeBtn.textContent = "Sending...";

    authMessage.textContent = "";

    try {

        const response = await fetch(
            "/api/v1/auth/request-code",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    phone
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data?.error?.message ||
                "Unable to send verification code."
            );
        }

        currentPhone = phone;

        phoneStep.classList.add("hidden");
        codeStep.classList.remove("hidden");

        authTitle.textContent =
            "Enter your verification code";

        authDescription.textContent =
            `We sent an 8-digit code to ${phone}.`;

        authMessage.textContent =
            data.development_code
                ? `Development code: ${data.development_code}`
                : "Verification code sent.";

        codeInput.focus();

    } catch (error) {

        authMessage.textContent =
            error.message;

    } finally {

        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = "Continue";
    }
}


/* VERIFY CODE */

async function verifyCode() {

    const code = codeInput.value.trim();

    if (!/^\d{8}$/.test(code)) {

        authMessage.textContent =
            "Enter the 8-digit verification code.";

        return;
    }

    verifyCodeBtn.disabled = true;
    verifyCodeBtn.textContent = "Verifying...";

    authMessage.textContent = "";

    try {

        const response = await fetch(
            "/api/v1/auth/verify-code",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    phone: currentPhone,
                    code
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data?.error?.message ||
                "Verification failed."
            );
        }

        localStorage.setItem(
            "wfc_token",
            data.token
        );

        localStorage.setItem(
            "wfc_user",
            JSON.stringify(data.user)
        );

        authMessage.textContent =
            "Verified. Opening WFC...";

        setTimeout(() => {
            window.location.href = "/app.html";
        }, 500);

    } catch (error) {

        authMessage.textContent =
            error.message;

    } finally {

        verifyCodeBtn.disabled = false;
        verifyCodeBtn.textContent = "Verify";
    }
}


/* CHANGE NUMBER */

function changePhone() {

    codeInput.value = "";

    phoneStep.classList.remove("hidden");
    codeStep.classList.add("hidden");

    authTitle.textContent =
        "Enter your phone number";

    authDescription.textContent =
        "We'll send you an 8-digit verification code.";

    authMessage.textContent = "";

    phoneInput.focus();
}


/* EVENTS */

getStartedBtn.addEventListener(
    "click",
    openAuth
);

signInBtn.addEventListener(
    "click",
    openAuth
);

backBtn.addEventListener(
    "click",
    closeAuth
);

sendCodeBtn.addEventListener(
    "click",
    requestCode
);

verifyCodeBtn.addEventListener(
    "click",
    verifyCode
);

changePhoneBtn.addEventListener(
    "click",
    changePhone
);


/* ENTER KEY */

phoneInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            requestCode();
        }
    }
);

codeInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            verifyCode();
        }
    }
);


/* ONLY NUMBERS IN CODE */

codeInput.addEventListener(
    "input",
    () => {
        codeInput.value =
            codeInput.value
                .replace(/\D/g, "")
                .slice(0, 8);
    }
);
