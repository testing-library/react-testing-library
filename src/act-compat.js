import {act as reactAct} from 'react-dom/test-utils'

// act is supported react-dom@16.8.0
// and is only needed for versions higher than that
// so we do nothing for versions that don't support act.
const act = reactAct || (cb => cb())

function rtlAct(...args) {
  return act(...args)
}

export default rtlAct
