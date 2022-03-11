import createCtx from './../../hooks/useCreateCtx'

const initialState = {
  message: 'provider initial message',
  info: 'initial info'
}

export const [useCtx, Provider] = createCtx(initialState)