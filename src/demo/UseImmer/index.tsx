import { ChangeEvent, useCallback, useState } from 'react'

import useImmer from '../../hooks/useImmer'
import styled from 'styled-components'

const defaultInfo = {
  name: 'ji',
  girlName: 'xu',
  description: {
    message: 'we are lover',
  }
}

const ImmerDemo = () => {
  // 控制输入框显隐
  const [inputVisible, setInputVisible] = useState(false)
  // 用户信息
  const [info, updateInfo] = useImmer(defaultInfo)

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value || ''
    updateInfo(({ description }) => {
      description.message = message
    })
  }, [updateInfo])

  return (
    <InfoContainer>
      {
        info ? (
          <>
            <span>{ info.name }</span>
            <span>❥(^_-)</span>
            <span>{ info.girlName }</span>
            <p onClick={() => setInputVisible(true)}>description message: { info.description.message }</p>
          </>
        ) : null
      }
      {
        inputVisible ? <input type="text" onChange={handleInputChange} onBlur={() => setInputVisible(false)} /> : null
      }
    </InfoContainer>
  )
}

export default ImmerDemo

const InfoContainer = styled.div`
  margin-left: 50px;
  width: 300px;
  height: 200px;
  border: 1px solid red;
  input {
    outline: none;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
`