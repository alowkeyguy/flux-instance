import { getBatch } from './batch'

// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

const nullListeners = { notify() {} }

function createListenerCollection() {
  const batch = getBatch()
  let first = null
  let last = null

  return {
    clear() {
      first = null
      last = null
    },

    notify() {
      batch(() => {
        let listener = first
        while (listener) {
          listener.callback()
          listener = listener.next
        }
      })
    },

    get() {
      let listeners = []
      let listener = first
      while (listener) {
        listeners.push(listener)
        listener = listener.next
      }
      return listeners
    },

    subscribe(callback) {
      let isSubscribed = true

      let listener = (last = {
        callback,
        next: null,
        prev: last
      })

      if (listener.prev) {
        listener.prev.next = listener
      } else {
        first = listener
      }

      return function unsubscribe() {
        if (!isSubscribed || first === null) return
        isSubscribed = false

        if (listener.next) {
          listener.next.prev = listener.prev
        } else {
          last = listener.prev
        }
        if (listener.prev) {
          listener.prev.next = listener.next
        } else {
          first = listener.next
        }
      }
    }
  }
}

export default class Subscription {
  constructor(store, parentSub) {
    this.store = store
    this.parentSub = parentSub
    // 取消redux里面订阅的handleChangeWrapper事件
    this.unsubscribe = null
    this.listeners = nullListeners

    this.handleChangeWrapper = this.handleChangeWrapper.bind(this)
  }

  // 往Subscription实例里添加订阅函数，注意区别于handleChangeWrapper
  // @return 取消当前函数订阅事件
  addNestedSub(listener) {
    this.trySubscribe()
    return this.listeners.subscribe(listener)
  }

  // 发布
  notifyNestedSubs() {
    this.listeners.notify()
  }

  // 业务里在Subscription上添加onStateChange，创建Subscription实例时会注册在redux里面的订阅队列里
  handleChangeWrapper() {
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  // 判断handleChangeWrapper事件是否在redux的订阅队列中（或者说当前subscription实例是否与redux关联）
  isSubscribed() {
    return Boolean(this.unsubscribe)
  }

  // provide的handleChangeWrapper事件订阅在redux的队列中，connect的事件分为两种情况：store如果是从父组件传过来的，订阅在当前新的Subscription实例的队列中，如果是在contextProvirer中取的，订阅在父级传下来的Subscription中

  // 在我们使用useSelector时候，更新是订阅在provide创建的Subscription实例的listeners里面

  // 最后可以这样理解：redux的订阅队列中有几个handleChangeWrapper，就有几个Subscription实例，每次redux notice的时候，会执行我们在每个组件里传的handleChangeWrapper，同时也会去触发对应Subscription实例的notifyNestedSubs
  trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub
        ? this.parentSub.addNestedSub(this.handleChangeWrapper)
        : this.store.subscribe(this.handleChangeWrapper)

      this.listeners = createListenerCollection()
    }
  }

  // 销毁subscription实例
  tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
      this.listeners.clear()
      this.listeners = nullListeners
    }
  }
}
