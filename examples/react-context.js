import React from 'react'

const NameContext = React.createContext('Unknown')

const NameProvider = ({children, first, last}) => {
  const fullName = `${first} ${last}`
  return (
    <NameContext.Provider value={fullName}>{children}</NameContext.Provider>
  )
}

const NameConsumer = () => (
  <NameContext.Consumer>
    {value => <div>My Name Is: {value}</div>}
  </NameContext.Consumer>
)

export {NameContext, NameConsumer, NameProvider}
