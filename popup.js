class PairTracker {
    constructor() {
        this.pairs = [];
        this.init();
    }

    async init() {
        await this.applyThemeOnLoad(); // Apply theme first
        await this.loadPairs();
        this.setupEventListeners();
        this.setupImageHandlers();
        this.renderPairs();
        this.refreshAllPairs();
    }

    async applyThemeOnLoad() {
        try {
            const data = await chrome.storage.local.get('theme');
            const theme = data.theme || 'dark';
            document.body.classList.toggle('light-theme', theme === 'light');
        } catch (error) {
            console.error('Error applying theme:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('addPair').addEventListener('click', () => this.addPair());
        document.getElementById('refreshAll').addEventListener('click', () => this.refreshAllPairs());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('pairAddress').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.addPair(); });
        document.getElementById('pairName').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.addPair(); });

        // Use event delegation for both remove and link clicks
        document.getElementById('pairsList').addEventListener('click', (e) => {
            // Handle remove button click
            if (e.target.matches('.btn-remove')) {
                const pairId = e.target.dataset.id;
                this.removePair(pairId);
                return; // Stop further processing
            }

            // **NEW:** Handle pair item click to open URL
            const pairItem = e.target.closest('.pair-item.clickable');
            if (pairItem && pairItem.dataset.url) {
                chrome.tabs.create({ url: pairItem.dataset.url });
            }
        });
    }

    async loadPairs() {
        try {
            const result = await chrome.storage.local.get(['pairs']);
            this.pairs = result.pairs || [];
        } catch (error) {
            console.error('Error loading pairs:', error);
            this.pairs = [];
        }
    }

    async savePairs() {
        try {
            await chrome.storage.local.set({ pairs: this.pairs });
        } catch (error) {
            console.error('Error saving pairs:', error);
        }
    }

    async addPair() {
        const nameInput = document.getElementById('pairName');
        const addressInput = document.getElementById('pairAddress');
        const name = nameInput.value.trim();
        const address = addressInput.value.trim();

        if (!name || !address) return;
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return;
        if (this.pairs.some(p => p.address.toLowerCase() === address.toLowerCase())) return;

        const newPair = { id: Date.now().toString(), name, address, url: null }; // Ensure url property exists
        this.pairs.push(newPair);
        await this.savePairs();
        nameInput.value = '';
        addressInput.value = '';
        this.renderPairs();
        this.fetchPairData(newPair);
    }

    async removePair(pairId) {
        this.pairs = this.pairs.filter(pair => pair.id !== pairId);
        await this.savePairs();
        this.renderPairs();
    }

    async fetchPairData(pair) {
        const pairIndex = this.pairs.findIndex(p => p.id === pair.id);
        if (pairIndex === -1) return;
        Object.assign(this.pairs[pairIndex], { loading: true, error: null });
        this.renderPairs();

        try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/pulsechain/${pair.address}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!data.pair) throw new Error('No pair data found');
            
            // **MODIFIED:** Save the URL along with other data
            Object.assign(this.pairs[pairIndex], {
                priceUsd: data.pair.priceUsd || 'N/A',
                priceNative: data.pair.priceNative || 'N/A',
                imageUrl: data.pair.info?.imageUrl || null,
                url: data.pair.url || null, // Save the URL here
                error: null
            });
        } catch (error) {
            console.error('Error fetching pair data:', error);
            this.pairs[pairIndex].error = error.message;
        } finally {
            this.pairs[pairIndex].loading = false;
            await this.savePairs(); // Save the updated data (including the URL)
            this.renderPairs();
        }
    }

    async refreshAllPairs() {
        const refreshBtn = document.getElementById('refreshAll');
        const originalText = refreshBtn.textContent;
        refreshBtn.textContent = '🔄 Refreshing...';
        refreshBtn.disabled = true;

        await Promise.all(this.pairs.map(p => this.fetchPairData(p)));

        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
    }

    renderPairs() {
        const container = document.getElementById('pairsList');
        if (this.pairs.length === 0) {
            container.innerHTML = `<div class="empty-state">No pairs added yet. Add your first pair above!</div>`;
            return;
        }
        // **MODIFIED:** Add 'clickable' class and 'data-url' attribute if a URL exists
        container.innerHTML = this.pairs.map(pair => `
            <div class="pair-item ${pair.url ? 'clickable' : ''}" data-url="${pair.url || ''}" title="${pair.url ? 'Click to open on DexScreener' : ''}">
                <div class="pair-content">
                    <div class="pair-image">${this.renderPairImage(pair)}</div>
                    <div class="pair-info">
                        <div class="pair-name">${this.escapeHtml(pair.name)}</div>
                        <div class="pair-prices">
                            ${pair.loading ? `<span class="loading">Loading...</span>` :
                              pair.error ? `<span class="error">Error: ${this.escapeHtml(pair.error)}</span>` :
                              `USD: ${pair.priceUsd || 'N/A'} | Base: ${pair.priceNative || 'N/A'}`
                            }
                        </div>
                    </div>
                </div>
                <button class="btn-remove" data-id="${pair.id}" title="Remove Pair">✕</button>
            </div>
        `).join('');
    }

    renderPairImage(pair) {
        if (pair.loading) return '⏳';
        if (pair.imageUrl) return `<img class="pair-img" src="${this.escapeHtml(pair.imageUrl)}" alt="${this.escapeHtml(pair.name)}">`;
        return '💎';
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
    }

    openSettings() {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    }

    setupImageHandlers() {
        const container = document.getElementById('pairsList');
        container.addEventListener('load', e => {
            if (e.target.matches('.pair-img')) e.target.style.opacity = '1';
        }, true);
        container.addEventListener('error', e => {
            if (e.target.matches('.pair-img') && e.target.parentElement) {
                e.target.parentElement.innerHTML = '💎';
            }
        }, true);
    }
}

new PairTracker();