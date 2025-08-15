class PairTracker {
    constructor() {
        this.pairs = [];
        this.init();
    }

    async init() {
        await this.loadPairs();
        this.setupEventListeners();
        this.setupImageHandlers();
        this.renderPairs();
        // Auto-refresh data on popup open
        this.refreshAllPairs();
    }

    setupEventListeners() {
        document.getElementById('addPair').addEventListener('click', () => this.addPair());
        document.getElementById('refreshAll').addEventListener('click', () => this.refreshAllPairs());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());

        // Allow Enter key to add pair
        document.getElementById('pairAddress').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPair();
        });

        document.getElementById('pairName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPair();
        });

        // **FIX:** Use event delegation for remove buttons
        document.getElementById('pairsList').addEventListener('click', (e) => {
            if (e.target.matches('.btn-remove')) {
                const pairId = e.target.dataset.id;
                this.removePair(pairId);
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
            await chrome.storage.local.set({
                pairs: this.pairs
            });
        } catch (error) {
            console.error('Error saving pairs:', error);
        }
    }

    async addPair() {
        const nameInput = document.getElementById('pairName');
        const addressInput = document.getElementById('pairAddress');
        const name = nameInput.value.trim();
        const address = addressInput.value.trim();

        if (!name || !address) {
            this.showError('Both name and address are required!');
            return;
        }

        if (!this.isValidAddress(address)) {
            this.showError('Please enter a valid pair address (0x...)');
            return;
        }

        if (this.pairs.some(pair => pair.address.toLowerCase() === address.toLowerCase())) {
            this.showError('This pair address already exists!');
            return;
        }

        const newPair = {
            id: Date.now().toString(),
            name: name,
            address: address,
            priceUsd: null,
            priceNative: null,
            imageUrl: null,
            url: null,
            loading: false,
            error: null
        };

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

    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    async fetchPairData(pair) {
        const pairIndex = this.pairs.findIndex(p => p.id === pair.id);
        if (pairIndex === -1) return;

        this.pairs[pairIndex].loading = true;
        this.pairs[pairIndex].error = null;
        this.renderPairs();

        try {
            const apiUrl = `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${pair.address}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.pair) {
                this.pairs[pairIndex].priceUsd = data.pair.priceUsd || 'N/A';
                this.pairs[pairIndex].priceNative = data.pair.priceNative || 'N/A';
                this.pairs[pairIndex].imageUrl = data.pair.info?.imageUrl || null;
                this.pairs[pairIndex].url = data.pair.url || null;
                this.pairs[pairIndex].error = null;
            } else {
                throw new Error('No pair data found');
            }
        } catch (error) {
            console.error('Error fetching pair data:', error);
            this.pairs[pairIndex].error = error.message;
            this.pairs[pairIndex].priceUsd = null;
            this.pairs[pairIndex].priceNative = null;
            this.pairs[pairIndex].imageUrl = null;
            this.pairs[pairIndex].url = null;
        } finally {
            this.pairs[pairIndex].loading = false;
            await this.savePairs(); // Save updated data
            this.renderPairs();
        }
    }

    async refreshAllPairs() {
        const refreshBtn = document.getElementById('refreshAll');
        const originalText = refreshBtn.textContent;
        refreshBtn.textContent = '🔄 Refreshing...';
        refreshBtn.disabled = true;

        const promises = this.pairs.map(pair => this.fetchPairData(pair));
        await Promise.all(promises);

        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
    }

    renderPairs() {
        const container = document.getElementById('pairsList');
        if (this.pairs.length === 0) {
            container.innerHTML = '<div class="empty-state">No pairs added yet. Add your first pair above!</div>';
            return;
        }

        container.innerHTML = this.pairs.map(pair => `
            <div class="pair-item">
                <div class="pair-content">
                    <div class="pair-image ${pair.loading ? 'loading' : ''}">
                        ${this.renderPairImage(pair)}
                    </div>
                    <div class="pair-info">
                        <div class="pair-name">${this.escapeHtml(pair.name)}</div>
                        <div class="pair-prices">
                            ${pair.loading ? 
                                '<span class="loading">Loading...</span>' : 
                            pair.error ? 
                                `<span class="error">Error: ${this.escapeHtml(pair.error)}</span>` :
                                `USD: ${pair.priceUsd || 'N/A'} | Base: ${pair.priceNative || 'N/A'}`
                            }
                        </div>
                    </div>
                </div>
                <button class="btn-remove" data-id="${pair.id}">✕</button>
            </div>
        `).join('');
    }

    renderPairImage(pair) {
        if (pair.loading) {
            return '⏳';
        }
        if (pair.imageUrl) {
            // **FIX:** Removed inline onload/onerror. Added 'pair-img' class for the delegated handler.
            return `<img class="pair-img" src="${this.escapeHtml(pair.imageUrl)}" alt="${this.escapeHtml(pair.name)}">`;
        }
        return '💎';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
            background: #ff6b6b; color: white; padding: 8px 16px;
            border-radius: 6px; font-size: 12px; z-index: 1000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 3000);
    }

    openSettings() {
        const url = chrome.runtime.getURL('settings.html');
        chrome.tabs.create({ url });
    }

    setupImageHandlers() {
        const container = document.getElementById('pairsList');

        // **FIX:** Delegated event listener for successful image loads.
        // The 'true' uses the "capture" phase, necessary for load/error events on images.
        container.addEventListener('load', (e) => {
            if (e.target.matches('.pair-img')) {
                e.target.style.opacity = '1';
            }
        }, true);

        // **FIX:** Delegated event listener for failed image loads.
        container.addEventListener('error', (e) => {
            if (e.target.matches('.pair-img')) {
                const parent = e.target.parentElement;
                if (parent) {
                    parent.innerHTML = '💎'; // Fallback icon
                }
            }
        }, true);
    }
}

// Initialize the tracker
new PairTracker();