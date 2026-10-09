(() => {
    "use strict";

    const API = "/api/v1";

    let currentChat = null;
    let zenxBetaChatId = null;
    let currentUser = null;
    let chats = [];
    let users = [];

    const $ = (id) => document.getElementById(id);

    function token() {
        return window.WFC?.getToken?.() ||
            localStorage.getItem("wfc_token") ||
            sessionStorage.getItem("wfc_token") ||
            "";
    }

    async function api(path, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        const t = token();

        if (t) {
            headers.Authorization = `Bearer ${t}`;
        }

        const response = await fetch(`${API}${path}`, {
            ...options,
            headers
        });

        let data = {};

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok) {
            throw new Error(
                data?.error?.message ||
                data?.message ||
                "Request failed"
            );
        }

        return data;
    }


    function showScreen(name) {
        $("chatHome")?.classList.toggle(
            "hidden",
            name !== "home"
        );

        $("conversationScreen")?.classList.toggle(
            "hidden",
            name !== "conversation"
        );

        $("newChatScreen")?.classList.toggle(
            "hidden",
            name !== "new"
        );
    }


    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function displayName(user) {
        return (
            user?.display_name ||
            user?.username ||
            user?.phone ||
            "User"
        );
    }


    function formatTime(value) {
        if (!value) return "";

        const date = new Date(
            String(value).replace(" ", "T") + "Z"
        );

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat(
            window.WFC_I18N?.getLanguage?.() || "en",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(date);
    }


    function formatChatPreview(chat) {
        if (!chat.last_message_body) {
            return "No messages yet";
        }

        if (chat.last_message_type !== "text") {
            return "Media";
        }

        return chat.last_message_body;
    }


    function renderChats() {
        const list = $("chatList");

        if (!list) return;

        const zenxRow = `
            <button type="button" class="chat-row zenx-beta-row" data-zenx-beta="true">
                <div class="chat-row-avatar zenx-beta-avatar">✦</div>

                <div class="chat-row-content">
                    <div class="chat-row-top">
                        <strong>ZENX-BETA</strong>
                        <time>AI</time>
                    </div>

                    <div class="chat-row-bottom">
                        <span>Independent AI assistant</span>
                    </div>
                </div>
            </button>
        `;

        const humanChats = chats.filter(chat => chat.type !== "ai");

        const chatRows = humanChats.map(chat => {
            const name =
                chat.type === "private"
                    ? displayName({
                        display_name: chat.other_display_name,
                        username: chat.other_username
                    })
                    : (chat.name || "Group");

            const avatar = chat.type === "private" ? "👤" : "👥";

            return `
                <button
                    type="button"
                    class="chat-row"
                    data-chat-id="${chat.id}"
                >
                    <div class="chat-row-avatar">${avatar}</div>

                    <div class="chat-row-content">
                        <div class="chat-row-top">
                            <strong>${escapeHTML(name)}</strong>
                            <time>${formatTime(chat.last_message_at || chat.updated_at)}</time>
                        </div>

                        <div class="chat-row-bottom">
                            <span>${escapeHTML(formatChatPreview(chat.last_message))}</span>
                        </div>
                    </div>
                </button>
            `;
        }).join("");

        list.innerHTML = zenxRow + chatRows;

        list.querySelector("[data-zenx-beta]")?.addEventListener(
            "click",
            openZenxBeta
        );

        list.querySelectorAll("[data-chat-id]").forEach(button => {
            button.addEventListener("click", () => {
                openConversation(Number(button.dataset.chatId));
            });
        });
    }

    async function loadChats() {
        try {
            const data = await api("/chats");

            chats = Array.isArray(data.chats)
                ? data.chats
                : [];

            renderChats();

        } catch (error) {
            console.error("Failed to load chats:", error);

            const list = $("chatList");

            if (list) {
                list.innerHTML = `
                    <div class="empty-chat">
                        <div class="empty-icon">⚠️</div>

                        <h1>
                            Unable to load chats
                        </h1>

                        <p>
                            ${escapeHTML(error.message)}
                        </p>

                        <button
                            id="retryChats"
                            class="primary-button"
                            type="button">
                            Retry
                        </button>
                    </div>
                `;

                $("retryChats")?.addEventListener(
                    "click",
                    loadChats
                );
            }
        }
    }


    async function loadCurrentUser() {
        try {
            const data = await api("/users/me");

            currentUser =
                data.user ||
                data;

            if ($("chatUserName")) {
                $("chatUserName").textContent =
                    displayName(currentUser);
            }

        } catch (error) {
            console.error(
                "Failed to load current user:",
                error
            );
        }
    }


    async function openZenxBeta() {
        try {
            const data = await api("/ai/chat");

            zenxBetaChatId = Number(data.chat.id);

            currentChat = {
                id: zenxBetaChatId,
                type: "ai",
                name: "ZENX-BETA",
                other_display_name: "ZENX-BETA",
                other_username: "zenx-beta",
                other_status: "AI assistant"
            };

            $("conversationName").textContent = "ZENX-BETA";
            $("conversationStatus").textContent = "AI assistant";

            const avatar = $("conversationAvatar");

            if (avatar) {
                avatar.textContent = "✦";
                avatar.classList.add("zenx-beta-conversation-avatar");
            }

            showScreen("conversation");

            await loadMessages(zenxBetaChatId);

            $("messageInput")?.focus();
        } catch (error) {
            console.error("Unable to open ZENX-BETA:", error);
            alert(error.message || "Unable to open ZENX-BETA");
        }
    }

    async function openConversation(chatId) {
        try {
            const data = await api(
                `/chats/${chatId}`
            );

            currentChat = data.chat;

            const otherName =
                displayName({
                    display_name:
                        currentChat.other_display_name,
                    username:
                        currentChat.other_username
                });

            $("conversationName").textContent =
                otherName;

            $("conversationStatus").textContent =
                currentChat.other_status ||
                "offline";

            showScreen("conversation");

            await loadMessages(chatId);

            await markMessagesRead(chatId);

            $("messageInput")?.focus();

        } catch (error) {
            console.error(
                "Failed to open conversation:",
                error
            );

            alert(error.message);
        }
    }


    async function loadMessages(chatId) {
        const list = $("messageList");

        if (!list) return;

        try {
            const data = await api(
                `/messages/${chatId}`
            );

            const messages = Array.isArray(data.messages)
                ? data.messages
                : [];

            if (!messages.length) {
                if (currentChat?.type === "ai") {
                    list.innerHTML = `
                        <div class="zenx-beta-empty">
                            <div class="zenx-empty-icon">✦</div>
                            <strong>ZENX-BETA</strong>
                            <span>Your independent AI assistant inside W.F.C’sChat.</span>
                        </div>
                    `;
                } else {
                    list.innerHTML = `
                        <div class="chat-empty">
                            No messages yet.
                        </div>
                    `;
                }

                return;
            }

            list.innerHTML = messages.map(message => {
                const isAI =
                    currentChat?.type === "ai" &&
                    message.message_type === "ai";

                const mine =
                    !isAI &&
                    Number(message.sender_id) === Number(currentUser?.id);

                const rowClass = isAI ? "theirs ai-message" : (mine ? "mine" : "theirs");

                return `
                    <div class="message-row ${rowClass}">
                        <div class="message-bubble">
                            ${
                                isAI
                                    ? `<div class="ai-message-name">ZENX-BETA</div>`
                                    : ""
                            }

                            <div class="message-body">
                                ${escapeHTML(message.body || "")}
                            </div>

                            <div class="message-meta">
                                ${formatTime(message.created_at)}
                                ${mine ? " ✓" : ""}
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

            list.scrollTop = list.scrollHeight;

        } catch (error) {
            console.error("Unable to load messages:", error);

            list.innerHTML = `
                <div class="chat-empty">
                    Unable to load messages.
                </div>
            `;
        }
    }

    async function markMessagesRead(chatId) {
        try {
            await api(
                `/messages/${chatId}/read`,
                {
                    method: "PATCH"
                }
            );
        } catch (error) {
            console.error(
                "Failed to mark messages read:",
                error
            );
        }
    }


    async function sendMessage(event) {
        event.preventDefault();

        if (!currentChat) return;

        const input = $("messageInput");

        if (!input) return;

        const body = input.value.trim();

        if (!body) return;

        input.value = "";

        try {
            if (currentChat.type === "ai") {
                await api(
                    "/ai/chat",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            message: body
                        })
                    }
                );

                await loadMessages(currentChat.id);
                return;
            }

            await api(
                "/messages",
                {
                    method: "POST",
                    body: JSON.stringify({
                        chat_id: currentChat.id,
                        body
                    })
                }
            );

            await loadMessages(currentChat.id);
            await loadChats();

        } catch (error) {
            console.error("Unable to send message:", error);

            input.value = body;

            alert(
                error.message ||
                "Unable to send message"
            );
        }
    }

    function setupNavigation() {
        $("floatingNewChat")?.addEventListener(
            "click",
            openNewChat
        );

        $("newChatBack")?.addEventListener(
            "click",
            closeNewChat
        );

        $("conversationBack")?.addEventListener(
            "click",
            () => {
                currentChat = null;
                showScreen("home");
                loadChats();
            }
        );

        $("messageForm")?.addEventListener(
            "submit",
            sendMessage
        );

        $("userSearch")?.addEventListener(
            "input",
            event => {
                searchUsers(event.target.value);
            }
        );

        $("chatSearch")?.addEventListener(
            "input",
            event => {
                const query =
                    event.target.value
                        .trim()
                        .toLowerCase();

                document
                    .querySelectorAll(".chat-row")
                    .forEach(row => {
                        const text =
                            row.textContent
                                .toLowerCase();

                        row.style.display =
                            !query ||
                            text.includes(query)
                                ? ""
                                : "none";
                    });
            }
        );

        document
            .querySelectorAll(".chat-tab")
            .forEach(tab => {
                tab.addEventListener(
                    "click",
                    () => {
                        document
                            .querySelectorAll(".chat-tab")
                            .forEach(item =>
                                item.classList.remove(
                                    "active"
                                )
                            );

                        tab.classList.add("active");
                    }
                );
            });

        $("settingsButton")?.addEventListener(
            "click",
            () => {
                alert("Settings will be connected next.");
            }
        );
    }


    function setupLanguageListener() {
        window.addEventListener(
            "wfc-language-change",
            () => {
                renderChats();

                if (currentChat) {
                    loadMessages(
                        currentChat.id
                    );
                }
            }
        );
    }


    async function init() {
        setupNavigation();
        setupLanguage();
        setupLanguageListener();

        window.WFC_I18N?.apply?.();

        await loadCurrentUser();
        await loadChats();
    }


    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
