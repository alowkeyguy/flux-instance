## redux
```typeScript
// 这里的合并就是将我们传人的reducer map遍历执行，返回一个key值与reducer map一致的state map
export default function combineReducers(reducers: ReducersMapObject) {

  const finalReducers: ReducersMapObject = clone(reducers)
  const finalReducerKeys = Object.keys(finalReducers)

   // 1、断言 && 初始化state值为initState
  // 2、这里的初始化与createStore里面的初始化（dispatch({ type: ActionTypes.INIT }）作用不一样
  // 3、这里的作用在于preloadedState不传的时候为注释2提供初始值
  assertReducerShape(finalReducers)


  return function combination(
    state: StateFromReducersMapObject<typeof reducers> = {},
    action: AnyAction
  ) {

    let hasChanged = false
    const nextState: StateFromReducersMapObject<typeof reducers> = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)

      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    hasChanged =
      hasChanged || finalReducerKeys.length !== Object.keys(state).length
    return hasChanged ? nextState : state
  }
}
```




# Dva
dva 是基于redux和redux-saga的一个状态管理方案。这里不能说它是个框架，只能说它是一个比较好的实践