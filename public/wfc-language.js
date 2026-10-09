(() => {
    "use strict";

    const STORAGE_KEY = "wfc_language";

    const languages = [
        ["en", "English"],
        ["fr", "Français"],
        ["es", "Español"],
        ["pt", "Português"],
        ["de", "Deutsch"],
        ["it", "Italiano"],
        ["nl", "Nederlands"],
        ["tr", "Türkçe"],
        ["ar", "العربية"],
        ["hi", "हिन्दी"],
        ["bn", "বাংলা"],
        ["zh", "中文"],
        ["ja", "日本語"],
        ["ko", "한국어"]
    ];

    const translations = {
        en: {
            name: "English",
            welcome: "Welcome to",
            connect: "Connect with people around the world.",
            language: "LANGUAGE",
            selectLanguage: "Select language",
            terms: "By continuing, you agree to",
            termsLink: "Terms & Conditions",
            privacy: "Privacy Policy",
            getStarted: "Get started",
            back: "Back",

            phoneTitle: "Enter your phone number",
            phoneDescription: "Select your country and enter your phone number.",
            phonePlaceholder: "Phone number",
            continue: "Continue",
            sendingCode: "Sending verification code...",
            enterPhone: "Please enter your phone number.",
            selectCountry: "Select country",
            searchCountry: "Search country",
            noCountries: "No countries found.",
            security: "Your phone number is used to create and protect your W.F.C'sChat account.",

            loading: "Loading...",
            cancel: "Cancel",
            save: "Save",
            close: "Close",
            search: "Search",
            retry: "Retry",
            error: "Something went wrong.",
            offline: "Offline",
            online: "Online",

            chats: "Chats",
            updates: "Updates",
            calls: "Calls",
            contacts: "Contacts",
            newChat: "New chat",
            searchChats: "Search chats",
            settings: "Settings",
            profile: "Profile",
            newGroup: "New group",
            message: "Message",
            typeMessage: "Type a message",
            send: "Send",
            attach: "Attach",
            camera: "Camera",
            microphone: "Microphone",
            lastSeen: "last seen",
            noChats: "No chats yet",
            startChat: "Start a chat",
            selectChat: "Select a chat to start messaging"
        },

        fr: {
            name: "Français",
            welcome: "Bienvenue sur",
            connect: "Connectez-vous avec des personnes du monde entier.",
            language: "LANGUE",
            selectLanguage: "Choisir la langue",
            terms: "En continuant, vous acceptez les",
            termsLink: "Conditions générales",
            privacy: "Politique de confidentialité",
            getStarted: "Commencer",
            back: "Retour",

            phoneTitle: "Entrez votre numéro de téléphone",
            phoneDescription: "Sélectionnez votre pays et entrez votre numéro de téléphone.",
            phonePlaceholder: "Numéro de téléphone",
            continue: "Continuer",
            sendingCode: "Envoi du code de vérification...",
            enterPhone: "Veuillez entrer votre numéro de téléphone.",
            selectCountry: "Sélectionner un pays",
            searchCountry: "Rechercher un pays",
            noCountries: "Aucun pays trouvé.",
            security: "Votre numéro de téléphone est utilisé pour créer et protéger votre compte W.F.C'sChat.",

            loading: "Chargement...",
            cancel: "Annuler",
            save: "Enregistrer",
            close: "Fermer",
            search: "Rechercher",
            retry: "Réessayer",
            error: "Une erreur s'est produite.",
            offline: "Hors ligne",
            online: "En ligne",

            chats: "Discussions",
            updates: "Actualités",
            calls: "Appels",
            contacts: "Contacts",
            newChat: "Nouvelle discussion",
            searchChats: "Rechercher des discussions",
            settings: "Paramètres",
            profile: "Profil",
            newGroup: "Nouveau groupe",
            message: "Message",
            typeMessage: "Écrire un message",
            send: "Envoyer",
            attach: "Joindre",
            camera: "Appareil photo",
            microphone: "Microphone",
            lastSeen: "vu(e) pour la dernière fois",
            noChats: "Aucune discussion",
            startChat: "Commencer une discussion",
            selectChat: "Sélectionnez une discussion pour commencer à envoyer des messages"
        },

        es: {
            name: "Español",
            welcome: "Bienvenido a",
            connect: "Conecta con personas de todo el mundo.",
            language: "IDIOMA",
            selectLanguage: "Seleccionar idioma",
            terms: "Al continuar, aceptas los",
            termsLink: "Términos y condiciones",
            privacy: "Política de privacidad",
            getStarted: "Comenzar",
            back: "Atrás",

            phoneTitle: "Introduce tu número de teléfono",
            phoneDescription: "Selecciona tu país e introduce tu número de teléfono.",
            phonePlaceholder: "Número de teléfono",
            continue: "Continuar",
            sendingCode: "Enviando código de verificación...",
            enterPhone: "Introduce tu número de teléfono.",
            selectCountry: "Seleccionar país",
            searchCountry: "Buscar país",
            noCountries: "No se encontraron países.",
            security: "Tu número de teléfono se utiliza para crear y proteger tu cuenta de W.F.C'sChat.",

            loading: "Cargando...",
            cancel: "Cancelar",
            save: "Guardar",
            close: "Cerrar",
            search: "Buscar",
            retry: "Reintentar",
            error: "Algo salió mal.",
            offline: "Sin conexión",
            online: "En línea",

            chats: "Chats",
            updates: "Novedades",
            calls: "Llamadas",
            contacts: "Contactos",
            newChat: "Nuevo chat",
            searchChats: "Buscar chats",
            settings: "Configuración",
            profile: "Perfil",
            newGroup: "Nuevo grupo",
            message: "Mensaje",
            typeMessage: "Escribe un mensaje",
            send: "Enviar",
            attach: "Adjuntar",
            camera: "Cámara",
            microphone: "Micrófono",
            lastSeen: "última vez visto",
            noChats: "No hay chats todavía",
            startChat: "Iniciar un chat",
            selectChat: "Selecciona un chat para comenzar a enviar mensajes"
        },

        pt: {
            name: "Português",
            welcome: "Bem-vindo ao",
            connect: "Conecte-se com pessoas de todo o mundo.",
            language: "IDIOMA",
            selectLanguage: "Selecionar idioma",
            terms: "Ao continuar, você concorda com os",
            termsLink: "Termos e condições",
            privacy: "Política de privacidade",
            getStarted: "Começar",
            back: "Voltar",

            phoneTitle: "Digite seu número de telefone",
            phoneDescription: "Selecione seu país e digite seu número de telefone.",
            phonePlaceholder: "Número de telefone",
            continue: "Continuar",
            sendingCode: "Enviando código de verificação...",
            enterPhone: "Digite seu número de telefone.",
            selectCountry: "Selecionar país",
            searchCountry: "Pesquisar país",
            noCountries: "Nenhum país encontrado.",
            security: "Seu número de telefone é usado para criar e proteger sua conta W.F.C'sChat.",

            loading: "Carregando...",
            cancel: "Cancelar",
            save: "Salvar",
            close: "Fechar",
            search: "Pesquisar",
            retry: "Tentar novamente",
            error: "Algo deu errado.",
            offline: "Offline",
            online: "Online",

            chats: "Conversas",
            updates: "Atualizações",
            calls: "Chamadas",
            contacts: "Contatos",
            newChat: "Nova conversa",
            searchChats: "Pesquisar conversas",
            settings: "Configurações",
            profile: "Perfil",
            newGroup: "Novo grupo",
            message: "Mensagem",
            typeMessage: "Digite uma mensagem",
            send: "Enviar",
            attach: "Anexar",
            camera: "Câmera",
            microphone: "Microfone",
            lastSeen: "visto por último",
            noChats: "Nenhuma conversa ainda",
            startChat: "Iniciar conversa",
            selectChat: "Selecione uma conversa para começar a enviar mensagens"
        },

        de: {
            name: "Deutsch",
            welcome: "Willkommen bei",
            connect: "Verbinde dich mit Menschen auf der ganzen Welt.",
            language: "SPRACHE",
            selectLanguage: "Sprache auswählen",
            terms: "Mit der Fortsetzung stimmst du den",
            termsLink: "Nutzungsbedingungen",
            privacy: "Datenschutzrichtlinien",
            getStarted: "Loslegen",
            back: "Zurück",

            phoneTitle: "Telefonnummer eingeben",
            phoneDescription: "Wähle dein Land und gib deine Telefonnummer ein.",
            phonePlaceholder: "Telefonnummer",
            continue: "Weiter",
            sendingCode: "Bestätigungscode wird gesendet...",
            enterPhone: "Bitte gib deine Telefonnummer ein.",
            selectCountry: "Land auswählen",
            searchCountry: "Land suchen",
            noCountries: "Keine Länder gefunden.",
            security: "Deine Telefonnummer wird zum Erstellen und Schützen deines W.F.C'sChat-Kontos verwendet.",

            loading: "Wird geladen...",
            cancel: "Abbrechen",
            save: "Speichern",
            close: "Schließen",
            search: "Suchen",
            retry: "Erneut versuchen",
            error: "Etwas ist schiefgelaufen.",
            offline: "Offline",
            online: "Online",

            chats: "Chats",
            updates: "Neuigkeiten",
            calls: "Anrufe",
            contacts: "Kontakte",
            newChat: "Neuer Chat",
            searchChats: "Chats durchsuchen",
            settings: "Einstellungen",
            profile: "Profil",
            newGroup: "Neue Gruppe",
            message: "Nachricht",
            typeMessage: "Nachricht eingeben",
            send: "Senden",
            attach: "Anhängen",
            camera: "Kamera",
            microphone: "Mikrofon",
            lastSeen: "zuletzt online",
            noChats: "Noch keine Chats",
            startChat: "Chat starten",
            selectChat: "Wähle einen Chat aus, um Nachrichten zu senden"
        },

        it: {
            name: "Italiano",
            welcome: "Benvenuto su",
            connect: "Connettiti con persone da tutto il mondo.",
            language: "LINGUA",
            selectLanguage: "Seleziona lingua",
            terms: "Continuando, accetti i",
            termsLink: "Termini e condizioni",
            privacy: "Informativa sulla privacy",
            getStarted: "Inizia",
            back: "Indietro",

            phoneTitle: "Inserisci il tuo numero di telefono",
            phoneDescription: "Seleziona il tuo paese e inserisci il tuo numero di telefono.",
            phonePlaceholder: "Numero di telefono",
            continue: "Continua",
            sendingCode: "Invio del codice di verifica...",
            enterPhone: "Inserisci il tuo numero di telefono.",
            selectCountry: "Seleziona paese",
            searchCountry: "Cerca paese",
            noCountries: "Nessun paese trovato.",
            security: "Il tuo numero di telefono viene utilizzato per creare e proteggere il tuo account W.F.C'sChat.",

            loading: "Caricamento...",
            cancel: "Annulla",
            save: "Salva",
            close: "Chiudi",
            search: "Cerca",
            retry: "Riprova",
            error: "Qualcosa è andato storto.",
            offline: "Offline",
            online: "Online",

            chats: "Chat",
            updates: "Aggiornamenti",
            calls: "Chiamate",
            contacts: "Contatti",
            newChat: "Nuova chat",
            searchChats: "Cerca chat",
            settings: "Impostazioni",
            profile: "Profilo",
            newGroup: "Nuovo gruppo",
            message: "Messaggio",
            typeMessage: "Scrivi un messaggio",
            send: "Invia",
            attach: "Allega",
            camera: "Fotocamera",
            microphone: "Microfono",
            lastSeen: "ultimo accesso",
            noChats: "Nessuna chat",
            startChat: "Inizia una chat",
            selectChat: "Seleziona una chat per iniziare a inviare messaggi"
        },

        nl: {
            name: "Nederlands",
            welcome: "Welkom bij",
            connect: "Maak verbinding met mensen over de hele wereld.",
            language: "TAAL",
            selectLanguage: "Taal selecteren",
            terms: "Door door te gaan, ga je akkoord met de",
            termsLink: "Algemene voorwaarden",
            privacy: "Privacybeleid",
            getStarted: "Aan de slag",
            back: "Terug",

            phoneTitle: "Voer je telefoonnummer in",
            phoneDescription: "Selecteer je land en voer je telefoonnummer in.",
            phonePlaceholder: "Telefoonnummer",
            continue: "Doorgaan",
            sendingCode: "Verificatiecode wordt verzonden...",
            enterPhone: "Voer je telefoonnummer in.",
            selectCountry: "Land selecteren",
            searchCountry: "Land zoeken",
            noCountries: "Geen landen gevonden.",
            security: "Je telefoonnummer wordt gebruikt om je W.F.C'sChat-account aan te maken en te beschermen.",

            loading: "Laden...",
            cancel: "Annuleren",
            save: "Opslaan",
            close: "Sluiten",
            search: "Zoeken",
            retry: "Opnieuw proberen",
            error: "Er is iets misgegaan.",
            offline: "Offline",
            online: "Online",

            chats: "Chats",
            updates: "Updates",
            calls: "Oproepen",
            contacts: "Contacten",
            newChat: "Nieuwe chat",
            searchChats: "Chats zoeken",
            settings: "Instellingen",
            profile: "Profiel",
            newGroup: "Nieuwe groep",
            message: "Bericht",
            typeMessage: "Typ een bericht",
            send: "Versturen",
            attach: "Bijvoegen",
            camera: "Camera",
            microphone: "Microfoon",
            lastSeen: "laatst gezien",
            noChats: "Nog geen chats",
            startChat: "Een chat starten",
            selectChat: "Selecteer een chat om berichten te versturen"
        },

        tr: {
            name: "Türkçe",
            welcome: "W.F.C'sChat'e hoş geldiniz",
            connect: "Dünyanın dört bir yanından insanlarla bağlantı kurun.",
            language: "DİL",
            selectLanguage: "Dil seç",
            terms: "Devam ederek şunları kabul etmiş olursunuz:",
            termsLink: "Şartlar ve Koşullar",
            privacy: "Gizlilik Politikası",
            getStarted: "Başla",
            back: "Geri",

            phoneTitle: "Telefon numaranızı girin",
            phoneDescription: "Ülkenizi seçin ve telefon numaranızı girin.",
            phonePlaceholder: "Telefon numarası",
            continue: "Devam",
            sendingCode: "Doğrulama kodu gönderiliyor...",
            enterPhone: "Lütfen telefon numaranızı girin.",
            selectCountry: "Ülke seç",
            searchCountry: "Ülke ara",
            noCountries: "Ülke bulunamadı.",
            security: "Telefon numaranız W.F.C'sChat hesabınızı oluşturmak ve korumak için kullanılır.",

            loading: "Yükleniyor...",
            cancel: "İptal",
            save: "Kaydet",
            close: "Kapat",
            search: "Ara",
            retry: "Tekrar dene",
            error: "Bir şeyler yanlış gitti.",
            offline: "Çevrimdışı",
            online: "Çevrimiçi",

            chats: "Sohbetler",
            updates: "Güncellemeler",
            calls: "Aramalar",
            contacts: "Kişiler",
            newChat: "Yeni sohbet",
            searchChats: "Sohbetlerde ara",
            settings: "Ayarlar",
            profile: "Profil",
            newGroup: "Yeni grup",
            message: "Mesaj",
            typeMessage: "Mesaj yazın",
            send: "Gönder",
            attach: "Ekle",
            camera: "Kamera",
            microphone: "Mikrofon",
            lastSeen: "son görülme",
            noChats: "Henüz sohbet yok",
            startChat: "Sohbet başlat",
            selectChat: "Mesajlaşmaya başlamak için bir sohbet seçin"
        },

        ar: {
            name: "العربية",
            welcome: "مرحبًا بك في",
            connect: "تواصل مع أشخاص من جميع أنحاء العالم.",
            language: "اللغة",
            selectLanguage: "اختيار اللغة",
            terms: "بمتابعة الاستخدام، فإنك توافق على",
            termsLink: "الشروط والأحكام",
            privacy: "سياسة الخصوصية",
            getStarted: "ابدأ",
            back: "رجوع",

            phoneTitle: "أدخل رقم هاتفك",
            phoneDescription: "اختر بلدك وأدخل رقم هاتفك.",
            phonePlaceholder: "رقم الهاتف",
            continue: "متابعة",
            sendingCode: "جارٍ إرسال رمز التحقق...",
            enterPhone: "يرجى إدخال رقم هاتفك.",
            selectCountry: "اختيار الدولة",
            searchCountry: "البحث عن دولة",
            noCountries: "لم يتم العثور على دول.",
            security: "يُستخدم رقم هاتفك لإنشاء حساب W.F.C'sChat وحمايته.",

            loading: "جارٍ التحميل...",
            cancel: "إلغاء",
            save: "حفظ",
            close: "إغلاق",
            search: "بحث",
            retry: "إعادة المحاولة",
            error: "حدث خطأ ما.",
            offline: "غير متصل",
            online: "متصل",

            chats: "الدردشات",
            updates: "التحديثات",
            calls: "المكالمات",
            contacts: "جهات الاتصال",
            newChat: "دردشة جديدة",
            searchChats: "البحث في الدردشات",
            settings: "الإعدادات",
            profile: "الملف الشخصي",
            newGroup: "مجموعة جديدة",
            message: "رسالة",
            typeMessage: "اكتب رسالة",
            send: "إرسال",
            attach: "إرفاق",
            camera: "الكاميرا",
            microphone: "الميكروفون",
            lastSeen: "آخر ظهور",
            noChats: "لا توجد محادثات بعد",
            startChat: "بدء محادثة",
            selectChat: "اختر محادثة لبدء إرسال الرسائل"
        },

        hi: {
            name: "हिन्दी",
            welcome: "W.F.C'sChat में आपका स्वागत है",
            connect: "दुनिया भर के लोगों से जुड़ें।",
            language: "भाषा",
            selectLanguage: "भाषा चुनें",
            terms: "जारी रखकर आप सहमत होते हैं:",
            termsLink: "नियम और शर्तें",
            privacy: "गोपनीयता नीति",
            getStarted: "शुरू करें",
            back: "वापस",

            phoneTitle: "अपना फ़ोन नंबर दर्ज करें",
            phoneDescription: "अपना देश चुनें और फ़ोन नंबर दर्ज करें।",
            phonePlaceholder: "फ़ोन नंबर",
            continue: "जारी रखें",
            sendingCode: "सत्यापन कोड भेजा जा रहा है...",
            enterPhone: "कृपया अपना फ़ोन नंबर दर्ज करें।",
            selectCountry: "देश चुनें",
            searchCountry: "देश खोजें",
            noCountries: "कोई देश नहीं मिला।",
            security: "आपके फ़ोन नंबर का उपयोग आपका W.F.C'sChat खाता बनाने और सुरक्षित रखने के लिए किया जाता है।",

            loading: "लोड हो रहा है...",
            cancel: "रद्द करें",
            save: "सहेजें",
            close: "बंद करें",
            search: "खोजें",
            retry: "पुनः प्रयास करें",
            error: "कुछ गलत हो गया।",
            offline: "ऑफ़लाइन",
            online: "ऑनलाइन",

            chats: "चैट",
            updates: "अपडेट",
            calls: "कॉल",
            contacts: "संपर्क",
            newChat: "नई चैट",
            searchChats: "चैट खोजें",
            settings: "सेटिंग्स",
            profile: "प्रोफ़ाइल",
            newGroup: "नया समूह",
            message: "संदेश",
            typeMessage: "संदेश लिखें",
            send: "भेजें",
            attach: "संलग्न करें",
            camera: "कैमरा",
            microphone: "माइक्रोफ़ोन",
            lastSeen: "अंतिम बार देखा गया",
            noChats: "अभी कोई चैट नहीं",
            startChat: "चैट शुरू करें",
            selectChat: "मैसेज भेजना शुरू करने के लिए चैट चुनें"
        },

        bn: {
            name: "বাংলা",
            welcome: "W.F.C'sChat-এ স্বাগতম",
            connect: "বিশ্বের মানুষের সাথে সংযুক্ত হন।",
            language: "ভাষা",
            selectLanguage: "ভাষা নির্বাচন করুন",
            terms: "চালিয়ে গেলে আপনি সম্মত হচ্ছেন:",
            termsLink: "শর্তাবলি",
            privacy: "গোপনীয়তা নীতি",
            getStarted: "শুরু করুন",
            back: "পিছনে",

            phoneTitle: "আপনার ফোন নম্বর লিখুন",
            phoneDescription: "আপনার দেশ নির্বাচন করে ফোন নম্বর লিখুন।",
            phonePlaceholder: "ফোন নম্বর",
            continue: "চালিয়ে যান",
            sendingCode: "যাচাইকরণ কোড পাঠানো হচ্ছে...",
            enterPhone: "অনুগ্রহ করে আপনার ফোন নম্বর লিখুন।",
            selectCountry: "দেশ নির্বাচন করুন",
            searchCountry: "দেশ খুঁজুন",
            noCountries: "কোনো দেশ পাওয়া যায়নি।",
            security: "আপনার ফোন নম্বর W.F.C'sChat অ্যাকাউন্ট তৈরি ও সুরক্ষিত রাখতে ব্যবহার করা হয়।",

            loading: "লোড হচ্ছে...",
            cancel: "বাতিল",
            save: "সংরক্ষণ",
            close: "বন্ধ করুন",
            search: "অনুসন্ধান",
            retry: "আবার চেষ্টা করুন",
            error: "কিছু ভুল হয়েছে।",
            offline: "অফলাইন",
            online: "অনলাইন",

            chats: "চ্যাট",
            updates: "আপডেট",
            calls: "কল",
            contacts: "পরিচিতি",
            newChat: "নতুন চ্যাট",
            searchChats: "চ্যাট অনুসন্ধান করুন",
            settings: "সেটিংস",
            profile: "প্রোফাইল",
            newGroup: "নতুন গ্রুপ",
            message: "বার্তা",
            typeMessage: "বার্তা লিখুন",
            send: "পাঠান",
            attach: "সংযুক্ত করুন",
            camera: "ক্যামেরা",
            microphone: "মাইক্রোফোন",
            lastSeen: "শেষ দেখা",
            noChats: "এখনও কোনো চ্যাট নেই",
            startChat: "চ্যাট শুরু করুন",
            selectChat: "বার্তা পাঠানো শুরু করতে একটি চ্যাট নির্বাচন করুন"
        },

        zh: {
            name: "中文",
            welcome: "欢迎使用 W.F.C'sChat",
            connect: "与世界各地的人联系。",
            language: "语言",
            selectLanguage: "选择语言",
            terms: "继续即表示您同意",
            termsLink: "条款和条件",
            privacy: "隐私政策",
            getStarted: "开始使用",
            back: "返回",

            phoneTitle: "输入您的电话号码",
            phoneDescription: "选择国家/地区并输入您的电话号码。",
            phonePlaceholder: "电话号码",
            continue: "继续",
            sendingCode: "正在发送验证码...",
            enterPhone: "请输入您的电话号码。",
            selectCountry: "选择国家/地区",
            searchCountry: "搜索国家/地区",
            noCountries: "未找到国家/地区。",
            security: "您的电话号码用于创建和保护您的 W.F.C'sChat 帐户。",

            loading: "正在加载...",
            cancel: "取消",
            save: "保存",
            close: "关闭",
            search: "搜索",
            retry: "重试",
            error: "出了点问题。",
            offline: "离线",
            online: "在线",

            chats: "聊天",
            updates: "动态",
            calls: "通话",
            contacts: "联系人",
            newChat: "新聊天",
            searchChats: "搜索聊天",
            settings: "设置",
            profile: "个人资料",
            newGroup: "新群组",
            message: "消息",
            typeMessage: "输入消息",
            send: "发送",
            attach: "附件",
            camera: "相机",
            microphone: "麦克风",
            lastSeen: "最后上线",
            noChats: "还没有聊天",
            startChat: "开始聊天",
            selectChat: "选择聊天以开始发送消息"
        },

        ja: {
            name: "日本語",
            welcome: "W.F.C'sChatへようこそ",
            connect: "世界中の人々とつながりましょう。",
            language: "言語",
            selectLanguage: "言語を選択",
            terms: "続行すると、以下に同意したものとみなされます：",
            termsLink: "利用規約",
            privacy: "プライバシーポリシー",
            getStarted: "始める",
            back: "戻る",

            phoneTitle: "電話番号を入力",
            phoneDescription: "国を選択して電話番号を入力してください。",
            phonePlaceholder: "電話番号",
            continue: "続行",
            sendingCode: "コードを送信中...",
            enterPhone: "電話番号を入力してください。",
            selectCountry: "国を選択",
            searchCountry: "国を検索",
            noCountries: "国が見つかりません。",
            security: "電話番号はW.F.C'sChatアカウントの作成と保護に使用されます。",

            loading: "読み込み中...",
            cancel: "キャンセル",
            save: "保存",
            close: "閉じる",
            search: "検索",
            retry: "再試行",
            error: "問題が発生しました。",
            offline: "オフライン",
            online: "オンライン",

            chats: "チャット",
            updates: "更新",
            calls: "通話",
            contacts: "連絡先",
            newChat: "新しいチャット",
            searchChats: "チャットを検索",
            settings: "設定",
            profile: "プロフィール",
            newGroup: "新しいグループ",
            message: "メッセージ",
            typeMessage: "メッセージを入力",
            send: "送信",
            attach: "添付",
            camera: "カメラ",
            microphone: "マイク",
            lastSeen: "最終アクセス",
            noChats: "まだチャットはありません",
            startChat: "チャットを開始",
            selectChat: "メッセージを開始するにはチャットを選択してください"
        },

        ko: {
            name: "한국어",
            welcome: "W.F.C'sChat에 오신 것을 환영합니다",
            connect: "전 세계 사람들과 연결하세요.",
            language: "언어",
            selectLanguage: "언어 선택",
            terms: "계속하면 다음에 동의하는 것으로 간주됩니다:",
            termsLink: "이용약관",
            privacy: "개인정보 보호정책",
            getStarted: "시작하기",
            back: "뒤로",

            phoneTitle: "전화번호를 입력하세요",
            phoneDescription: "국가를 선택하고 전화번호를 입력하세요.",
            phonePlaceholder: "전화번호",
            continue: "계속",
            sendingCode: "코드 전송 중...",
            enterPhone: "전화번호를 입력하세요.",
            selectCountry: "국가 선택",
            searchCountry: "국가 검색",
            noCountries: "국가를 찾을 수 없습니다.",
            security: "전화번호는 W.F.C'sChat 계정을 만들고 보호하는 데 사용됩니다.",

            loading: "로드 중...",
            cancel: "취소",
            save: "저장",
            close: "닫기",
            search: "검색",
            retry: "다시 시도",
            error: "문제가 발생했습니다.",
            offline: "오프라인",
            online: "온라인",

            chats: "채팅",
            updates: "업데이트",
            calls: "통화",
            contacts: "연락처",
            newChat: "새 채팅",
            searchChats: "채팅 검색",
            settings: "설정",
            profile: "프로필",
            newGroup: "새 그룹",
            message: "메시지",
            typeMessage: "메시지 입력",
            send: "보내기",
            attach: "첨부",
            camera: "카메라",
            microphone: "마이크",
            lastSeen: "마지막 접속",
            noChats: "아직 채팅이 없습니다",
            startChat: "채팅 시작",
            selectChat: "메시지를 시작하려면 채팅을 선택하세요"
        }
    };

    function isSupported(language) {
        return Object.prototype.hasOwnProperty.call(translations, language);
    }

    function getLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        return isSupported(saved) ? saved : "en";
    }

    function updateDocumentLanguage(language) {
        document.documentElement.lang = language;
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }

    function apply() {
        const language = getLanguage();

        updateDocumentLanguage(language);

        window.WFC_LANGUAGE = language;
        window.WFC_TRANSLATIONS = translations[language];

        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.dataset.i18n;
            element.textContent = t(key);
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            const key = element.dataset.i18nPlaceholder;
            element.placeholder = t(key);
        });

        document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
            const key = element.dataset.i18nAriaLabel;
            element.setAttribute("aria-label", t(key));
        });

        return language;
    }

    function setLanguage(language) {
        if (!isSupported(language)) {
            return false;
        }

        const previous = getLanguage();

        localStorage.setItem(STORAGE_KEY, language);
        apply();

        if (previous !== language) {
            window.dispatchEvent(
                new CustomEvent("wfc-language-change", {
                    detail: {
                        language,
                        translations: translations[language]
                    }
                })
            );
        }

        return true;
    }

    function t(key, fallback) {
        const language = getLanguage();

        return translations[language]?.[key]
            ?? translations.en?.[key]
            ?? fallback
            ?? key;
    }

    function getLanguages() {
        return languages.map(([code, name]) => ({
            code,
            name
        }));
    }

    window.WFC_I18N = {
        translations,
        languages,
        getLanguages,
        getLanguage,
        setLanguage,
        t,
        apply
    };

    window.WFC_LANGUAGE = getLanguage();
    window.WFC_TRANSLATIONS = translations[window.WFC_LANGUAGE];

    document.addEventListener("DOMContentLoaded", () => {
        apply();
    });
})();
