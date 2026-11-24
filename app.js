  const defaultJournals = [
    { name:'MDPI', platform:'SuSy 投稿系统', site:'https://www.mdpi.com/', author:'https://susy.mdpi.com/' },
    { name:'PNAS', platform:'PNAS Central', site:'https://www.pnas.org/', author:'https://www.pnascentral.org/' },
    { name:'Journal of the Asia Pacific Economy', platform:'Taylor & Francis 投稿系统', site:'https://www.tandfonline.com/journals/rjap20', author:'https://rp.tandfonline.com/dashboard/' },
    { name:'Technology in Society', platform:'Elsevier Editorial Manager', site:'https://www.sciencedirect.com/journal/technology-in-society', author:'https://www.editorialmanager.com/TECHIS' },
    { name:'Growth and Change', platform:'Wiley Authors', site:'https://onlinelibrary.wiley.com/journal/14682257', author:'https://authors.wiley.com/dashboard' },
    { name:'Humanities and Social Sciences Communications', platform:'Springer Nature · Your research', site:'https://www.nature.com/palcomms/', author:'https://link.springernature.com/home/' }
  ];

  const namespace = 'submission-tracker:v1:' + location.pathname.replace(/\/index\.html$/, '/');
  const fieldNames = ['title','journal','number','status','date','url','note'];
  const limits = {title:280,journal:140,number:90,status:100,date:10,url:4096,note:480};
  const byId = id => document.getElementById(id);
  const form = byId('recordForm');
  const dialog = byId('recordDialog');
  const portalForm = byId('portalForm');
  const portalDialog = byId('portalDialog');
  const memory = new Map();
  let profile = 'guest';
  let activeRecordId = '';
  let activePortalName = '';

  function element(tag, text, cls) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }
  function action(label, cls, handler) {
    const button = element('button', label, cls);
    button.type = 'button';
    button.addEventListener('click', handler);
    return button;
  }
  function safeUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return '';
      for (const key of [...url.searchParams.keys()]) {
        if (/^(utm_.+|adobe_mc|mc_eid|fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
      }
      return url.href;
    } catch { return ''; }
  }
  function link(label, address, cls) {
    const anchor = element('a', label, cls);
    anchor.href = address;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    return anchor;
  }
  function getJournal(name) {
    return journals.find(j => j.name.toLowerCase() === name.toLowerCase());
  }
  function report(message, isError=false) {
    const feedback = byId('feedback');
    feedback.textContent = message;
    feedback.classList.toggle('error',isError);
  }
  function newId() {
    return globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  function clean(record) {
    const result = {id: typeof record.id === 'string' && /^[a-z0-9-]{1,80}$/i.test(record.id) ? record.id : newId()};
    for (const name of fieldNames) result[name] = typeof record[name] === 'string' ? record[name].trim().slice(0,limits[name]) : '';
    result.url = safeUrl(result.url);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(result.date)) result.date = '';
    if (!result.title || !result.journal) throw new Error('每条稿件记录都需要题目和期刊名称。');
    return result;
  }
  function cleanPortal(record) {
    const name = typeof record.name === 'string' ? record.name.trim().slice(0,140) : '';
    const platform = typeof record.platform === 'string' ? record.platform.trim().slice(0,140) : '';
    const author = typeof record.author === 'string' ? safeUrl(record.author.slice(0,4096).trim()) : '';
    const site = typeof record.site === 'string' ? safeUrl(record.site.slice(0,4096).trim()) : '';
    if (!name || !author) throw new Error('请填写入口名称和有效的 HTTPS 投稿后台链接。');
    if (record.site && !site) throw new Error('请提供有效的 HTTPS 官网链接。');
    return {name, platform, author, site};
  }
  function storageKey() { return namespace + ':' + profile; }
  function readProfile() {
    if (memory.has(profile)) return memory.get(profile);
    try {
      const saved = localStorage.getItem(storageKey());
      if (saved === null) return {records:[], journals:[...defaultJournals]};
      const items = JSON.parse(saved);
      return {records:items.records.map(clean), journals:items.journals.map(cleanPortal)};
    } catch {
      report('无法读取本地存储。可导入备份，或使用导出功能保留本次记录。',true);
      return {records:[], journals:[...defaultJournals]};
    }
  }
  let {records, journals} = readProfile();

  function saveRecords() {
    const data = {records,journals};
    try {
      localStorage.setItem(storageKey(), JSON.stringify(data));
      memory.delete(profile);
      report('已保存到当前浏览器。更换浏览器或移动文件前，可先导出备份。');
    } catch {
      memory.set(profile,data);
      report('当前浏览器无法持久保存。请导出备份，以便下次打开时导入。',true);
    }
    drawPortals();
    drawRecords();
  }
  function drawPortals() {
    const cards = byId('portals'), datalist = byId('journalList');
    cards.replaceChildren();
    datalist.replaceChildren();
    if (!journals.length) cards.append(element('p','还没有投稿入口。点击「新增入口」添加。','empty'));
    for (const journal of journals) {
      const card = element('article',undefined,'portal');
      const title = element('div');
      title.append(element('h3',journal.name));
      if (journal.platform) title.append(element('p',journal.platform));
      const actions = element('div',undefined,'actions');
      actions.append(link('作者后台 ↗',journal.author,'button primary'));
      if (journal.site) actions.append(link('官网 ↗',journal.site,'button'));
      actions.append(action('编辑','',() => openPortal(journal)));
      card.append(title,actions);
      cards.append(card);
      const option = element('option');
      option.value = journal.name;
      datalist.append(option);
    }
  }
  function drawRecords() {
    const list = byId('records');
    list.replaceChildren();
    if (!records.length) {
      list.append(element('p','还没有稿件记录。点击「新增稿件」添加。','empty'));
      return;
    }
    for (const record of [...records].sort((a,b) => b.date.localeCompare(a.date))) {
      const row = element('article',undefined,'record grid');
      const title = element('div');
      title.append(element('p',record.title,'entry-title'), element('p',[record.journal,record.number].filter(Boolean).join(' · '),'small'));
      if (record.note) title.append(element('p',record.note,'small'));
      const status = element('div');
      status.append(element('p','手动记录状态','label'),element('span',record.status || '未记录','status'));
      const date = element('div');
      date.append(element('p','状态日期','label'),element('span',record.date || '未填写'));
      const actions = element('div',undefined,'actions');
      const author = getJournal(record.journal)?.author;
      if (record.url) actions.append(link('打开稿件 ↗',record.url,'button'));
      else if (author) actions.append(link('打开后台 ↗',author,'button'));
      actions.append(action('编辑','',() => openForm(record)),action('删除','danger',() => {
        if (!window.confirm('删除这条本地稿件记录？')) return;
        records = records.filter(item => item.id !== record.id);
        saveRecords();
      }));
      row.append(title,status,date,actions);
      list.append(row);
    }
  }
  function openForm(record) {
    form.reset();
    activeRecordId = record?.id || '';
    byId('formTitle').textContent = record ? '编辑稿件' : '新增稿件';
    byId('formError').textContent = '';
    if (record) for (const name of fieldNames) form.elements.namedItem(name).value = record[name];
    dialog.showModal();
    form.elements.namedItem('title').focus();
  }

  function openPortal(journal) {
    portalForm.reset();
    activePortalName = journal?.name || '';
    byId('portalFormTitle').textContent = journal ? '编辑投稿入口' : '新增投稿入口';
    byId('deletePortal').hidden = !journal;
    byId('portalError').textContent = '';
    if (journal) for (const key of ['name','author','site','platform']) portalForm.elements.namedItem(key).value = journal[key];
    portalDialog.showModal();
    portalForm.elements.namedItem('name').focus();
  }
  byId('addPortal').addEventListener('click', () => openPortal());
  byId('cancelPortal').addEventListener('click', () => portalDialog.close());
  byId('deletePortal').addEventListener('click',() => {
    if (!window.confirm('删除这个投稿入口？稿件记录仍会保留。')) return;
    journals = journals.filter(j => j.name !== activePortalName);
    saveRecords();
    portalDialog.close();
  });
  portalForm.addEventListener('submit',event => {
    event.preventDefault();
    try {
      const journal = cleanPortal(Object.fromEntries(new FormData(portalForm)));
      const duplicate = getJournal(journal.name);
      if (duplicate && duplicate.name !== activePortalName) throw new Error('这个投稿入口已经存在。');
      if (activePortalName) {
        journals = journals.map(j => j.name === activePortalName ? journal : j);
        records = records.map(r => r.journal.toLowerCase() === activePortalName.toLowerCase() ? {...r,journal:journal.name} : r);
      } else {
        journals = [...journals,journal];
      }
      saveRecords();
      portalDialog.close();
    } catch (error) { byId('portalError').textContent = error.message; }
  });

  byId('addRecord').addEventListener('click', () => openForm());
  byId('cancelRecord').addEventListener('click',() => dialog.close());
  form.addEventListener('submit',event => {
    event.preventDefault();
    try {
      const entry = Object.fromEntries(new FormData(form));
      if (entry.url.trim() && !safeUrl(entry.url.trim())) throw new Error('请输入有效的 HTTPS 稿件链接。');
      const record = clean({...entry,id:activeRecordId});
      if (activeRecordId) records = records.map(item => item.id === record.id ? record : item);
      else records = [...records,record];
      saveRecords();
      dialog.close();
    } catch (error) { byId('formError').textContent = error.message; }
  });
  byId('exportRecords').addEventListener('click',() => {
    const backup = new Blob([JSON.stringify({version:2,records,journals},null,2)],{type:'application/json'});
    const url = URL.createObjectURL(backup);
    const node = element('a');
    node.href = url;
    node.download = '投稿记录备份.json';
    document.body.append(node);
    node.click();
    node.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    report('已发起下载。备份文件包含稿件信息，请自行保管。');
  });
  byId('importRecords').addEventListener('click',() => byId('backupFile').click());
  byId('backupFile').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    const startingProfile = profile;
    try {
      if (file.size > 2_000_000) throw new Error();
      const backup = JSON.parse(await file.text());
      if (startingProfile !== profile) {
        report('账号已切换，请在目标台账中重新导入。',true);
        return;
      }
      if (![1,2].includes(backup.version) || !Array.isArray(backup.records)) throw new Error();
      const incoming = backup.records.map(clean);
      const incomingJournals = backup.version === 2 ? backup.journals.map(cleanPortal) : [];
      if (!window.confirm('导入 ' + incoming.length + ' 条记录？已有记录将以备份中的对应内容更新。')) return;
      const merged = new Map(records.map(item => [item.id,item]));
      for (const record of incoming) merged.set(record.id,record);
      records = [...merged.values()];
      const mergedJournals = new Map(journals.map(j => [j.name.toLowerCase(),j]));
      for (const journal of incomingJournals) mergedJournals.set(journal.name.toLowerCase(),journal);
      journals = [...mergedJournals.values()];
      saveRecords();
    } catch { report('无法导入。请选择台账导出的 JSON 备份文件。',true); }
    finally { event.target.value = ''; }
  });
  window.submissionTracker = {
    switchProfile(userId) {
      const next = userId ? 'google-' + encodeURIComponent(userId) : 'guest';
      if (next === profile) return;
      if (dialog.open) dialog.close();
      if (portalDialog.open) portalDialog.close();
      profile = next;
      report('状态手动更新。当前台账保存在此浏览器。');
      ({records,journals} = readProfile());
      drawPortals();
      drawRecords();
    }
  };
  drawPortals();
  drawRecords();
