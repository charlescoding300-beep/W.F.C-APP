(() => {
    "use strict";

    const API = "/api/v1";

    let currentChat = null;
    let currentMessages = [];
    let zenxBetaChatId = null;
    let currentUser = null;
    let chats = [];
    let users = [];
    let activeScreen = "home";
    let nextAnimatedMessageId = null;
    let sendAudioContext = null;
    let sendSoundEnabled = true;
    try { sendSoundEnabled = localStorage.getItem('wfc_send_sound') !== 'off'; } catch {}

    const $ = (id) => document.getElementById(id);

    const EMOJI_CATALOG = [
        ['😀','grinning face'],['😃','big smile'],['😄','smile eyes'],['😁','beaming'],['😆','laughing'],['😅','sweat smile'],['😂','joy laugh'],['🙂','smile'],['🙃','upside down'],['😉','wink'],['😊','blush'],['😍','love eyes'],['🥰','hearts'],['😘','kiss'],['😋','yum'],['🤗','hug'],['🤔','thinking'],['🥲','happy tears'],['😭','crying'],['😎','cool'],['😴','sleep'],['😮','surprised'],['😡','angry'],['🤩','star eyes'],
        ['👋','wave hello'],['👌','ok'],['✌️','peace'],['🤞','crossed fingers'],['🙌','celebrate'],['👏','clap'],['👍','thumbs up'],['👎','thumbs down'],['🙏','please thanks'],['💪','strong'],['🫶','heart hands'],['🤝','handshake'],['❤️','red heart'],['🧡','orange heart'],['💛','yellow heart'],['💚','green heart'],['💙','blue heart'],['💜','purple heart'],['🤍','white heart'],['💔','broken heart'],['💯','hundred'],
        ['🐶','dog'],['🐱','cat'],['🦋','butterfly'],['🌻','sunflower'],['🌿','leaf'],['🌈','rainbow'],['☀️','sun'],['🌙','moon'],['⭐','star'],['🔥','fire'],['❄️','snowflake'],['☕','coffee'],['🍕','pizza'],['🍔','burger'],['🍰','cake'],['🎂','birthday cake'],['⚽','football'],['🏀','basketball'],['🎮','game'],['🎉','party'],['🎁','gift'],['🎵','music'],['📸','camera'],['💡','idea'],['✨','sparkles'],['🚀','rocket'],['✅','check'],['🙏','thanks']
    ];

    const WFC_STICKER_PACKS=[
      {id:"motion",name:"W.F.C Motion",description:"A little movement for everyday chats.",stickers:[{id:"wfc:wave",title:"Wave",emoji:"👋",asset:"wave.svg"},{id:"wfc:heart",title:"Blue heart",emoji:"💙",asset:"heart.svg"},{id:"wfc:sparkle",title:"Sparkle",emoji:"✨",asset:"sparkle.svg"},{id:"wfc:rocket",title:"On the way",emoji:"🚀",asset:"rocket.svg"}]},
      {id:"feelings",name:"W.F.C Feelings",description:"Warm reactions, drawn for W.F.C.",stickers:[{id:"wfc:laugh",title:"Laugh",emoji:"😂",asset:"laugh.svg"},{id:"wfc:party",title:"Celebrate",emoji:"🎉",asset:"party.svg"},{id:"wfc:thanks",title:"Thanks",emoji:"🫶",asset:"thanks.svg"},{id:"wfc:cheers",title:"Cheers",emoji:"🥳",asset:"cheers.svg"}]},
      {id:"people",name:"W.F.C People",description:"Original animated human reactions, drawn as vector art.",stickers:[{id:"wfc:person-wave",title:"Hello",emoji:"👋",asset:"person-wave.svg",lottie:"person-wave.json"},{id:"wfc:person-clap",title:"Applause",emoji:"👏",asset:"person-clap.svg",lottie:"person-clap.json"},{id:"wfc:person-laugh",title:"Laughing",emoji:"😂",asset:"person-laugh.svg",lottie:"person-laugh.json"},{id:"wfc:person-hug",title:"Warm hug",emoji:"🫶",asset:"person-hug.svg",lottie:"person-hug.json"}]}    ];
    const WFC_GIF_LIBRARY=[
      {id:"people-happy",title:"Happy person",keywords:"smile reaction joy",asset:"people-happy.gif",source:"https://commons.wikimedia.org/wiki/File:Happy_Emotion.gif",sourceTitle:"Happy Emotion.gif",creator:"GRPH3B18",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/"},
      {id:"people-wave",title:"Wave hello",keywords:"waving man person hello",asset:"people-wave.gif",source:"https://commons.wikimedia.org/wiki/File:Man_Waving_Hand_GIF_Animation_Loop.gif",sourceTitle:"Man Waving Hand GIF Animation Loop.gif",creator:"VideoPlasty",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
      {id:"people-applause",title:"Bravo",keywords:"clap clapping applause man",asset:"people-applause.gif",source:"https://commons.wikimedia.org/wiki/File:Movicon2-bravo.gif",sourceTitle:"Movicon2-bravo.gif",creator:"Jochen Gros",license:"CC BY-SA 2.5",licenseUrl:"https://creativecommons.org/licenses/by-sa/2.5/"},
      {id:"people-walk",title:"Walking loop",keywords:"walk person movement vintage",asset:"people-walk.gif",source:"https://commons.wikimedia.org/wiki/File:Muybridge_human_male_walking_animated.gif",sourceTitle:"Muybridge human male walking animated.gif",creator:"Eadweard Muybridge; animation by Jjkutch",license:"Public domain",licenseUrl:""},
      {id:"people-wow",title:"Aerial wow",keywords:"acrobat cartwheel person flip",asset:"people-wow.gif",source:"https://commons.wikimedia.org/wiki/File:FrontAerial.gif",sourceTitle:"FrontAerial.gif",creator:"User Lambtron",license:"Public domain",licenseUrl:""},
      {id:"hello",title:"Hello there",keywords:"wfc wave",asset:"hello.gif"},
      {id:"love",title:"Sending love",keywords:"wfc heart",asset:"love.gif"},
      {id:"spark",title:"A little sparkle",keywords:"wfc",asset:"spark.gif"},
      {id:"cheers",title:"Cheers",keywords:"wfc party",asset:"cheers.gif"}
    ];
    let commonsGifLibrary=[];
    let commonsSearchSequence=0;
    function cleanCommonsText(value){const plain=String(value||"").replace(/<br\s*\/?>/gi," ").replace(/<[^>]*>/g," ");const decoder=document.createElement("textarea");decoder.innerHTML=plain;return decoder.value.replace(/\s+/g," ").trim().slice(0,180);}
    function gifCreditText(gif){return gif.source?(gif.creator+" · "+gif.license):"";}
    function gifSourceCaption(gif){if(!gif.source)return "";return "Source: "+(gif.creator||"Creator not listed")+" — “"+(gif.sourceTitle||gif.title)+"”. Wikimedia Commons: "+gif.source+"\nLicense: "+gif.license+(gif.licenseUrl?" — "+gif.licenseUrl:"");}
    function renderGifLibrary(q){
      const grid=$("gifGrid");if(!grid)return;
      const query=String(q||"").trim().toLowerCase();
      const items=[...WFC_GIF_LIBRARY,...commonsGifLibrary].filter(g=>!query||((g.title+" "+g.id+" "+(g.keywords||"")+" "+(g.creator||"")).toLowerCase().includes(query)));
      grid.innerHTML=items.map(g=>{
        const imageUrl=g.remote?g.url:"/motion/gifs/"+g.asset;
        const credit=g.source?'<a class="wfc-gif-credit" href="'+escapeHTML(g.source)+'" target="_blank" rel="noopener noreferrer" aria-label="Source and license for '+escapeHTML(g.title)+'">'+escapeHTML(gifCreditText(g))+' · source</a>':"";
        return '<article class="wfc-gif-card"><button type="button" class="wfc-gif-choice" data-send-gif="'+escapeHTML(g.id)+'" aria-label="Send GIF: '+escapeHTML(g.title)+'"><img'+(g.source?' class="wfc-gif-source-image"':'')+' src="'+escapeHTML(imageUrl)+'" alt="" loading="lazy"><span>'+escapeHTML(g.title)+'</span></button>'+credit+'</article>';
      }).join("")||'<div class="sticker-pack-empty"><strong>No GIFs found</strong><small>Try a reaction like wave, happy, or applause.</small></div>';
    }
    async function searchCommonsGifs(){
      const query=String($("gifSearch")?.value||"").trim().slice(0,60);
      const note=$("gifPickerNote"),grid=$("gifGrid");
      if(!query){if(note)note.textContent="Enter a reaction to search Wikimedia Commons. Source and license credit is included when you share a GIF.";return;}
      const sequence=++commonsSearchSequence;
      if(note)note.textContent="Searching Wikimedia Commons…";
      if(grid)grid.innerHTML='<div class="sticker-pack-empty"><strong>Searching for human GIFs</strong><small>Looking for openly licensed GIFs under 8 MB.</small></div>';
      try{
        const url=new URL("https://commons.wikimedia.org/w/api.php");
        url.searchParams.set("action","query");url.searchParams.set("generator","search");url.searchParams.set("gsrsearch","filemime:gif "+query);url.searchParams.set("gsrnamespace","6");url.searchParams.set("gsrlimit","30");url.searchParams.set("prop","imageinfo");url.searchParams.set("iiprop","url|size|extmetadata");url.searchParams.set("format","json");url.searchParams.set("origin","*");
        const response=await fetch(url.toString(),{headers:{Accept:"application/json"}});
        if(!response.ok)throw new Error("Wikimedia Commons could not be reached.");
        const data=await response.json();
        if(sequence!==commonsSearchSequence)return;
        const pages=Object.values(data.query?.pages||{});
        const blocked=/\b(?:porn|sexual|erotic|nudity|nude|genital|vulva|penis|orgasm|fetish|gore|violence)\b/i;
        commonsGifLibrary=pages.map(page=>{
          const info=page.imageinfo?.[0],meta=info?.extmetadata||{},license=cleanCommonsText(meta.LicenseShortName?.value);
          const creator=cleanCommonsText(meta.Artist?.value)||"Creator not listed";
          const description=cleanCommonsText(meta.ImageDescription?.value);
          const title=String(page.title||"").replace(/^File:/,"");
          const url=String(info?.url||"");
          const safeLicense=/^(public domain|pd(?:-|$)|cc0\b|cc by(?:-sa)?(?:\s|$))/i.test(license);
          const safeUrl=/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//i.test(url)&&/\.gif(?:\?|$)/i.test(url);
          if(!safeLicense||!safeUrl||!Number.isFinite(Number(info.size))||Number(info.size)>8*1024*1024||blocked.test(title+" "+description))return null;
          const source="https://commons.wikimedia.org/wiki/"+encodeURIComponent(String(page.title||"").replace(/ /g,"_"));
          const licenseMatch=license.match(/(BY-SA|BY)[^0-9]{0,6}([0-9]\.[0-9])/i);
          const licenseUrl=licenseMatch?"https://creativecommons.org/licenses/"+licenseMatch[1].toLowerCase()+"/"+licenseMatch[2]+"/":(/^cc0\b/i.test(license)?"https://creativecommons.org/publicdomain/zero/1.0/":"");
          return {id:"commons-"+String(page.pageid||title).replace(/[^a-z0-9_-]/gi,"-"),title:title.replace(/\.gif$/i,"").replace(/[_]+/g," "),keywords:query,remote:true,url:url,source:source,sourceTitle:title,creator:creator,license:license,licenseUrl:licenseUrl};
        }).filter(Boolean).slice(0,12);
        renderGifLibrary(query);
        if(note)note.textContent=commonsGifLibrary.length?("Wikimedia Commons results. Creator, source, and license are shown below each GIF and added to its caption when shared."):("No openly licensed human GIFs under 8 MB matched. Try wave, happy, or applause.");
      }catch(error){
        if(sequence!==commonsSearchSequence)return;
        commonsGifLibrary=[];
        renderGifLibrary(query);
        if(note)note.textContent="Commons search is unavailable right now. The licensed human GIFs below still work.";
      }
    }
    function stickerAssetUrl(item){return "/motion/stickers/"+item.asset;}
    function stickerArtwork(item,className=""){
      const alt=escapeHTML((item.title||"Sticker")+" animated sticker");
      if(!item.lottie)return '<img class="'+className+'" src="'+stickerAssetUrl(item)+'" alt="" loading="lazy">';
      return '<span class="'+className+' wfc-sticker-lottie" data-lottie-src="/motion/lottie/'+escapeHTML(item.lottie)+'?v=2" role="img" aria-label="'+alt+'"><img class="wfc-lottie-fallback" src="'+stickerAssetUrl(item)+'" alt="" loading="lazy"></span>';
    }
    function activateStickerLotties(root=document){
      const player=window.lottie;
      if(!player||typeof player.loadAnimation!=="function"||!root?.querySelectorAll)return;
      const reduced=Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
      root.querySelectorAll("[data-lottie-src]:not([data-lottie-loaded])").forEach(host=>{
        host.dataset.lottieLoaded="loading";
        try{
          const animation=player.loadAnimation({container:host,renderer:"svg",loop:!reduced,autoplay:!reduced,path:host.dataset.lottieSrc,rendererSettings:{preserveAspectRatio:"xMidYMid meet"}});
          animation.addEventListener("DOMLoaded",()=>{host.dataset.lottieLoaded="ready";host.classList.add("is-lottie-ready");if(reduced)animation.goToAndStop(0,true);});
          animation.addEventListener("data_failed",()=>{host.dataset.lottieLoaded="failed";animation.destroy();});
        }catch(_){host.dataset.lottieLoaded="failed";}
      });
    }
    function installedStickerPackIds(){try{const raw=localStorage.getItem("wfc_sticker_packs");let saved=raw===null?["motion","feelings","people"]:JSON.parse(raw);if(!Array.isArray(saved))saved=[];const migration="wfc_sticker_pack_defaults_v2";if(localStorage.getItem(migration)!=="done"){saved=[...new Set([...saved,"people"])];localStorage.setItem("wfc_sticker_packs",JSON.stringify(saved));localStorage.setItem(migration,"done");}return WFC_STICKER_PACKS.filter(p=>saved.includes(p.id)).map(p=>p.id);}catch(_){return[];}}
    function renderStickerPacks(){const installed=installedStickerPackIds(),grid=$("installedStickerGrid"),shop=$("stickerPackShop");if(!grid||!shop)return;const stickers=WFC_STICKER_PACKS.filter(p=>installed.includes(p.id)).flatMap(p=>p.stickers);grid.innerHTML=stickers.length?stickers.map(x=>'<button type="button" class="wfc-sticker-choice" data-sticker-id="'+escapeHTML(x.id)+'" aria-label="Send '+escapeHTML(x.title)+' sticker">'+stickerArtwork(x,"wfc-sticker-choice-art")+'<span>'+escapeHTML(x.title)+'</span></button>').join(""):'<div class="sticker-pack-empty"><strong>Your sticker shelf is ready</strong><small>Add a pack below to start sending animated stickers.</small></div>';activateStickerLotties(grid);shop.innerHTML=WFC_STICKER_PACKS.map(p=>{const added=installed.includes(p.id),preview=p.stickers.slice(0,3).map(x=>'<img src="'+stickerAssetUrl(x)+'" alt="">').join("");return '<article class="sticker-pack-card"><div class="sticker-pack-preview">'+preview+'</div><div class="sticker-pack-copy"><strong>'+escapeHTML(p.name)+'</strong><small>'+escapeHTML(p.description)+'</small></div><button type="button" class="sticker-pack-install'+(added?' is-added':'')+'" data-pack-install="'+p.id+'" aria-pressed="'+added+'">'+(added?'Added ✓':'Add pack')+'</button></article>';}).join("");}
    function renderGifLibrary(q){const grid=$("gifGrid");if(!grid)return;const query=String(q||"").trim().toLowerCase(),items=WFC_GIF_LIBRARY.filter(g=>!query||(g.title+" "+g.id).toLowerCase().includes(query));grid.innerHTML=items.map(g=>'<button type="button" class="wfc-gif-choice" data-send-gif="'+g.id+'" aria-label="Send GIF: '+escapeHTML(g.title)+'"><img src="/motion/gifs/'+g.asset+'" alt=""><span>'+escapeHTML(g.title)+'</span></button>').join("")||'<div class="sticker-pack-empty"><strong>No GIFs found</strong><small>Try another search.</small></div>';}
    function setMediaPickerTab(tab){document.querySelectorAll("[data-picker-tab]").forEach(b=>{const on=b.dataset.pickerTab===tab;b.setAttribute("aria-selected",on);b.classList.toggle("active",on);});document.querySelectorAll("[data-picker-pane]").forEach(p=>p.classList.toggle("hidden",p.dataset.pickerPane!==tab));if(tab==="emoji")$("emojiSearch")?.focus();}

    function closeMediaPicker() {
        $('stickerTray')?.classList.add('hidden');
        $('stickerButton')?.setAttribute('aria-expanded', 'false');
    }

    function renderEmojiChoices(query = '') {
        const grid = $('emojiGrid');
        if (!grid) return;
        const normalized = String(query).trim().toLowerCase();
        const matches = EMOJI_CATALOG.filter(([emoji, label]) => !normalized || `${emoji} ${label}`.toLowerCase().includes(normalized));
        grid.innerHTML = matches.map(([emoji, label]) => `<button type="button" class="emoji-choice" data-insert-emoji="${escapeHTML(emoji)}" aria-label="${escapeHTML(label)}">${escapeHTML(emoji)}</button>`).join('') || '<span class="emoji-no-results">No emoji found</span>';
    }

    function insertEmoji(emoji) {
        const input = $('messageInput');
        if (!input) return;
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? start;
        input.setRangeText(emoji, start, end, 'end');
        input.focus();
        resizeComposer();
    }

    function getSendAudioContext() {
        if (!sendSoundEnabled) return null;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        try {
            if (!sendAudioContext || sendAudioContext.state === 'closed') sendAudioContext = new AudioContextClass();
            if (sendAudioContext.state === 'suspended') sendAudioContext.resume().catch(() => {});
            return sendAudioContext;
        } catch (_) { return null; }
    }

    function playSendChime(context) {
        if (!sendSoundEnabled || !context || context.state !== 'running') return;
        const now = context.currentTime;
        [[880, 0], [1174.66, 0.075]].forEach(([frequency, delay]) => {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, now + delay);
            gain.gain.setValueAtTime(0.0001, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.035, now + delay + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.13);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(now + delay);
            oscillator.stop(now + delay + 0.14);
        });
    }

    function syncSendSoundToggle() {
        const button = $('sendSoundToggle');
        if (!button) return;
        button.textContent = sendSoundEnabled ? '♪' : '♩';
        button.setAttribute('aria-pressed', sendSoundEnabled ? 'true' : 'false');
        button.setAttribute('aria-label', sendSoundEnabled ? 'Turn send sound off' : 'Turn send sound on');
        button.title = sendSoundEnabled ? 'Send sound on' : 'Send sound off';
        button.classList.toggle('is-muted', !sendSoundEnabled);
    }

    function setSendSoundPreference(enabled, preview = false) {
        sendSoundEnabled = Boolean(enabled);
        try { localStorage.setItem('wfc_send_sound', sendSoundEnabled ? 'on' : 'off'); } catch {}
        syncSendSoundToggle();
        if (preview && sendSoundEnabled) playSendChime(getSendAudioContext());
    }

    function executeAIAction(action) {
        if (!action || typeof action !== 'object') return;
        if (action.type === 'set_theme' && ['dark', 'light'].includes(action.theme)) {
            try { localStorage.setItem('wfc_theme', action.theme); } catch {}
            applyTheme();
            return;
        }
        if (action.type === 'set_send_chime' && typeof action.enabled === 'boolean') {
            setSendSoundPreference(action.enabled);
            return;
        }
        if (action.type === 'set_app_language' && typeof action.language === 'string') {
            if (window.WFC_I18N?.getLanguages?.().some(language => language.code === action.language)) {
                window.WFC_I18N.setLanguage(action.language);
            }
            return;
        }
        if (action.type !== 'open_app_section') return;
        closeOverflow();
        if (action.section === 'settings') openSettings();
        else if (action.section === 'appearance') openSettings('appearance');
        else if (action.section === 'language') { closeSettings(); openLanguagePanel(); }
        else if (action.section === 'people') { closeSettings(); openNewChat(); }
        else if (action.section === 'invite') { closeSettings(); openInvite(); }
        else if (action.section === 'new_group') { closeSettings(); closeInvite(); openGroupPanel(); }
        else if (action.section === 'chats') {
            closeSettings(); closeInvite(); currentChat = null; setActiveTab('chats'); showScreen('home'); loadChats();
        }
    }

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
            const error = new Error(data?.error?.message || data?.message || "Request failed");
            error.status = response.status;
            error.code = data?.error?.code;
            throw error;
        }

        return data;
    }


    function showScreen(name) {
        activeScreen = name;
        const desktop = window.matchMedia("(min-width: 700px)").matches;
        const keepSidebar = desktop && name !== "home";
        $("emptyConversation")?.classList.toggle("hidden", !(desktop && name === "home"));

        $("chatHome")?.classList.toggle(
            "hidden",
            name !== "home" && !keepSidebar
        );
        $("conversationScreen")?.classList.toggle(
            "hidden",
            name !== "conversation"
        );
        $("newChatScreen")?.classList.toggle(
            "hidden",
            name !== "new"
        );
        $("savedContactsScreen")?.classList.toggle(
            "hidden",
            name !== "contacts"
        );

        document.querySelector(".chat-app")?.classList.toggle(
            "desktop-with-chat",
            desktop && name !== "home"
        );
        document.querySelector(".chat-app")?.classList.toggle(
            "is-conversation-active",
            name === "conversation"
        );
    }

    window.matchMedia("(min-width: 700px)").addEventListener(
        "change",
        () => {
            if (activeScreen !== "home") showScreen(activeScreen);
        }
    );

    function setActiveChatRow(chatId) {
        document.querySelectorAll("#chatList .chat-row").forEach(row => {
            const isAI = row.hasAttribute("data-zenx-beta") && currentChat?.type === "ai";
            const isSelected = row.dataset.chatId && Number(row.dataset.chatId) === Number(chatId);
            const active = Boolean(isAI || isSelected);
            row.classList.toggle("active", active);
            row.setAttribute("aria-current", active ? "page" : "false");
        });
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function renderInlineMessage(text) {
        let html = escapeHTML(text);
        html = html.replace(/(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*|\p{Regional_Indicator}{2})/gu,
            '<span class="emoji-live">$1</span>');
        html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
        html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/https:\/\/[A-Za-z0-9._~:/?#[\]@!$&\x27()*+,;=%-]+/g, url => '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>');
        return html;
    }

    function renderPlainMessage(text) {
        const lines = String(text || '').split(/\r?\n/);
        while (lines.length && !lines[0].trim()) lines.shift();
        while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
        if (!lines.length) return '';
        let html = '';
        let listType = '';
        const closeList = () => {
            if (listType) html += listType === 'ol' ? '</ol>' : '</ul>';
            listType = '';
        };
        for (const line of lines) {
            const bullet = line.match(/^\s*[-*•]\s+(.+)$/);
            const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
            const item = bullet || ordered;
            if (item) {
                const nextType = ordered ? 'ol' : 'ul';
                if (listType !== nextType) {
                    closeList();
                    html += nextType === 'ol' ? '<ol class="message-list-items">' : '<ul class="message-list-items">';
                    listType = nextType;
                }
                html += `<li>${renderInlineMessage(item[1])}</li>`;
                continue;
            }
            closeList();
            if (!line.trim()) {
                html += '<div class="message-line-space" aria-hidden="true"></div>';
                continue;
            }
            const heading = line.match(/^#{1,3}\s+(.+)$/);
            html += heading
                ? `<h3 class="message-heading">${renderInlineMessage(heading[1])}</h3>`
                : `<p>${renderInlineMessage(line)}</p>`;
        }
        closeList();
        return html;
    }

    function renderMessageMarkup(text) {
        const source = String(text || '');
        const fence = /```([a-zA-Z0-9_+#.-]{0,24})[ \t]*\r?\n([\s\S]*?)```/g;
        let html = '';
        let offset = 0;
        let match;
        while ((match = fence.exec(source))) {
            html += renderPlainMessage(source.slice(offset, match.index));
            const language = match[1] || 'Code';
            const code = match[2].replace(/\r?\n$/, '');
            html += `<section class="message-code-block" aria-label="${escapeHTML(language)} code block"><div class="code-block-toolbar"><span>${escapeHTML(language)}</span><button type="button" class="code-copy-button" data-copy-code aria-label="Copy code">Copy</button></div><pre><code>${escapeHTML(code)}</code></pre></section>`;
            offset = fence.lastIndex;
        }
        html += renderPlainMessage(source.slice(offset));
        return html;
    }

    async function copyTextToClipboard(text) {
        if (window.isSecureContext && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Copy is not available in this browser. Select the code and copy it instead.');
    }

    function displayName(user) {
        return (
            user?.display_name ||
            user?.username ||
            user?.phone ||
            "User"
        );
    }


    function avatarMarkup(url, fallback) {
        const safeUrl = typeof url === "string" && /^\/api\/v1\/media\/(?:avatar|group-avatar|avatar-video)\/\d+$/.test(url) ? url : "";
        if (!safeUrl) {
            return fallback === "G"
                ? '<svg class="avatar-placeholder avatar-placeholder-group" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.8 19c.4-3.2 2.7-5 6.2-5s5.8 1.8 6.2 5H2.8Zm12.1-4.4c3.5-.3 5.9 1.4 6.3 4.4h-4.3a7.6 7.6 0 0 0-2-4.4Z"/></svg>'
                : '<svg class="avatar-placeholder" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 2c-4.8 0-8 2.5-8 6.2 0 .5.4.8.9.8h14.2c.5 0 .9-.3.9-.8 0-3.7-3.2-6.2-8-6.2Z"/></svg>';
        }
        if (safeUrl.includes('/avatar-video/')) return `<video data-private-video="${escapeHTML(safeUrl)}" muted loop autoplay playsinline aria-label="Profile video"></video>`;
        return `<img data-private-image="${escapeHTML(safeUrl)}" alt="">`;
    }

    function hydratePrivateImages(root = document) {
        const authToken = token();
        root.querySelectorAll?.('img[data-private-image],video[data-private-video],audio[data-private-audio],a[data-private-document]').forEach(async media => {
            if (media.dataset.loading === '1' || media.dataset.loaded === '1') return;
            media.dataset.loading = '1';
            const url = media.dataset.privateImage || media.dataset.privateVideo || media.dataset.privateAudio || media.dataset.privateDocument;
            try {
                const response = await fetch(url, { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
                if (!response.ok) throw new Error('Profile media unavailable');
                const blobUrl=URL.createObjectURL(await response.blob());
                if(media.tagName==='A')media.href=blobUrl;else media.src=blobUrl;
                media.dataset.loaded = '1';
                if (media.tagName === 'VIDEO') media.play().catch(() => {});
            } catch { media.remove(); }
            finally { delete media.dataset.loading; }
        });
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

        if (chat.last_message_type === "image") return "Photo";
        if (chat.last_message_type === "gif") return "GIF";
        if (chat.last_message_type === "sticker") return "Sticker";
        if (chat.last_message_type !== "text") return "Media";

        return chat.last_message_body;
    }


    function verifiedPhoneBadge(timestamp) {
        return timestamp
            ? '<span class="phone-verified-badge" role="img" aria-label="Phone verified by SMS" title="Phone verified by SMS"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="phone-verified-seal" d="M12 1.6 14.1 3.1 16.7 2.8 17.7 5.2 20.2 6.3 19.9 8.9 21.4 11 19.9 13.1 20.2 15.7 17.7 16.8 16.7 19.2 14.1 18.9 12 20.4 9.9 18.9 7.3 19.2 6.3 16.8 3.8 15.7 4.1 13.1 2.6 11 4.1 8.9 3.8 6.3 6.3 5.2 7.3 2.8 9.9 3.1Z"/><path class="phone-verified-check" d="m7.8 11.8 2.8 2.8 5.7-5.7"/></svg></span>'
            : '';
    }

    function favoriteChatIds() {
        try {
            const saved = JSON.parse(localStorage.getItem("wfc_favorite_chats") || "[]");
            return new Set(Array.isArray(saved) ? saved.map(String) : []);
        } catch { return new Set(); }
    }

    function saveFavoriteChatIds(ids) {
        try { localStorage.setItem("wfc_favorite_chats", JSON.stringify([...ids])); } catch {}
    }

    function updateChatListVisibility() {
        const query = $("chatSearch")?.value.trim().toLowerCase() || "";
        const filter = document.querySelector("[data-chat-filter].active")?.dataset.chatFilter || "all";
        const favorites = favoriteChatIds();
        document.querySelectorAll("#chatList .chat-row-shell").forEach(shell => {
            const row = shell.querySelector(".chat-row");
            const isUnread = shell.dataset.unread === "true";
            const isFavorite = favorites.has(shell.dataset.chatId);
            const isGroup = shell.dataset.chatKind === "group";
            const matchesFilter = filter === "all" || (filter === "unread" && isUnread) || (filter === "favorites" && isFavorite) || (filter === "groups" && isGroup);
            const matchesSearch = !query || (row?.textContent || "").toLowerCase().includes(query);
            shell.hidden = !(matchesFilter && matchesSearch);
            const favoriteButton = shell.querySelector("[data-toggle-favorite]");
            if (favoriteButton) {
                const name = row?.querySelector(".chat-row-top strong")?.textContent.trim() || "chat";
                const action = isFavorite ? "Remove" : "Add";
                const relation = isFavorite ? "from" : "to";
                favoriteButton.setAttribute("aria-pressed", String(isFavorite));
                favoriteButton.setAttribute("aria-label", `${action} ${name} ${relation} favorites`);
                favoriteButton.title = `${action} ${name} ${relation} favorites`;
            }
        });
        const aiRow = document.querySelector("#chatList [data-zenx-beta]");
        if (aiRow) {
            const matchesFilter = filter === "all";
            const matchesSearch = !query || aiRow.textContent.toLowerCase().includes(query);
            aiRow.hidden = !(matchesFilter && matchesSearch);
        }
    }

    function renderChats() {

        const list = $("chatList");

        if (!list) return;

        const zenxRow = `
            <button type="button" class="chat-row zenx-beta-row${currentChat?.type === "ai" ? " active" : ""}" data-zenx-beta="true" aria-current="${currentChat?.type === "ai" ? "page" : "false"}">
                <div class="chat-row-avatar zenx-beta-avatar"><img src="/motion/zenx-ai.svg" alt=""></div>

                <div class="chat-row-content">
                    <div class="chat-row-top">
                        <strong class="zenx-name-lockup"><span class="zenx-ai-label">ZENX AI</span><span class="verified-badge" role="img" aria-label="Verified assistant" title="Verified assistant"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.4 12.2 3l2.7-.1.9 2.5 2.2 1.5-.8 2.6.8 2.6-2.2 1.5-.9 2.5-2.7-.1L10 18l-2.2-1.6-2.7.1-.9-2.5L2 12.5l.8-2.6L2 7.3l2.2-1.5.9-2.5 2.7.1L10 1.4Z"/><path d="m6.5 10.1 2.2 2.2 4.8-4.8"/></svg></span></strong>
                    </div>
                    <div class="chat-row-bottom"><span>Private AI assistant</span></div>
                </div>
            </button>
        `;

        const humanChats = chats.filter(chat => chat.type !== "ai");
        const unreadTotal = humanChats.reduce((sum, chat) => sum + Math.max(0, Number(chat.unread_count) || 0), 0);
        document.querySelectorAll("[data-unread-count]").forEach(badge => {
            badge.textContent = unreadTotal > 99 ? "99+" : String(unreadTotal);
            badge.classList.toggle("hidden", unreadTotal < 1);
            badge.setAttribute("aria-label", `${unreadTotal} unread messages`);
        });
        const favoriteIds = favoriteChatIds();
        const chatRows = humanChats.map(chat => {
            const name = chat.type === "private" ? displayName({ display_name: chat.other_display_name, username: chat.other_username }) : (chat.name || "Group");
            const avatar = avatarMarkup(chat.type === "private" ? chat.other_profile_picture : chat.picture, (name.trim()[0] || "W").toUpperCase());
            const unread = Math.max(0, Number(chat.unread_count) || 0);
            const mentions = Math.max(0, Number(chat.unread_mentions_count) || 0);
            const unreadBadge = unread ? `<span class="unread-count" aria-label="${unread} unread messages">${unread > 99 ? '99+' : unread}</span>` : '';
            const mentionBadge = mentions ? '<span class="mention-indicator" title="Unread mention" aria-label="Unread mention">@</span>' : '';
            const chatId = String(Number(chat.id));
            const kind = chat.type === "private" ? "private" : "group";
            const isFavorited = favoriteIds.has(chatId);
            const preview = formatChatPreview(chat);
            const timestamp = formatTime(chat.last_message_created_at || chat.updated_at);
            return `<div class="chat-row-shell" data-chat-id="${chatId}" data-chat-kind="${kind}" data-unread="${unread > 0}"><button type="button" class="chat-row" data-chat-id="${chatId}"><span class="chat-row-avatar">${avatar}${mentionBadge}${unreadBadge}</span><span class="chat-row-content"><span class="chat-row-top"><strong>${escapeHTML(name)}${chat.type === "private" ? verifiedPhoneBadge(chat.other_phone_verified_at) : ""}</strong><time>${escapeHTML(timestamp)}</time></span><span class="chat-row-bottom"><span>${escapeHTML(preview)}</span></span></span></button><button type="button" class="chat-favorite-toggle" data-toggle-favorite="${chatId}" aria-pressed="${isFavorited}" aria-label="${isFavorited ? "Remove from" : "Add to"} favorites" title="${isFavorited ? "Remove from favorites" : "Add to favorites"}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg></button></div>`;
        }).join("");

        list.innerHTML = zenxRow + chatRows;
        setActiveChatRow(currentChat?.id);
        hydratePrivateImages(list);
        updateChatListVisibility();

        list.querySelector("[data-zenx-beta]")?.addEventListener(
            "click",
            openZenxBeta
        );

        list.querySelectorAll("button.chat-row[data-chat-id]").forEach(button => {
            button.addEventListener("click", () => {
                openConversation(Number(button.dataset.chatId));
            });
        });
        list.querySelectorAll("[data-toggle-favorite]").forEach(button => {
            button.addEventListener("click", event => {
                event.stopPropagation();
                const id = String(button.dataset.toggleFavorite);
                const favorites = favoriteChatIds();
                if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
                saveFavoriteChatIds(favorites);
                updateChatListVisibility();
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
            if (activeScreen === 'contacts') renderSavedContacts();

        } catch (error) {
            console.error("Failed to load chats:", error);
            const list = $("chatList");
            if (!list) return;
            if (error.status === 401 || /session required|unauthorized/i.test(error.message || "")) {
                list.innerHTML = `
                    <button type="button" class="chat-row zenx-beta-row${currentChat?.type === "ai" ? " active" : ""}" data-zenx-beta="true" aria-current="${currentChat?.type === "ai" ? "page" : "false"}">
                        <div class="chat-row-avatar zenx-beta-avatar"><img src="/motion/zenx-ai.svg" alt=""></div>
                        <div class="chat-row-content"><div class="chat-row-top"><strong class="zenx-name-lockup"><span class="zenx-ai-label">ZENX AI</span><span class="verified-badge" role="img" aria-label="Verified assistant"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.4 12.2 3l2.7-.1.9 2.5 2.2 1.5-.8 2.6.8 2.6-2.2 1.5-.9 2.5-2.7-.1L10 18l-2.2-1.6-2.7.1-.9-2.5L2 12.5l.8-2.6L2 7.3l2.2-1.5.9-2.5 2.7.1L10 1.4Z"/><path d="m6.5 10.1 2.2 2.2 4.8-4.8"/></svg></span></strong><time>AI</time></div><div class="chat-row-bottom"><span>Your private AI assistant</span></div></div>
                    </button>
                    <div class="user-search-empty"><strong>Sign in to see your chats</strong><br>Your conversations and ZENX AI are ready after phone verification.</div>
                    <a class="discover-members-button" href="/phone.html" style="display:grid;place-items:center;text-decoration:none">Continue with phone</a>
                `;
                list.querySelector('[data-zenx-beta]')?.addEventListener('click', openZenxBeta);
                return;
            }
            list.innerHTML = `<div class="user-search-empty"><strong>Your chats could not load</strong><br>${escapeHTML(error.message || 'Check your connection and try again.')}<br><button id="retryChats" class="settings-action-button" type="button">Try again</button></div>`;
            $("retryChats")?.addEventListener("click", loadChats);
        }
    }

    async function loadCurrentUser() {
        try {
            const data = await api("/users/me");

            currentUser =
                data.user ||
                data;

            if ($("chatUserName")) $("chatUserName").textContent = displayName(currentUser);
            if ($("railProfile")) {
                $("railProfile").innerHTML = avatarMarkup(currentUser?.profile_picture, (displayName(currentUser)[0] || 'W').toUpperCase());
                hydratePrivateImages($("railProfile"));
            }

        } catch (error) {
            console.error(
                "Failed to load current user:",
                error
            );
        }
    }


    function showZenxSignInGate() {
        currentChat = { id: null, type: "ai", name: "ZENX AI" };
        setActiveChatRow(null);
        $("userPhoneVerifiedBadge")?.classList.add("hidden");
        $("conversationName").textContent = "ZENX AI";
        $("conversationStatus").textContent = "Private AI assistant";
        $("zenxVerifiedBadge")?.classList.remove("hidden");
        $("conversationScreen")?.classList.add("is-auth-gated");
        $("messageList").innerHTML = `<div class="zenx-guest-card"><div class="zenx-empty-icon"><img src="/motion/zenx-ai.svg" alt=""></div><h2>Meet ZENX AI <span class="verified-badge" role="img" aria-label="Verified assistant"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.4 12.2 3l2.7-.1.9 2.5 2.2 1.5-.8 2.6.8 2.6-2.2 1.5-.9 2.5-2.7-.1L10 18l-2.2-1.6-2.7.1-.9-2.5L2 12.5l.8-2.6L2 7.3l2.2-1.5.9-2.5 2.7.1L10 1.4Z"/><path d="m6.5 10.1 2.2 2.2 4.8-4.8"/></svg></span></h2><p>Ask questions, get help, or chat in the language you use. Sign in with your phone to start a private conversation.</p><a href="/phone.html">Continue with phone</a></div>`;
        showScreen("conversation");
    }

    async function openZenxBeta() {
        if (!token()) { showZenxSignInGate(); return; }
        try {
            const data = await api("/ai/chat");
            zenxBetaChatId = Number(data.chat.id);
            currentChat = { id: zenxBetaChatId, type: "ai", name: "ZENX AI", other_display_name: "ZENX AI", other_username: "zenx-ai", other_status: "Private AI assistant" };
            setActiveChatRow(zenxBetaChatId);
            $("conversationName").textContent = "ZENX AI";
            $("userPhoneVerifiedBadge")?.classList.add("hidden");
            $("conversationStatus").textContent = "Private AI assistant";
            $("zenxVerifiedBadge")?.classList.remove("hidden");
            $("conversationScreen")?.classList.remove("is-auth-gated");
            const avatar = $("conversationAvatar");
            if (avatar) { avatar.innerHTML = '<img src="/motion/zenx-ai.svg" alt="">'; avatar.classList.add("zenx-beta-conversation-avatar"); }
            showScreen("conversation");
            await loadMessages(zenxBetaChatId);
            $("messageInput")?.focus();
        } catch (error) {
            if (error.status === 401 || /session required|unauthorized/i.test(error.message || "")) { showZenxSignInGate(); return; }
            $("conversationName").textContent = "ZENX AI";
            $("zenxVerifiedBadge")?.classList.remove("hidden");
            $("messageList").innerHTML = `<div class="chat-load-error"><div class="zenx-empty-icon"><img src="/motion/zenx-ai.svg" alt=""></div><h2>ZENX AI is unavailable</h2><p>${escapeHTML(error.message || 'Please check your connection and try again.')}</p><button id="retryZenx" type="button">Try again</button></div>`;
            showScreen("conversation");
            $("retryZenx")?.addEventListener("click", openZenxBeta);
        }
    }

    async function openConversation(chatId) {
        try {
            const data = await api(
                `/chats/${chatId}`
            );

            currentChat = data.chat;
            if ((voiceRecorder || voiceNoteBlob) && voiceNoteChatId !== Number(currentChat.id)) discardVoiceNote();
            closeOverflow(); closeChatDetails(); closeChatSearch();
            let chatThemes = {}; try { chatThemes = JSON.parse(localStorage.getItem('wfc_chat_themes') || '{}'); } catch {}
            $('messageList')?.setAttribute('data-chat-theme', chatThemes[String(chatId)] || 'default');
            $("conversationScreen")?.classList.remove("is-auth-gated");
            $("zenxVerifiedBadge")?.classList.add("hidden");
            $("userPhoneVerifiedBadge")?.classList.toggle("hidden", currentChat.type !== "private" || !currentChat.other_phone_verified_at);
            setActiveChatRow(chatId);

            const otherName = currentChat.type === "group"
                ? (currentChat.name || "Group")
                : displayName({
                    display_name: currentChat.other_display_name,
                    username: currentChat.other_username
                });

            $("conversationName").textContent = otherName;
            $("conversationStatus").textContent = currentChat.type === "group"
                ? "Group conversation"
                : (currentChat.other_status || "offline");
            const conversationAvatar = $("conversationAvatar");
            if (conversationAvatar) {
                conversationAvatar.innerHTML = avatarMarkup(
                    currentChat.other_profile_picture,
                    currentChat.type === "group" ? "G" : (otherName.trim()[0] || "W").toUpperCase()
                );
                if (currentChat.type === "group") {
                    conversationAvatar.innerHTML = avatarMarkup(currentChat.picture, "G");
                }
                conversationAvatar.classList.remove("zenx-beta-conversation-avatar");
                hydratePrivateImages(conversationAvatar);
            }

            showScreen("conversation");

            await loadMessages(chatId);

            await markMessagesRead(chatId);
            await loadChats();

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

            const messages = Array.isArray(data.messages) ? data.messages : [];
            currentMessages = messages;
            if (Number(currentChat?.id) !== Number(chatId)) return;
            const signature = `${chatId}:${messages.map(message => `${message.id}:${message.is_read ? 1 : 0}:${message.viewed_once ? 1 : 0}`).join(',')}`;
            if (list.dataset.messageSignature === signature) return;
            const playingViewOnce = list.querySelector('audio[data-view-once-player]:not([data-view-once-finished])');
            if (playingViewOnce) return;
            list.dataset.messageSignature = signature;

            if (!messages.length) {
                if (currentChat?.type === "ai") {
                    list.innerHTML = `
                        <div class="zenx-beta-empty">
                            <div class="zenx-empty-icon"><img src="/motion/zenx-ai.svg" alt=""></div>
                            <strong>ZENX AI</strong>
                            <span>Your private assistant, ready for your questions.</span>
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

                const rowClass = `${isAI ? "theirs ai-message" : (mine ? "mine" : "theirs")}${Number(message.id) === Number(nextAnimatedMessageId) ? " is-sending" : ""}`;

                const senderName = currentChat?.type === "group" && !mine
                    ? `<div class="message-sender-name">${escapeHTML(message.sender_display_name || message.sender_username || "Member")}</div>`
                    : "";
                const isVoiceMessage = message.message_type === "audio" && Boolean(message.media_url);
                const voiceAlreadyOpened = Boolean(Number(message.view_once) && Number(message.viewed_once) && !mine);
                const voiceMessageMarkup = isVoiceMessage
                    ? voiceAlreadyOpened
                        ? '<div class="voice-note-opened"><span aria-hidden="true">◉</span> Voice note opened</div>'
                        : '<button type="button" class="voice-note-play" data-voice-play="' + escapeHTML(message.media_url) + '" data-view-once="' + (Number(message.view_once) ? 'true' : 'false') + '" aria-label="' + (Number(message.view_once) && !mine ? 'Listen to this voice note once' : 'Play voice note') + '"><span class="voice-note-play-icon" aria-hidden="true">▶</span><span>' + (Number(message.view_once) && !mine ? 'Listen once' : 'Voice message') + '</span>' + (Number(message.view_once) ? '<span class="voice-once-badge">VIEW ONCE</span>' : '') + '</button>'
                    : "";
                const imageMessage = ["image", "gif"].includes(message.message_type) && /^\/api\/v1\/media\/\d+$/.test(message.media_url || "");
                const stickerPackItem = WFC_STICKER_PACKS.flatMap(pack => pack.stickers).find(item => item.id === message.body);
                const messageContent = imageMessage
                    ? '<img class="message-image ' + (message.message_type === "gif" ? "message-gif" : "") + '" data-private-image="' + escapeHTML(message.media_url) + '" alt="' + (message.message_type === "gif" ? "Animated GIF shared in chat" : "Photo shared in chat") + '" loading="lazy">' + (message.body && ["image","gif"].includes(message.message_type) ? '<div class="message-caption">' + renderMessageMarkup(message.body) + '</div>' : "")
                    : isVoiceMessage
                        ? voiceMessageMarkup
                    : stickerPackItem
                        ? '<span class="wfc-sticker-frame">' + stickerArtwork(stickerPackItem,"wfc-sticker-message") + '</span>'
                        : message.message_type === "sticker"
                            ? '<span class="sticker-message emoji-live-sticker" role="img" aria-label="Sticker">' + escapeHTML(message.body || "✨") + '</span>'
                            : renderMessageMarkup(message.body || "");
                return `
                    <div class="message-row ${rowClass}" data-message-id="${Number(message.id)}">
                        <div class="message-bubble">
                            ${senderName}
                            <div class="message-body">${messageContent}</div>
                            <div class="message-meta">${formatTime(message.created_at)}${mine ? `<svg class="message-read-state${message.is_read ? ' is-read' : ''}" viewBox="0 0 24 16" role="img" aria-label="${message.is_read ? 'Read' : 'Sent'}"><path d="m1.5 8.5 4.2 4.2L14 3.8"/><path d="m8.5 12.2 1.2 1.2L22 2.8"/></svg>` : ""}</div>
                        </div>
                    </div>
                `;
            }).join("");
            nextAnimatedMessageId = null;

            activateStickerLotties(list);
            hydratePrivateImages(list);
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


    function resizeComposer() {
        const input = $('messageInput');
        if (!input) return;
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, 132)}px`;
    }

    function appendOptimisticMessage(body) {
        const list = $('messageList');
        if (!list) return null;
        const row = document.createElement('div');
        row.className = 'message-row mine is-sending optimistic-message';
        row.innerHTML = `<div class="message-bubble"><div class="message-body">${renderMessageMarkup(body)}</div><div class="message-meta">${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div></div>`;
        list.appendChild(row);
        window.WFCMotion?.animateSentMessage(row, $('sendMessageButton'));
        list.scrollTop = list.scrollHeight;
        if (currentChat?.type === 'ai') {
            const typing = document.createElement('div');
            typing.className = 'ai-typing-indicator';
            typing.setAttribute('role', 'status');
            typing.setAttribute('aria-label', 'ZENX AI is typing');
            typing.innerHTML = '<span>ZENX AI is thinking</span><i></i><i></i><i></i>';
            list.appendChild(typing);
            list.scrollTop = list.scrollHeight;
            return { row, typing };
        }
        return { row, typing: null };
    }

    async function sendMessage(event) {
        event.preventDefault();
        if (!currentChat) return;
        const input = $('messageInput');
        if (!input) return;
        const body = input.value.trim();
        if (!body) return;
        const targetChat = { id: Number(currentChat.id), type: currentChat.type };
        input.value = '';
        resizeComposer();
        const audioContext = getSendAudioContext();
        const optimistic = appendOptimisticMessage(body);

        try {
            if (targetChat.type === 'ai') {
                const result = await api('/ai/chat', {
                    method: 'POST',
                    body: JSON.stringify({ message: body })
                });
                playSendChime(audioContext);
                if (optimistic?.typing) optimistic.typing.remove();
                await loadMessages(targetChat.id);
                executeAIAction(result.action);
                return;
            }

            await api('/messages', {
                method: 'POST',
                body: JSON.stringify({ chat_id: targetChat.id, body })
            });
            playSendChime(audioContext);
            await loadMessages(targetChat.id);
            await loadChats();
        } catch (error) {
            optimistic?.row.remove();
            optimistic?.typing?.remove();
            if (Number(currentChat?.id) === targetChat.id) {
                input.value = body;
                resizeComposer();
            }
            console.error('Unable to send message:', error);
            showAppNotice(error.message || 'Unable to send message');
        }
    }

    async function sendSticker(stickerId) {
        const item=WFC_STICKER_PACKS.flatMap(p=>p.stickers).find(x=>x.id===stickerId);if(!currentChat||!item)return;
        $('stickerTray')?.classList.add('hidden');$('stickerButton')?.setAttribute('aria-expanded','false');
        if(currentChat.type==='ai'){insertEmoji(item.emoji);$('messageForm')?.requestSubmit();return;}
        try{await api('/messages',{method:'POST',body:JSON.stringify({chat_id:currentChat.id,body:item.id,message_type:'sticker'})});await loadMessages(currentChat.id);await loadChats();}
        catch(e){showAppNotice(e.message||'The sticker could not be sent.');}
    }
    async function sendGif(file, attribution="") {
        if(!currentChat||!file)return;if(currentChat.type==='ai'){showAppNotice('Open a W.F.C conversation to share a GIF.');return;}
        if(file.type!=='image/gif'||file.size>8*1024*1024){showAppNotice('Choose a GIF up to 8 MB.');return;}
        const form=new FormData();form.append('image',file,file.name||'wfc-motion.gif');form.append('chat_id',String(currentChat.id));if(attribution)form.append('caption',String(attribution).slice(0,1100));
        try{const response=await fetch(API+'/media/upload',{method:'POST',headers:token()?{Authorization:'Bearer '+token()}:{},body:form});const data=await response.json().catch(()=>({}));if(!response.ok||!data.success)throw new Error(data?.error?.message||'The GIF could not be sent.');$('stickerTray')?.classList.add('hidden');$('stickerButton')?.setAttribute('aria-expanded','false');await loadMessages(currentChat.id);await loadChats();}
        catch(e){showAppNotice(e.message||'The GIF could not be sent.');}
    }
    async function sendLibraryGif(id){
        const gif=[...WFC_GIF_LIBRARY,...commonsGifLibrary].find(item=>item.id===id);if(!gif)return;
        try{const response=await fetch(gif.remote?gif.url:"/motion/gifs/"+encodeURIComponent(gif.asset));if(!response.ok)throw new Error("GIF unavailable");const filename=(gif.asset||"commons-reaction.gif").replace(/[^a-z0-9._-]/gi,"-");await sendGif(new File([await response.blob()],filename,{type:"image/gif"}),gifSourceCaption(gif));}
        catch(e){showAppNotice(e.message||"This GIF could not be sent.");}
    }

    let voiceRecorder = null;
    let voiceRecordingStream = null;
    let voiceRecordingChunks = [];
    let voiceRecordingStartedAt = 0;
    let voiceRecordingTimer = null;
    let voiceRecordingDiscard = false;
    let voiceNoteBlob = null;
    let voiceNotePreviewUrl = '';
    let voiceNoteChatId = null;

    function formatVoiceDuration(seconds) {
        const value = Math.max(0, Math.floor(seconds));
        return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
    }

    async function startVoiceRecording() {
        if (voiceRecorder) return;
        if (!currentChat || currentChat.type === 'ai') {
            showAppNotice('Voice notes can be sent in a W.F.C person or group chat.');
            return;
        }
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
            showAppNotice('Voice recording needs microphone access on a secure HTTPS connection.');
            return;
        }
        const recordingChatId = Number(currentChat.id);
        try {
            if (voiceNoteBlob) discardVoiceNote();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!currentChat || Number(currentChat.id) !== recordingChatId) {
                stream.getTracks().forEach(track => track.stop());
                voiceNoteChatId = null;
                return;
            }
            voiceRecordingStream = stream;
            voiceNoteChatId = recordingChatId;
            const formats = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'];
            const mimeType = formats.find(type => MediaRecorder.isTypeSupported(type));
            voiceRecorder = mimeType ? new MediaRecorder(voiceRecordingStream, { mimeType }) : new MediaRecorder(voiceRecordingStream);
            voiceRecordingChunks = [];
            voiceRecordingDiscard = false;
            voiceRecordingStartedAt = Date.now();
            voiceNoteChatId = Number(currentChat.id);
            voiceRecorder.addEventListener('dataavailable', event => { if (event.data?.size) voiceRecordingChunks.push(event.data); });
            voiceRecorder.addEventListener('stop', () => {
                const recordingType = voiceRecorder?.mimeType || voiceRecordingChunks[0]?.type || 'audio/webm';
                voiceRecordingStream?.getTracks().forEach(track => track.stop());
                voiceRecordingStream = null;
                voiceRecorder = null;
                window.clearInterval(voiceRecordingTimer);
                voiceRecordingTimer = null;
                $('voiceRecordingStatus')?.classList.add('hidden');
                $('voiceRecordButton')?.classList.remove('is-recording');
                $('voiceRecordButton')?.setAttribute('aria-label', 'Record a voice note');
                if (voiceRecordingDiscard) { voiceRecordingChunks = []; voiceRecordingDiscard = false; return; }
                voiceNoteBlob = new Blob(voiceRecordingChunks, { type: recordingType });
                voiceRecordingChunks = [];
                if (!voiceNoteBlob.size) { showAppNotice('No audio was captured. Check microphone permission and try again.'); return; }
                if (voiceNotePreviewUrl) URL.revokeObjectURL(voiceNotePreviewUrl);
                voiceNotePreviewUrl = URL.createObjectURL(voiceNoteBlob);
                const preview = $('voiceNotePreviewAudio');
                if (preview) preview.src = voiceNotePreviewUrl;
                if ($('voiceNoteViewOnce')) $('voiceNoteViewOnce').checked = false;
                $('voiceNoteReview')?.classList.remove('hidden');
            }, { once: true });
            voiceRecorder.start(250);
            $('voiceRecordingStatus')?.classList.remove('hidden');
            $('voiceRecordButton')?.classList.add('is-recording');
            $('voiceRecordButton')?.setAttribute('aria-label', 'Stop recording');
            const updateTimer = () => {
                const elapsed = (Date.now() - voiceRecordingStartedAt) / 1000;
                const time = $('voiceRecordingTime');
                if (time) time.textContent = `Recording · ${formatVoiceDuration(elapsed)}`;
                if (elapsed >= 120) stopVoiceRecording(false);
            };
            updateTimer();
            voiceRecordingTimer = window.setInterval(updateTimer, 250);
        } catch (error) {
            voiceRecordingStream?.getTracks().forEach(track => track.stop());
            voiceRecordingStream = null;
            voiceNoteChatId = null;
            showAppNotice(error.name === 'NotAllowedError' ? 'Allow microphone access to record a voice note.' : error.message || 'The microphone could not be opened.');
        }
    }

    function stopVoiceRecording(discard = false) {
        if (!voiceRecorder || voiceRecorder.state === 'inactive') return;
        voiceRecordingDiscard = discard;
        window.clearInterval(voiceRecordingTimer);
        voiceRecordingTimer = null;
        voiceRecorder.stop();
    }

    function discardVoiceNote() {
        stopVoiceRecording(true);
        voiceNoteBlob = null;
        if (voiceNotePreviewUrl) URL.revokeObjectURL(voiceNotePreviewUrl);
        voiceNotePreviewUrl = '';
        voiceNoteChatId = null;
        $('voiceNotePreviewAudio')?.removeAttribute('src');
        $('voiceNoteReview')?.classList.add('hidden');
        if ($('voiceNoteViewOnce')) $('voiceNoteViewOnce').checked = false;
    }

    async function uploadVoiceNote() {
        if (!voiceNoteBlob || !currentChat || currentChat.type === 'ai' || Number(currentChat.id) !== voiceNoteChatId) return;
        const button = $('sendVoiceNote');
        const label = button?.textContent;
        if (button) { button.disabled = true; button.textContent = 'Sending…'; }
        try {
            const extension = voiceNoteBlob.type.includes('ogg') ? 'ogg' : voiceNoteBlob.type.includes('mp4') ? 'm4a' : 'webm';
            const form = new FormData();
            form.append('audio', voiceNoteBlob, `wfc-voice-note.${extension}`);
            form.append('chat_id', String(currentChat.id));
            form.append('view_once', String(Boolean($('voiceNoteViewOnce')?.checked)));
            const response = await fetch(API + '/media/voice-upload', { method: 'POST', headers: token() ? { Authorization: `Bearer ${token()}` } : {}, body: form });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success) throw new Error(data?.error?.message || 'The voice note could not be sent.');
            discardVoiceNote();
            await loadMessages(currentChat.id);
            await loadChats();
        } catch (error) {
            showAppNotice(error.message || 'The voice note could not be sent.');
        } finally {
            if (button) { button.disabled = false; button.textContent = label || 'Send voice note'; }
        }
    }

    async function playVoiceMessage(button) {
        const source = button.dataset.voicePlay;
        if (!source) return;
        button.disabled = true;
        button.classList.add('is-loading');
        try {
            const response = await fetch(source, { headers: token() ? { Authorization: `Bearer ${token()}` } : {}, cache: 'no-store' });
            if (response.status === 410) throw new Error('This voice note was already opened.');
            if (!response.ok) throw new Error('The voice note could not be opened.');
            const player = document.createElement('audio');
            const objectUrl = URL.createObjectURL(await response.blob());
            player.className = 'voice-note-audio';
            player.controls = true;
            player.preload = 'metadata';
            player.src = objectUrl;
            if (button.dataset.viewOnce === 'true') player.dataset.viewOncePlayer = 'true';
            button.replaceWith(player);
            const releaseAudio = () => { URL.revokeObjectURL(objectUrl); };
            player.addEventListener('ended', () => {
                releaseAudio();
                if (player.dataset.viewOncePlayer) {
                    player.dataset.viewOnceFinished = 'true';
                    const opened = document.createElement('div');
                    opened.className = 'voice-note-opened';
                    opened.textContent = 'Voice note opened';
                    player.replaceWith(opened);
                    if (currentChat?.id) void loadMessages(currentChat.id);
                }
            }, { once: true });
            player.addEventListener('error', releaseAudio, { once: true });
            if (player.dataset.viewOncePlayer) player.addEventListener('play', () => {
                const messageRow = player.closest('.message-row');
                messageRow?.classList.add('voice-note-viewed');
            }, { once: true });
            await player.play().catch(() => {});
        } catch (error) {
            button.disabled = false;
            button.classList.remove('is-loading');
            button.textContent = error.message || 'Try voice note again';
        }
    }

    let selectedInviteContacts = [];
    let inviteVcardContacts = [];
    let inviteContactMatch = null;
    let latestInviteUrl = '';

    function setActiveTab(name) {
        document.querySelectorAll('[data-app-nav]').forEach(button => {
            const active = button.dataset.appNav === name;
            button.classList.toggle('active', active);
            if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
        });
    }

    function openPrimarySection(name) {
        setActiveTab(name);
        $('primaryUtilityScreen')?.remove();
        if (name === 'chats') { currentChat = null; showScreen('home'); loadChats(); return; }
        showScreen('home');
        const app = document.querySelector('.chat-app'); if (!app) return;
        const copy = {
            calls: ['☎','CALLS','Calls','Incoming, outgoing and missed calls would appear here.','Calling is not available on this server yet. Voice and video calling has not been connected, so there is no call history to show.','Find someone to message','people'],
            updates: ['◉','YOUR MOMENTS','Status','Share a photo, video, song, or short note with your contacts. Status posts disappear after 24 hours.','Status sharing is not enabled on this server yet. Your private conversations stay in Chats.','Invite people to W.F.C','invite']
        };
        const page = document.createElement('section'); page.id = 'primaryUtilityScreen'; page.className = 'primary-utility-screen';
        if (name === 'calls') {
            page.innerHTML = `<header class="utility-header"><button class="utility-back" data-action="back" aria-label="Back to chats">←</button><span>W.F.C Calls</span></header><div class="calls-page"><div class="calls-heading"><div><span class="utility-eyebrow">RECENT ACTIVITY</span><h1>Calls</h1><p>Your incoming, outgoing, and missed W.F.C calls.</p></div><button class="calls-new-button" data-action="people" type="button"><span aria-hidden="true">＋</span> Find people</button></div><div class="calls-summary"><article><small>Past 7 days</small><strong id="callsWeekCount">—</strong><span>calls</span></article><article><small>Missed</small><strong id="callsMissedCount">—</strong><span>calls</span></article></div><div class="calls-filter-row"><button type="button" class="active" data-call-filter="all">All</button><button type="button" data-call-filter="missed">Missed</button></div><div id="callHistoryFeed" class="call-history-feed"><div class="user-search-empty">Loading call history…</div></div><p class="calls-platform-note">W.F.C call history only includes calls made inside W.F.C. Your phone’s carrier call log stays on your device.</p></div>`;
            loadCallHistory(page);
        } else if (name === 'tools') {
            page.innerHTML = '<header class="utility-header"><button class="utility-back" data-action="back" aria-label="Back to chats">←</button><span>W.F.C tools</span></header><div class="utility-content"><span class="utility-eyebrow">YOUR WORKSPACE</span><h1>Tools</h1><p class="utility-lede">Quick access to the things you use to connect.</p><div class="utility-tool-grid"><button data-action="group"><b>＋</b><strong>New group</strong><span>Start a group with people you know</span></button><button data-action="invite"><b>↗</b><strong>Invite a contact</strong><span>Share your personal invitation link</span></button><button data-action="profile"><b>◉</b><strong>My profile</strong><span>Change your name or photo</span></button><button data-action="ai"><b class="zenx-tool-icon"><img src="/motion/zenx-ai.svg" alt=""></b><strong>ZENX AI</strong><span>Open your assistant</span></button></div></div>';
        } else if (name === 'updates') {
            page.innerHTML = `<header class="utility-header"><button class="utility-back" data-action="back" aria-label="Back to chats">←</button><span>W.F.C Status</span></header><div class="updates-page"><div class="updates-heading"><div><span class="utility-eyebrow">YOUR MOMENTS</span><h1>Status</h1><p>Share a photo, video, song, voice note, document, or text. Your status disappears after 24 hours.</p></div></div><button type="button" class="updates-self" data-action="create-update-gallery" aria-label="Open your gallery to add a status"><span class="status-own-avatar"><span class="update-avatar">${currentUser?.profile_picture ? avatarMarkup(currentUser.profile_picture, "W") : escapeHTML((displayName(currentUser)[0] || "W").toUpperCase())}</span><span class="status-add-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span></span><span class="status-self-copy"><strong>My status</strong><small>Open your gallery to add a photo, video, or song</small></span></button><div id="updatesFeed" class="updates-feed"><div class="user-search-empty">Loading statuses…</div></div><p class="updates-channel-note">Status posts are only visible to your selected contacts and disappear after 24 hours.</p><div class="updates-share-dock"><span><strong>Share a status</strong><small>Photo, video, text, music, voice, or document</small></span><button class="utility-primary" data-action="create-update">＋ Share status</button></div></div>`;
            loadUpdatesFeed(page);
        } else {
            const [icon,eyebrow,title,lede,status,action,dest] = copy[name] || copy.calls;
            page.innerHTML = `<header class="utility-header"><button class="utility-back" data-action="back" aria-label="Back to chats">←</button><span>W.F.C'sChat</span></header><div class="utility-content"><div class="utility-orbit">${icon}</div><span class="utility-eyebrow">${eyebrow}</span><h1>${title}</h1><p class="utility-lede">${lede}</p><div class="utility-status"><strong>Calling is not connected yet</strong><span>${status}</span></div><button class="utility-primary" data-action="${dest}">${action}</button></div>`;
        }
        app.appendChild(page);
        if (name === 'calls') {
            page.addEventListener('click', event => {
                const filter=event.target.closest('[data-call-filter]');
                if(!filter) return;
                page.querySelectorAll('[data-call-filter]').forEach(button=>button.classList.toggle('active',button===filter));
                const list=page.querySelector('#callHistoryFeed');
                if(list) list.querySelectorAll('[data-call-outcome]').forEach(row=>row.classList.toggle('hidden',filter.dataset.callFilter==='missed'&&row.dataset.callOutcome!=='missed'));
                if(list&&!list.querySelector('[data-call-outcome]:not(.hidden)')) list.querySelector('.calls-filter-empty')?.classList.remove('hidden');
                else list?.querySelector('.calls-filter-empty')?.classList.add('hidden');
            });
        }
        if (name === 'updates') hydratePrivateImages(page);
        page.addEventListener('click', async event => {
            const callChat=event.target.closest('[data-open-call-chat]');
            if(callChat){page.remove();await startPrivateChat(Number(callChat.dataset.openCallChat));return;}
            const removeButton=event.target.closest('[data-delete-update]');
            if(removeButton){if(!window.confirm('Delete this status?'))return;try{await api(`/updates/${Number(removeButton.dataset.deleteUpdate)}`,{method:'DELETE'});await loadUpdatesFeed(page);}catch(error){showAppNotice(error.message||'Could not delete this status.');}return;}
            const action = event.target.closest('[data-action]')?.dataset.action; if (!action) return;
            if (action === 'create-update-gallery') { openUpdateComposer(page, true); return; }
            if (action === 'create-update') { openUpdateComposer(page, false); return; }
            page.remove();
            if (action === 'back') openPrimarySection('chats');
            else if (action === 'people') openNewChat();
            else if (action === 'invite') openInvite();
            else if (action === 'group') openGroupPanel();
            else if (action === 'profile') openSettings('profile');
            else if (action === 'ai') openZenxBeta();
        });
    }

    async function loadCallHistory(page) {
        const feed=page.querySelector('#callHistoryFeed');
        if(!feed) return;
        try {
            const result=await api('/calls');
            const summary=result.summary||{};
            page.querySelector('#callsWeekCount').textContent=String(Number(summary.last_7_days)||0);
            page.querySelector('#callsMissedCount').textContent=String(Number(summary.missed_7_days)||0);
            const calls=Array.isArray(result.calls)?result.calls:[];
            if(!calls.length){
                feed.innerHTML='<div class="calls-empty"><span class="calls-empty-icon" aria-hidden="true">☎</span><strong>No W.F.C calls in the last 30 days</strong><span>When W.F.C calling is connected, incoming, outgoing, and missed calls will appear here by day.</span></div><div class="calls-filter-empty hidden">No missed calls in this period.</div>';
                return;
            }
            feed.innerHTML=calls.map(call=>{
                const name=displayName({display_name:call.display_name,username:call.username});
                const incoming=call.direction==='incoming';
                const missed=call.outcome==='missed';
                const label=missed?'Missed':(call.outcome==='declined'?'Declined':call.outcome==='cancelled'?'Cancelled':(incoming?'Incoming':'Outgoing'));
                const arrow=missed?'↙':incoming?'↙':'↗';
                return `<article class="call-history-row" data-call-outcome="${missed?'missed':'other'}"><span class="call-history-icon ${missed?'is-missed':''}" aria-hidden="true">${call.kind==='video'?'▣':'☎'}</span><span class="call-history-copy"><strong>${escapeHTML(name)}</strong><small class="${missed?'is-missed':''}"><span aria-hidden="true">${arrow}</span>${label} ${call.kind==='video'?'video':'voice'} call</small></span><time>${escapeHTML(formatCallDate(call.created_at))}</time><button type="button" class="call-history-open" data-open-call-chat="${Number(call.peer_user_id)}" aria-label="Open chat with ${escapeHTML(name)}">›</button></article>`;
            }).join('')+'<div class="calls-filter-empty hidden">No missed calls in this period.</div>';
        } catch(error) {
            feed.innerHTML=`<div class="calls-empty"><strong>Call history could not load</strong><span>${escapeHTML(error.message||'Check your connection and try again.')}</span></div>`;
        }
    }

    function formatCallDate(value) {
        const date=new Date(String(value||'').replace(' ','T')+'Z');
        if(Number.isNaN(date.getTime())) return '';
        const now=new Date();
        const sameDay=date.toDateString()===now.toDateString();
        return sameDay?formatTime(value):new Intl.DateTimeFormat(window.WFC_I18N?.getLanguage?.()||'en',{month:'short',day:'numeric'}).format(date);
    }

    async function loadUpdatesFeed(page) {
        const feed = page.querySelector('#updatesFeed'); if (!feed) return;
        try {
            const result = await api('/updates');
            const updates = Array.isArray(result.updates) ? result.updates : [];
            feed.innerHTML = updates.length ? updates.map(item => {
                const name = displayName({ display_name:item.display_name, username:item.username });
                const avatar = avatarMarkup(item.profile_picture, (name[0] || 'W').toUpperCase());
                const mediaType=String(item.file_type||'');
                const media = item.media_url ? (mediaType.startsWith('video/')
                    ? `<video class="update-media" data-private-video="${escapeHTML(item.media_url)}" controls playsinline preload="metadata"></video>`
                    : mediaType.startsWith('audio/')
                        ? `<audio class="update-audio" data-private-audio="${escapeHTML(item.media_url)}" controls preload="metadata" aria-label="Status audio shared by ${escapeHTML(name)}"></audio>`
                        : mediaType==='application/pdf'||mediaType.includes('officedocument')||mediaType==='application/msword'||mediaType==='application/vnd.ms-excel'||mediaType==='application/vnd.ms-powerpoint'||mediaType==='text/plain'
                            ? `<a class="update-document" data-private-document="${escapeHTML(item.media_url)}" target="_blank" rel="noopener noreferrer" aria-label="Open document shared by ${escapeHTML(name)}">▤ <span>Open document</span> ↗</a>`
                            : `<img class="update-media" data-private-image="${escapeHTML(item.media_url)}" alt="Status shared by ${escapeHTML(name)}" loading="lazy">`) : '';
                const music=item.music_url?`<a class="update-music-link" href="${escapeHTML(item.music_url)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">♫</span><span><strong>Listen to this song</strong><small>Open in your music app</small></span><b aria-hidden="true">↗</b></a>`:'';
                const body = escapeHTML(item.body || '').replaceAll('\n','<br>');
                const mine = Number(item.user_id) === Number(currentUser?.id);
                return `<article class="update-card"><div class="update-card-head"><span class="update-card-avatar">${avatar}</span><div><strong>${escapeHTML(name)}${item.phone_verified_at ? verifiedPhoneBadge(item.phone_verified_at) : ''}</strong><time>${formatTime(item.created_at)}</time></div>${mine ? `<button type="button" class="update-delete" data-delete-update="${Number(item.id)}" aria-label="Delete your update">⋮</button>` : ''}</div>${body ? `<p>${body}</p>` : ''}${media}${music}</article>`;
            }).join('') : '<div class="updates-empty"><img class="updates-empty-vector" src="/motion/status-empty.svg" alt=""><strong>No statuses from your contacts yet</strong><span>When you or someone you have chatted with shares a status, it will appear here.</span></div>';
            hydratePrivateImages(feed);
        } catch(error) { feed.innerHTML=`<div class="utility-status"><strong>Status posts could not load</strong><span>${escapeHTML(error.message||'Check your connection and try again.')}</span><button type="button" class="utility-primary" data-action="create-update">Share a status</button></div>`; }
    }

    function openUpdateComposer(page, openGallery = false) {
        if ($('updateComposerOverlay')) return;
        const overlay=document.createElement('section'); overlay.id='updateComposerOverlay'; overlay.className='update-composer-overlay';
        overlay.innerHTML=`
          <div class="update-composer-backdrop" data-close-update></div>
          <form id="updateComposerForm" class="update-composer status-composer" role="dialog" aria-modal="true" aria-labelledby="statusComposerTitle">
            <header class="status-compose-header">
              <div><span class="status-compose-eyebrow">STATUS · 24 HOURS</span><h2 id="statusComposerTitle">Create a status</h2><p>Share a moment with the people you choose.</p></div>
              <button type="button" data-close-update class="status-compose-close" aria-label="Close status composer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
            </header>
            <section class="status-music-card" aria-label="Add music to your status">
              <span class="status-music-art" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21"/><path d="M28 11v19.3a5.2 5.2 0 1 1-3.4-4.9V15l13-3v15.3a5.2 5.2 0 1 1-3.4-4.9V9.5L28 11Z"/><path d="M8 27v-6m5 10V17m22 14V18m5 5v5"/></svg></span>
              <span class="status-music-copy"><strong>Add music</strong><small id="statusMusicState">Choose a soundtrack for this moment.</small></span>
              <button class="status-music-open" id="statusMusicOpen" type="button" aria-expanded="false" aria-controls="statusMusicPicker"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg><span>Browse songs</span><b aria-hidden="true">⌄</b></button>
            </section>
            <section class="status-music-picker" id="statusMusicPicker" aria-label="Choose a song" hidden>
              <header class="status-music-picker-head"><div><strong>Choose a song</strong><small>Search the Apple Music catalog</small></div><button type="button" id="statusMusicPickerClose" aria-label="Close song picker">×</button></header>
              <label class="status-music-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input id="statusMusicSearch" type="search" autocomplete="off" placeholder="Search songs or artists" aria-label="Search songs or artists"><button type="button" id="statusMusicSearchClear" aria-label="Clear search" hidden>×</button></label>
              <div class="status-music-results" id="statusMusicResults" role="list" aria-live="polite"><div class="status-music-loading"><span class="status-music-spinner" aria-hidden="true"></span><span>Finding songs…</span></div></div>
              <div class="status-music-picker-footer"><button type="button" class="status-audio-device" data-status-tool="audio">Choose audio from your device</button><span>Song details and artwork are provided courtesy of Apple Music.</span><button type="button" id="statusManualMusicToggle">Paste a music link instead</button></div>
              <label class="status-manual-music" id="statusManualMusic" hidden><span>Music link</span><input name="music_url" type="url" maxlength="500" placeholder="Spotify, Apple Music, YouTube, or SoundCloud" aria-label="Paste a music link"></label>
            </section>
            <div class="status-compose-grid">
              <div class="status-compose-preview" id="updateComposePreview" data-empty="true">
                <svg class="status-preview-art" viewBox="0 0 360 420" role="img" aria-label="Illustration of a golden-hour moment"><defs><linearGradient id="statusSky" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#163b50"/><stop offset=".53" stop-color="#9a6571"/><stop offset="1" stop-color="#f2b56e"/></linearGradient><linearGradient id="statusHill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#315f58"/><stop offset="1" stop-color="#142f31"/></linearGradient></defs><rect width="360" height="420" rx="22" fill="url(#statusSky)"/><circle cx="258" cy="127" r="55" fill="#ffd79b" opacity=".94"/><circle cx="258" cy="127" r="78" fill="#ffd79b" opacity=".12"/><path d="M0 249c58-36 105-34 156-9 49 24 109-5 204-49v229H0Z" fill="#385d5a" opacity=".9"/><path d="M0 300c59-39 107-27 163-6 61 23 117-3 197-38v164H0Z" fill="url(#statusHill)"/><path d="M0 352c67-22 114-17 168 4 53 21 109 7 192-20v84H0Z" fill="#10292b"/><path d="M70 349c12-34 31-47 51-48 25-2 40 16 43 47l-6 54H73Z" fill="#182e31"/><circle cx="119" cy="282" r="18" fill="#182e31"/><path d="M34 394c6-29 15-45 30-54m-10 18-21-14m30 26 21-23m213 43c-5-31-17-49-36-58m16 28 18-15m-28 31-18-20" fill="none" stroke="#9bb89a" stroke-width="5" stroke-linecap="round" opacity=".66"/></svg>
                <div class="status-preview-empty"><span class="status-preview-camera"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h3l1.5-2h7l1.5 2h3a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-16A1.5 1.5 0 0 1 3 18V9a1.5 1.5 0 0 1 1-1.5Z"/><circle cx="12" cy="13" r="3.5"/></svg></span><strong>Your moment preview</strong><small>Choose media to see it here</small></div>
                <p class="status-preview-caption" id="statusPreviewCaption" hidden></p>
              </div>
              <div class="status-compose-fields">
                <div class="status-compose-actions" role="group" aria-label="Choose status content">
                  <button type="button" class="status-tool status-tool-gallery" data-status-tool="gallery"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.5"/><path d="m5 17 4-4 3 3 3-4 4 5"/></svg><strong>Gallery</strong><small>Photo or video</small></button>
                  <button type="button" class="status-tool status-tool-text" data-status-tool="text"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M12 6v13m-4 0h8"/></svg><strong>Text</strong><small>Write a status</small></button>
                  <button type="button" class="status-tool status-tool-music" data-status-tool="music"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg><strong>Music</strong><small>Find a song</small></button>
                  <button type="button" class="status-tool status-tool-voice" data-status-tool="voice"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0m-7 7v3m-4 0h8"/></svg><strong>Voice</strong><small>Record a note</small></button>
                  <button type="button" class="status-tool status-tool-document" data-status-tool="document"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h6M8 14h8m-8 3h8"/></svg><strong>Document</strong><small>Choose a document</small></button>
                </div>
                <input id="statusMediaInput" class="status-media-input" name="media" type="file" accept="image/*,video/*" aria-label="Choose status media" hidden>
                <p class="status-tool-hint" id="statusToolHint">Choose a photo or video from your device gallery, or select another status type.</p>
                <label class="status-caption-field"><span>Caption</span><textarea name="body" maxlength="500" placeholder="Add a caption…" aria-label="Status text"></textarea><small><span id="statusCaptionCount">0</span>/500</small></label>
                <p class="update-music-note">Music links open in your music app. Use Music to browse songs or choose audio from your device.</p>
              </div>
            </div>
            <footer class="status-compose-footer"><span class="status-audience"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 18.6V20m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-7.6a4 4 0 0 1 0 7.7m2 2H18a3.6 3.6 0 0 1 3 3.5V20"/></svg>Share with your contacts</span><button class="utility-primary" type="submit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-8-5 16-3.5-6L4 12Zm7.5 2L20 4"/></svg>Share status</button></footer>
            <p class="update-compose-error" id="updateComposeError" role="alert"></p>
          </form>`;
        document.querySelector('.chat-app')?.appendChild(overlay);
        let previewUrl = '';
        const closeComposer = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); overlay.remove(); };
        overlay.addEventListener('click', event => { if(event.target.closest('[data-close-update]')) closeComposer(); });
        const input=overlay.querySelector('#statusMediaInput');
        const preview=overlay.querySelector('#updateComposePreview');
        const previewCaption=overlay.querySelector('#statusPreviewCaption');
        const updateCaption=()=>{const value=overlay.querySelector('[name=body]').value.trim();previewCaption.textContent=value;previewCaption.hidden=!value;overlay.querySelector('#statusCaptionCount').textContent=String(overlay.querySelector('[name=body]').value.length);};
        overlay.querySelector('[name=body]').addEventListener('input',updateCaption);
        const musicCard=overlay.querySelector('.status-music-card');
        const musicState=overlay.querySelector('#statusMusicState');
        const musicOpen=overlay.querySelector('#statusMusicOpen');
        const musicPicker=overlay.querySelector('#statusMusicPicker');
        const musicSearch=overlay.querySelector('#statusMusicSearch');
        const musicResults=overlay.querySelector('#statusMusicResults');
        const musicUrl=overlay.querySelector('[name=music_url]');
        let musicSearchTimer=0;
        let musicRequestId=0;
        let selectedMusic=null;
        const setMusicPicker=(open)=>{musicPicker.hidden=!open;musicOpen.setAttribute('aria-expanded',String(open));musicOpen.querySelector('span').textContent=selectedMusic?'Change song':'Browse songs';if(open){if(!musicSearch.value.trim())musicSearch.value='Afrobeats';searchStatusMusic(musicSearch.value);musicSearch.focus();}};
        overlay.addEventListener('click',event=>{if(!musicPicker.hidden&&!event.target.closest('.status-music-card,.status-music-picker'))setMusicPicker(false);});
        const renderStatusMusic=(tracks,query)=>{
            if(!tracks.length){musicResults.innerHTML=`<div class="status-music-empty"><span class="status-music-empty-icon">♫</span><strong>No songs found</strong><span>Try another song or artist${query?' for “'+escapeHTML(query)+'”':''}, or paste a music link.</span></div>`;return;}
            musicResults.innerHTML=tracks.map(track=>{
                const title=String(track.trackName||'Unknown song');
                const artist=String(track.artistName||'Unknown artist');
                const album=String(track.collectionName||'Apple Music');
                const duration=Number(track.trackTimeMillis)>0?`${Math.floor(track.trackTimeMillis/60000)}:${String(Math.floor(track.trackTimeMillis/1000)%60).padStart(2,'0')}`:'';
                const link=String(track.trackViewUrl||'');
                const art=String(track.artworkUrl100||'').replace(/100x100bb\.(jpg|png)$/i,'180x180bb.$1');
                return `<article class="status-music-track" role="listitem" data-track-id="${Number(track.trackId)||0}"><a class="status-music-track-art" href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHTML(title)} in Apple Music"><img src="${escapeHTML(art)}" alt="${escapeHTML(album)} album artwork" loading="lazy"></a><div class="status-music-track-copy"><strong title="${escapeHTML(title)}">${escapeHTML(title)}</strong><span title="${escapeHTML(artist)}">${escapeHTML(artist)}${duration?` · ${duration}`:''}</span><a class="status-music-store-link" href="${escapeHTML(link)}" target="_blank" rel="noopener noreferrer">View in Apple Music ↗</a></div><button type="button" class="status-music-select" data-select-track="${Number(track.trackId)||0}" aria-label="Add ${escapeHTML(title)} by ${escapeHTML(artist)} to status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Add</span></button></article>`;
            }).join('');
        };
        async function searchStatusMusic(query){
            const term=String(query||'').trim();
            if(term.length<2){musicResults.innerHTML='<div class="status-music-empty"><span class="status-music-empty-icon">♫</span><strong>Search for a song</strong><span>Try a track name or artist.</span></div>';return;}
            const requestId=++musicRequestId;
            musicResults.innerHTML='<div class="status-music-loading"><span class="status-music-spinner" aria-hidden="true"></span><span>Finding songs…</span></div>';
            try{
                const params=new URLSearchParams({term,media:'music',entity:'song',limit:'18',country:'ng'});
                const response=await fetch(`https://itunes.apple.com/search?${params.toString()}`,{headers:{Accept:'application/json'}});
                if(!response.ok)throw new Error('The music catalog is unavailable right now.');
                const data=await response.json();
                if(requestId!==musicRequestId)return;
                renderStatusMusic(Array.isArray(data.results)?data.results.filter(track=>track.trackViewUrl&&track.trackName):[],term);
            }catch(error){
                if(requestId!==musicRequestId)return;
                musicResults.innerHTML='<div class="status-music-empty"><span class="status-music-empty-icon">♫</span><strong>Couldn’t load songs</strong><span>Check your connection, or use a link below.</span></div>';
            }
        }
        musicOpen.addEventListener('click',()=>setMusicPicker(musicPicker.hidden));
        overlay.querySelector('#statusMusicPickerClose').addEventListener('click',()=>setMusicPicker(false));
        musicSearch.addEventListener('input',()=>{overlay.querySelector('#statusMusicSearchClear').hidden=!musicSearch.value;clearTimeout(musicSearchTimer);musicSearchTimer=setTimeout(()=>searchStatusMusic(musicSearch.value),320);});
        overlay.querySelector('#statusMusicSearchClear').addEventListener('click',()=>{musicSearch.value='';musicSearch.dispatchEvent(new Event('input',{bubbles:true}));musicSearch.focus();});
        overlay.querySelector('#statusManualMusicToggle').addEventListener('click',event=>{const field=overlay.querySelector('#statusManualMusic');field.hidden=!field.hidden;event.currentTarget.textContent=field.hidden?'Paste a music link instead':'Hide music link';if(!field.hidden)musicUrl.focus();});
        musicResults.addEventListener('click',event=>{
            const button=event.target.closest('[data-select-track]');if(!button)return;
            const row=button.closest('.status-music-track');
            const trackId=Number(button.dataset.selectTrack);
            const title=row?.querySelector('.status-music-track-copy strong')?.textContent||'Selected song';
            const artist=row?.querySelector('.status-music-track-copy span')?.textContent?.split(' · ')[0]||'';
            const storeLink=row?.querySelector('.status-music-store-link')?.href||'';
            if(!storeLink)return;
            selectedMusic={trackId,title,artist,storeLink};
            musicUrl.value=storeLink;
            musicCard.classList.add('has-music');
            musicState.textContent=`${title}${artist?` · ${artist}`:''}`;
            musicOpen.querySelector('span').textContent='Change song';
            setMusicPicker(false);
        });
        musicUrl.addEventListener('input',event=>{const hasMusic=Boolean(event.target.value.trim());selectedMusic=null;musicCard.classList.toggle('has-music',hasMusic);musicState.textContent=hasMusic?'Music link added to your status.':'Choose a soundtrack for this moment.';musicOpen.querySelector('span').textContent=hasMusic?'Change song':'Browse songs';});
        const statusToolHint=overlay.querySelector('#statusToolHint');
        const showStatusMedia=(file)=>{
            if(!file)return;
            if(previewUrl)URL.revokeObjectURL(previewUrl);
            previewUrl=URL.createObjectURL(file);preview.dataset.empty='false';preview.dataset.hasMedia='true';
            preview.querySelector('.status-preview-art')?.remove();preview.querySelector('.status-preview-empty')?.remove();
            const media=file.type.startsWith('video/')?document.createElement('video'):file.type.startsWith('audio/')?document.createElement('audio'):file.type.startsWith('image/')?document.createElement('img'):null;
            if(media){media.src=previewUrl;if(media instanceof HTMLVideoElement){media.playsInline=true;media.controls=true;media.preload='metadata';media.setAttribute('aria-label','Status video preview');}else if(media instanceof HTMLAudioElement){media.controls=true;media.preload='metadata';media.setAttribute('aria-label','Status audio preview');}else{media.alt='Status photo preview';}media.className='status-preview-media';preview.prepend(media);}
            else {const documentCard=document.createElement('a');documentCard.className='status-document-preview';documentCard.href=previewUrl;documentCard.target='_blank';documentCard.rel='noopener noreferrer';documentCard.textContent='▤  '+file.name;preview.prepend(documentCard);}
            statusToolHint.textContent=file.type.startsWith('audio/')?'Audio selected. Add a caption, then share your status.':file.type==='application/pdf'||file.type.includes('officedocument')||file.type==='application/msword'?'Document selected. Add a caption, then share your status.':'Media selected. Add a caption, then share your status.';
            updateCaption();
        };
        input.addEventListener('change',()=>showStatusMedia(input.files?.[0]));
        overlay.addEventListener('click',event=>{
            const button=event.target.closest('[data-status-tool]');if(!button)return;
            const tool=button.dataset.statusTool;
            if(tool==='text'){statusToolHint.textContent='Write a text status below.';overlay.querySelector('[name=body]').focus();return;}
            if(tool==='music'){statusToolHint.textContent='Search the music catalog or choose an audio track from your device.';setMusicPicker(true);return;}
            if(tool==='audio'||tool==='gallery'||tool==='voice'||tool==='document'){
                input.value='';input.removeAttribute('capture');
                if(tool==='gallery'){input.accept='image/*,video/*';statusToolHint.textContent='Choose a photo or video from your device gallery.';}
                if(tool==='audio'){input.accept='audio/*';statusToolHint.textContent='Choose an audio track from your device.';}
                if(tool==='voice'){input.accept='audio/*';input.setAttribute('capture','user');statusToolHint.textContent='Record a voice note with your device, then review it before sharing.';}
                if(tool==='document'){input.accept='application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';statusToolHint.textContent='Choose a supported document from your device.';}
                input.click();
            }
        });
        if(openGallery){input.accept='image/*,video/*';input.click();}
        overlay.querySelector('form').addEventListener('submit',async event=>{
            event.preventDefault();const form=event.currentTarget;const button=form.querySelector('button[type=submit]');const data=new FormData(form);button.disabled=true;button.textContent='Sharing…';
            try{const response=await fetch(`${API}/updates`,{method:'POST',headers:token()?{Authorization:`Bearer ${token()}`}:{},body:data});const result=await response.json().catch(()=>({}));if(!response.ok||!result.success)throw Error(result?.error?.message||'The status could not be shared.');closeComposer();await loadUpdatesFeed(page);}
            catch(error){overlay.querySelector('#updateComposeError').textContent=error.message||'The status could not be shared.';button.disabled=false;button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-8-5 16-3.5-6L4 12Zm7.5 2L20 4"/></svg>Share status';}
        });
    }

    function openInvite() {
        const panel = $('invitePanel');
        if (!panel) return;
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        $('inviteStatus').textContent = '';
        $('pickContactsButton')?.focus();
        loadPersonalInviteLink();
    }

    async function loadPersonalInviteLink() {
        try {
            const result = await api('/invites/link');
            latestInviteUrl = result.invite_url || '';
            $('copyInviteLink')?.classList.toggle('hidden', !latestInviteUrl);
        } catch (error) {
            latestInviteUrl = '';
            $('copyInviteLink')?.classList.add('hidden');
        }
    }

    function closeInvite() {
        const panel = $('invitePanel');
        panel?.classList.remove('is-open');
        panel?.setAttribute('aria-hidden', 'true');
    }

    const WFC_THEME_PRESETS={
      ocean:{name:"Ocean",mode:"dark",accent:"#48a9e4",wallpaper:"aurora"},
      graphite:{name:"Graphite",mode:"dark",accent:"#9aaebe",wallpaper:"dots"},
      violet:{name:"Violet",mode:"dark",accent:"#a38be9",wallpaper:"aurora"},
      sunset:{name:"Sunset",mode:"dark",accent:"#e1a15b",wallpaper:"sunset"},
      paper:{name:"Paper",mode:"light",accent:"#008069",wallpaper:"plain"}
    };
    function parseSharedTheme(){
      const prefix="#wfc-theme=";if(!location.hash.startsWith(prefix))return null;
      try{const x=JSON.parse(decodeURIComponent(location.hash.slice(prefix.length)));return {name:String(x.name||"Shared theme").slice(0,28),mode:x.mode==="light"?"light":"dark",accent:/^#[0-9a-f]{6}$/i.test(x.accent)?x.accent:"#008069",wallpaper:["aurora","dots","sunset","plain"].includes(x.wallpaper)?x.wallpaper:"aurora"};}catch(_){return null;}
    }
    function getCurrentVisualTheme(){
      const shared=parseSharedTheme();if(shared)return shared;
      let saved={};try{saved=JSON.parse(localStorage.getItem("wfc_custom_theme")||"{}");}catch(_){}
      let mode="light";try{mode=localStorage.getItem("wfc_theme")||saved.mode||"light";}catch(_){}
      return {name:String(saved.name||"Paper").slice(0,28),mode:mode==="light"?"light":"dark",accent:/^#[0-9a-f]{6}$/i.test(saved.accent)?saved.accent:"#008069",wallpaper:["aurora","dots","sunset","plain"].includes(saved.wallpaper)?saved.wallpaper:"plain"};
    }
    function saveVisualTheme(theme){
      const safe={name:String(theme.name||"My W.F.C theme").trim().slice(0,28)||"My W.F.C theme",mode:theme.mode==="light"?"light":"dark",accent:/^#[0-9a-f]{6}$/i.test(theme.accent)?theme.accent:"#008069",wallpaper:["aurora","dots","sunset","plain"].includes(theme.wallpaper)?theme.wallpaper:"aurora"};
      if(location.hash.startsWith("#wfc-theme="))history.replaceState(null,"",location.pathname+location.search);
      try{localStorage.setItem("wfc_theme",safe.mode);localStorage.setItem("wfc_custom_theme",JSON.stringify(safe));}catch(_){}
      applyTheme();return safe;
    }
    function renderThemeStudio(){
      const t=getCurrentVisualTheme();
      const presets=Object.entries(WFC_THEME_PRESETS).map(([id,x])=>'<button type="button" class="theme-preset-card'+(t.name===x.name?' selected':'')+'" data-theme-preset="'+id+'" aria-pressed="'+(t.name===x.name)+'"><span class="theme-preset-swatch" style="--theme-swatch:'+x.accent+'"><i></i><i></i><i></i></span><strong>'+escapeHTML(x.name)+'</strong><small>'+x.mode+' theme</small></button>').join("");
      const selected=(value)=>t.wallpaper===value?' selected':'';
      return '<div class="theme-studio"><div class="theme-studio-hero"><div><span class="theme-studio-kicker">W.F.C THEME STUDIO</span><h4>Make the chat yours.</h4><p>Choose a palette, tune the accent, and set the mood behind your messages.</p></div><svg class="theme-studio-mark" viewBox="0 0 100 100" role="img" aria-label="Animated W.F.C theme symbol"><defs><linearGradient id="themeMark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#67c2ed"/><stop offset="1" stop-color="#a18be9"/></linearGradient></defs><circle cx="50" cy="50" r="37" fill="url(#themeMark)"><animate attributeName="r" values="35;39;35" dur="4s" repeatCount="indefinite"/></circle><path d="M31 40h38v25H48l-10 8v-8h-7z" fill="#f5fbff" opacity=".95"/><path d="M40 49h20M40 57h13" stroke="#53a7d8" stroke-width="3" stroke-linecap="round"/></svg></div>'+
      '<div class="theme-live-preview" style="--theme-preview-accent:'+t.accent+'"><div class="theme-preview-top"><span class="theme-preview-avatar">W</span><span><b>W.F.C</b><small>Theme preview</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg></div><div class="theme-preview-thread"><span class="theme-preview-date">TODAY</span><div class="theme-preview-bubble incoming">A fresh look for your chats<span>10:41</span></div><div class="theme-preview-bubble outgoing">Made just for W.F.C <span>10:42&nbsp; ✓</span></div></div></div>'+
      '<label class="theme-field-label" for="themeNameInput">Theme name</label><input id="themeNameInput" class="theme-name-input" type="text" maxlength="28" value="'+escapeHTML(t.name)+'" placeholder="My W.F.C theme">'+
      '<div class="theme-studio-section"><div class="theme-studio-section-title"><strong>Choose a palette</strong><small>5 W.F.C originals</small></div><div class="theme-preset-grid">'+presets+'</div></div>'+
      '<div class="theme-custom-row"><label class="theme-accent-control">Accent color<input id="themeAccentPicker" type="color" value="'+t.accent+'" aria-label="Choose accent color"><span>'+t.accent.toUpperCase()+'</span></label><label class="theme-wallpaper-control" for="themeWallpaperPicker">Chat wallpaper<select id="themeWallpaperPicker"><option value="aurora"'+selected("aurora")+'>Aurora gradient</option><option value="dots"'+selected("dots")+'>Quiet dots</option><option value="sunset"'+selected("sunset")+'>Evening glow</option><option value="plain"'+selected("plain")+'>Clean and plain</option></select></label></div>'+
      '<div class="theme-share-row"><button type="button" class="settings-action-button" data-theme-share>Copy share link</button><span id="themeShareStatus" role="status" aria-live="polite">Your theme is saved on this device.</span></div>'+
      '<details class="theme-reference-note"><summary>Theme guide</summary><div><h5>Creating a theme</h5><p>Name your W.F.C theme, select a palette, and tune the color with a hex value or the color picker.</p><h5>Publishing your theme</h5><p>Copy a share link to let someone apply the same name, accent color, and wallpaper in W.F.C.</p><h5>Updating your theme</h5><p>Save a change here, then copy a fresh link to share the updated design.</p><h5>Including a chat background</h5><p>Choose one of the original W.F.C wallpapers above. Motion is kept subtle and respects reduced-motion settings.</p><p class="theme-guide-quote">Telegram says: “Your theme gets updated automatically for all its users whenever you save and apply changes.”</p><a href="https://core.telegram.org/themes" target="_blank" rel="noopener">Read Telegram’s theme guide</a></div></details></div>';
    }
    function applyTheme(){
      const shared=parseSharedTheme();let t=getCurrentVisualTheme();
      if(shared){t=shared;try{localStorage.setItem("wfc_theme",t.mode);localStorage.setItem("wfc_custom_theme",JSON.stringify(t));}catch(_){}history.replaceState(null,"",location.pathname+location.search);}
      const root=document.documentElement;root.dataset.theme=t.mode;root.dataset.wallpaper=t.wallpaper;root.style.setProperty("--wfc-accent",t.accent);
      const summary=$("themeSummary");if(summary)summary.textContent=t.name+" theme";
      return t.mode;
    }
    function toggleTheme(){
      const t=getCurrentVisualTheme();t.mode=t.mode==="dark"?"light":"dark";t.name=t.mode==="dark"?"Ocean":"Paper";saveVisualTheme(t);openSettingDetail("appearance");
    }

    function openSettings(detailKey) {
        if ($('settingsName')) $('settingsName').textContent = displayName(currentUser);
        if ($('settingsUsername')) $('settingsUsername').textContent = currentUser?.username ? '@' + currentUser.username : '';
        const phoneVerification = $('settingsPhoneVerification');
        if (phoneVerification) {
            const phoneDigits = String(currentUser?.phone || "").replace(/\D/g, "");
            const verified = Boolean(currentUser?.phone_verified_at);
            phoneVerification.classList.toggle("is-verified", verified);
            phoneVerification.classList.toggle("is-unverified", !verified);
            if (verified) {
                const phoneSummary = phoneDigits.length >= 4
                    ? "SMS confirmed · ending in " + phoneDigits.slice(-4)
                    : "SMS confirmed";
                phoneVerification.innerHTML =
                    verifiedPhoneBadge(currentUser.phone_verified_at) +
                    '<span class="phone-verification-copy"><strong>Phone number verified</strong><small>' +
                    phoneSummary +
                    '</small></span>';
            } else {
                phoneVerification.innerHTML =
                    '<span class="phone-verification-pending" aria-hidden="true">!</span>' +
                    '<span class="phone-verification-copy"><strong>Phone not verified</strong><small>Complete SMS verification to confirm your number</small></span>';
            }
        }
        const avatar = $('profilePhotoVisual');
        if (avatar) {
            avatar.innerHTML = avatarMarkup(currentUser?.profile_picture, 'W');
            hydratePrivateImages(avatar);
        }
        $('settingsPanel')?.classList.add('is-open');
        $('settingsPanel')?.setAttribute('aria-hidden', 'false');
        $('settingsHome')?.classList.remove('hidden');
        $('settingsDetail')?.classList.add('hidden');
        if (detailKey) openSettingDetail(detailKey);
    }

    function closeSettings() {
        $('settingsPanel')?.classList.remove('is-open');
        $('settingsPanel')?.setAttribute('aria-hidden', 'true');
    }

    function openSettingDetail(key) {
        const home = $('settingsHome');
        const detail = $('settingsDetail');
        if (!home || !detail) return;
        if (key === 'profile') {
            const user = currentUser || {};
            const publicName = user.display_name || user.username || 'W.F.C member';
            const currentStatus = ['online', 'offline', 'busy', 'away'].includes(String(user.status || '').toLowerCase())
                ? String(user.status).toLowerCase()
                : 'online';
            home.classList.add('hidden');
            detail.classList.remove('hidden');
            detail.innerHTML = `
                <button id="settingsDetailBack" type="button" class="settings-detail-back">← Settings</button>
                <div class="profile-editor-heading">
                    <span class="profile-editor-eyebrow">YOUR W.F.C PROFILE</span>
                    <h3>Edit your profile</h3>
                    <p>Choose how people see and recognize you.</p>
                    <img class="profile-editor-art" src="/motion/profile-editor.svg" alt="" aria-hidden="true">
                </div>
                <div class="profile-public-card" aria-label="Live profile preview">
                    <div class="profile-public-avatar">${avatarMarkup(user.profile_picture, (publicName.trim()[0] || 'W').toUpperCase())}</div>
                    <div class="profile-public-copy">
                        <span class="profile-public-eyebrow">PROFILE PREVIEW</span>
                        <strong id="profilePreviewName">${escapeHTML(publicName)}</strong>
                        <small id="profilePreviewUsername">${user.username ? '@' + escapeHTML(user.username) : 'Choose a username so people can find you'}</small>
                        <small id="profilePreviewAbout" class="profile-about-preview">${escapeHTML(user.about || 'Add a short About so people can get to know you.')}</small>
                        <span id="profilePreviewStatus" class="profile-status-pill">${escapeHTML(currentStatus[0].toUpperCase() + currentStatus.slice(1))}</span>
                    </div>
                    <span class="profile-preview-tag"><span class="profile-preview-dot"></span>LIVE PREVIEW</span>
                </div>
                <div class="profile-privacy-note">
                    <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="8.5" width="12" height="9" rx="2"/><path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5M10 12v2"/></svg>
                    <span>Your phone number stays private. Only profile details are shown to other members.</span>
                </div>
                <form id="profileEditForm" class="profile-edit-form">
                    <div class="profile-form-grid">
                        <div class="profile-field">
                            <label for="profileDisplayName">Display name</label>
                            <input id="profileDisplayName" name="display_name" maxlength="80" required value="${escapeHTML(user.display_name || '')}" placeholder="Your name" autocomplete="name">
                            <small class="profile-field-help">The name people see in chats.</small>
                        </div>
                        <div class="profile-field">
                            <label for="profileUsername">Username</label>
                            <div class="profile-username-field"><span aria-hidden="true">@</span><input id="profileUsername" name="username" minlength="3" maxlength="30" pattern="[a-zA-Z0-9_.]{3,30}" required value="${escapeHTML(user.username || '')}" placeholder="yourname" autocomplete="username" autocapitalize="none" spellcheck="false"></div>
                            <small class="profile-field-help">Letters, numbers, dots and underscores.</small>
                        </div>
                        <div class="profile-field profile-field-wide">
                            <div class="profile-field-label-row"><label for="profileAbout">About</label><small id="profileAboutCount" class="profile-character-count">0 / 140</small></div>
                            <textarea id="profileAbout" name="about" maxlength="140" rows="4" placeholder="A little about you" aria-describedby="profileAboutHelp profileAboutCount">${escapeHTML(user.about || '')}</textarea>
                            <small id="profileAboutHelp" class="profile-field-help">Add a short bio people can see on your profile.</small>
                        </div>
                        <div class="profile-field profile-status-field">
                            <label for="profileStatus">Status</label>
                            <select id="profileStatus" name="status">
                                <option value="online" ${currentStatus === 'online' ? 'selected' : ''}>Available</option>
                                <option value="away" ${currentStatus === 'away' ? 'selected' : ''}>Away</option>
                                <option value="busy" ${currentStatus === 'busy' ? 'selected' : ''}>Busy</option>
                                <option value="offline" ${currentStatus === 'offline' ? 'selected' : ''}>Offline</option>
                            </select>
                        </div>
                    </div>
                    <div class="profile-form-actions">
                        <p id="profileSaveStatus" class="profile-save-status" role="status" aria-live="polite"></p>
                        <button id="saveProfileButton" class="profile-save-button" type="submit"><span>Save profile</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg></button>
                    </div>
                </form>`;
            hydratePrivateImages(detail);
            const profileForm = $('profileEditForm');
            const syncProfilePreview = () => {
                const name = String($('profileDisplayName')?.value || '').trim() || 'Your name';
                const username = String($('profileUsername')?.value || '').trim();
                const about = String($('profileAbout')?.value || '').trim();
                const statusValue = String($('profileStatus')?.value || 'online');
                const statusNames = { online: 'Available', away: 'Away', busy: 'Busy', offline: 'Offline' };
                if ($('profilePreviewName')) $('profilePreviewName').textContent = name;
                if ($('profilePreviewUsername')) $('profilePreviewUsername').textContent = username ? '@' + username : 'Choose a username so people can find you';
                if ($('profilePreviewAbout')) $('profilePreviewAbout').textContent = about || 'Add a short About so people can get to know you.';
                if ($('profilePreviewStatus')) $('profilePreviewStatus').textContent = statusNames[statusValue] || 'Available';
                if ($('profileAboutCount')) $('profileAboutCount').textContent = String($('profileAbout')?.value.length || 0) + ' / 140';
            };
            profileForm?.addEventListener('input', syncProfilePreview);
            profileForm?.addEventListener('change', syncProfilePreview);
            syncProfilePreview();
            profileForm?.addEventListener('submit', saveProfileDetails);
            return;
        }
        const info = {
            subscription: ['Subscription', 'W.F.C messaging is currently free. There is no subscription charge or payment setup in this app.'],
            device: ['Link device', 'Enter the one-time code shown on the browser you want to link. Review its name before you approve it.'],
            account: ['Account', `Signed in as ${escapeHTML(displayName(currentUser))}${currentUser?.username ? ` (@${escapeHTML(currentUser.username)})` : ''}. Your verified number is used for sign-in and stays private.`],
            privacy: ['Privacy', 'Member search shows profile names, usernames, profile photos and About text. Your phone number is not returned in member search. Contact selection is user controlled; only numbers you review and invite are sent to TextBee.'],
            lists: ['Lists', 'Custom contact lists are not available yet. Use People to search W.F.C members and start a conversation.'],
            chats: ['Chats', `You have ${chats.length} conversation${chats.length === 1 ? '' : 's'} on this account. Your W.F.C chats are available whenever you sign in on a supported device.`],
            appearance: ['Appearance', 'Choose a W.F.C theme, accent color, and chat wallpaper.'],
            notifications: ['Notifications', 'Push notifications are not connected to the W.F.C server yet. This page will not request browser notification access until messages can be delivered to it.'],
            language: ['App language', 'Choose the language used by W.F.C on this device.'],
            invite: ['Invite a contact', 'Select people and review their numbers before W.F.C queues any invitation SMS.']
        };
        const [title, description] = info[key] || info.account;
        let action = '';
        if (key === 'device') {
            action = [
                '<section class="device-pair-settings">',
                '<p class="device-pair-settings-intro">On the browser you want to link, keep the one-time code visible. Enter it below and check the browser name before approving.</p>',
                '<form id="devicePairForm" class="device-pair-form">',
                '<label for="devicePairCode">Code from the browser</label>',
                '<div class="device-pair-input-row"><input id="devicePairCode" name="code" type="text" inputmode="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" maxlength="9" placeholder="ABCD EFGH" required><button id="devicePairReviewButton" type="submit">Review</button></div>',
                '</form>',
                '<section id="devicePairReview" class="device-pair-review hidden" aria-live="polite">',
                '<span class="device-pair-review-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></svg></span>',
                '<div><small>REQUESTED BROWSER</small><strong id="devicePairName"></strong></div>',
                '<p>Only approve if this is your browser and you started this request.</p>',
                '<div class="device-pair-review-actions"><button type="button" data-device-action="approve">Approve and link</button><button type="button" data-device-action="deny">Do not link</button></div>',
                '</section>',
                '<p id="devicePairStatus" class="device-pair-feedback" role="status" aria-live="polite"></p>',
                '<p class="device-pair-settings-note">Your phone stays signed in. The linked browser keeps its own sign-in until you sign out there.</p>',
                '</section>'
            ].join('');
        } else if (key === 'appearance') {
            action = renderThemeStudio();
        } else if (key === 'language') {
            action = '<button class="settings-action-button" type="button" data-open-language>Choose app language</button>';
        } else if (key === 'invite') {
            action = '<button class="settings-action-button" type="button" data-open-invites>Invite a contact</button>';
        } else if (key === 'lists') {
            action = '<button class="settings-action-button" type="button" data-open-people>Find people</button>';
        }
        home.classList.add('hidden');
        detail.classList.remove('hidden');
        detail.innerHTML = `<button id="settingsDetailBack" type="button" class="settings-detail-back">← Settings</button><h3>${title}</h3><p>${description}</p>${action}`;
        if (key === 'device') setupDevicePairing();
    }

    function setupDevicePairing() {
        const form = $('devicePairForm');
        const input = $('devicePairCode');
        const review = $('devicePairReview');
        const status = $('devicePairStatus');
        let code = '';

        input?.addEventListener('input', () => {
            input.value = input.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '').slice(0, 8);
            status.textContent = '';
            status.className = 'device-pair-feedback';
        });

        form?.addEventListener('submit', async event => {
            event.preventDefault();
            code = String(input?.value || '').toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '');
            if (!/^[A-HJ-NP-Z2-9]{8}$/.test(code)) {
                status.textContent = 'Enter the eight characters shown on the browser.';
                status.className = 'device-pair-feedback is-error';
                input?.focus();
                return;
            }
            const button = $('devicePairReviewButton');
            button.disabled = true;
            status.textContent = 'Checking the browser…';
            status.className = 'device-pair-feedback';
            try {
                const result = await api('/device-link/preview', {
                    method: 'POST',
                    body: JSON.stringify({ code })
                });
                $('devicePairName').textContent = result.device_name || 'W.F.C browser';
                form.classList.add('hidden');
                review?.classList.remove('hidden');
                status.textContent = 'Review the browser above, then choose whether to link it.';
            } catch (error) {
                status.textContent = error.message || 'That code is unavailable. Check it and try again.';
                status.className = 'device-pair-feedback is-error';
            } finally {
                button.disabled = false;
            }
        });

        review?.addEventListener('click', async event => {
            const button = event.target.closest('[data-device-action]');
            if (!button || !code) return;
            const action = button.dataset.deviceAction;
            if (action === 'approve' && !window.confirm('Link ' + ($('devicePairName')?.textContent || 'this browser') + ' to your W.F.C account?')) return;
            review.querySelectorAll('button').forEach(item => { item.disabled = true; });
            status.textContent = action === 'approve' ? 'Linking this browser…' : 'Declining the request…';
            status.className = 'device-pair-feedback';
            try {
                const result = await api('/device-link/decision', {
                    method: 'POST',
                    body: JSON.stringify({ code, action })
                });
                status.textContent = result.message || (action === 'approve' ? 'Device linked.' : 'Request declined.');
                status.className = 'device-pair-feedback is-success';
                review.classList.add('hidden');
                form.classList.add('hidden');
            } catch (error) {
                status.textContent = error.message || 'The request could not be updated.';
                status.className = 'device-pair-feedback is-error';
                review.querySelectorAll('button').forEach(item => { item.disabled = false; });
            }
        });
    }

    async function saveProfileDetails(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const button = $('saveProfileButton');
        const status = $('profileSaveStatus');
        const values = new FormData(form);
        const profile = Object.fromEntries(values.entries());
        button.disabled = true;
        button.textContent = 'Saving…';
        status.textContent = '';
        status.className = 'profile-save-status';
        try {
            const data = await api('/users/me', {
                method: 'PATCH',
                body: JSON.stringify(profile)
            });
            if (!data?.user) throw new Error('The profile could not be updated.');
            currentUser = data.user;
            try { localStorage.setItem('wfc_user', JSON.stringify(currentUser)); } catch {}
            if ($('settingsName')) $('settingsName').textContent = displayName(currentUser);
            if ($('settingsUsername')) $('settingsUsername').textContent = currentUser.username ? `@${currentUser.username}` : '';
            status.textContent = 'Your profile is saved.';
            status.classList.add('is-success');
            openSettingDetail('profile');
            const refreshedStatus = $('profileSaveStatus');
            if (refreshedStatus) {
                refreshedStatus.textContent = 'Your profile is saved.';
                refreshedStatus.classList.add('is-success');
            }
        } catch (error) {
            status.textContent = error.message || 'The profile could not be saved. Try again.';
            status.classList.add('is-error');
            button.disabled = false;
            button.textContent = 'Save profile';
        }
    }

    function openLanguagePanel() {
        const panel = $('languagePanel');
        if (!panel) return;
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        $('closeLanguage')?.focus();
    }

    function closeLanguagePanel() {
        const panel = $('languagePanel');
        panel?.classList.remove('open');
        panel?.setAttribute('aria-hidden', 'true');
    }

    function setupLanguage() {
        const list = $('languageList');
        const i18n = window.WFC_I18N;
        if (!list || !i18n) return;
        const languages = i18n.getLanguages();
        list.innerHTML = languages.map(language => `
            <button class="language-option" type="button" data-language-code="${escapeHTML(language.code)}">
                <span>${escapeHTML(language.name)}</span><span aria-hidden="true">›</span>
            </button>
        `).join('');
        list.querySelectorAll('[data-language-code]').forEach(button => {
            button.addEventListener('click', () => {
                i18n.setLanguage(button.dataset.languageCode);
                closeLanguagePanel();
                closeSettings();
            });
        });
        $('closeLanguage')?.addEventListener('click', closeLanguagePanel);
        $('languagePanel')?.addEventListener('click', event => {
            if (event.target === $('languagePanel')) closeLanguagePanel();
        });
    }

    function renderSelectedInviteContacts() {
        const container = $('selectedInviteContacts');
        if (!container) return;
        if (!selectedInviteContacts.length) {
            container.textContent = 'No contacts selected yet.';
            return;
        }
        container.innerHTML = selectedInviteContacts.map((contact, index) => {
            const digits = contact.phone.replace(/\D/g, '');
            const masked = digits.length > 4 ? `••• ${digits.slice(-4)}` : 'Number selected';
            return `<div class="invite-contact-chip"><span><strong>${escapeHTML(contact.name)}</strong><small>${escapeHTML(masked)}</small></span><button type="button" data-remove-invite-contact="${index}" aria-label="Remove ${escapeHTML(contact.name)}">×</button></div>`;
        }).join('');
    }

    async function choosePhoneContacts() {
        const note = $('contactPickerNote');
        if (!window.isSecureContext || !navigator.contacts?.select) {
            note.textContent = 'Phone contact access needs HTTPS and a supported mobile browser. Import a .vcf contact file or enter the number below on this page.';
            return;
        }
        try {
            const chosen = await navigator.contacts.select(['name', 'tel'], { multiple: false });
            selectedInviteContacts = chosen.slice(0, 1).map(contact => {
                const raw = Array.isArray(contact.tel) ? contact.tel[0] : '';
                return {
                    name: Array.isArray(contact.name) ? contact.name[0] : (contact.name || 'Contact'),
                    phone: typeof raw === 'string' ? raw : (raw?.value || '')
                };
            }).filter(contact => contact.phone.trim());
            renderSelectedInviteContacts();
            note.textContent = 'Review this person, then open your Messages app to send the invitation from your SIM.';
            await checkInviteContact();
        } catch (error) {
            note.textContent = error?.name === 'AbortError' ? 'Contact selection cancelled. No contact data was shared.' : 'Could not open phone contacts. Try the Messages app instead.';
        }
    }

    function renderInviteVcardChoices() {
        const list=$('inviteVcardChoices');
        if(!list) return;
        list.innerHTML=inviteVcardContacts.map((contact,index)=>`<button type="button" data-select-invite-vcard="${index}"><span><strong>${escapeHTML(contact.name)}</strong><small>${escapeHTML(maskContactPhone(contact.phone))}</small></span><b aria-hidden="true">›</b></button>`).join('');
    }

    function selectInviteContact(contact) {
        const cleaned=cleanPhoneContact(contact);
        if(!cleaned) return;
        selectedInviteContacts=[cleaned];
        inviteContactMatch=null;
        renderSelectedInviteContacts();
        $('sendInviteButton').textContent='Continue to Messages';
        void checkInviteContact();
    }

    function addManualInviteContact() {
        const name=$('manualInviteName')?.value.trim()||'Friend';
        const phone=$('manualInvitePhone')?.value.trim()||'';
        if(!phone||!/[0-9]{7,}/.test(phone)){
            $('inviteStatus').textContent='Enter a valid phone number, including its country code.';
            $('inviteStatus').className='invite-status is-error';
            return;
        }
        selectInviteContact({name,phone});
    }

    async function importInviteVcard(file) {
        const list=$('inviteVcardChoices');
        if(!file) return;
        if(file.size>5*1024*1024){$('contactPickerNote').textContent='Choose a .vcf file smaller than 5 MB.';return;}
        try {
            inviteVcardContacts=parseVCardContacts(await file.text()).slice(0,500).map(cleanPhoneContact).filter(Boolean);
            renderInviteVcardChoices();
            $('contactPickerNote').textContent=inviteVcardContacts.length?`Choose one of ${inviteVcardContacts.length} contacts. Only that phone number is checked.`:'No phone numbers were found in that file.';
        } catch {
            $('contactPickerNote').textContent='That file could not be read. Choose a valid .vcf contacts file.';
        } finally { $('inviteContactFile').value=''; }
    }

    async function checkInviteContact() {
        const status=$('inviteStatus');
        const contact=selectedInviteContacts[0];
        inviteContactMatch=null;
        if(!contact?.phone) return;
        status.textContent='Checking whether this person is already on W.F.C…';
        status.className='invite-status';
        try {
            const result=await api('/contacts/match',{method:'POST',body:JSON.stringify({contacts:[contact]})});
            inviteContactMatch=result.matches?.[0]?.registered?result.matches[0].user:null;
            const button=$('sendInviteButton');
            if(inviteContactMatch){
                status.textContent=`${displayName(inviteContactMatch)} is already on W.F.C. Open their chat instead of sending an invite.`;
                button.textContent='Open chat';
            } else {
                status.textContent='Not on W.F.C yet. Continue to Messages to invite them from your SIM.';
                button.textContent='Continue to Messages';
            }
            status.className='invite-status';
        } catch(error) {
            status.textContent=error.message||'Could not check this contact. You can still open Messages.';
            status.className='invite-status';
            $('sendInviteButton').textContent='Continue to Messages';
        }
    }

    async function sendInvitations(event) {
        event.preventDefault();
        const status = $('inviteStatus');
        const contact=selectedInviteContacts[0];
        if(!contact?.phone){
            status.textContent='Choose one phone contact or enter a phone number first.';
            status.className='invite-status is-error';
            return;
        }
        if(inviteContactMatch){
            const userId=Number(inviteContactMatch.id);
            closeInvite();
            await startPrivateChat(userId);
            return;
        }
        if (!window.confirm(`Open Messages with an invitation for ${contact.name}? Review the draft and tap Send there.`)) return;
        const button=$('sendInviteButton');
        button.disabled=true;
        status.textContent='Preparing your invitation…';
        status.className='invite-status';
        try {
            if(!latestInviteUrl){const result=await api('/invites/link');latestInviteUrl=result.invite_url||'';}
            if(!latestInviteUrl) throw new Error('Your invitation link is not ready yet.');
            const name=displayName(currentUser);
            const body=`${name} invited you to join W.F.C’sChat. Create an account to connect: ${latestInviteUrl}`;
            const phone=String(contact.phone).replace(/[^+0-9]/g,'');
            location.href=`sms:${encodeURIComponent(phone)}?body=${encodeURIComponent(body)}`;
            status.textContent='Messages opened. Review the recipient and tap Send to use your SIM.';
            status.className='invite-status is-success';
        } catch(error) {
            status.textContent=error.message||'Could not prepare the SMS draft.';
            status.className='invite-status is-error';
            button.disabled=false;
        }
    }

    async function openNativeInviteMessages() {
        try {
            if (!latestInviteUrl) {
                const result = await api('/invites/link');
                latestInviteUrl = result.invite_url || '';
            }
            if (!latestInviteUrl) throw new Error('Your invitation link is not ready yet.');
            const name = displayName(currentUser);
            const body = `${name} invited you to join W.F.C'sChat. Create an account to connect: ${latestInviteUrl}`;
            const recipient=selectedInviteContacts[0]?.phone;
            location.href = `sms:${recipient ? encodeURIComponent(recipient.replace(/[^+0-9]/g,'')) : ''}?body=${encodeURIComponent(body)}`;
        } catch (error) {
            $('inviteStatus').textContent = error.message || 'Could not prepare your invite link.';
            $('inviteStatus').className = 'invite-status is-error';
        }
    }

    async function copyInviteLink() {
        if (!latestInviteUrl) return;
        try {
            await navigator.clipboard.writeText(latestInviteUrl);
            $('inviteStatus').textContent = 'Invite link copied.';
        } catch {
            window.prompt('Copy your invite link:', latestInviteUrl);
        }
    }

    let matchedPhoneContacts = [];

    function cleanPhoneContact(contact) {
        const name = String(contact?.name || '').trim().slice(0, 80) || 'Contact';
        const rawPhone = String(contact?.phone || '').trim().slice(0, 40);
        return rawPhone ? { name, phone: rawPhone } : null;
    }

    function parseVCardContacts(text) {
        const unfolded = String(text || '').replace(/\r?\n[ \t]/g, '');
        const cards = unfolded.split(/BEGIN:VCARD/i).slice(1);
        const decode = value => String(value || '').replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').trim();
        const contacts = [];
        for (const card of cards) {
            const nameLine = card.match(/^FN(?:;[^:]*)?:(.*)$/im);
            const structured = card.match(/^N(?:;[^:]*)?:(.*)$/im);
            const name = decode(nameLine?.[1] || structured?.[1]?.split(';').filter(Boolean).reverse().join(' ') || 'Contact');
            const phones = [...card.matchAll(/^TEL(?:;[^:]*)?:(.*)$/gim)].map(match => match[1].replace(/^tel:/i, '').trim());
            for (const phone of phones) contacts.push({ name, phone });
        }
        return contacts;
    }

    function maskContactPhone(value) {
        const digits = String(value || '').replace(/\D/g, '');
        return digits.length > 4 ? `••• ${digits.slice(-4)}` : 'Phone contact';
    }

    async function matchPhoneContacts(contacts) {
        const note = $('phoneContactNote');
        const list = $('phoneContactMatches');
        const cleaned = [...new Map(contacts.map(cleanPhoneContact).filter(Boolean).map(contact => [`${contact.name.toLowerCase()}|${contact.phone.replace(/\D/g, '')}`, contact])).values()].slice(0, 500);
        if (!cleaned.length) { note.textContent = 'No phone numbers were found in the selected contacts.'; return; }
        matchedPhoneContacts = [];
        list.innerHTML = '<div class="user-search-empty">Checking selected contacts…</div>';
        note.textContent = `Checking ${cleaned.length} selected contact${cleaned.length === 1 ? '' : 's'}. Numbers are used for this match only and are not saved.`;
        try {
            for (let offset = 0; offset < cleaned.length; offset += 100) {
                const batch = cleaned.slice(offset, offset + 100);
                const result = await api('/contacts/match', { method: 'POST', body: JSON.stringify({ contacts: batch }) });
                const matches = Array.isArray(result.matches) ? result.matches : [];
                for (const match of matches) matchedPhoneContacts.push({ ...match, selected: batch[Number(match.index)] || cleaned[offset + Number(match.index)] || cleaned[offset] });
            }
            renderPhoneContactMatches();
            const registeredCount = matchedPhoneContacts.filter(item => item.registered).length;
            note.textContent = `${registeredCount} on W.F.C · ${matchedPhoneContacts.length - registeredCount} not registered. Choose Message or Invite by SMS.`;
        } catch (error) {
            list.innerHTML = `<div class="user-search-empty">${escapeHTML(error.message || 'Contacts could not be checked.')}</div>`;
            note.textContent = error.status === 429 ? 'Contact matching reached its daily limit. Please try again later.' : 'No contact data was saved. Check your connection and try again.';
        }
    }

    function renderPhoneContactMatches() {
        const list = $('phoneContactMatches');
        if (!list) return;
        if (!matchedPhoneContacts.length) { list.innerHTML = ''; return; }
        list.innerHTML = matchedPhoneContacts.map((item, index) => {
            const contact = item.selected || {};
            const name = item.registered ? displayName(item.user) : (contact.name || 'Contact');
            const picture = item.registered ? item.user.profile_picture : '';
            const avatar = avatarMarkup(picture, (name.trim()[0] || '•').toUpperCase());
            const action = item.registered
                ? `<button class="saved-message-action" type="button" data-phone-match-message="${Number(item.user.id)}">Message</button>`
                : `<button class="saved-message-action phone-invite-action" type="button" data-phone-match-invite="${index}">Invite</button>`;
            const detail = item.registered ? (item.user.username ? `@${escapeHTML(item.user.username)}` : 'On W.F.C') : `Not registered · ${escapeHTML(maskContactPhone(contact.phone))}`;
            return `<div class="saved-contact-row phone-match-row"><span class="saved-contact-avatar">${avatar}</span><span class="saved-contact-copy"><strong>${escapeHTML(name)}${item.registered && item.user.phone_verified_at ? verifiedPhoneBadge(item.user.phone_verified_at) : ''}</strong><small>${detail}</small></span>${action}</div>`;
        }).join('');
        hydratePrivateImages(list);
    }

    async function chooseAndMatchPhoneContacts() {
        const note = $('phoneContactNote');
        if (!window.isSecureContext || !navigator.contacts?.select) {
            note.textContent = 'This browser cannot open the phone contact picker on the current HTTP address. Import a .vcf contact file, or open W.F.C over HTTPS to use the phone picker.';
            return;
        }
        try {
            const chosen = await navigator.contacts.select(['name', 'tel'], { multiple: true });
            const contacts = chosen.flatMap(contact => {
                const rawPhones = Array.isArray(contact.tel) ? contact.tel : [contact.tel];
                return rawPhones.filter(Boolean).map(phone => ({ name: Array.isArray(contact.name) ? contact.name[0] : contact.name, phone: typeof phone === 'string' ? phone : phone.value }));
            });
            await matchPhoneContacts(contacts);
        } catch (error) {
            note.textContent = error?.name === 'AbortError' ? 'Contact selection cancelled. Nothing was checked.' : 'Could not open contacts. Import a .vcf file instead.';
        }
    }

    async function importPhoneContactFile(file) {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { $('phoneContactNote').textContent = 'Choose a .vcf file smaller than 5 MB.'; return; }
        try {
            const contacts = parseVCardContacts(await file.text());
            await matchPhoneContacts(contacts);
        } catch {
            $('phoneContactNote').textContent = 'That contact file could not be read. Choose a valid .vcf file.';
        } finally { $('phoneContactFile').value = ''; }
    }

    async function renderSavedContacts() {
        const list = $('savedContactList');
        if (!list) return;
        list.innerHTML = '<div class="user-search-empty">Loading your people…</div>';
        try {
            const data = await api('/contacts');
            const saved = Array.isArray(data.contacts) ? data.contacts : [];
            const people = new Map();
            for (const chat of chats) {
                if (chat.type !== 'private' || !chat.last_message_id || !chat.other_user_id) continue;
                people.set(Number(chat.other_user_id), {
                    id:Number(chat.other_user_id), username:chat.other_username,
                    display_name:chat.other_display_name, profile_picture:chat.other_profile_picture,
                    chat_id:Number(chat.id), about:chat.other_about, status:chat.other_status, is_saved:false,
                    preview:formatChatPreview(chat), updated_at:chat.last_message_created_at || chat.updated_at
                });
            }
            for (const contact of saved) {
                const existing = people.get(Number(contact.id)) || {};
                people.set(Number(contact.id), { ...existing, ...contact, id:Number(contact.id), is_saved:true });
            }
            const rows = [...people.values()].sort((a,b) => Number(b.is_saved)-Number(a.is_saved) || String(a.display_name || a.username).localeCompare(String(b.display_name || b.username)));
            if (!rows.length) {
                list.innerHTML = '<div class="saved-contacts-empty"><span aria-hidden="true">＋</span><strong>No people yet</strong><p>Start a chat or save a W.F.C member to keep them here.</p></div>';
                return;
            }
            list.innerHTML = rows.map(person => {
                const name = displayName(person);
                const avatar = avatarMarkup(person.profile_picture, (name[0] || 'W').toUpperCase());
                return `<div class="saved-contact-row"><span class="saved-contact-avatar">${avatar}</span><span class="saved-contact-copy"><strong>${escapeHTML(name)}</strong><small>${person.is_saved ? 'Saved contact' : escapeHTML(person.preview || 'Recent conversation')}</small></span><button class="saved-message-action" type="button" data-contact-message="${person.id}" data-chat-id="${person.chat_id || ''}">Message</button>${person.is_saved ? `<button class="saved-remove-action" type="button" data-remove-contact="${person.id}" aria-label="Remove ${escapeHTML(name)} from contacts">×</button>` : ''}</div>`;
            }).join('');
            hydratePrivateImages(list);
            list.querySelectorAll('[data-contact-message]').forEach(button => button.addEventListener('click', () => {
                const chatId = Number(button.dataset.chatId);
                if (chatId) openConversation(chatId); else startPrivateChat(Number(button.dataset.contactMessage));
            }));
            list.querySelectorAll('[data-remove-contact]').forEach(button => button.addEventListener('click', async () => {
                button.disabled = true;
                try { await api(`/contacts/${Number(button.dataset.removeContact)}`, { method:'DELETE' }); await renderSavedContacts(); }
                catch (error) { showAppNotice(error.message || 'Could not remove this contact.'); button.disabled = false; }
            }));
        } catch (error) {
            list.innerHTML = `<div class="user-search-empty">${escapeHTML(error.message || 'Your contacts could not load.')}</div>`;
        }
    }

    function openSavedContacts() {
        setActiveTab('chats');
        showScreen('contacts');
        renderSavedContacts();
    }

    function openNewChat() {
        setActiveTab('chats');
        showScreen('new');
        $('userSearch')?.focus();
        $('userSearchResults').innerHTML = '<div class="user-search-empty">Search by name or username to find W.F.C members.</div>';
    }

    function closeNewChat() {
        setActiveTab('chats');
        showScreen('home');
        loadChats();
    }

    async function searchUsers(query) {
        const results = $('userSearchResults');
        const value = String(query || '').trim();
        if (!results) return;
        if (value.length < 2) {
            results.innerHTML = '<div class="user-search-empty">Type at least 2 characters to search.</div>';
            return;
        }
        results.innerHTML = '<div class="user-search-empty">Searching W.F.C…</div>';
        try {
            const data = await api(`/users/search?q=${encodeURIComponent(value)}`);
            const found = Array.isArray(data.users) ? data.users : [];
            if (!found.length) {
                results.innerHTML = '<div class="user-search-empty">No members found. Invite them to join W.F.C.</div>';
                return;
            }
            results.innerHTML = found.map(user => `
                <div class="user-result-row">
                    <button class="user-result-main" type="button" data-message-user="${Number(user.id)}">
                        <span class="user-result-avatar">${avatarMarkup(user.profile_picture, (displayName(user).trim()[0] || 'W').toUpperCase())}</span>
                        <span class="user-result-copy"><strong>${escapeHTML(displayName(user))}</strong><small>@${escapeHTML(user.username)}</small>${user.about ? `<small class="user-result-about">${escapeHTML(user.about)}</small>` : ''}<small class="user-result-status">${escapeHTML(user.status || 'offline')}</small></span>
                    </button>
                    <div class="user-result-actions">
                        <button class="user-message-action" type="button" data-message-user="${Number(user.id)}">Message</button>
                        <button class="user-save-action ${user.is_saved ? 'is-saved' : ''}" type="button" data-save-contact="${Number(user.id)}" ${user.is_saved ? 'disabled' : ''}>${user.is_saved ? 'Saved' : 'Save'}</button>
                    </div>
                </div>
            `).join('');
            hydratePrivateImages(results);
            results.querySelectorAll('[data-message-user]').forEach(button => {
                button.addEventListener('click', () => startPrivateChat(Number(button.dataset.messageUser)));
            });
            results.querySelectorAll('[data-save-contact]').forEach(button => {
                button.addEventListener('click', async () => {
                    const userId = Number(button.dataset.saveContact);
                    button.disabled = true;
                    button.textContent = 'Saving…';
                    try {
                        await api('/contacts', { method:'POST', body:JSON.stringify({ user_id:userId }) });
                        button.textContent = 'Saved';
                        button.classList.add('is-saved');
                        showAppNotice('Added to your contacts.');
                    } catch (error) {
                        button.disabled = false;
                        button.textContent = 'Save';
                        showAppNotice(error.message || 'Could not save this contact.');
                    }
                });
            });
        } catch (error) {
            results.innerHTML = `<div class="user-search-empty">${escapeHTML(error.message || 'Search failed. Try again.')}</div>`;
        }
    }

    async function startPrivateChat(userId) {
        try {
            const data = await api('/chats/private', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId })
            });
            await loadChats();
            await openConversation(Number(data.chat.id));
        } catch (error) {
            alert(error.message || 'Could not start this chat.');
        }
    }

    let selectedGroupMembers = new Map();
    let pendingPhoto = null;
    let pendingPhotoUrl = '';
    let pendingGroupPicture = null;
    let pendingGroupPictureUrl = '';
    let cameraStream = null;

    function openOverflow(trigger) {
        const menu = $('overflowMenu');
        if (!menu) return;
        $('chatActionMenu')?.classList.add('hidden');
        const rect = trigger.getBoundingClientRect();
        menu.classList.remove('hidden');
        menu.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 190)}px`;
        menu.style.left = `${Math.max(12, Math.min(rect.right - 214, window.innerWidth - 232))}px`;
        document.querySelectorAll('.overflow-trigger').forEach(button => button.setAttribute('aria-expanded', 'true'));
    }

    function closeOverflow() {
        $('overflowMenu')?.classList.add('hidden');
        $('chatActionMenu')?.classList.add('hidden');
        $('chatMoreMenuItems')?.classList.add('hidden');
        $('chatActionMore')?.setAttribute('aria-expanded', 'false');
        $('conversationMenuButton')?.setAttribute('aria-expanded', 'false');
        document.querySelectorAll('.overflow-trigger').forEach(button => button.setAttribute('aria-expanded', 'false'));
    }

    function showAppNotice(message) {
        const notice = $('appNotice');
        if (!notice) return;
        notice.textContent = message;
        notice.classList.add('is-visible');
        window.clearTimeout(showAppNotice.timer);
        showAppNotice.timer = window.setTimeout(() => notice.classList.remove('is-visible'), 4200);
    }

    function refreshChatActionLabels() {
        if (!currentChat) return;
        const isPrivate = currentChat.type === 'private';
        document.querySelectorAll('[data-private-only]').forEach(item => { item.hidden = !isPrivate; });
        const isFavorite = isPrivate && favoriteChatIds().has(String(currentChat.id));
        const listButton = $('chatActionList');
        if (listButton) listButton.innerHTML = `<span>${isFavorite ? '★' : '☆'}</span> ${isFavorite ? 'Remove from list' : 'Add to list'}`;
        const muteButton = $('chatActionMute');
        if (muteButton) muteButton.innerHTML = `<span>◖</span> ${currentChat.is_muted ? 'Unmute notifications' : 'Mute notifications'}`;
        const blockButton = $('chatActionBlock');
        if (blockButton) blockButton.innerHTML = `<span>⊘</span> ${currentChat.is_blocked ? 'Unblock' : 'Block'}`;
        const menu = $('chatActionMenu');
        if (menu) menu.setAttribute('aria-label', currentChat.type === 'group' ? 'Group conversation options' : 'Conversation options');
    }

    function openChatActionMenu(trigger) {
        if (!currentChat || !trigger) return;
        closeOverflow();
        const menu = $('chatActionMenu');
        if (!menu) return;
        refreshChatActionLabels();
        menu.classList.remove('hidden');
        const rect = trigger.getBoundingClientRect();
        const width = Math.min(292, window.innerWidth - 24);
        menu.style.width = `${width}px`;
        menu.style.top = `${Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - menu.offsetHeight - 12))}px`;
        menu.style.left = `${Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))}px`;
        trigger.setAttribute('aria-expanded', 'true');
        refreshChatActionLabels();
    }

    function closeChatDetails() {
        $('chatDetailsPanel')?.classList.remove('is-open');
        $('chatDetailsPanel')?.setAttribute('aria-hidden', 'true');
    }

    function openChatDetails(kind) {
        if (!currentChat || (kind === 'contact' && currentChat.type !== 'private')) return;
        closeOverflow();
        const panel = $('chatDetailsPanel');
        const title = $('chatDetailsTitle');
        const content = $('chatDetailsContent');
        if (!panel || !content) return;
        title.textContent = kind === 'contact' ? 'Contact information' : 'Media, links and documents';
        if (kind === 'contact') {
            const name = displayName({ display_name: currentChat.other_display_name, username: currentChat.other_username });
            content.innerHTML = `<div class="chat-contact-profile"><span class="chat-contact-avatar">${avatarMarkup(currentChat.other_profile_picture, (name[0] || 'W').toUpperCase())}</span><strong>${escapeHTML(name)}</strong><span>@${escapeHTML(currentChat.other_username || '')}</span></div><div class="chat-contact-facts"><article><small>About</small><strong>${escapeHTML(currentChat.other_about || 'No about information shared.')}</strong></article><article><small>Presence</small><strong>${escapeHTML(currentChat.other_status || 'offline')}</strong></article><article><small>Account</small><strong>${currentChat.other_phone_verified_at ? 'Phone verified' : 'W.F.C member'}</strong></article></div><button id="chatSaveContactButton" class="settings-action-button chat-detail-primary" type="button">${currentChat.is_saved ? 'Saved contact' : 'Add to contacts'}</button>`;
            hydratePrivateImages(content);
            const save = $('chatSaveContactButton');
            if (save && !currentChat.is_saved) save.addEventListener('click', async () => {
                try { await api('/contacts', { method: 'POST', body: JSON.stringify({ user_id: Number(currentChat.other_user_id) }) }); currentChat.is_saved = 1; save.textContent = 'Saved contact'; showAppNotice(`${name} added to contacts.`); }
                catch (error) { showAppNotice(error.message || 'Could not save contact.'); }
            });
        } else {
            content.innerHTML = `<div class="chat-media-filters" role="group" aria-label="Filter shared items"><button type="button" class="active" data-chat-media-filter="all">All</button><button type="button" data-chat-media-filter="media">Media</button><button type="button" data-chat-media-filter="links">Links</button><button type="button" data-chat-media-filter="documents">Docs</button></div><div id="chatMediaResults" class="chat-media-results"></div>`;
            renderChatMedia('all');
        }
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
    }

    function renderChatMedia(filter) {
        const results = $('chatMediaResults');
        if (!results || !currentChat) return;
        const items = currentMessages.filter(message => {
            const hasMedia = ['image', 'gif', 'video', 'audio'].includes(message.message_type) || Boolean(message.media_url);
            const hasLink = /https?:\/\//i.test(message.body || '');
            const isDoc = ['document', 'file'].includes(message.message_type);
            return filter === 'media' ? hasMedia : filter === 'links' ? hasLink : filter === 'documents' ? isDoc : hasMedia || hasLink || isDoc;
        }).reverse();
        if (!items.length) {
            results.innerHTML = `<div class="chat-details-empty">No ${filter === 'all' ? 'shared media, links or documents' : filter} in this chat yet.</div>`;
            return;
        }
        results.innerHTML = items.map(message => {
            const type = ['image','gif','video','audio'].includes(message.message_type) ? (message.message_type === 'image' ? 'Photo' : message.message_type.toUpperCase()) : ['document','file'].includes(message.message_type) ? 'Document' : 'Link';
            const url = (message.body || '').match(/https?:\/\/[^\s<]+/i)?.[0];
            return `<button type="button" class="chat-media-item" data-jump-to-message="${Number(message.id)}"><span class="chat-media-icon">${type === 'Photo' ? '▧' : type === 'Link' ? '↗' : '▤'}</span><span><strong>${escapeHTML(type)}</strong><small>${escapeHTML((url || message.body || '').slice(0, 100))}</small><small>${escapeHTML(formatTime(message.created_at))}</small></span></button>`;
        }).join('');
    }

    function openChatSearch() {
        closeOverflow();
        closeChatDetails();
        const panel = $('dmSearchPanel');
        panel?.classList.remove('hidden');
        $('dmSearchInput')?.focus();
        applyChatMessageSearch();
    }

    function closeChatSearch() {
        $('dmSearchPanel')?.classList.add('hidden');
        const input = $('dmSearchInput'); if (input) input.value = '';
        $('messageList')?.querySelectorAll('[data-message-id]').forEach(row => row.hidden = false);
        if ($('dmSearchResultCount')) $('dmSearchResultCount').textContent = '';
    }

    function applyChatMessageSearch() {
        const query = $('dmSearchInput')?.value.trim().toLocaleLowerCase() || '';
        const rows = [...($('messageList')?.querySelectorAll('[data-message-id]') || [])];
        let matches = 0;
        rows.forEach(row => { const show = !query || row.textContent.toLocaleLowerCase().includes(query); row.hidden = !show; if (show) matches++; });
        const count = $('dmSearchResultCount');
        if (count) count.textContent = query ? `${matches} of ${rows.length}` : '';
    }

    function jumpToChatMessage(id) {
        closeChatDetails();
        const row = $('messageList')?.querySelector(`[data-message-id="${Number(id)}"]`);
        if (!row) return;
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('chat-message-focus');
        window.setTimeout(() => row.classList.remove('chat-message-focus'), 1600);
    }

    async function handleChatAction(action) {
        if (!currentChat) return;
        const privateOnlyActions = ['contact', 'list', 'mute', 'new-group', 'report', 'block'];
        if (currentChat.type !== 'private' && privateOnlyActions.includes(action)) return;
        const chatId = Number(currentChat.id), peerId = Number(currentChat.other_user_id);
        closeOverflow();
        if (action === 'contact') return openChatDetails('contact');
        if (action === 'search') return openChatSearch();
        if (action === 'media') return openChatDetails('media');
        if (action === 'list') {
            const favorites = favoriteChatIds();
            if (favorites.has(String(chatId))) favorites.delete(String(chatId)); else favorites.add(String(chatId));
            saveFavoriteChatIds(favorites); updateChatListVisibility(); refreshChatActionLabels();
            showAppNotice(favorites.has(String(chatId)) ? 'Chat added to your list.' : 'Chat removed from your list.'); return;
        }
        if (action === 'mute') {
            try { const data = await api(`/chats/${chatId}/mute`, { method: 'PATCH', body: JSON.stringify({ is_muted: !currentChat.is_muted }) }); currentChat.is_muted = data.is_muted; refreshChatActionLabels(); await loadChats(); showAppNotice(data.is_muted ? 'Notifications muted for this chat.' : 'Notifications unmuted for this chat.'); }
            catch (error) { showAppNotice(error.message || 'Could not update notifications.'); }
            return;
        }
        if (action === 'new-group') return openGroupPanel(true);
        if (action === 'theme') {
            let saved = {}; try { saved = JSON.parse(localStorage.getItem('wfc_chat_themes') || '{}'); } catch {}
            const order = ['default','sage','dusk'], next = order[(order.indexOf(saved[chatId] || 'default') + 1) % order.length];
            saved[chatId] = next; try { localStorage.setItem('wfc_chat_themes', JSON.stringify(saved)); } catch {}
            $('messageList')?.setAttribute('data-chat-theme', next); showAppNotice(`Chat theme: ${next === 'default' ? 'Original' : next[0].toUpperCase() + next.slice(1)}.`); return;
        }
        if (action === 'report') {
            if (!window.confirm(`Report ${displayName({display_name: currentChat.other_display_name, username: currentChat.other_username})} for spam or abuse?`)) return;
            try { await api('/blocks/reports', { method: 'POST', body: JSON.stringify({ chat_id: chatId, reason: 'Spam or abuse' }) }); showAppNotice('Report sent for review.'); }
            catch (error) { showAppNotice(error.message || 'Could not send report.'); }
            return;
        }
        if (action === 'block') {
            if (!currentChat.is_blocked && !window.confirm(`Block ${displayName({display_name: currentChat.other_display_name, username: currentChat.other_username})}? Messages in this DM will be paused.`)) return;
            try { const blocked = Boolean(currentChat.is_blocked); if (blocked) await api(`/blocks/${peerId}`, { method: 'DELETE' }); else await api(`/blocks/${peerId}`, { method: 'POST' }); currentChat.is_blocked = blocked ? 0 : 1; refreshChatActionLabels(); showAppNotice(blocked ? 'Contact unblocked.' : 'Contact blocked.'); }
            catch (error) { showAppNotice(error.message || 'Could not update block.'); }
            return;
        }
        if (action === 'clear') {
            if (!window.confirm('Clear this chat from your conversation view? This only clears it for you.')) return;
            try { await api(`/messages/${chatId}/clear`, { method: 'POST' }); currentMessages = []; const list = $('messageList'); if (list) delete list.dataset.messageSignature; closeChatSearch(); closeChatDetails(); await loadMessages(chatId); await loadChats(); showAppNotice('Chat cleared from your view.'); }
            catch (error) { showAppNotice(error.message || 'Could not clear chat.'); }
            return;
        }
        if (action === 'export') {
            try {
                const data = await api(`/messages/${chatId}`), rows = Array.isArray(data.messages) ? data.messages : [];
                const peer = displayName({ display_name: currentChat.other_display_name, username: currentChat.other_username });
                const lines = [`W.F.C chat export — ${peer}`, `Exported ${new Date().toLocaleString()}`, ''];
                rows.forEach(message => { const sender = Number(message.sender_id) === Number(currentUser?.id) ? displayName(currentUser) : peer; const body = message.body || `[${message.message_type || 'media'}]${message.media_url ? ` ${message.media_url}` : ''}`; lines.push(`[${message.created_at || ''}] ${sender}: ${body}`); });
                const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = `wfc-chat-${chatId}.txt`; link.click(); URL.revokeObjectURL(url); showAppNotice('Chat export downloaded.');
            } catch (error) { showAppNotice(error.message || 'Could not export chat.'); }
            return;
        }
        if (action === 'shortcut') {
            const url = `${location.origin}${location.pathname}?chat=${chatId}`;
            try { if (navigator.share) await navigator.share({ title: `Chat with ${displayName({display_name: currentChat.other_display_name, username: currentChat.other_username})}`, url }); else { await copyTextToClipboard(url); showAppNotice('Chat shortcut link copied. Save it as a bookmark to open this DM directly.'); } }
            catch (error) { if (error.name !== 'AbortError') showAppNotice('Could not create a chat shortcut.'); }
        }
    }

    function setGroupStep(step) {
        const details = $('groupDetailsStep');
        const members = $('groupMembersStep');
        const back = $('groupBack');
        details?.classList.toggle('hidden', step !== 'details');
        members?.classList.toggle('hidden', step !== 'members');
        back?.classList.toggle('hidden', step !== 'members');
        $('groupTitle').textContent = step === 'members' ? 'Add people' : 'New group';
        if (step === 'members') $('groupMemberSearch')?.focus();
    }

    function renderSelectedGroupMembers() {
        const container = $('selectedGroupMembers');
        const count = $('groupSelectedCount');
        if (!container) return;
        const selected = [...selectedGroupMembers.values()];
        if (count) count.textContent = selected.length
            ? `${selected.length} selected · up to 1,023 people`
            : 'Select people you know';
        container.innerHTML = selected.map(user => `
            <button class="selected-group-chip" type="button" data-remove-group-user="${Number(user.id)}" aria-label="Remove ${escapeHTML(displayName(user))}">
                <span>${escapeHTML((displayName(user)[0] || 'W').toUpperCase())}</span>${escapeHTML(displayName(user))}<b aria-hidden="true">×</b>
            </button>
        `).join('');
        container.querySelectorAll('[data-remove-group-user]').forEach(button => {
            button.addEventListener('click', () => {
                selectedGroupMembers.delete(Number(button.dataset.removeGroupUser));
                renderSelectedGroupMembers();
                searchGroupMembers($('groupMemberSearch')?.value || '');
            });
        });
        const createButton = $('createGroupButton');
        if (createButton) {
            createButton.disabled = selected.length === 0;
            createButton.textContent = selected.length ? `Create group · ${selected.length + 1}` : 'Select at least one person';
        }
    }

    function openGroupPanel(includeCurrentPeer = false) {
        selectedGroupMembers = new Map();
        if (includeCurrentPeer && currentChat?.type === 'private' && Number(currentChat.other_user_id) > 0) {
            selectedGroupMembers.set(Number(currentChat.other_user_id), { id: Number(currentChat.other_user_id), username: currentChat.other_username, display_name: currentChat.other_display_name, profile_picture: currentChat.other_profile_picture, about: currentChat.other_about, status: currentChat.other_status, is_saved: currentChat.is_saved });
        }
        pendingGroupPicture = null;
        if ($('groupName')) $('groupName').value = '';
        if ($('groupMemberSearch')) $('groupMemberSearch').value = '';
        $('groupPictureInput').value = '';
        $('groupPicturePreview').removeAttribute('src');
        $('groupPicturePreview').hidden = true;
        $('groupPicturePlaceholder').hidden = false;
        $('groupStatus').textContent = '';
        $('groupStatus').className = 'invite-status';
        renderSelectedGroupMembers();
        setGroupStep('details');
        $('groupPanel')?.classList.add('is-open');
        $('groupPanel')?.setAttribute('aria-hidden', 'false');
        closeOverflow();
        $('groupName')?.focus();
    }

    function closeGroupPanel() {
        $('groupPanel')?.classList.remove('is-open');
        $('groupPanel')?.setAttribute('aria-hidden', 'true');
    }

    async function searchGroupMembers(query) {
        const results = $('groupMemberResults');
        const value = String(query || '').trim();
        if (!results) return;
        if (value && value.length < 2) {
            results.innerHTML = '<div class="user-search-empty">Type at least 2 characters to search.</div>';
            return;
        }
        results.innerHTML = '<div class="user-search-empty">Loading your people…</div>';
        try {
            const data = await api(`/chats/group-candidates${value ? `?q=${encodeURIComponent(value)}` : ''}`);
            const found = Array.isArray(data.users) ? data.users : [];
            if (!found.length) {
                results.innerHTML = `<div class="user-search-empty"><strong>${value ? 'No matching people' : 'No people to show yet'}</strong><br>${value ? 'Try another name or username.' : 'Start a chat or save a W.F.C member, then they will appear here.'}</div>`;
                return;
            }
            results.innerHTML = found.map(user => `
                <button class="group-member-row ${selectedGroupMembers.has(Number(user.id)) ? 'selected' : ''}" type="button" data-group-user="${Number(user.id)}" aria-pressed="${selectedGroupMembers.has(Number(user.id)) ? 'true' : 'false'}">
                    <span class="user-result-avatar">${avatarMarkup(user.profile_picture, (displayName(user)[0] || 'W').toUpperCase())}</span>
                    <span class="user-result-copy"><strong>${escapeHTML(displayName(user))}</strong><small>@${escapeHTML(user.username)}${user.is_saved ? ' · Saved contact' : ' · Recent chat'}</small></span>
                    <span class="group-member-check" aria-hidden="true">${selectedGroupMembers.has(Number(user.id)) ? '✓' : '+'}</span>
                </button>
            `).join('');
            hydratePrivateImages(results);
            results.querySelectorAll('[data-group-user]').forEach(button => {
                button.addEventListener('click', () => {
                    const id = Number(button.dataset.groupUser);
                    const user = found.find(item => Number(item.id) === id);
                    if (!user) return;
                    if (selectedGroupMembers.has(id)) selectedGroupMembers.delete(id);
                    else if (selectedGroupMembers.size < 1023) selectedGroupMembers.set(id, user);
                    renderSelectedGroupMembers();
                    searchGroupMembers(value);
                });
            });
        } catch (error) {
            results.innerHTML = `<div class="user-search-empty">${escapeHTML(error.message || 'Could not load people.')}</div>`;
        }
    }

    async function createGroup() {
        const name = $('groupName').value.trim();
        const button = $('createGroupButton');
        const status = $('groupStatus');
        if (name.length < 2) {
            setGroupStep('details');
            status.textContent = 'Add a group name with at least 2 characters.';
            status.className = 'invite-status is-error';
            $('groupName')?.focus();
            return;
        }
        if (!selectedGroupMembers.size) return;
        button.disabled = true;
        button.textContent = 'Creating your group…';
        status.textContent = '';
        try {
            const data = await api('/chats/group', {
                method: 'POST',
                body: JSON.stringify({ name, member_ids: [...selectedGroupMembers.keys()] })
            });
            let pictureError = '';
            if (pendingGroupPicture) {
                try {
                    const form = new FormData();
                    form.append('chat_id', String(data.chat.id));
                    form.append('image', pendingGroupPicture);
                    const headers = {};
                    const authToken = token();
                    if (authToken) headers.Authorization = `Bearer ${authToken}`;
                    const response = await fetch(`${API}/media/group-avatar`, { method: 'POST', headers, body: form });
                    const imageResult = await response.json().catch(() => ({}));
                    if (!response.ok) throw new Error(imageResult?.error?.message || 'The group picture could not be saved.');
                } catch (error) {
                    pictureError = error.message || 'The group picture could not be saved.';
                }
            }
            closeGroupPanel();
            await loadChats();
            await openConversation(Number(data.chat.id));
            if (pictureError) showAppNotice(`Group created. ${pictureError}`);
        } catch (error) {
            status.textContent = error.message || 'The group could not be created.';
            status.className = 'invite-status is-error';
            button.disabled = false;
            renderSelectedGroupMembers();
        }
    }

    async function startCameraCapture() {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
            $('cameraInput')?.click();
            return;
        }
        $('cameraPanel')?.classList.add('is-open');
        $('cameraPanel')?.setAttribute('aria-hidden', 'false');
        $('cameraStatus').textContent = 'Waiting for camera permission…';
        $('cameraFallbackButton')?.classList.add('hidden');
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { facingMode: { ideal: 'environment' } }
            });
            $('cameraVideo').srcObject = cameraStream;
            $('cameraStatus').textContent = 'Camera is on. Frame your photo, then tap the circle.';
        } catch {
            $('cameraStatus').textContent = 'Camera access was not available. You can choose a photo from this device instead.';
            $('cameraFallbackButton')?.classList.remove('hidden');
        }
    }

    function closeCameraCapture() {
        cameraStream?.getTracks().forEach(track => track.stop());
        cameraStream = null;
        if ($('cameraVideo')) $('cameraVideo').srcObject = null;
        $('cameraPanel')?.classList.remove('is-open');
        $('cameraPanel')?.setAttribute('aria-hidden', 'true');
    }

    function captureLivePhoto() {
        const video = $('cameraVideo');
        if (!video?.videoWidth || !video.videoHeight) {
            $('cameraStatus').textContent = 'Wait for the camera preview to appear.';
            return;
        }
        const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            if (!blob) {
                $('cameraStatus').textContent = 'The photo could not be captured. Try again.';
                return;
            }
            const file = new File([blob], `wfc-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            closeCameraCapture();
            showPhotoReview(file);
        }, 'image/jpeg', 0.88);
    }

    function showPhotoReview(file, captionText = '') {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            $('photoStatus').textContent = 'Choose an image file.';
            $('photoStatus').className = 'invite-status is-error';
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            $('photoStatus').textContent = 'Photos must be 8 MB or smaller.';
            $('photoStatus').className = 'invite-status is-error';
            return;
        }
        if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
        pendingPhoto = file;
        pendingPhotoUrl = URL.createObjectURL(file);
        $('photoPreviewImage').src = pendingPhotoUrl;
        const composer = $('messageInput');
        const caption = String(captionText || composer?.value || '').trim();
        $('photoCaption').value = caption;
        if (composer) { composer.value = ''; resizeComposer(); }

        const availableChats = chats.filter(chat => chat.type !== 'ai');
        const fromAI = currentChat?.type === 'ai' && Number(zenxBetaChatId) > 0;
        const rows = availableChats.map(chat => {
            const privateChat = chat.type === 'private';
            const label = privateChat ? displayName({ display_name: chat.other_display_name, username: chat.other_username }) : (chat.name || 'Group');
            const image = privateChat ? chat.other_profile_picture : chat.picture;
            const avatar = avatarMarkup(image, (label.trim()[0] || 'W').toUpperCase());
            const checked = Number(chat.id) === Number(currentChat?.id);
            return `<label class="photo-recipient-row"><span class="photo-recipient-avatar">${avatar}</span><span class="photo-recipient-copy"><strong>${escapeHTML(label)}${privateChat ? verifiedPhoneBadge(chat.other_phone_verified_at) : ''}</strong><small>${privateChat ? 'Private chat' : 'Group chat'}</small></span><input type="checkbox" name="photoRecipient" value="${Number(chat.id)}" ${checked ? 'checked' : ''} aria-label="Send picture to ${escapeHTML(label)}"></label>`;
        });
        if (fromAI) rows.unshift(`<label class="photo-recipient-row"><span class="photo-recipient-avatar zenx-beta-avatar"><img src="/motion/zenx-ai.svg" alt=""></span><span class="photo-recipient-copy"><strong>ZENX AI</strong><small>Ask about this picture</small></span><input type="checkbox" name="photoRecipient" value="ai" ${currentChat?.type === 'ai' ? 'checked' : ''} aria-label="Send picture to ZENX AI"></label>`);
        const recipientList = $('photoRecipientList');
        recipientList.innerHTML = rows.join('') || '<div class="user-search-empty">Start a conversation before sharing a picture.</div>';
        hydratePrivateImages(recipientList);
        if (!recipientList.querySelector('input:checked') && recipientList.querySelector('input')) recipientList.querySelector('input').checked = true;
        const count = recipientList.querySelectorAll('input:checked').length;
        $('photoStatus').textContent = count ? `${count} conversation${count === 1 ? '' : 's'} selected. Your picture and caption will arrive together.` : 'Choose one or more conversations. Select up to 10.';
        $('photoStatus').className = 'invite-status';
        $('confirmPhotoSendButton').disabled = count === 0;
        $('photoPreviewPanel')?.classList.add('is-open');
        $('photoPreviewPanel')?.setAttribute('aria-hidden', 'false');
    }

    function closePhotoReview(restoreCaption = false) {
        const composer = $('messageInput');
        const caption = $('photoCaption')?.value.trim() || '';
        if (restoreCaption && caption && composer && !composer.value.trim()) {
            composer.value = caption;
            resizeComposer();
        }
        $('photoPreviewPanel')?.classList.remove('is-open');
        $('photoPreviewPanel')?.setAttribute('aria-hidden', 'true');
        if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
        pendingPhotoUrl = '';
        pendingPhoto = null;
        if ($('photoPreviewImage')) $('photoPreviewImage').removeAttribute('src');
        if ($('photoCaption')) $('photoCaption').value = '';
        if ($('photoInput')) $('photoInput').value = '';
    }

    async function uploadPhoto() {
        if (!pendingPhoto) return;
        const selected = Array.from(document.querySelectorAll('#photoRecipientList input[name="photoRecipient"]:checked'));
        if (!selected.length || selected.length > 10) {
            $('photoStatus').textContent = selected.length > 10 ? 'Choose up to 10 conversations at a time.' : 'Choose at least one conversation.';
            $('photoStatus').className = 'invite-status is-error'; return;
        }
        const button = $('confirmPhotoSendButton'); button.disabled = true;
        const audioContext = getSendAudioContext(); let sent = 0; let first = null;
        try {
            for (const input of selected) {
                const isAI = input.value === 'ai';
                const chatId = isAI ? Number(zenxBetaChatId) : Number(input.value);
                if (!Number.isInteger(chatId) || chatId < 1) throw new Error('Choose a valid conversation.');
                $('photoStatus').textContent = `Sending picture (${sent + 1} of ${selected.length})…`;
                const form = new FormData(); const caption = $('photoCaption').value.trim();
                if (isAI) form.append('message', caption);
                else { form.append('chat_id', String(chatId)); form.append('caption', caption); }
                form.append('image', pendingPhoto, pendingPhoto.name || 'photo.jpg');
                const response = await fetch(isAI ? `${API}/ai/chat-image` : `${API}/media/upload`, { method:'POST', headers:token()?{Authorization:`Bearer ${token()}`}:{}, body:form });
                const data = await response.json().catch(() => ({}));
                if (!response.ok || !data.success) throw new Error(data?.error?.message || 'A picture could not be sent.');
                sent++; if (!first) first = { isAI, chatId, id:Number(isAI?data?.messages?.[0]?.id:data?.message?.id)||null };
            }
            if (first?.id) nextAnimatedMessageId = first.id;
            playSendChime(audioContext); closePhotoReview(); await loadChats();
            if (first?.isAI) await openZenxBeta(); else if (first) await openConversation(first.chatId);
        } catch (error) {
            $('photoStatus').textContent = sent ? `Sent to ${sent}. The remaining photo sends failed. ${error.message || ''}` : (error.message || 'The photo could not be sent.');
            $('photoStatus').className = 'invite-status is-error';
            selected.slice(0,sent).forEach(input => { input.checked = false; }); button.disabled = false;
        }
    }

    async function updateProfilePhoto(file) {
        if (!file) return;
        const isVideo = ['video/mp4','video/webm'].includes(file.type);
        const validImage = file.type.startsWith('image/');
        if (!validImage && !isVideo) { showAppNotice('Choose an image, GIF, MP4, or WebM file.'); return; }
        if (file.size > 8 * 1024 * 1024) { showAppNotice('Profile media must be 8 MB or smaller.'); return; }
        const formData = new FormData();
        formData.append('image', file, file.name || (isVideo ? 'profile.mp4' : 'profile.jpg'));
        try {
            const response = await fetch(`${API}/media/${isVideo ? 'avatar-video' : 'avatar'}`, {
                method: 'POST', headers: token() ? { Authorization: `Bearer ${token()}` } : {}, body: formData
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success) throw new Error(data?.error?.message || 'Profile media could not be saved.');
            currentUser = { ...currentUser, profile_picture: data.profile_picture };
            localStorage.setItem('wfc_user', JSON.stringify(currentUser));
            $('profilePhotoVisual').innerHTML = avatarMarkup(data.profile_picture, 'W');
            hydratePrivateImages($('profilePhotoVisual'));
            if ($('profileEditForm')) openSettingDetail('profile');
            await loadChats();
            if (currentChat?.id) openConversation(currentChat.id);
        } catch (error) { showAppNotice(error.message || 'Profile media could not be saved.'); }
        finally { $('profilePhotoInput').value = ''; }
    }

    function setupNavigation() {
        $('railChats')?.addEventListener('click', () => openPrimarySection('chats'));
        $('railPeople')?.addEventListener('click', openNewChat);
        $('railInvite')?.addEventListener('click', openInvite);
        $('railSettings')?.addEventListener('click', () => openSettings());
        $('railAI')?.addEventListener('click', openZenxBeta);
        $('railProfile')?.addEventListener('click', () => openSettings('profile'));
        $('emptyFindPeople')?.addEventListener('click', openNewChat);
        $('emptyInvitePeople')?.addEventListener('click', openInvite);
        $('emptyOpenAI')?.addEventListener('click', openZenxBeta);
        renderEmojiChoices();
        renderStickerPacks();
        renderGifLibrary();
        setMediaPickerTab('emoji');
        $('stickerButton')?.addEventListener('click', () => {
            const tray = $('stickerTray');
            if (!tray) return;
            const opening = tray.classList.contains('hidden');
            tray.classList.toggle('hidden', !opening);
            $('stickerButton')?.setAttribute('aria-expanded', opening ? 'true' : 'false');
            if (opening) {
                renderStickerPacks();
                renderGifLibrary($('gifSearch')?.value || '');
                setMediaPickerTab('emoji');
            }
        });
        $('stickerTrayClose')?.addEventListener('click', () => {
            closeMediaPicker();
        });
        $('emojiSearch')?.addEventListener('input', event => renderEmojiChoices(event.target.value));
        $('gifSearch')?.addEventListener('input', event => { commonsGifLibrary=[]; renderGifLibrary(event.target.value); });
        $('gifCommonsSearch')?.addEventListener('click', () => { void searchCommonsGifs(); });
        $('gifSearch')?.addEventListener('keydown', event => { if(event.key==='Enter'){event.preventDefault();void searchCommonsGifs();} });
        $('emojiGrid')?.addEventListener('click', event => {
            const button = event.target.closest('[data-insert-emoji]');
            if (button) insertEmoji(button.dataset.insertEmoji);
        });
        $('stickerTray')?.addEventListener('click', async event => {
            const tab = event.target.closest('[data-picker-tab]');
            if (tab) { setMediaPickerTab(tab.dataset.pickerTab); return; }
            const sticker = event.target.closest('[data-sticker-id]');
            if (sticker) { await sendSticker(sticker.dataset.stickerId); return; }
            const pack = event.target.closest('[data-pack-install]');
            if (pack) {
                const ids = new Set(installedStickerPackIds());
                if (ids.has(pack.dataset.packInstall)) ids.delete(pack.dataset.packInstall);
                else ids.add(pack.dataset.packInstall);
                try {
                    localStorage.setItem('wfc_sticker_packs', JSON.stringify([...ids]));
                    renderStickerPacks();
                } catch { showAppNotice('Sticker packs could not be saved on this device.'); }
                return;
            }
            const gif = event.target.closest('[data-send-gif]');
            if (gif) {
                gif.disabled = true;
                try { await sendLibraryGif(gif.dataset.sendGif); }
                finally { if (gif.isConnected) gif.disabled = false; }
            }
        });
        $('voiceRecordButton')?.addEventListener('click', () => {
            if (voiceRecorder?.state === 'recording') stopVoiceRecording(false);
            else void startVoiceRecording();
        });
        $('stopVoiceNote')?.addEventListener('click', () => stopVoiceRecording(false));
        $('cancelVoiceRecording')?.addEventListener('click', () => stopVoiceRecording(true));
        $('discardVoiceNote')?.addEventListener('click', discardVoiceNote);
        $('sendVoiceNote')?.addEventListener('click', () => void uploadVoiceNote());
        $('messageList')?.addEventListener('click', event => {
            const play = event.target.closest('[data-voice-play]');
            if (play) void playVoiceMessage(play);
        });
        $('gifUploadInput')?.addEventListener('change', event => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (file) void sendGif(file).finally(() => { input.value = ''; });
        });
        $('floatingNewChat')?.addEventListener('click', openSavedContacts);
        $('syncPhoneContacts')?.addEventListener('click', chooseAndMatchPhoneContacts);
        $('phoneContactFile')?.addEventListener('change', event => importPhoneContactFile(event.target.files?.[0]));
        $('phoneContactMatches')?.addEventListener('click', event => {
            const messageButton = event.target.closest('[data-phone-match-message]');
            if (messageButton) { startPrivateChat(Number(messageButton.dataset.phoneMatchMessage)); return; }
            const inviteButton = event.target.closest('[data-phone-match-invite]');
            if (inviteButton) {
                const contact = matchedPhoneContacts[Number(inviteButton.dataset.phoneMatchInvite)]?.selected;
                if (!contact?.phone) return;
                selectedInviteContacts = [contact];
                inviteContactMatch=null;
                renderSelectedInviteContacts();
                openInvite();
                void checkInviteContact();
            }
        });
        $('savedContactsBack')?.addEventListener('click', closeNewChat);
        $('discoverWfcMembers')?.addEventListener('click', openNewChat);
        $('newChatBack')?.addEventListener('click', closeNewChat);
        $('conversationBack')?.addEventListener('click', () => {
            currentChat = null;
            setActiveTab('chats');
            showScreen('home');
            loadChats();
        });
        $('messageForm')?.addEventListener('submit', sendMessage);
        syncSendSoundToggle();
        $('sendSoundToggle')?.addEventListener('click', () => setSendSoundPreference(!sendSoundEnabled, true));
        $('messageInput')?.addEventListener('input', resizeComposer);
        $('messageInput')?.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
                event.preventDefault();
                $('messageForm')?.requestSubmit();
            }
        });
        $('messageInput')?.addEventListener('paste', event => {
            const item = Array.from(event.clipboardData?.items || []).find(candidate => candidate.type?.startsWith('image/'));
            const file = item?.getAsFile();
            if (!file) return;
            event.preventDefault();
            const pastedText = event.clipboardData?.getData('text/plain') || '';
            const draftText = $('messageInput')?.value.trim() || '';
            const caption = [draftText, pastedText.trim()].filter(Boolean).join('\n\n');
            showPhotoReview(file, caption);
        });
        $('messageList')?.addEventListener('click', async event => {
            const button = event.target.closest('[data-copy-code]');
            if (!button) return;
            const code = button.closest('.message-code-block')?.querySelector('pre code')?.textContent || '';
            try {
                await copyTextToClipboard(code);
                button.textContent = 'Copied';
                button.setAttribute('aria-label', 'Code copied');
                window.setTimeout(() => {
                    if (button.isConnected) { button.textContent = 'Copy'; button.setAttribute('aria-label', 'Copy code'); }
                }, 1600);
            } catch (error) {
                showAppNotice(error.message || 'Select the code and copy it.');
            }
        });
        $('inviteForm')?.addEventListener('submit', sendInvitations);
        $('selectedInviteContacts')?.addEventListener('click', event => {
            const button = event.target.closest('[data-remove-invite-contact]');
            if (!button) return;
            selectedInviteContacts.splice(Number(button.dataset.removeInviteContact), 1);
            inviteContactMatch=null;
            renderSelectedInviteContacts();
            $('inviteStatus').textContent='';
            $('sendInviteButton').textContent='Continue to Messages';
        });
        $('pickContactsButton')?.addEventListener('click', choosePhoneContacts);
        $('addManualInviteContact')?.addEventListener('click', addManualInviteContact);
        $('manualInvitePhone')?.addEventListener('keydown', event => { if(event.key==='Enter'){event.preventDefault();addManualInviteContact();} });
        $('inviteContactFile')?.addEventListener('change', event => importInviteVcard(event.target.files?.[0]));
        $('inviteVcardChoices')?.addEventListener('click', event => { const button=event.target.closest('[data-select-invite-vcard]'); if(button) selectInviteContact(inviteVcardContacts[Number(button.dataset.selectInviteVcard)]); });
        $('openNativeMessages')?.addEventListener('click', openNativeInviteMessages);
        $('closeInvite')?.addEventListener('click', closeInvite);
        $('copyInviteLink')?.addEventListener('click', copyInviteLink);
        document.querySelectorAll('[data-close-invite]').forEach(el => el.addEventListener('click', closeInvite));
        $('closeSettings')?.addEventListener('click', closeSettings);
        $('signOutButton')?.addEventListener('click', () => window.WFC?.logout?.());
        document.querySelectorAll('[data-close-settings]').forEach(el => el.addEventListener('click', closeSettings));
        $('profilePhotoButton')?.addEventListener('click', () => $('profilePhotoInput')?.click());
        $('profilePhotoInput')?.addEventListener('change', event => updateProfilePhoto(event.target.files?.[0]));
        $('galleryButton')?.addEventListener('click', () => $('photoInput')?.click());
        $('composerCameraButton')?.addEventListener('click', startCameraCapture);
        $('cameraButton')?.addEventListener('click', startCameraCapture);
        $('photoInput')?.addEventListener('change', event => { showPhotoReview(event.target.files?.[0]); event.currentTarget.value = ''; });
        $('cameraInput')?.addEventListener('change', event => { showPhotoReview(event.target.files?.[0]); event.currentTarget.value = ''; });
        $('closeCamera')?.addEventListener('click', closeCameraCapture);
        $('takePhotoButton')?.addEventListener('click', captureLivePhoto);
        $('cameraFallbackButton')?.addEventListener('click', () => $('photoInput')?.click());
        document.querySelectorAll('[data-close-camera]').forEach(el => el.addEventListener('click', closeCameraCapture));
        $('closePhotoPreview')?.addEventListener('click', () => closePhotoReview(true));
        $('cancelPhotoSend')?.addEventListener('click', () => closePhotoReview(true));
        $('confirmPhotoSendButton')?.addEventListener('click', uploadPhoto);
        $('photoRecipientList')?.addEventListener('change', event => {
            const selected = $('photoRecipientList').querySelectorAll('input:checked');
            if (selected.length > 10) { event.target.checked = false; showAppNotice('Choose up to 10 conversations at a time.'); }
            const count = $('photoRecipientList').querySelectorAll('input:checked').length;
            $('confirmPhotoSendButton').disabled = count === 0;
            $('photoStatus').textContent = count ? `${count} conversation${count === 1 ? '' : 's'} selected. Your picture and caption will arrive together.` : 'Choose one or more conversations.';
        });
        document.querySelectorAll('[data-close-photo]').forEach(el => el.addEventListener('click', () => closePhotoReview(true)));
        $('closeGroup')?.addEventListener('click', closeGroupPanel);
        $('groupBack')?.addEventListener('click', () => setGroupStep('details'));
        $('groupAddPeople')?.addEventListener('click', () => {
            const name = $('groupName').value.trim();
            if (name.length < 2) { $('groupStatus').textContent = 'Add a group name with at least 2 characters.'; $('groupStatus').className = 'invite-status is-error'; $('groupName').focus(); return; }
            $('groupStatus').textContent = '';
            setGroupStep('members');
            searchGroupMembers('');
        });
        $('createGroupButton')?.addEventListener('click', createGroup);
        $('groupPictureButton')?.addEventListener('click', () => $('groupPictureInput')?.click());
        $('groupPictureInput')?.addEventListener('change', event => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 8 * 1024 * 1024) {
                $('groupStatus').textContent = 'Choose a JPEG, PNG, WebP, or GIF under 8 MB.';
                $('groupStatus').className = 'invite-status is-error';
                event.target.value = '';
                return;
            }
            pendingGroupPicture = file;
            const preview = $('groupPicturePreview');
            if (pendingGroupPictureUrl) URL.revokeObjectURL(pendingGroupPictureUrl);
            pendingGroupPictureUrl = URL.createObjectURL(file);
            preview.src = pendingGroupPictureUrl;
            preview.hidden = false;
            $('groupPicturePlaceholder').hidden = true;
            $('groupStatus').textContent = 'Picture ready.';
            $('groupStatus').className = 'invite-status is-success';
        });
        document.querySelectorAll('[data-close-group]').forEach(el => el.addEventListener('click', closeGroupPanel));
        $('groupMemberSearch')?.addEventListener('input', event => searchGroupMembers(event.target.value));

        $('conversationMenuButton')?.addEventListener('click', event => {
            const menu = $('chatActionMenu');
            if (menu && !menu.classList.contains('hidden')) closeOverflow();
            else openChatActionMenu(event.currentTarget);
        });
        $('chatActionMenu')?.addEventListener('click', event => {
            const more = event.target.closest('#chatActionMore');
            if (more) { const sub = $('chatMoreMenuItems'); const open = sub?.classList.toggle('hidden') === false; more.setAttribute('aria-expanded', String(open)); return; }
            const item = event.target.closest('[data-chat-action]');
            if (item) void handleChatAction(item.dataset.chatAction);
        });
        $('chatDetailsContent')?.addEventListener('click', event => {
            const filter = event.target.closest('[data-chat-media-filter]');
            if (filter) { $('chatDetailsContent').querySelectorAll('[data-chat-media-filter]').forEach(button => button.classList.toggle('active', button === filter)); renderChatMedia(filter.dataset.chatMediaFilter); return; }
            const jump = event.target.closest('[data-jump-to-message]'); if (jump) jumpToChatMessage(jump.dataset.jumpToMessage);
        });
        $('closeChatDetails')?.addEventListener('click', closeChatDetails);
        document.querySelectorAll('[data-close-chat-details]').forEach(el => el.addEventListener('click', closeChatDetails));
        $('dmSearchInput')?.addEventListener('input', applyChatMessageSearch);
        $('dmSearchClose')?.addEventListener('click', closeChatSearch);

        document.querySelectorAll('.overflow-trigger').forEach(button => {
            button.addEventListener('click', () => {
                const menu = $('overflowMenu');
                if (menu && !menu.classList.contains('hidden')) closeOverflow();
                else openOverflow(button);
            });
        });
        $('menuNewGroup')?.addEventListener('click', () => openGroupPanel(false));
        $('menuLinkDevice')?.addEventListener('click', () => { closeOverflow(); openSettings('device'); });
        $('menuSettings')?.addEventListener('click', () => { closeOverflow(); openSettings(); });
        $('overflowMenu')?.addEventListener('click', event => event.stopPropagation());
        document.addEventListener('click', event => {
            if (!event.target.closest('.overflow-trigger') && !event.target.closest('#conversationMenuButton') && !event.target.closest('#overflowMenu') && !event.target.closest('#chatActionMenu')) closeOverflow();
            const picker = $('stickerTray');
            if (picker && !picker.classList.contains('hidden') && !picker.contains(event.target) && !event.target.closest('#stickerButton')) closeMediaPicker();
        });

        $('editProfileButton')?.addEventListener('click', () => openSettingDetail('profile'));
        $('settingsHome')?.addEventListener('click', event => {
            const button = event.target.closest('[data-setting]');
            if (button) openSettingDetail(button.dataset.setting);
        });
        $('settingsDetail')?.addEventListener('click', event => {
            if (event.target.closest('#settingsDetailBack')) {
                $('settingsDetail').classList.add('hidden');
                $('settingsHome').classList.remove('hidden');
                return;
            }
            const presetButton = event.target.closest('[data-theme-preset]');
            if (presetButton) { const preset = WFC_THEME_PRESETS[presetButton.dataset.themePreset]; if (preset) { const name = $('themeNameInput')?.value.trim() || preset.name; saveVisualTheme({ ...preset, name }); openSettingDetail('appearance'); } return; }
            if (event.target.closest('[data-theme-share]')) {
                const t = getCurrentVisualTheme(); t.name = $('themeNameInput')?.value.trim() || t.name;
                saveVisualTheme(t);
                const link = window.location.origin + window.location.pathname + window.location.search + '#wfc-theme=' + encodeURIComponent(JSON.stringify(t));
                copyTextToClipboard(link).then(() => { const status = $('themeShareStatus'); if (status) status.textContent = 'Share link copied. Anyone opening it can apply this W.F.C theme.'; }).catch(() => { const status = $('themeShareStatus'); if (status) status.textContent = link; });
                return;
            }
            if (event.target.closest('[data-theme-toggle]')) return toggleTheme();
            if (event.target.closest('[data-open-language]')) {
                closeSettings();
                openLanguagePanel();
                return;
            }
            if (event.target.closest('[data-open-invites]')) {
                closeSettings();
                openInvite();
                return;
            }
            if (event.target.closest('[data-open-people]')) {
                closeSettings();
                openNewChat();
            }
        });

        $('settingsDetail')?.addEventListener('input', event => {
            if (event.target.id === 'themeAccentPicker') {
                const theme = getCurrentVisualTheme(); theme.accent = event.target.value; theme.name = $('themeNameInput')?.value.trim() || 'Custom';
                saveVisualTheme(theme); const label = event.target.parentElement?.querySelector('span'); if (label) label.textContent = event.target.value.toUpperCase();
            }
        });
        $('settingsDetail')?.addEventListener('change', event => {
            if (!['themeNameInput', 'themeWallpaperPicker'].includes(event.target.id)) return;
            const theme = getCurrentVisualTheme();
            theme.name = $('themeNameInput')?.value.trim() || theme.name;
            if (event.target.id === 'themeWallpaperPicker') theme.wallpaper = event.target.value;
            saveVisualTheme(theme);
            const status = $('themeShareStatus'); if (status) status.textContent = 'Theme saved on this device. Copy a share link when ready.';
        });

        $('userSearch')?.addEventListener('input', event => searchUsers(event.target.value));
        $('chatSearch')?.addEventListener('input', updateChatListVisibility);
        const androidSearchButton = $('androidSearchButton');
        androidSearchButton?.addEventListener('click', () => {
            const panel = $('chatSearch')?.closest('.chat-search');
            if (!panel) return;
            const open = panel.classList.toggle('android-search-open');
            androidSearchButton.setAttribute('aria-expanded', String(open));
            if (open) $('chatSearch')?.focus();
            else {
                const input = $('chatSearch');
                if (input?.value) {
                    input.value = '';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });
        $('androidCameraButton')?.addEventListener('click', () => {
            document.querySelector('[data-app-nav="updates"]')?.click();
        });
        document.querySelectorAll("[data-chat-filter]").forEach(button => button.addEventListener("click", () => {
            document.querySelectorAll("[data-chat-filter]").forEach(option => {
                const active = option === button;
                option.classList.toggle("active", active);
                option.setAttribute("aria-pressed", String(active));
            });
            updateChatListVisibility();
        }));
        document.querySelectorAll('[data-app-nav]').forEach(button => button.addEventListener('click', () => openPrimarySection(button.dataset.appNav)));
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeInvite(); closeSettings(); closePhotoReview(); closeCameraCapture(); closeGroupPanel(); closeLanguagePanel(); closeOverflow(); closeMediaPicker();
            }
        });
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
        showScreen('home');
        applyTheme();
        setupNavigation();
        setupLanguage();
        setupLanguageListener();

        window.WFC_I18N?.apply?.();

        await loadCurrentUser();
        await loadChats();
        const directChat = Number(new URLSearchParams(location.search).get('chat'));
        if (Number.isInteger(directChat) && directChat > 0) await openConversation(directChat);
        window.setInterval(async () => {
            if (document.visibilityState !== 'visible' || !token()) return;
            await loadChats();
            if (currentChat?.id) {
                await loadMessages(currentChat.id);
                await markMessagesRead(currentChat.id);
                await loadChats();
            }
        }, 5000);
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
