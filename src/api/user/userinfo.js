import request from '@/utils/request'
import { cached_data } from '@/utils/cache'
import {
  findUserByCid,
  findUserById,
  findUserByUsername,
  getCurrentUser,
  getMockStore,
  saveMockStore
} from '@/api/mock/local-auth'
const api = 'users'
const urlGetUserSummary = `${api}/summary`
/**
 * 获取用户摘要信息
 *
 * @export
 * @param {*} id
 * @param {*} ignoreErr 是否忽略错误
 * @returns
 */
export function getUserSummary(id, ignoreErr) {
  const localUser = id ? findUserById(id) || findUserByUsername(id) : getCurrentUser()
  if (localUser) {
    return Promise.resolve({
      id: localUser.id,
      realName: localUser.realName,
      companyCode: localUser.company && localUser.company.code,
      companyName: localUser.company && localUser.company.name,
      dutiesRawType: (localUser.duties && localUser.duties.name) || '',
      about: '',
      isInvalidAccount: localUser.status
    })
  }
  if (id) return Promise.reject({ status: 404, message: '用户不存在' })
  const action = () =>
    request.get(urlGetUserSummary, {
      params: {
        id
      },
      ignoreError: ignoreErr
    })

  return id ? cached_data(`${urlGetUserSummary}/${id}`, action
  ) : action()
}
const urlGetUserBase = `${api}/base`
/**
 * 基础信息
 * @description > ``` response
   {
    Id:"",//用户唯一标识号，可为身份号或身份证号,
    RealName:"姓名",
    Company:"单位名称",//后续可能拓展为单位基础信息,
    职务:"职务名称",
  }
  ```
 */
export function getUserBase(id, ignoreErr) {
  const localUser = id ? findUserById(id) || findUserByUsername(id) : getCurrentUser()
  if (localUser) {
    return Promise.resolve({
      id: localUser.id,
      base: localUser.base || {}
    })
  }
  if (id) return Promise.reject({ status: 404, message: '用户不存在' })
  return cached_data(`${urlGetUserBase}/${id}`, () =>
    request.get(urlGetUserBase, {
      params: {
        id
      },
      ignoreError: ignoreErr
    })
  )
}

export function getUserDiy(id, ignoreErr) {
  const localUser = id ? findUserById(id) || findUserByUsername(id) : getCurrentUser()
  if (localUser) return Promise.resolve(localUser.diy || {})
  return request.get('users/diyinfo', {
    params: {
      id
    },
    ignoreError: ignoreErr
  })
}
/**
 * 社会关系 Get /Users/social
 * @description
 ```
 {
    Home:{//家庭
        zipCode://邮编
        Address://详细地址
    },
    Phone:联系方式
}
```
 */
export function getUserSocial(id, ignoreErr) {
  const localUser = id ? findUserById(id) || findUserByUsername(id) : getCurrentUser()
  if (localUser) return Promise.resolve(localUser.social || {})
  return request.get('users/social', {
    params: {
      id
    },
    ignoreError: ignoreErr
  })
}

/**
 * 职务信息 Get /Users/duties
 * @description
 ```
 {
    id:101
    Name:"干事"
 }
```
 */
export function getUserDuties(id, ignoreErr) {
  const localUser = id ? findUserById(id) || findUserByUsername(id) : getCurrentUser()
  if (localUser) return Promise.resolve(localUser.duties || {})
  return request.get('users/duties', {
    params: {
      id
    },
    ignoreError: ignoreErr
  })
}

/**
 * 获取用户系统信息
 *
 * @export
 * @param {*} id
 * @returns
 */
export function getUserApplication(id, ignoreErr) {
  const localUser = id ? findUserById(id) || findUserByUsername(id) : getCurrentUser()
  if (localUser) return Promise.resolve(localUser.application || {})
  return request.get('users/application', {
    params: {
      id
    },
    ignoreError: ignoreErr
  })
}

/**
 * 单位信息 Get /Users/company
 * @description
 ```
  {
      Company:{
          Name:"单位名称",
        Code:"ADJC1A22",
        Parent:"上级单位名称"
      },
      Duties:"职务名称"
  }
 ```
 */
export function getUserCompany(id, ignoreErr) {
  const localUser = id ? findUserById(id) || findUserByUsername(id) : getCurrentUser()
  if (localUser) {
    return Promise.resolve({
      company: localUser.company || {},
      companyOfManage: localUser.companyOfManage || localUser.company || {}
    })
  }
  return request.get('users/company', {
    params: {
      id
    },
    ignoreError: ignoreErr
  })
}

/**
 *通过身份证号查询身份号
 *
 * @export
 * @param {*} cid
 * @param {*} ignoreErr 是否忽略错误
 * @returns
 */
export function getUserIdByCid(cid, ignoreErr) {
  const localUser = findUserByCid(cid)
  if (localUser) {
    return Promise.resolve({
      id: localUser.id,
      base: localUser.base || {}
    })
  }
  return Promise.reject({ status: 404, message: '用户不存在' })
}

export function getUserIdByRealName({ realName, pageIndex, pageSize, ignoreErr, fuzz }) {
  const keyword = (realName || '').trim()
  if (!keyword) return Promise.resolve({ total: 0, list: [] })
  const users = getMockStore().users || []
  const list = users.filter(i => i.realName && i.realName.indexOf(keyword) > -1).map(i => {
    return { id: i.id, realName: i.realName }
  })
  return Promise.resolve({
    total: list.length,
    list
  })
}

const url_getUserAvatar = `${api}/avatar`
/**
 * 获取用户头像
 *
 * @export
 * @param {string} id 用户id，默认为当前用户
 * @param {guid} avatarId 头像id，默认为null
 * @returns
 */
export function getUserAvatar(id, avatarId, ignoreErr) {
  const localUser = id ? findUserById(id) || findUserByUsername(id) : getCurrentUser()
  if (localUser) {
    return Promise.resolve({
      url: localUser.avatar || ''
    })
  }
  return cached_data(`${url_getUserAvatar}/${id}/${avatarId}`, () =>
    request.get(url_getUserAvatar, {
      params: {
        userId: id,
        avatarId
      },
      ignoreError: ignoreErr
    })
  )
}

/**
 *修改用户头像
 *
 * @export
 * @param {*} newAvatar
 * @returns
 */
export function postUserAvatar(newAvatar, ignoreErr) {
  const store = getMockStore()
  const localUser = getCurrentUser()
  if (localUser && store.users) {
    const target = store.users.find(i => i.id === localUser.id)
    if (target) target.avatar = newAvatar
    saveMockStore(store)
    return Promise.resolve({ url: newAvatar })
  }
  return request.post('/users/avatar', {
    url: newAvatar
  }, {
    ignoreError: ignoreErr
  })
}

/**
 * 修改用户单位
 *
 * @export
 * @param {Array} modifies {
 *  userid 目标用户id或数组
 *  companyType 单位类型
 *  targetCompany 目标单位
 * }
 * @param {Object} auth 授权
 */
export function postUserCompany(modifies, auth) {
  return request.post('/users/usersCompany', {
    auth,
    data: modifies
  })
}
