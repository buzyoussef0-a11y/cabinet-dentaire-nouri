/* ── CHAT.JS — Cabinet Dentaire Nouri ── */
var CHAT_WEBHOOK = 'https://n8n.srv1521649.hstgr.cloud/webhook/dental-assistant';
var chatHistory = [];
var chatInited = false;
var chatOpen = false;

/* ── Persistent session ID across page visits ── */
var chatSessionId = localStorage.getItem('chatSessionId') ||
    'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('chatSessionId', chatSessionId);

/* ── Initialise on first open ── */
async function initChat() {
    if (chatInited) return;
    chatInited = true;

    var user = (typeof getCurrentUser === 'function') ? await getCurrentUser() : null;
    var name = user ? (user.user_metadata?.full_name || 'زائر') : 'زائر';
    var greeting = user
        ? 'مرحباً ' + name.split(' ')[0] + '! 😊 أنا مساعد Cabinet Nouri. كيف أساعدك؟'
        : 'مرحباً! 😊 أنا مساعد Cabinet Dentaire Nouri.\nكيف يمكنني مساعدتك اليوم؟';

    appendMsg(greeting, 'bot');

    /* Quick-reply chips */
    setTimeout(function () { showQuickReplies(); }, 400);
}

/* ── Toggle chat open/close ── */
function toggleChat() {
    var win = document.getElementById('chatWindow');
    var badge = document.getElementById('chatToggleBadge');
    if (!win) return;

    chatOpen = !chatOpen;
    if (chatOpen) {
        win.classList.remove('chat-hidden');
        if (badge) badge.style.display = 'none';
        initChat();
        setTimeout(function () {
            var inp = document.getElementById('chatInput');
            if (inp) inp.focus();
        }, 200);
    } else {
        win.classList.add('chat-hidden');
    }
}

/* ── Parse Markdown links → clickable <a> tags ── */
function parseMarkdownLinks(text) {
    return text.replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener" style="color:#00E5FF;text-decoration:underline;">$1</a>'
    );
}

/* ── Append message bubble ── */
function appendMsg(text, type) {
    var msgs = document.getElementById('chatMessages');
    if (!msgs) return;

    var div = document.createElement('div');
    div.className = type === 'bot' ? 'msg-bot' : 'msg-user';

    if (type === 'bot') {
        /* Bot messages: parse Markdown links, then render newlines */
        var parsed = parseMarkdownLinks(text);
        div.innerHTML = parsed.replace(/\n/g, '<br>');
    } else {
        /* User messages: plain text only (XSS-safe) */
        text.split('\n').forEach(function (line, i, arr) {
            div.appendChild(document.createTextNode(line));
            if (i < arr.length - 1) div.appendChild(document.createElement('br'));
        });
    }

    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

/* ── Quick-reply chips ── */
function showQuickReplies() {
    var msgs = document.getElementById('chatMessages');
    if (!msgs) return;

    var chips = [
        { label: '📅 حجز موعد', value: 'أريد حجز موعد' },
        { label: '💰 أسعار الخدمات', value: 'ما هي أسعار الخدمات؟' },
        { label: '🕐 ساعات العمل', value: 'ما هي ساعات العمل؟' },
        { label: '📍 الموقع', value: 'أين يقع الكابينيه؟' }
    ];

    var container = document.createElement('div');
    container.className = 'quick-replies';
    container.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;margin-top:4px;animation:msgSlideIn 0.3s ease both;';

    chips.forEach(function (c) {
        var btn = document.createElement('button');
        btn.textContent = c.label;
        btn.style.cssText = [
            'background:rgba(13,242,242,0.1)',
            'border:1px solid rgba(13,242,242,0.3)',
            'color:#0df2f2',
            'padding:7px 13px',
            'border-radius:50px',
            'font-size:0.78rem',
            'font-weight:700',
            'font-family:Cairo,sans-serif',
            'cursor:pointer',
            'transition:all 0.25s ease'
        ].join(';');
        btn.onmouseenter = function () {
            btn.style.background = 'rgba(13,242,242,0.2)';
            btn.style.transform = 'translateY(-2px)';
        };
        btn.onmouseleave = function () {
            btn.style.background = 'rgba(13,242,242,0.1)';
            btn.style.transform = 'translateY(0)';
        };
        btn.onclick = function () {
            /* Remove chips */
            if (container.parentNode) container.parentNode.removeChild(container);
            sendWithText(c.value);
        };
        container.appendChild(btn);
    });

    msgs.appendChild(container);
    msgs.scrollTop = msgs.scrollHeight;
}

/* ── Typing indicator ── */
function showTyping() {
    var msgs = document.getElementById('chatMessages');
    if (!msgs) return null;
    var div = document.createElement('div');
    div.className = 'msg-bot msg-typing';
    div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
}

/* ── Send from input field ── */
function sendChatMessage() {
    var input = document.getElementById('chatInput');
    if (!input) return;
    var msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    sendWithText(msg);
}

/* ── Handle Enter key ── */
function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
}

/* ── Core send function ── */
async function sendWithText(msg) {
    appendMsg(msg, 'user');
    chatHistory.push({ role: 'user', content: msg });

    var typing = showTyping();
    var user = (typeof getCurrentUser === 'function') ? await getCurrentUser() : null;

    var fallback = 'شكراً على تواصلك. 📞 للتواصل الفوري اتصل بنا على 0535 40 22 11 أو تواصل عبر واتساب.';

    try {
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 12000);

        var res = await fetch(CHAT_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                message: msg,
                sessionId: chatSessionId,
                userId: user ? user.id : null,
                userName: user ? (user.user_metadata && user.user_metadata.full_name) || null : null
            })
        });

        clearTimeout(timeout);

        var reply = fallback;

        if (res.ok) {
            var ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                var data = await res.json();
                reply = data.response || data.output || data.reply || data.message || data.text || fallback;
            } else {
                var raw = (await res.text()).trim();
                if (raw) reply = raw;
            }
        }

        if (typing) typing.remove();
        appendMsg(reply, 'bot');
        chatHistory.push({ role: 'assistant', content: reply });

    } catch (e) {
        if (typing) typing.remove();
        if (e.name === 'AbortError') {
            appendMsg('⏱️ انتهت مهلة الاتصال. يرجى المحاولة مجدداً.', 'bot');
        } else {
            appendMsg(fallback, 'bot');
        }
    }
}
