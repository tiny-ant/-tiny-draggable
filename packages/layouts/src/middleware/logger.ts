import { AnyAction, CombinedState } from 'redux'

const logger = (store: CombinedState<any>) => (next: (action: AnyAction) => any) => (action: AnyAction): any => {
  console.group(action.type)
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

export default logger
