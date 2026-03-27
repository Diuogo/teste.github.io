/**
 * NiceDrop Authentication with Supabase
 * Handles user signup, login, and role management
 * 
 * MODO: 
 * - Se Supabase está configurado: usa BD real
 * - Se não: usa localStorage (modo demo/teste)
 */

// ============================================
// STATE
// ============================================

const authState = {
    forms: {
        login: document.getElementById('loginForm'),
        signup: document.getElementById('signupForm')
    },
    tabs: document.querySelectorAll('.tab-btn'),
    messageEl: document.getElementById('authMessage'),
    supabase: null,
    isOnlineMode: false // será true se Supabase estiver configurado
};

function setStoredSession(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('nicedrop_user');
}

function clearSession() {
    localStorage.removeItem('user');
    localStorage.removeItem('nicedrop_user');
}

// ============================================
// SUPABASE INITIALIZATION
// ============================================

async function initAuth() {
    // Initialize Supabase if configured
    try {
        if (!window.supabaseConfig?.isConfigured || !window.supabaseConfig.isConfigured()) {
            console.warn('⚠️  Credenciais Supabase não preenchidas. Usando modo localStorage (demo)');
            authState.isOnlineMode = false;
            setupEventListeners();
            return;
        }

        await window.supabaseConfig.init();
        authState.supabase = window.supabaseConfig.getClient();

        if (!authState.supabase) {
            console.warn('⚠️  Supabase não configurado. Usando modo localStorage (demo)');
            authState.isOnlineMode = false;
            setupEventListeners();
            return;
        }

        authState.isOnlineMode = true;

        // Check if user is already logged in
        const { data: { session } } = await authState.supabase.auth.getSession();
        if (session) {
            // User is logged in, check if they have owner role
            checkRoleAndRedirect();
        }

        setupEventListeners();
        console.log('✅ Auth inicializado com Supabase (MODO ONLINE)');
    } catch (error) {
        console.warn('⚠️  Erro ao inicializar Supabase. Usando modo localStorage:', error.message);
        authState.isOnlineMode = false;
        setupEventListeners();
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function switchTab(tabName) {
    authState.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    Object.values(authState.forms).forEach(form => {
        form.classList.toggle('active', form.dataset.form === tabName);
    });

    hideMessage();
}

function showMessage(type, text) {
    authState.messageEl.textContent = text;
    authState.messageEl.className = `auth-message ${type}`;
    authState.messageEl.style.display = 'block';
    
    if (type === 'error') {
        setTimeout(hideMessage, 5000);
    }
}

function hideMessage() {
    authState.messageEl.style.display = 'none';
    authState.messageEl.textContent = '';
    authState.messageEl.className = 'auth-message';
}

// ============================================
// VALIDATION
// ============================================

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateLogin(email, password) {
    if (!email.trim()) {
        showMessage('error', 'Por favor, introduza o seu email');
        return false;
    }
    if (!validateEmail(email)) {
        showMessage('error', 'Por favor, introduza um email válido');
        return false;
    }
    if (!password.trim()) {
        showMessage('error', 'Por favor, introduza a sua password');
        return false;
    }
    return true;
}

function validateSignup(name, email, password, confirm) {
    if (!name.trim()) {
        showMessage('error', 'Por favor, introduza o seu nome');
        return false;
    }
    if (!email.trim()) {
        showMessage('error', 'Por favor, introduza o seu email');
        return false;
    }
    if (!validateEmail(email)) {
        showMessage('error', 'Por favor, introduza um email válido');
        return false;
    }
    if (password.length < 6) {
        showMessage('error', 'A password deve ter pelo menos 6 caracteres');
        return false;
    }
    if (password !== confirm) {
        showMessage('error', 'As passwords não correspondem');
        return false;
    }
    return true;
}

// ============================================
// AUTHENTICATION HANDLERS
// ============================================

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!validateLogin(email, password)) {
        return;
    }

    showMessage('info', 'Autenticando...');

    try {
        if (!authState.isOnlineMode) {
            // Modo demo/localStorage
            handleLoginOffline(email, password);
            return;
        }

        // Sign in with Supabase
        const { data, error } = await authState.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        console.log('✅ Autenticado:', data.user.email);

        // Check user role
        await checkRoleAndRedirect();

    } catch (error) {
        console.error('Erro de autenticação:', error.message);
        showMessage('error', 'Falha de autenticação. Verifique as suas credenciais.');
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    if (!validateSignup(name, email, password, confirm)) {
        return;
    }

    showMessage('info', 'Criando conta...');

    try {
        if (!authState.isOnlineMode) {
            // Modo demo/localStorage
            handleSignupOffline(name, email, password);
            return;
        }

        // Sign up with Supabase
        const { data, error } = await authState.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: name // O trigger do Supabase irá criar o perfil
                }
            }
        });

        if (error) {
            throw error;
        }

        showMessage('success', 'Conta criada! Por favor, autentique-se com as suas credenciais.');
        document.getElementById('signupForm').reset();
        setTimeout(() => {
            switchTab('login');
            document.getElementById('loginEmail').value = email;
            document.getElementById('loginEmail').focus();
        }, 2000);

    } catch (error) {
        console.error('Erro de registo:', error.message);
        showMessage('error', error.message || 'Registo falhou');
    }
}

// ============================================
// MODO OFFLINE (Demo/localStorage)
// ============================================

// Simula BD em memoria
let demoDatabase = JSON.parse(localStorage.getItem('nicedrop_demo_db')) || {
    users: [
        {
            id: 'demo-1',
            email: 'demo@nicedrop.com',
            name: 'Demo User',
            password: '123456', // ⚠️ Só para demo!
            role: 'owner',
            created_at: new Date().toISOString()
        }
    ]
};

function saveDemoDB() {
    localStorage.setItem('nicedrop_demo_db', JSON.stringify(demoDatabase));
}

function handleLoginOffline(email, password) {
    const user = demoDatabase.users.find(u => u.email === email && u.password === password);

    try {
        if (!authState.isOnlineMode) {
            // Modo demo/localStorage
            handleLoginOffline(email, password);
            return;
        }

        // Sign in with Supabase
        const { data, error } = await authState.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        // Buscar perfil do utilizador na tabela profiles
        const userId = data.user.id;
        const { data: profile, error: profileError } = await authState.supabase
            .from('profiles')
            .select('id, username, avatar, role')
            .eq('id', userId)
            .single();

        if (profileError) {
            throw profileError;
        }

        // Guardar apenas os campos permitidos
        const userData = {
            id: profile.id,
            email: data.user.email,
            username: profile.username,
            role: profile.role,
            avatar: profile.avatar
        };
        setStoredSession(userData);

        // Redirecionar conforme o papel
        if (profile.role === 'developer') {
            showMessage('success', 'Bem-vindo! Redirecionando para painel de administração...');
            setTimeout(() => {
                window.location.href = '/teste.github.io/admin.html';
            }, 1500);
        } else if (profile.role === 'owner' || profile.role === 'operator') {
            showMessage('success', 'Bem-vindo! Redirecionando para o painel...');
            setTimeout(() => {
                window.location.href = '/teste.github.io/dashboard.html';
            }, 1500);
        } else {
            showMessage('error', 'Apenas operadores ou proprietários podem aceder ao painel.');
            await authState.supabase.auth.signOut();
            clearSession();
        }

    } catch (error) {
        console.error('Erro de autenticação:', error.message);
        showMessage('error', 'Falha de autenticação. Verifique as suas credenciais.');
    }
    // Verifique se email já existe
    if (demoDatabase.users.some(u => u.email === email)) {
        showMessage('error', 'Este email já está registado');
        return;
    }

    // Crie novo utilizador
    const newUser = {
        id: 'demo-' + Date.now(),
        email,
        name,
        password, // ⚠️ Só para demo!
        role: 'client', // Default role (admin muda para owner)
        created_at: new Date().toISOString()
    };

    demoDatabase.users.push(newUser);
    saveDemoDB();

    console.log('✅ Conta criada (demo):', email);
    showMessage('success', 'Conta criada! Por favor, autentique-se com as suas credenciais.');

    document.getElementById('signupForm').reset();

    setTimeout(() => {
        switchTab('login');
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginEmail').focus();
    }, 2000);
}

// ============================================
// ROLE VERIFICATION
// ============================================

async function checkRoleAndRedirect() {
    try {
        if (!authState.isOnlineMode) {
            // Modo demo - role já foi verificado no handleLoginOffline
            return;
        }

        // Get current user
        const { data: { user }, error: userError } = await authState.supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('Utilizador não autenticado');
        }

        // Buscar perfil correto na tabela profiles
        const { data: profile, error } = await authState.supabase
            .from('profiles')
            .select('id, username, avatar, role')
            .eq('id', user.id)
            .single();

        if (error) {
            throw error;
        }

        // Guardar apenas os campos permitidos
        const userData = {
            id: profile.id,
            email: user.email,
            username: profile.username,
            role: profile.role,
            avatar: profile.avatar
        };
        setStoredSession(userData);

        // Redirecionar conforme o papel
        if (profile.role === 'developer') {
            showMessage('success', 'Bem-vindo! Redirecionando para painel de administração...');
            setTimeout(() => {
                window.location.href = '/teste.github.io/admin.html';
            }, 1500);
        } else if (profile.role === 'owner' || profile.role === 'operator') {
            showMessage('success', 'Bem-vindo! Redirecionando para o painel...');
            setTimeout(() => {
                window.location.href = '/teste.github.io/dashboard.html';
            }, 1500);
        } else {
            showMessage('error', 'Apenas operadores ou proprietários podem aceder ao painel.');
            await authState.supabase.auth.signOut();
            clearSession();
        }

    } catch (error) {
        console.error('Erro ao verificar papel:', error.message);
        showMessage('error', 'Falha ao verificar o papel do utilizador');
    }
}

async function logout() {
    try {
        const { error } = await authState.supabase.auth.signOut();
        if (error) throw error;

        clearSession();
        window.location.href = '/teste.github.io/index.html';
    } catch (error) {
        console.error('Logout error:', error.message);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    authState.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(btn.dataset.tab);
        });
    });

    authState.forms.login.addEventListener('submit', handleLogin);
    authState.forms.signup.addEventListener('submit', handleSignup);

    document.querySelectorAll('.form-group input').forEach(input => {
        input.addEventListener('focus', hideMessage);
    });

    document.querySelectorAll('.form-group select').forEach(select => {
        select.addEventListener('change', hideMessage);
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    function waitForSupabase(cb) {
        if (window.supabase && window.supabase.createClient) {
            cb();
        } else {
            setTimeout(() => waitForSupabase(cb), 50);
        }
    }
    waitForSupabase(initAuth);
});
