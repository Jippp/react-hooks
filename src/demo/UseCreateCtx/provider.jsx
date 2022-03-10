import createCtx from './../../hooks/useCreateCtx'

const initialState = {
  message: 'provider initial message'
}

export const [useCtx, Provider] = createCtx(initialState)