import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'

// 当mapStateToProps是函数的时候，调用wrapMapToPropsFunc
export function whenMapStateToPropsIsFunction(mapStateToProps) {
  return typeof mapStateToProps === 'function'
    ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
    : undefined
}
// 当mapStateToProps没有传的时候，调用wrapMapToPropsConstant
export function whenMapStateToPropsIsMissing(mapStateToProps) {
  return !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : undefined
}

// 实际上是让whenMapStateToPropsIsFunction和whenMapStateToPropsIsMissing都去执行一次mapStateToProps，然后根据传入的mapStateToProps的情况来选出有执行结果的函数赋值给initMapStateToProps。

export default [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing]
