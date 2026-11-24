(() => {
  'use strict';
  const button = document.getElementById('openLogin');
  const signIn = document.getElementById('googleSignIn');
  const signOut = document.getElementById('signOut');
  const dialog = document.getElementById('loginDialog');
  const status = document.getElementById('authStatus');
  const label = document.getElementById('profileLabel');
  const config = window.SUBMISSION_TRACKER_FIREBASE_CONFIG;
  const sdkBase = 'https://www.gstatic.com/firebasejs/12.19.0/';
  let auth;
  let sdk;
  let ready = false;
  let idleMessage = '';

  button.addEventListener('click', () => {
    status.textContent = idleMessage;
    dialog.showModal();
  });
  document.getElementById('closeLogin').addEventListener('click', () => dialog.close());

  function applyUser(user) {
    window.submissionTracker.switchProfile(user?.uid);
    label.textContent = user ? '当前账号 · ' + (user.displayName || 'Google') : '访客台账';
    button.hidden = Boolean(user);
    signOut.hidden = !user;
    if (user && dialog.open) dialog.close();
  }

  function signInMessage(code) {
    const messages = {
      'auth/popup-blocked': '浏览器拦截了授权弹窗。请允许此网页弹窗后重试。',
      'auth/popup-closed-by-user': '授权弹窗已关闭，可以重新登录。',
      'auth/unauthorized-domain': '当前域名尚未加入 Firebase Authentication 的授权域名。',
      'auth/operation-not-allowed': '请在 Firebase Authentication 中启用 Google 登录。',
      'auth/network-request-failed': '无法连接 Google 登录服务，请检查网络后重试。'
    };
    return messages[code] || 'Google 登录未完成。请检查 Firebase 配置后重试。';
  }

  signIn.addEventListener('click', async () => {
    if (!ready) return;
    signIn.disabled = true;
    status.textContent = '请在 Google 授权弹窗中选择账号。';
    try {
      const provider = new sdk.GoogleAuthProvider();
      provider.setCustomParameters({prompt:'select_account'});
      const result = await sdk.signInWithPopup(auth, provider);
      applyUser(result.user);
    } catch (error) {
      status.textContent = signInMessage(error.code);
    } finally {
      signIn.disabled = false;
    }
  });

  signOut.addEventListener('click', async () => {
    signOut.disabled = true;
    try {
      await sdk.signOut(auth);
      applyUser(null);
    } catch {
      alert('退出未完成，请重试。');
    } finally {
      signOut.disabled = false;
    }
  });

  async function initialize() {
    if (location.protocol === 'file:') {
      idleMessage = '本地文件可使用访客台账。Google 登录请使用已配置的 HTTPS 部署版。';
      status.textContent = idleMessage;
      return;
    }
    if (!config || !['apiKey','authDomain','projectId','appId'].every(key => typeof config[key] === 'string' && config[key].trim())) {
      idleMessage = 'Google 登录尚未配置。站点发布者可按 README 设置 Firebase，访客台账可直接使用。';
      status.textContent = idleMessage;
      return;
    }
    idleMessage = '正在连接 Google 登录服务…';
    status.textContent = idleMessage;
    try {
      const [appSdk, authSdk] = await Promise.all([
        import(sdkBase + 'firebase-app.js'),
        import(sdkBase + 'firebase-auth.js')
      ]);
      sdk = authSdk;
      auth = sdk.getAuth(appSdk.initializeApp(config));
      await sdk.setPersistence(auth, sdk.browserLocalPersistence);
      sdk.onAuthStateChanged(auth, applyUser);
      ready = true;
      idleMessage = '点击继续后，将打开 Google 授权弹窗。';
      status.textContent = idleMessage;
      signIn.disabled = false;
    } catch (error) {
      idleMessage = signInMessage(error.code);
      status.textContent = idleMessage;
    }
  }

  initialize();
})();
