window.__ModuleLoader__.load({
  id: '@gyxsza/approval-alert',
  factory(require) {
    let audio = null;

    function audioContext() {
      try {
        if (audio) return audio;
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        audio = new Ctor();
        return audio;
      } catch (e) {
        return null;
      }
    }

    // 新页面在用户第一次交互前无法出声；预创建 AudioContext 并挂一次性解锁。
    function unlockAudio() {
      const ac = audioContext();
      if (!ac) return;
      try {
        if (ac.state === 'suspended') ac.resume().catch(() => {});
      } catch (e) {
        /* 忽略 */
      }
    }

    function installUnlock() {
      ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => {
        try {
          window.addEventListener(ev, unlockAudio, { passive: true });
        } catch (e) {
          /* 忽略 */
        }
      });
    }

    // 兜底单音：即使 host 侧发声失败，也能听到一点。
    function playBeep() {
      try {
        const ac = audioContext();
        if (!ac) return;
        try {
          if (ac.state === 'suspended') ac.resume().catch(() => {});
        } catch (e) {
          /* 忽略 */
        }
        const t = ac.currentTime + 0.01;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.value = 988;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(t);
        osc.stop(t + 0.13);
      } catch (e) {
        /* 声音失败不阻断审批 */
      }
    }

    function ensureNotificationPermission() {
      try {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission === 'default') Notification.requestPermission().catch?.(() => {});
      } catch (e) {
        /* 忽略 */
      }
    }

    function notify(request) {
      try {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission !== 'granted') return;
        const toolName = (request && request.toolName) || '工具';
        new Notification('等待授权', {
          body: '工具「' + toolName + '」请求越权执行，需要你的批准',
          silent: false,
        });
      } catch (e) {
        /* 忽略 */
      }
    }

    return {
      inject: ['remote'],
      apply(ctx) {
        installUnlock();
        ensureNotificationPermission();
        // 注意：$on(event, listener) 只有两个参数，没有 prepend。
        ctx.remote.$on('approval/request', function (request, next) {
          playBeep();
          notify(request);
          return next();
        });
      },
    };
  },
});
