document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        policies: {
            minLen: 8,
            reqUpper: true,
            reqLower: true,
            reqNum: true,
            reqSym: true,
            lockAttempts: 3
        },
        db: [], // Array of { username, email, passwordHash, status: 'active' | 'locked', failedAttempts: 0 }
        isSimulating: false
    };

    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const resetBtn = document.getElementById('resetBtn');

    // Policies Elements
    const policiesForm = document.getElementById('policiesForm');
    const minLenInput = document.getElementById('minLen');
    const reqUpperCb = document.getElementById('reqUpper');
    const reqLowerCb = document.getElementById('reqLower');
    const reqNumCb = document.getElementById('reqNum');
    const reqSymCb = document.getElementById('reqSym');
    const lockAttemptsInput = document.getElementById('lockAttempts');
    const policyMsg = document.getElementById('policyMsg');

    // Registration Elements
    const registerForm = document.getElementById('registerForm');
    const regUser = document.getElementById('regUser');
    const regEmail = document.getElementById('regEmail');
    const regPass = document.getElementById('regPass');
    const regConfirm = document.getElementById('regConfirm');
    const regBtn = document.getElementById('regBtn');
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    const passReqs = document.getElementById('passReqs');
    const regMsg = document.getElementById('regMsg');

    // Authentication Elements
    const loginForm = document.getElementById('loginForm');
    const loginUser = document.getElementById('loginUser');
    const loginPass = document.getElementById('loginPass');
    const loginBtn = document.getElementById('loginBtn');
    const dbRecords = document.getElementById('dbRecords');
    const authResult = document.getElementById('authResult');

    // Helper: Simple Hash Function (for simulation)
    const sha256_mock = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    };

    // --- Tab Navigation ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // --- Reset ---
    resetBtn.addEventListener('click', () => {
        state.db = [];
        updateDBView();
        authResult.classList.add('hidden');
        resetSteps();
        loginForm.reset();
        registerForm.reset();
        regMsg.classList.add('hidden');
        updatePasswordRequirements('');
    });

    // --- Policies Form ---
    policiesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        state.policies = {
            minLen: parseInt(minLenInput.value),
            reqUpper: reqUpperCb.checked,
            reqLower: reqLowerCb.checked,
            reqNum: reqNumCb.checked,
            reqSym: reqSymCb.checked,
            lockAttempts: parseInt(lockAttemptsInput.value)
        };
        
        policyMsg.classList.remove('hidden');
        setTimeout(() => policyMsg.classList.add('hidden'), 3000);
        updatePasswordRequirements(regPass.value);
    });

    // --- Registration Form ---
    const updatePasswordRequirements = (password) => {
        const p = state.policies;
        let html = '';
        let validChecks = 0;
        let totalChecks = 1; // Length is always a check

        const hasLen = password.length >= p.minLen;
        html += `<li class="${hasLen ? 'met' : ''}">Minimum ${p.minLen} characters</li>`;
        if (hasLen) validChecks++;

        if (p.reqUpper) {
            totalChecks++;
            const hasUpper = /[A-Z]/.test(password);
            html += `<li class="${hasUpper ? 'met' : ''}">At least 1 uppercase letter</li>`;
            if (hasUpper) validChecks++;
        }
        if (p.reqLower) {
            totalChecks++;
            const hasLower = /[a-z]/.test(password);
            html += `<li class="${hasLower ? 'met' : ''}">At least 1 lowercase letter</li>`;
            if (hasLower) validChecks++;
        }
        if (p.reqNum) {
            totalChecks++;
            const hasNum = /[0-9]/.test(password);
            html += `<li class="${hasNum ? 'met' : ''}">At least 1 number</li>`;
            if (hasNum) validChecks++;
        }
        if (p.reqSym) {
            totalChecks++;
            const hasSym = /[^A-Za-z0-9]/.test(password);
            html += `<li class="${hasSym ? 'met' : ''}">At least 1 special character</li>`;
            if (hasSym) validChecks++;
        }

        passReqs.innerHTML = html;

        // Strength Meter Update
        const strengthPct = totalChecks === 0 ? 0 : (validChecks / totalChecks) * 100;
        strengthBar.style.width = `${strengthPct}%`;
        
        if (strengthPct === 0) {
            strengthBar.style.backgroundColor = 'var(--danger)';
            strengthLabel.innerText = 'Strength: Poor';
        } else if (strengthPct < 50) {
            strengthBar.style.backgroundColor = 'var(--warning)';
            strengthLabel.innerText = 'Strength: Weak';
        } else if (strengthPct < 100) {
            strengthBar.style.backgroundColor = '#6366f1'; // Indigo
            strengthLabel.innerText = 'Strength: Good';
        } else {
            strengthBar.style.backgroundColor = 'var(--success)';
            strengthLabel.innerText = 'Strength: Excellent';
        }

        // Enable/Disable Reg Button
        const passMatch = regPass.value === regConfirm.value && regPass.value !== '';
        regBtn.disabled = !(validChecks === totalChecks && passMatch && regUser.value.trim() !== '');
    };

    regPass.addEventListener('input', (e) => {
        updatePasswordRequirements(e.target.value);
    });

    regConfirm.addEventListener('input', () => {
        updatePasswordRequirements(regPass.value);
    });

    regUser.addEventListener('input', () => {
        updatePasswordRequirements(regPass.value);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = regUser.value.trim();
        const password = regPass.value;

        // Check if user exists
        if (state.db.find(u => u.username === username)) {
            showRegMsg('Username already exists!', 'error');
            return;
        }

        // Hash and Save
        const passwordHash = sha256_mock(password);
        state.db.push({
            username,
            email: regEmail.value.trim(),
            passwordHash,
            status: 'active',
            failedAttempts: 0
        });

        showRegMsg('User registered successfully!', 'success');
        updateDBView();
        registerForm.reset();
        updatePasswordRequirements('');
    });

    const showRegMsg = (msg, type) => {
        regMsg.innerText = msg;
        regMsg.className = `alert ${type}`;
        regMsg.classList.remove('hidden');
        setTimeout(() => regMsg.classList.add('hidden'), 3000);
    };

    // --- Database View ---
    const updateDBView = () => {
        if (state.db.length === 0) {
            dbRecords.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No users registered yet.</td></tr>';
            return;
        }

        dbRecords.innerHTML = state.db.map(u => `
            <tr>
                <td><strong>${u.username}</strong></td>
                <td><span class="badge ${u.status === 'active' ? 'badge-active' : 'badge-locked'}">${u.status.toUpperCase()}</span></td>
                <td>${u.failedAttempts}</td>
            </tr>
        `).join('');
    };

    // --- Authentication Simulation ---
    const resetSteps = () => {
        for (let i = 1; i <= 8; i++) {
            const step = document.getElementById(`step${i}`);
            step.className = 'step';
        }
    };

    const runStep = async (stepNum, isSuccess = true, errorMsg = '') => {
        const step = document.getElementById(`step${stepNum}`);
        step.classList.add('active');
        
        // Wait 1 second for simulation effect
        await new Promise(r => setTimeout(r, 1000));
        
        if (isSuccess) {
            step.classList.replace('active', 'success');
        } else {
            step.classList.replace('active', 'error');
            if (errorMsg) {
                step.querySelector('p').innerText = errorMsg;
            }
        }
    };

    const showResultOverlay = (type, title, desc) => {
        authResult.className = `auth-result ${type}`;
        authResult.querySelector('.result-title').innerText = title;
        authResult.querySelector('.result-desc').innerText = desc;
        authResult.classList.remove('hidden');
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (state.isSimulating) return;
        
        const username = loginUser.value.trim();
        const password = loginPass.value;

        state.isSimulating = true;
        loginBtn.disabled = true;
        authResult.classList.add('hidden');
        resetSteps();

        try {
            // Step 1: Login Request
            await runStep(1, true);

            // Step 2: Input Validation
            if (!username || !password) {
                await runStep(2, false, 'Missing credentials');
                showResultOverlay('error', 'Login Failed', 'Missing credentials.');
                return;
            }
            await runStep(2, true);

            // Step 3: User Lookup
            const user = state.db.find(u => u.username === username);
            if (!user) {
                await runStep(3, false, 'User not found in DB');
                showResultOverlay('error', 'Login Failed', 'User does not exist.');
                return;
            }
            await runStep(3, true);

            // Step 4: Status Check
            if (user.status === 'locked') {
                await runStep(4, false, 'Account is locked');
                showResultOverlay('locked', 'Account Locked', 'Please contact administrator.');
                return;
            }
            await runStep(4, true);

            // Step 5: Password Hashing
            const inputHash = sha256_mock(password);
            await runStep(5, true);

            // Step 6: Password Verification
            if (inputHash !== user.passwordHash) {
                await runStep(6, false, 'Hash mismatch');
                
                // Increase failed attempts
                user.failedAttempts++;
                if (user.failedAttempts >= state.policies.lockAttempts) {
                    user.status = 'locked';
                    updateDBView();
                    showResultOverlay('locked', 'Account Locked', `Maximum failed attempts (${state.policies.lockAttempts}) reached.`);
                } else {
                    updateDBView();
                    showResultOverlay('error', 'Login Failed', `Incorrect password. Attempt ${user.failedAttempts} of ${state.policies.lockAttempts}.`);
                }
                return;
            }
            await runStep(6, true);

            // Reset failed attempts on success
            user.failedAttempts = 0;
            updateDBView();

            // Step 7: Session Creation
            await runStep(7, true);

            // Step 8: Access Granted
            await runStep(8, true);
            showResultOverlay('success', 'Access Granted', 'Welcome to the Dashboard!');

        } finally {
            state.isSimulating = false;
            loginBtn.disabled = false;
        }
    });

    // Initialize
    updatePasswordRequirements('');
});
