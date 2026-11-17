let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let activeChatUser = null;
let selectedMediaArray = [];

window.onload = function() {
    initAuthData();
    initFeedData();
    initChatData();

    if (currentUser) {
        showMainApp();
    }
};

function initAuthData() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            { id: '1', name: 'Sarah Bernard', email: 'sarah@mail.com', password: 'password', bio: 'Développeuse Fullstack 🚀' },
            { id: '2', name: 'Andry Rakoto', email: 'andry@mail.com', password: 'password', bio: 'Créateur de contenu 🎬' },
            { id: '3', name: 'Mahmoud Gizy', email: 'mahmoud@mail.com', password: 'password', bio: 'Architecte Logiciel 💻' }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('posts')) {
        localStorage.setItem('posts', JSON.stringify([
            {
                id: 'p1',
                userId: '1',
                userName: 'Sarah Bernard',
                privacy: 'public',
                caption: 'Bienvenue sur la nouvelle version de KoaSocial optimisée pour GitHub Pages ! 🚀',
                media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80' }],
                date: new Date().toISOString(),
                reactions: { '2': 'love' },
                comments: [{ id: 'c1', userId: '2', userName: 'Andry Rakoto', text: 'Superbe plateforme !' }]
            }
        ]));
    }
    if (!localStorage.getItem('messages')) {
        localStorage.setItem('messages', JSON.stringify([]));
    }
}

function switchTab(tab) {
    const loginForm = document.getElementById('form-login');
    const regForm = document.getElementById('form-register');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');

    if (tab === 'login') {
        loginForm.classList.remove('hidden-section');
        regForm.classList.add('hidden-section');
        tabLogin.className = "flex-1 py-2.5 font-bold text-xs rounded-xl bg-white text-[#2563EB] shadow-xs transition";
        tabReg.className = "flex-1 py-2.5 font-bold text-xs rounded-xl text-[#64748B] transition";
    } else {
        loginForm.classList.add('hidden-section');
        regForm.classList.remove('hidden-section');
        tabReg.className = "flex-1 py-2.5 font-bold text-xs rounded-xl bg-white text-[#16A34A] shadow-xs transition";
        tabLogin.className = "flex-1 py-2.5 font-bold text-xs rounded-xl text-[#64748B] transition";
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Email ou mot de passe incorrect.');
    }
}

function quickLogin(email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('main-screen').classList.add('hidden-section');
    document.getElementById('auth-screen').classList.remove('hidden-section');
}

function showMainApp() {
    document.getElementById('auth-screen').classList.add('hidden-section');
    document.getElementById('main-screen').classList.remove('hidden-section');
    
    document.getElementById('current-username').innerText = currentUser.name;
    document.getElementById('header-user-avatar').innerText = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('creator-name').innerText = currentUser.name;
    document.getElementById('creator-avatar').innerText = currentUser.name.charAt(0).toUpperCase();

    switchView('feed');
}

function switchView(viewName) {
    ['feed', 'chat', 'profile'].forEach(v => {
        const el = document.getElementById(`view-${v}`);
        if (el) el.classList.add('hidden-section');
    });

    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) activeView.classList.remove('hidden-section');

    if (viewName === 'feed') loadFeed();
    if (viewName === 'chat') loadChatFriends();
    if (viewName === 'profile') loadProfile();
}

// Feed & Posts
function handleMediaSelection(input) {
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(evt) {
                selectedMediaArray.push({ type: 'image', url: evt.target.result });
                renderMediaPreviews();
            };
            reader.readAsDataURL(file);
        });
    }
}

function renderMediaPreviews() {
    const container = document.getElementById('media-preview-container');
    if (!container) return;
    container.innerHTML = '';
    if (selectedMediaArray.length > 0) {
        container.classList.remove('hidden-section');
        selectedMediaArray.forEach((media, index) => {
            const div = document.createElement('div');
            div.className = "relative rounded-lg overflow-hidden border h-20 bg-black/5 flex items-center justify-center";
            div.innerHTML = `<img src="${media.url}" class="h-full w-full object-cover"><button type="button" onclick="selectedMediaArray.splice(${index},1);renderMediaPreviews();" class="absolute top-1 right-1 w-5 h-5 bg-black text-white rounded-full text-[9px]">X</button>`;
            container.appendChild(div);
        });
    } else {
        container.classList.add('hidden-section');
    }
}

function createPost(e) {
    e.preventDefault();
    const caption = document.getElementById('post-caption').value.trim();
    const privacy = document.getElementById('post-privacy').value;

    if (!caption && selectedMediaArray.length === 0) {
        alert('Veuillez ajouter du texte ou des médias.');
        return;
    }

    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.unshift({
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        privacy: privacy,
        caption: caption,
        media: [...selectedMediaArray],
        date: new Date().toISOString(),
        reactions: {},
        comments: []
    });
    localStorage.setItem('posts', JSON.stringify(posts));

    document.getElementById('post-caption').value = '';
    selectedMediaArray = [];
    renderMediaPreviews();
    loadFeed();
}

function loadFeed() {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const container = document.getElementById('posts-container');
    if (!container) return;
    container.innerHTML = '';

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = "bg-white rounded-2xl shadow-xs border border-[#E5EAF2] p-5 space-y-3";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-[#2563EB] text-white font-bold rounded-full flex items-center justify-center text-sm">${post.userName.charAt(0)}</div>
                <div>
                    <h4 class="font-bold text-xs text-[#172033]">${post.userName}</h4>
                    <span class="text-[10px] text-[#64748B]">${new Date(post.date).toLocaleString()}</span>
                </div>
            </div>
            <p class="text-xs text-[#172033]">${escapeHtml(post.caption)}</p>
            ${post.media && post.media.length > 0 ? `<div class="rounded-xl overflow-hidden"><img src="${post.media[0].url}" class="w-full max-h-80 object-cover"></div>` : ''}
        `;
        container.appendChild(div);
    });
}

// Chat
function initChatData() {
    if (!localStorage.getItem('messages')) {
        localStorage.setItem('messages', JSON.stringify([]));
    }
}

function loadChatFriends() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const otherUsers = users.filter(u => u.id !== currentUser.id);
    const list = document.getElementById('friends-list');
    if (!list) return;
    list.innerHTML = '';

    otherUsers.forEach(user => {
        const div = document.createElement('div');
        div.className = "p-3 flex items-center gap-3 cursor-pointer hover:bg-[#F5F7FB] transition";
        div.onclick = () => selectChatUser(user);
        div.innerHTML = `
            <div class="w-9 h-9 bg-[#2563EB] text-white font-bold rounded-full flex items-center justify-center text-xs">${user.name.charAt(0)}</div>
            <div class="font-bold text-xs text-[#172033]">${user.name}</div>
        `;
        list.appendChild(div);
    });
}

function selectChatUser(user) {
    activeChatUser = user;
    document.getElementById('chat-header').innerHTML = `<span class="font-bold text-sm">${user.name}</span>`;
    document.getElementById('chat-input-area').classList.remove('hidden-section');
    loadChatMessages();
}

function loadChatMessages() {
    if (!activeChatUser) return;
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const container = document.getElementById('chat-messages');
    if (!container) return;
    container.innerHTML = '';

    const thread = messages.filter(m => (m.senderId === currentUser.id && m.receiverId === activeChatUser.id) || (m.senderId === activeChatUser.id && m.receiverId === currentUser.id));
    thread.forEach(m => {
        const isMe = m.senderId === currentUser.id;
        const div = document.createElement('div');
        div.className = `max-w-[75%] p-3 rounded-xl text-xs ${isMe ? 'bg-[#2563EB] text-white self-end' : 'bg-white border self-start'}`;
        div.innerText = m.text;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !activeChatUser) return;

    let messages = JSON.parse(localStorage.getItem('messages')) || [];
    messages.push({
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: activeChatUser.id,
        text: text,
        date: new Date().toISOString()
    });
    localStorage.setItem('messages', JSON.stringify(messages));
    input.value = '';
    loadChatMessages();
}

// Profile
function loadProfile() {
    document.getElementById('profile-name').innerText = currentUser.name;
    document.getElementById('profile-email').innerText = currentUser.email;
    document.getElementById('profile-avatar-initial').innerText = currentUser.name.charAt(0).toUpperCase();

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const userPosts = posts.filter(p => p.userId === currentUser.id);
    const container = document.getElementById('user-posts-container');
    if (!container) return;
    container.innerHTML = '';

    if (userPosts.length === 0) {
        container.innerHTML = '<div class="text-[#64748B] text-xs py-6 text-center">Aucune publication personnelle.</div>';
        return;
    }

    userPosts.forEach(post => {
        const div = document.createElement('div');
        div.className = "border border-[#E5EAF2] rounded-xl p-4 bg-[#F5F7FB]/50 space-y-2";
        div.innerHTML = `<p class="text-xs text-[#172033]">${escapeHtml(post.caption)}</p>`;
        container.appendChild(div);
    });
}

function handleGlobalSearch(query) {
    loadFeed();
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
