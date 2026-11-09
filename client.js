window.__ModuleLoader__.load({
  id: '@gyxsza/approval-alert',
  factory(require) {
    function playBeep() {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return;
        const ac = new Ctor();
        const t0 = ac.currentTime;
        [880, 880, 1174.66].forEach((freq, i) => {
          const t = t0 + i * 0.16;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + 0.15);
        });
        setTimeout(() => {
          try { ac.close(); } catch (e) { /* 忽略 */ }
        }, 1200);
      } catch (e) {
        /* 声音失败不阻断审批 */
      }
    }

    function ensureNotificationPermission() {
      try {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission === 'default') Notification.requestPermission();
      } catch (e) { /* 忽略 */ }
    }

    function notify(request) {
      try {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission !== 'granted') return;
        const toolName = (request && request.toolName) || '工具';
        new Notification('等待授权', {
          body: '工具「' + toolName + '」请求越权执行，需要你的批准',
          silent: false
        });
      } catch (e) { /* 忽略 */ }
    }

    return {
      inject: ['remote'],
      apply(ctx) {
        ensureNotificationPermission();
        ctx.remote.$on('approval/request', function (request, next) {
          playBeep();
          notify(request);
          return next();
        }, { prepend: true });
      }
    };
  }
});
