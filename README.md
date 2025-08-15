# DexScreener Pair Tracker Chrome Extension By @AmirBaha2ri

A Chrome extension that tracks cryptocurrency pairs from the DexScreener API on PulseChain. Users can add multiple pair addresses with custom names and monitor their USD and native token prices.

Any questions? Contact: t.me/amirbaha2ri

## Features

- ✅ Add/remove cryptocurrency pairs with custom names
- ✅ Real-time price tracking (USD and Base/Native prices)
- ✅ Data persistence using Chrome's local storage
- ✅ Clean, modern UI with glassmorphism design
- ✅ Auto-refresh functionality
- ✅ Error handling and loading states
- ✅ Input validation for pair addresses

## Installation

1. **Download the extension files:**
   - `manifest.json`
   - `popup.html`
   - `popup.js`

2. **Install in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the folder containing your extension files
   - The extension will appear in your toolbar

## Usage

1. **Click the extension icon** in your Chrome toolbar to open the popup

2. **Add a new pair:**
   - Enter a descriptive name for the pair (e.g., "Incentive Token")
   - Enter the pair address (must start with 0x and be 42 characters long)
   - Click "Add Pair" or press Enter

3. **View pair data:**
   - Each pair shows the custom name, USD price, and native token price
   - Data refreshes automatically when you open the popup

4. **Manage pairs:**
   - Click the "✕" button to remove a pair
   - Click "🔄 Refresh All Pairs" to update all data

## API Integration

The extension uses the DexScreener API:
```
https://api.dexscreener.com/latest/dex/pairs/pulsechain/{pairAddress}
```

**Data extracted:**
- `pair.priceUsd` → USD price
- `pair.priceNative` → Base/Native token price

## Technical Details

### Permissions Required
- `storage` - For saving pair addresses locally
- `activeTab` - For extension popup functionality  
- `https://api.dexscreener.com/*` - For API access

### Storage
- Uses Chrome's `chrome.storage.local` API
- Data persists between browser sessions
- No server-side storage required

## Error Handling

- **Invalid addresses**: Validates 0x format and 40-character length
- **Duplicate pairs**: Prevents adding the same address twice
- **API errors**: Displays user-friendly error messages
- **Network issues**: Shows loading states and retry options

## Customization

The extension can be easily modified to:
- Support other blockchain networks (change the API URL)
- Add more data fields (volume, liquidity, etc.)
- Implement different refresh intervals
- Add export/import functionality for pair lists

## Troubleshooting

**Extension doesn't load:**
- Ensure all files are in the same directory
- Check that Developer mode is enabled in Chrome extensions

**API not working:**
- Verify internet connection
- Check if the DexScreener API is accessible
- Ensure pair addresses are valid and exist on PulseChain

**Data not persisting:**
- Check Chrome storage permissions
- Try reloading the extension

## Example Pair Address
```
0xf808Bb6265e9Ca27002c0A04562Bf50d4FE37EAA
```
This is the Incentive (INC) / Wrapped Pulse (WPLS) pair used as an example in the original request.