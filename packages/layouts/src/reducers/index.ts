
type State = {
  count?: number;
}

type ActionType = {
  type: string;
  payload?: any;
}

export default function reducer(state: State = {}, action: ActionType): State {
  switch (action.type)
  {
    case 'ADD':
      state = {
        ...state,
        count: (state.count || 0) + 1,
      }
  }
  return state
}
