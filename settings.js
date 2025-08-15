document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENT SELECTORS ---
    const totalPairsEl = document.getElementById('totalPairs');
    const storageUsedEl = document.getElementById('storageUsed');
    const exportPairsBtn = document.getElementById('exportPairs');
    const copyPairsBtn = document.getElementById('copyPairs');
    const pairsExportEl = document.getElementById('pairsExport');
    const clearDataBtn = document.getElementById('clearData');
    const confirmClearBtn = document.getElementById('confirmClear');
    const successMessageEl = document.getElementById('successMessage');
    const backButton = document.getElementById('backButton');

    let currentPairs = [];

    // --- INITIALIZATION ---
    async function init() {
        const data = await chrome.storage.local.get(['pairs']);
        currentPairs = data.pairs || [];
        updateStats();
    }

    // --- UI UPDATE FUNCTIONS ---
    function updateStats() {
        totalPairsEl.textContent = currentPairs.length;
        chrome.storage.local.getBytesInUse(['pairs'], (bytes) => {
            const kb = (bytes / 1024).toFixed(2);
            storageUsedEl.textContent = `${kb} KB`;
        });
    }

    function showSuccessMessage(message) {
        successMessageEl.textContent = message;
        successMessageEl.style.display = 'block';
        setTimeout(() => {
            successMessageEl.style.display = 'none';
        }, 3000);
    }

    // --- EVENT LISTENERS ---
    exportPairsBtn.addEventListener('click', () => {
        if (currentPairs.length === 0) {
            pairsExportEl.textContent = 'No pairs to export.';
        } else {
            const exportData = currentPairs.map(p => ({ name: p.name, address: p.address }));
            pairsExportEl.textContent = JSON.stringify(exportData, null, 2);
        }
        pairsExportEl.classList.remove('hidden');
        copyPairsBtn.classList.remove('hidden');
    });

    copyPairsBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(pairsExportEl.textContent).then(() => {
            showSuccessMessage('Copied to clipboard!');
            copyPairsBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyPairsBtn.textContent = '📋 Copy to Clipboard';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy. Please copy manually.');
        });
    });

    clearDataBtn.addEventListener('click', () => {
        clearDataBtn.classList.add('hidden');
        confirmClearBtn.classList.remove('hidden');
    });

    confirmClearBtn.addEventListener('click', async () => {
        await chrome.storage.local.clear();
        currentPairs = [];
        updateStats();
        pairsExportEl.textContent = '';
        pairsExportEl.classList.add('hidden');
        copyPairsBtn.classList.add('hidden');
        confirmClearBtn.classList.add('hidden');
        clearDataBtn.classList.remove('hidden');
        showSuccessMessage('All data has been cleared!');
    });

    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Closes the current tab (the settings page)
        chrome.tabs.getCurrent(tab => {
            chrome.tabs.remove(tab.id);
        });
    });

    // --- START EXECUTION ---
    init();
});