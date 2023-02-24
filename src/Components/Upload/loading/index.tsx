import { FC } from 'react'

import styled from 'styled-components'

import './style.less'

type Theme = 'dark' | 'light'

interface LoadingProps {
  theme?: Theme
}

const Loading: FC<LoadingProps> = ({ theme = 'light' }) => {
  return (
    <LoadingContainer className="jx-loading" theme={theme}>
      <div className="jx-loading-l1 jx-loading-loader"></div>
      <div className="jx-loading-l2 jx-loading-loader"></div>
    </LoadingContainer>
  )
}

export default Loading

const LoadingContainer = styled.div<{ theme: Theme }>`
  & .jx-loading-loader {
    &::before,
    &::after {
      border-color: ${({ theme }) => theme === 'light' ? 'rgba(255, 255, 255, 0.2)' :  'rgba(0, 0, 0, 0.2)'};
    }
  }
`