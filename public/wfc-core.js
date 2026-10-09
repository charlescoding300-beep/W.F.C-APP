(() => {
    "use strict";

    const STORAGE = {
        language: "wfc_language",
        token: "wfc_token",
        user: "wfc_user",
        phone: "wfc_phone"
    };

    const WFC = {
        storage: STORAGE,

        getToken() {
            return localStorage.getItem(STORAGE.token);
        },

        setToken(token) {
            if (token) {
                localStorage.setItem(STORAGE.token, token);
            }
        },

        clearSession() {
            localStorage.removeItem(STORAGE.token);
            localStorage.removeItem(STORAGE.user);
            sessionStorage.removeItem(STORAGE.phone);
            sessionStorage.removeItem("wfc_development_code");
        },

        getUser() {
            try {
                return JSON.parse(
                    localStorage.getItem(STORAGE.user) || "null"
                );
            } catch {
                return null;
            }
        },

        setUser(user) {
            if (user) {
                localStorage.setItem(
                    STORAGE.user,
                    JSON.stringify(user)
                );
            }
        },

        async api(path, options = {}) {
            const headers = {
                "Content-Type": "application/json",
                ...(options.headers || {})
            };

            const token = this.getToken();

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(path, {
                ...options,
                headers
            });

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (response.status === 401) {
                this.clearSession();

                window.dispatchEvent(
                    new CustomEvent("wfc-auth-expired")
                );
            }

            if (!response.ok) {
                const error = new Error(
                    data?.error?.message ||
                    "Something went wrong."
                );

                error.code = data?.error?.code;
                error.status = response.status;
                error.data = data;

                throw error;
            }

            return data;
        },

        async me() {
            const result =
                await this.api("/api/v1/users/me");

            if (result.user) {
                this.setUser(result.user);
            }

            return result.user;
        },

        logout() {
            this.clearSession();
            window.location.href = "/";
        },

        back(fallback = "/") {
            if (
                window.history.length > 1 &&
                document.referrer
            ) {
                window.history.back();
            } else {
                window.location.replace(fallback);
            }
        },

        requireAuth(fallback = "/") {
            if (!this.getToken()) {
                window.location.replace(fallback);
                return false;
            }

            return true;
        }
    };

    window.WFC = WFC;

    window.WFC_BACK = {
        goBack(fallback = "/") {
            WFC.back(fallback);
        }
    };

    window.addEventListener(
        "wfc-auth-expired",
        () => {
            if (
                !window.location.pathname.includes("index.html") &&
                window.location.pathname !== "/"
            ) {
                window.location.replace("/");
            }
        }
    );
})();
