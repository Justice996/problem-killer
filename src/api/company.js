import request from '@/utils/request'
import { cached_data } from '@/utils/cache'
import { getMockStore } from '@/api/mock/local-auth'
const api = 'company'
/**
 * 获取单位的子单位
 *
 * @export
 * @param {string} id 单位id
 * @returns
 * {array} list:
 *  {json} list[i]:
 *      {string} list[i].name:""
 *      {string} list[i].code:""
 */
export function companyChild(id) {
  const store = getMockStore()
  if (store && store.companies) {
    const list = store.companies
      .filter(i => (i.parent || null) === (id || null))
      .map(i => ({ code: i.code, name: i.name }))
    return Promise.resolve({ list })
  }
  return request.get(`${api}/companyChild`, {
    params: {
      id: id
    }
  })
}

const urlCompanyDetail = `${api}/detail`
/**
* 获取单位信息
*
* @export
* @param {*} id
*/
export function companyDetail(id) {
  const store = getMockStore()
  if (store && store.companies) {
    const model = store.companies.find(i => i.code === id)
    if (model) return Promise.resolve({ model })
  }
  return cached_data(`${urlCompanyDetail}/${id}`, () =>
    request.get(urlCompanyDetail, {
      params: {
        id
      }
    })
  )
}
/**
 *获取单位主管列表
 *
 * @export
 * @param {string} id 单位id
 * @returns
 */
export function Managers(id, userid) {
  return request({
    url: '/company/Managers',
    method: 'get',
    params: {
      id,
      userid
    }
  })
}
const urlCompaniesManagers = `${api}/companiesManagers`
/**
 * 获取多个单位的管理
 *
 * @export
 * @param {Array<String>} ids 单位id
 * @returns
 */
export function companiesManagers(ids) {
  const ids_str = ids.join('##')
  return cached_data(`${urlCompaniesManagers}/${ids_str}`, () =>
    request.get(urlCompaniesManagers, {
      params: { ids: ids_str }
    })
  )
}

/**
 * 获取单位人员列表
 * @param {*} param0
 */
export function getMembers({
  code,
  userCompanyType,
  pageIndex,
  pageSize
}) {
  return request.get('/company/members', {
    params: {
      code,
      userCompanyType,
      page: pageIndex,
      pageSize
    }
  })
}

/**
 * 获取职务详情
 *
 * @export
 * @param {*} name 职务名称
 * @returns
 */
export function dutiesDetail(name) {
  return request({
    url: '/company/dutiesDetail',
    method: 'get',
    params: {
      name
    }
  })
}

/**
 * 获取建议，通过职务名称的部分查询可能的职务
 *
 * @export
 * @param {*} name
 * @param {*} tag
 * @param {*} page
 * @returns
 */
export function dutiesQuery(name, tag, page) {
  const store = getMockStore()
  if (store && store.duties) {
    const keyword = name || ''
    const list = store.duties.filter(i => {
      const matchName = i.name.indexOf(keyword) > -1
      const matchTag = !tag || i.tag === tag
      return matchName && matchTag
    })
    return Promise.resolve({ list })
  }
  page = page || {
    pageSize: 50,
    pageIndex: 0
  }
  const {
    pageSize,
    pageIndex
  } = page
  return request({
    url: '/company/dutiesQuery',
    method: 'get',
    params: {
      name,
      tag,
      pageSize,
      pageIndex
    }
  })
}

/**
 * 查询职务类别
 *
 * @export
 * @param {*} tagName
 * @returns
 */
export function dutiesTag(tagName) {
  const store = getMockStore()
  if (store && store.duties) {
    const dict = {}
    store.duties.forEach(i => { dict[i.tag] = true })
    return Promise.resolve({ list: Object.keys(dict) })
  }
  return request({
    url: 'company/dutiesTag',
    method: 'get',
    params: {
      tag: tagName
    }
  })
}

/**
 * 职级查询
 *
 * @export
 * @param {*} name
 * @param {*} tag
 * @param {*} page
 * @returns
 */
export function companyTitleQuery(name, tag, page) {
  const store = getMockStore()
  if (store && store.titles) {
    const keyword = name || ''
    const list = store.titles.filter(i => {
      const matchName = i.name.indexOf(keyword) > -1
      const matchTag = !tag || i.tag === tag
      return matchName && matchTag
    })
    return Promise.resolve({ list })
  }
  page = page || {
    pageSize: 20,
    pageIndex: 0
  }
  const {
    pageSize,
    pageIndex
  } = page
  return request({
    url: '/company/titleQuery',
    method: 'get',
    params: {
      name,
      tag,
      pageSize,
      pageIndex
    }
  })
}

/**
 * 查询职务等级类别
 *
 * @export
 * @param {*} tagName
 * @returns
 */
export function companyTitleTag(tagName) {
  return request({
    url: 'company/titleTag',
    method: 'get',
    params: {
      tag: tagName
    }
  })
}

export function companyTag(tag, page) {
  page = page || {
    pageSize: 20,
    pageIndex: 0
  }
  return request({
    url: 'company/companyTag',
    method: 'get',
    params: {
      tag,
      pageSize: page.pageSize,
      pageIndex: page.pageIndex
    }
  })
}
