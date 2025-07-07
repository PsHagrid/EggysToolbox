# Eggys Toolbox

Aiman Toolbox is a minimal Chrome extension that adds a "Chat Exporter" panel to pages displaying chats. The exporter lets you select multiple conversations and download them as a ZIP archive of text files.

## Loading the extension
1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the upper right corner.
4. Choose **Load unpacked** and select the folder containing `manifest.json`.
5. The extension icon will appear in the toolbar.

## Supported pages
The exporter expects each conversation title to be an `<h4>` element with the messages immediately following in one or more `<pre>` blocks. Any page following this structure will work. Pages that do not use this markup will not be detected by the exporter.

## Using the exporter
1. Navigate to a supported page that lists conversations in the above format.
2. Click the extension icon. A draggable "Chat Exporter" panel should appear on the page.
3. Use the search field to filter conversations.
4. Click a title to select or deselect it, then press **Export Selected** to download a ZIP containing the chosen chats.

## Permissions and limitations
- `manifest.json` lists an empty `permissions` array, so the extension does not request special Chrome permissions.
- JSZip is loaded from `https://cdnjs.cloudflare.com`. If that CDN is blocked, exporting will not work.
- The exporter only works with pages that use `<h4>` and `<pre>` tags for chat logs; other layouts are unsupported.
