// electron-builder afterPack hook: ad-hoc code-sign the final macOS app.
// Without an Apple Developer certificate the app would be left unsigned, and
// Apple Silicon Macs refuse to run unsigned apps ("is damaged"). An ad-hoc
// signature lets users open it via right-click → Open.
const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function (context) {
  if (context.electronPlatformName !== 'darwin') return;
  // Universal builds pack x64 and arm64 into temp dirs first; sign only the merged app.
  if (/-temp$/.test(context.appOutDir)) return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
  execFileSync('codesign', ['--verify', '--deep', '--strict', app], { stdio: 'inherit' });
};
