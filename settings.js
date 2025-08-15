document.addEventListener('DOMContentLoaded', () => {
    const totalPairsEl = document.getElementById('totalPairs');
    const storageUsedEl = document.getElementById('storageUsed');
    const exportPairsBtn = document.getElementById('exportPairs');
    const copyPairsBtn = document.getElementById('copyPairs');
    const pairsExportEl = document.getElementById('pairsExport');
    const clearDataBtn = document.getElementById('clearData');
    const confirmClearBtn = document.getElementById('confirmClear');
    const successMessageEl = document.getElementById('successMessage');
    const backButton = document.getElementById('backButton');
    const themeRadios = document.querySelectorAll('input[name="theme"]');

    let currentPairs = [];

    // --- THEME FUNCTIONS ---
    function applyTheme(theme) {
        document.body.classList.toggle('light-theme', theme === 'light');
    }

    async function handleThemeChange(event) {
        const selectedTheme = event.target.value;
        await chrome.storage.local.set({ theme: selectedTheme });
        applyTheme(selectedTheme);
    }

    // --- INITIALIZATION ---
    async function init() {
        const data = await chrome.storage.local.get(['pairs', 'theme']);
        
        // Load and apply theme first
        const currentTheme = data.theme || 'dark';
        applyTheme(currentTheme);
        document.querySelector(`input[name="theme"][value="${currentTheme}"]`).checked = true;

        // Load pairs and update stats
        currentPairs = data.pairs || [];
        updateStats();
    }

    function updateStats() {
        totalPairsEl.textContent = currentPairs.length;
        chrome.storage.local.getBytesInUse(['pairs'], (bytes) => {
            storageUsedEl.textContent = `${(bytes / 1024).toFixed(2)} KB`;
        });
    }

    function showSuccessMessage(message) {
        successMessageEl.textContent = message;
        successMessageEl.classList.remove('hidden');
        setTimeout(() => {
            successMessageEl.classList.add('hidden');
        }, 3000);
    }

    // --- EVENT LISTENERS ---
    exportPairsBtn.addEventListener('click', () => {
        pairsExportEl.textContent = currentPairs.length > 0 
            ? JSON.stringify(currentPairs.map(p => ({ name: p.name, address: p.address })), null, 2)
            : 'No pairs to export.';
        pairsExportEl.classList.remove('hidden');
        copyPairsBtn.classList.remove('hidden');
    });

    copyPairsBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(pairsExportEl.textContent).then(() => {
            showSuccessMessage('Copied to clipboard!');
            copyPairsBtn.textContent = '✅ Copied!';
            setTimeout(() => { copyPairsBtn.textContent = '📋 Copy to Clipboard'; }, 2000);
        });
    });

    clearDataBtn.addEventListener('click', () => {
        clearDataBtn.classList.add('hidden');
        confirmClearBtn.classList.remove('hidden');
    });

    confirmClearBtn.addEventListener('click', async () => {
        await chrome.storage.local.remove('pairs'); // Only remove pairs, not theme
        currentPairs = [];
        updateStats();
        pairsExportEl.textContent = '';
        pairsExportEl.classList.add('hidden');
        copyPairsBtn.classList.add('hidden');
        confirmClearBtn.classList.add('hidden');
        clearDataBtn.classList.remove('hidden');
        showSuccessMessage('All pair data has been cleared!');
    });

    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.getCurrent(tab => chrome.tabs.remove(tab.id));
    });

    themeRadios.forEach(radio => radio.addEventListener('change', handleThemeChange));

    init();
});