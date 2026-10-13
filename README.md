# Invoice Studio

A local desktop app for creating, saving, and printing invoices. Runs entirely on
your computer — no account, no internet, no cloud. Your invoices are stored locally
in the app.

Built with React + Vite + Tailwind, wrapped as a Windows and macOS desktop app with Electron.

## Install the app on Windows (the easy way)

1. Open the `release` folder.
2. Run **`Invoice Studio Setup 1.5.0.exe`**.
3. Follow the installer — it adds **Invoice Studio** to your Start menu and Desktop.
4. Launch it like any other program.

> Prefer not to install? The folder `release/win-unpacked/` contains a ready-to-run
> **`Invoice Studio.exe`** you can double-click directly (or copy anywhere you like).

Windows may show a "Windows protected your PC" SmartScreen notice because the app
isn't code-signed. Click **More info → Run anyway**.

## Install the app on a Mac

1. Go to the repo's **Releases** page on GitHub and open the latest
   **Invoice Studio … for Mac** release.
2. Download **`Invoice-Studio-1.5.0.dmg`** (one file for both Apple Silicon and Intel Macs).
3. Open the DMG and drag **Invoice Studio** into **Applications**.
4. First launch only: the app isn't notarized by Apple, so macOS blocks a plain
   double-click. **Right-click the app → Open → Open.** On macOS 15 or later, try to
   open it once, then go to **System Settings → Privacy & Security → Open Anyway**.

The DMG is built automatically on a GitHub-hosted Mac by
[`.github/workflows/build-mac.yml`](.github/workflows/build-mac.yml) on every push.
You can also run it by hand from the **Actions** tab (**Build macOS DMG → Run workflow**).
On a Mac, keyboard shortcuts use ⌘ instead of Ctrl (⌘S save, ⌘P print, ⌘V paste).

## Using it

- **New Invoice** — start a fresh invoice (left sidebar).
- **Import from Walmart screenshot** — at the top of the editor, click the dropzone to
  choose an image, drag an image onto it, or paste one with `Ctrl+V`. The app reads the
  Walmart order page **offline** (no internet, no account) and auto-fills the PO #,
  order #, item, price, quantity, tracking, ship method, customer name/address, tax, and
  date. **Always review** the filled fields before saving — the first scan takes a few
  seconds while the recognizer warms up.
- Fill in or correct the fields on the left; the document preview on the right updates live.
- **Credit Memo** — open a saved invoice and click **Credit Memo** in the toolbar to
  create a credit memo for it. It's pre-filled from the invoice, numbered `CM-…` to
  match (e.g. `INV-483920` → `CM-483920`), and references the original invoice number.
  Adjust the amount for partial credits, then save/print like any other document.
- **Save** (or `Ctrl+S`) — stores the invoice locally. Saved invoices appear in the
  sidebar; click any to reopen it.
- **Print / PDF** — opens the print dialog. Choose your printer, or pick
  "Save as PDF" / "Microsoft Print to PDF" to export a clean PDF.

### How the screenshot import works

Text recognition (Tesseract) runs entirely on your machine; the English language model
ships inside the app (`electron/tessdata/`). Nothing is uploaded anywhere. The parser in
[`src/walmartParser.ts`](src/walmartParser.ts) is tuned to the Walmart Marketplace order
page layout — if Walmart changes that layout, the field-matching there is what to adjust.
A regression test lives in [`test/parser.test.ts`](test/parser.test.ts).

## Developing / rebuilding

```bash
npm install        # one-time

npm run dev            # web dev server (browser) at http://localhost:5173
npm run electron:dev   # run inside the Electron window with live reload
npm run app            # build, then preview the production app in Electron
npm run dist           # build + package the Windows installer into release/
npm run dist:mac       # build + package the macOS .dmg into release/ (run on a Mac)
```

`npm run typecheck` and `npm run lint` are also available.

## Project layout

- `src/` — the React app
  - `types.ts` — the invoice data model + totals
  - `storage.ts` — local (browser `localStorage`) persistence
  - `components/` — `Sidebar`, `InvoiceEditor`, `InvoicePreview`, `Field`
- `electron/` — desktop shell (`main.cjs`, `preload.cjs`)
- `dist/` — built web assets (generated)
- `release/` — packaged Windows installer / macOS DMG (generated)
