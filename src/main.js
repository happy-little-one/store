const observers = new WeakMap
let keys = []

export function observable(obj) {
  return new Proxy(obj, {
    get(target,key) {
      keys.push({obj, key}) // 添加key
      const value = Reflect.get(target, key) 
      return typeof value === 'object' ? observable(value) : value //递归处理
    },
    set(target, key, value) {
      Reflect.set(target, key, value)
      const objObservers = observers.get(obj) || new Map()
      const keyObservers = objObservers.get(key)
      if(keyObservers) keyObservers.forEach(hander => hander()) // 执行观察者列表
      return true
    },
  })
}

export function autorun(handler) {
  handler()
  keys.forEach(({obj, key}) => {
    if(!observers.get(obj)) observers.set(obj, new Map())
    const objObservers = observers.get(obj)
    if(!objObservers.get(key)) objObservers.set(key, new Set())
    const keyObservers = objObservers.get(key)
    keyObservers.add(handler)
  }) // 添加观察者
  keys = [] // 清空keys
}

const o = observable({a: {b: 1}, c: 1,d: [1]})
autorun(() => o.d.map(v => console.log(v, 'd')))

o.d.push(2)