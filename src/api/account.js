import request from '../utils/request'
import rsa from '../utils/crypto/rsa'
import aes from '../utils/crypto/aes'
import {
  parseTime
} from '../utils'
import crypto from 'crypto'
import {
  createOrUpdateUser,
  findUserByUsername,
  getMockStore,
  removeUser as removeLocalUser,
  saveMockStore,
  setCurrentUser,
  setUserRegisterStatus
} from '@/api/mock/local-auth'

async function formatPsw(username, rawPsw) {
  if (rawPsw === passwordCache(username)) {
    rawPsw = aes.decrypt(getLoginSetting().password)
  }
  const md5 = crypto.createHash('md5')
  md5.update(username)
  var tmpraw = parseTime(new Date(), '{yyyy}{mm}{dd}') + rawPsw + md5.digest('hex')
  const r = await rsa.encrypt(tmpraw)
  return r
}
const dic_loginSetting = 'login.setting'
const dic_passwordCache = '##password.cache.inmemory##'
export function getLoginSetting() {
  var s = localStorage.getItem(dic_loginSetting)
  var p = JSON.parse(s)
  if (!p) p = {}
  return p
}
export function setLoginSetting(val) {
  if (!val) val = {}
  val.password = val.password === passwordCache(val.username) ? getLoginSetting().password : aes.encrypt(val.password)
  localStorage.setItem(dic_loginSetting, JSON.stringify(val))
}
export function passwordCache(username) {
  const c = crypto.createHash('sha1')
  return c.update(dic_passwordCache + username).digest('hex')
}
/**
 * 登录账号
 * @param { {
 * username: String,
 * password: any,
 * RememberMe: Boolean,
 * Verify: { Code: any }
 * } } params
 */
export async function login(params) {
  params.password = await formatPsw(params.username, params.password)
  const user = findUserByUsername(params.username)
  if (!user) {
    return Promise.reject({ status: 21000, message: '账号不存在' })
  }
  if (user.status === 0) {
    return Promise.reject({ status: 12440, message: '账号待审批' })
  }
  if (user.status === -1) {
    return Promise.reject({ status: 12450, message: '账号审批被退回' })
  }
  setCurrentUser(user.id)
  return Promise.resolve({
    id: user.id,
    username: user.username
  })
}

/**
 * 登出
 */
export function logout() {
  setCurrentUser(null)
  return Promise.resolve(true)
}

/**
 * 移除用户
 * @param { {
 * id: String,
 * Auth: {
 *   Code: String,
 *   AuthByUserID: String
 * }
 * } } params
 */
export function removeAccount(params) {
  const id = params && params.data && params.data.id
  const ok = removeLocalUser(id)
  if (!ok) return Promise.reject({ status: 404, message: '用户不存在' })
  return Promise.resolve(true)
}
/**
 * 恢复用户
 * @param { {
  * data: UserRemoveDataModel,
  * Auth: {
  *   Code: String,
  *   AuthByUserID: String
  * }
  * } } params
  */
export function restoreAccount(params) {
  return request({
    method: 'PUT',
    url: 'Account/Restore',
    data: params
  })
}
/**
 * 注册
 *
 * @export
 * @param {*} params
 * @returns
 */
export function regnew(params) {
  // 注册接口暂时不使用加密
  // params.password = formatPsw(params.username, params.password)
  // params.confirmpassword = formatPsw(params.username, params.confirmpassword)
  const result = createOrUpdateUser(params, { isNew: true })
  if (!result.ok) return Promise.reject(result.error)
  return Promise.resolve(result.data)
}

/**
 * 修改用户密码
 * @param {*} params
 */
export async function accountPassword(params) {
  const store = getMockStore()
  const user = store.users.find(i => i.id === params.id || i.username === params.id)
  if (!user) return Promise.reject({ status: 404, message: '用户不存在' })
  user.password = params.newPassword
  saveMockStore(store)
  return Promise.resolve(true)
}

/**
 * 获取用户信息
 * @description 在account的api中用来验证用户是否登录，并且实时更新用户的基本信息
 */
export function getUserInfo() {
  const store = getMockStore()
  const user = store.users.find(i => i.id === store.currentUserId)
  if (!user) return Promise.reject({ status: 401, message: '未登录' })
  return Promise.resolve({ id: user.id, base: user.base })
}

/**
 * 修改授权码
 * @param { {
 * NewKey: String,
 * ModifyUserId: String,
 * Auth: {
 *   Code: String,
 *   AuthByUserID: String,
 * },
 * } } params
 */
export function postAuthKey(params) {
  return request.post('account/AuthKey', params)
}

/**
 * 获取授权码
 */
export function getAuthKey(ignoreErr) {
  return request.get('account/AuthKey', {
    ignoreError: ignoreErr
  })
}

/**
 * 检查授权码正确性
 *
 * @export
 * @param {*} authByUserId
 * @param {*} code
 * @param {Boolean} ignoreErr
 * @returns
 */
export function checkAuthCode(authByUserId, code, ignoreErr) {
  return request.post('account/checkAuthCode', {
    Auth: {
      authByUserId,
      code
    }
  })
}

/**
 * 授权未认证用户，需要登录
 *
 * @export
 * @param {*} username
 * @param {*} valid
 */
export function authUserRegister(username, valid) {
  const ok = setUserRegisterStatus(username, valid)
  if (!ok) return Promise.reject({ status: 404, message: '用户不存在' })
  return Promise.resolve(true)
}

/**
 * 注册
 *
 * @export
 * @param {*} params
 * @returns
 */
export function modifyUser(params) {
  // 注册接口暂时不使用加密
  // params.password = formatPsw(params.username, params.password)
  // params.confirmpassword = formatPsw(params.username, params.confirmpassword)
  const result = createOrUpdateUser(params, { isNew: false })
  if (!result.ok) return Promise.reject(result.error)
  return Promise.resolve(result.data)
}

export function signIn(signInId) {
  return request.get('signIn/signIn', {
    params: {
      signInId
    }
  })
}

/**
 * 报告日志
 *
 * @export
 * @param {*} username
 * @param {*} msg
 * @param {*} rank Debug = 32,
    ///Infomation = 16,
    ///Warning = 8,
    ///Danger = 4,
    ///Disaster = 0
 * @returns
 */
export function report(username, msg, rank) {
  return request.post('log/report', {
    params: {
      username,
      message: msg,
      rank
    }
  })
}

/**
 * 查询时间范围内 日志
 *
 * @export
 * @param {*} username
 * @param {*} startDate
 * @param {*} endDate
 * @param {*} rankArr Debug = 32,
    ///Infomation = 16,
    ///Warning = 8,
    ///Danger = 4,
    ///Disaster = 0
 * @returns
 */
export function getReport(username, startDate, endDate, page, rankArr, ip, device, message) {
  var date = startDate === null || endDate === null ? null : {
    start: startDate,
    end: endDate
  }
  return request.post('log/query', {
    userName: {
      value: username
    },
    date,
    rank: rankArr === null ? null : {
      arrays: rankArr
    },
    ip: ip === null ? null : {
      arrays: ip
    },
    device: device === null ? null : {
      arrays: device
    },
    message: message === null ? null : {
      value: message
    },
    page
  })
}

/**
 * 获取日志等级字典
 *
 * @export
 * @returns
 */
export function getReportDic() {
  return request.get('log/logRankDictionary')
}

export function getUserActionOperationDic() {
  return request.get('log/userActionOperationDictionary')
}
