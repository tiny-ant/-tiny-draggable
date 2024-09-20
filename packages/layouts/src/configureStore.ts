import {
  applyMiddleware,
  compose,
  legacy_createStore as createStore,
  StoreEnhancerStoreCreator,
} from 'redux'
import thunk from 'redux-thunk'

import logger from './middleware/logger'
import monitorReducersEnhancer from './middleware/monitorReducers'
import rootReducer from './reducers'

// import createLogger from 'redux-logger';
// const logger = createLogger();

export default function configureStore(preloadedState: any = {}): any {
  const middlewares: any[] = [thunk]

  if (process.env.NODE_ENV === 'development') {
    middlewares.push(logger)
  }
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer]
  const composedEnhancers = compose<
    StoreEnhancerStoreCreator<
      StoreEnhancerStoreCreator<unknown, Record<string, unknown>>,
      Record<string, unknown>
    >
  >(...enhancers)

  /**
    Creates a Redux store that holds the state tree.

    We recommend using configureStore from the @reduxjs/toolkit package, which replaces createStore: https://redux.js.org/introduction/why-rtk-is-redux-today

    The only way to change the data in the store is to call dispatch() on it.

    There should only be a single store in your app. To specify how different parts of the state tree respond to actions, you may combine several reducers into a single reducer function by using combineReducers.

    @param reducer
    A function that returns the next state tree, given the current state tree and the action to handle.

    @param preloadedState
    The initial state. You may optionally specify it to hydrate the state from the server in universal apps, or to restore a previously serialized user session. If you use combineReducers to produce the root reducer function, this must be an object with the same shape as combineReducers keys.

    @param enhancer
    The store enhancer. You may optionally specify it to enhance the store with third-party capabilities such as middleware, time travel, persistence, etc. The only store enhancer that ships with Redux is applyMiddleware().

    @returns
    A Redux store that lets you read the state, dispatch actions and subscribe to changes.
   */
  const store = createStore(rootReducer, preloadedState, composedEnhancers)

  return store
}
