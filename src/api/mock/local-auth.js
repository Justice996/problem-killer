const STORE_KEY = 'mock.local.auth.store.v1'

const defaultStore = () => ({
  currentUserId: null,
  users: [
    {
      id: 'demo_admin',
      username: 'demo_admin',
      cid: '110101199001011234',
      realName: '演示用户',
      password: '12345678',
      status: 1,
      avatar: '',
      base: {
        cid: '110101199001011234',
        realName: '演示用户',
        gender: 1,
        hometown: '110000',
        nation: '汉族',
        education: '本科',
        time_Work: '2018-07-01',
        time_BirthDay: '1990-01-01',
        time_Party: '2010-01-01'
      },
      social: {
        phone: '13800138000',
        settle: { self: {}, lover: {}, parent: {}, loversParent: {}}
      },
      diy: {},
      company: { code: 'root', name: '演示单位' },
      companyOfManage: { code: 'root', name: '演示单位' },
      duties: { name: '职员', title: { name: '一级科员', code: 'title-1' }, titleDate: '2020-01-01' },
      application: { userName: 'demo_admin', email: '', invitedBy: 1 }
    }
  ],
  companies: [
    { code: 'root', name: '演示单位', parent: null },
    { code: 'dept-1', name: '技术部', parent: 'root' },
    { code: 'dept-2', name: '运营部', parent: 'root' }
  ],
  duties: [
    { code: 'duty-1', name: '职员', tag: '默认' },
    { code: 'duty-2', name: '主管', tag: '管理' }
  ],
  titles: [
    { code: 'title-1', name: '一级科员', tag: '行政' },
    { code: 'title-2', name: '二级科员', tag: '行政' }
  ]
})

export function getMockStore() {
  const raw = localStorage.getItem(STORE_KEY)
  if (!raw) {
    const seed = defaultStore()
    localStorage.setItem(STORE_KEY, JSON.stringify(seed))
    return seed
  }
  try {
    return JSON.parse(raw)
  } catch (e) {
    const seed = defaultStore()
    localStorage.setItem(STORE_KEY, JSON.stringify(seed))
    return seed
  }
}

export function saveMockStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function getCurrentUser() {
  const store = getMockStore()
  if (!store.currentUserId) return null
  return store.users.find(i => i.id === store.currentUserId) || null
}

export function setCurrentUser(userId) {
  const store = getMockStore()
  store.currentUserId = userId || null
  saveMockStore(store)
}

export function findUserByUsername(username) {
  return getMockStore().users.find(i => i.username === username)
}

export function findUserById(id) {
  return getMockStore().users.find(i => i.id === id)
}

export function findUserByCid(cid) {
  return getMockStore().users.find(i => i.cid === cid)
}

export function createOrUpdateUser(formData, { isNew }) {
  const store = getMockStore()
  const data = formData.Data || formData.data || {}
  const base = data.Base || {}
  const app = data.Application || {}
  const social = data.Social || { settle: {}}
  const companyRaw = data.Company || {}
  const userName = app.userName || data.userName
  let target = store.users.find(i => i.username === userName)

  if (isNew && target) {
    return { ok: false, error: { status: 12430, message: '账号已存在' }}
  }

  if (!target) {
    target = {
      id: userName,
      username: userName,
      status: 0
    }
    store.users.push(target)
  }

  target.cid = base.cid
  target.realName = base.realName
  target.password = data.password || target.password || ''
  target.base = { ...target.base, ...base, time_BirthDay: base.time_Birthday || base.time_BirthDay }
  target.social = { ...target.social, ...social }
  target.diy = { ...(target.diy || {}), ...(data.Diy || {}) }
  target.application = { ...(target.application || {}), ...app }
  target.company = companyRaw.company || target.company || { code: 'root', name: '演示单位' }
  target.companyOfManage = companyRaw.companyOfManage || target.company
  const duties = companyRaw.duties || {}
  const title = companyRaw.title || {}
  target.duties = {
    name: duties.name || '职员',
    title,
    titleDate: companyRaw.titleDate || null
  }
  if (isNew) target.status = 0

  saveMockStore(store)
  return { ok: true, data: { id: target.id }}
}

export function setUserRegisterStatus(username, valid) {
  const store = getMockStore()
  const target = store.users.find(i => i.username === username || i.id === username)
  if (!target) return false
  target.status = valid ? 1 : -1
  saveMockStore(store)
  return true
}

export function removeUser(userId) {
  const store = getMockStore()
  const idx = store.users.findIndex(i => i.id === userId || i.username === userId)
  if (idx < 0) return false
  store.users.splice(idx, 1)
  if (store.currentUserId === userId) store.currentUserId = null
  saveMockStore(store)
  return true
}
