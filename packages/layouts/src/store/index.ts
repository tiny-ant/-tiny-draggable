import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counter'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  // middleware: (getDefaultMiddleware) => {
  //   return getDefaultMiddleware().concat(apiSlice.middleware);
  // },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
