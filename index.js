import { exec } from 'node:child_process';

export const name = 'approval-alert';

function beep() {
  try {
    if (process.platform === 'win32') {
      exec(
        'powershell.exe -NoProfile -NonInteractive -Command "[console]::beep(880,120);[console]::beep(880,120);[console]::beep(1175,160)"',
        { windowsHide: true, timeout: 5000 },
        () => {},
      );
    } else if (process.platform === 'darwin') {
      exec('afplay /System/Library/Sounds/Glass.aiff', () => {});
    } else {
      exec('printf "\\a"', () => {});
    }
  } catch (e) {
    /* 声音失败不阻断审批 */
  }
}

export function apply(ctx) {
  // 审批 UI 是 approval/request waterfall 里的一个 answerer，正常回答时不会调用 next()，
  // 所以只注册在它后面的监听器永远不会执行。prepend 让本监听器排在瀑布链最前，
  // 在用户看到审批卡之前就发声。
  ctx.on('approval/request', function (request, next) {
    beep();
    return next();
  }, { prepend: true });
}
