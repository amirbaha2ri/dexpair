# DexScreener Pair Tracker - Chrome Extension

A lightweight and easy-to-use Chrome extension for tracking cryptocurrency pairs from DexScreener, specifically configured for the PulseChain network.

## 🚀 Features

* **Add Pairs by Address:** Easily add any token pair by providing a custom name and its contract address.
* **Real-time Price Updates:** Fetches the latest USD and native token prices directly from the DexScreener API.
* **Token Images:** Automatically displays the token's image where available.
* **Selectable Themes:** Choose between a sleek dark theme and a clean light theme to match your preference.
* **Data Management:** Simple settings page to export your list of pairs as a JSON backup or clear all data to start fresh.
* **Secure & Private:** All data is stored locally on your machine using `chrome.storage.local`.

---

## 🛠️ Installation

Since this extension is not on the Chrome Web Store, you need to load it manually in Developer Mode.

1.  **Download the Files:** Make sure you have all the project files (`manifest.json`, `popup.html`, `popup.js`, `settings.html`, `settings.js`, and the `img` folder) in a single directory on your computer.
2.  **Open Chrome Extensions:**
    * Open Google Chrome.
    * Navigate to `chrome://extensions` or click the three-dot menu → **Extensions** → **Manage Extensions**.
3.  **Enable Developer Mode:**
    * In the top-right corner of the Extensions page, toggle the **"Developer mode"** switch to **On**.
4.  **Load the Extension:**
    * Click the **"Load unpacked"** button that appears on the top-left.
    * In the file selection dialog, navigate to the directory where you saved the extension files and select it.
5.  **Done!** The "DexScreener Pair Tracker" extension should now appear in your extensions list and in your Chrome toolbar.

---

## ⚙️ How to Use

1.  **Pin the Extension:** Click the puzzle piece icon in your Chrome toolbar and then click the pin icon next to "DexScreener Pair Tracker" to keep it visible.
2.  **Adding a Pair:**
    * Click the extension icon to open the popup.
    * Enter a custom name (e.g., "Incentive Token") and the pair's contract address (`0x...`).
    * Click **"Add Pair"**. The pair will be added to your list and its data will be fetched immediately.
3.  **Refreshing Data:**
    * The extension automatically refreshes all pairs every time you open the popup.
    * To manually update, click the **"Refresh All Pairs"** button at the bottom.
4.  **Managing Settings:**
    * Click the gear icon (`⚙️`) in the top-right of the popup to open the settings page.
    * In settings, you can:
        * **Change the Theme:** Select between Light and Dark mode.
        * **Export Data:** Generate a JSON backup of your saved pairs.
        * **Clear Data:** Permanently delete all saved pairs.

---

## 📂 Project Files

* `manifest.json`: The core configuration file for the Chrome extension. Defines permissions, popup behavior, and icons.
* `popup.html`: The HTML structure for the main popup window.
* `popup.js`: Handles all logic for the popup, including adding/removing pairs and fetching data from the API.
* `settings.html`: The HTML structure for the settings page.
* `settings.js`: Manages the logic for the settings page, including theme selection and data management.
* `/img/`: A folder containing the icons for the extension (`dexpair-16.png`, `dexpair-48.png`, `dexpair-128.png`).

---

## 💬 Contact

For any questions, feedback, or support, feel free to reach out:

* **Telegram:** [t.me/amirbaha2ri](https://t.me/amirbaha2ri)
* **LinkedIn:** [linkedin.com/in/amirbaha2ri](https://www.linkedin.com/in/amirbaha2ri)
