const globalObj = typeof window === 'undefined' ? global : window

let Scheduler = globalObj.Scheduler
try {
  const requireString = `require${Math.random()}`.slice(0, 7)
  const nodeRequire = module && module[requireString]
  // import React's scheduler so we'll be able to schedule our tasks later on.
  Scheduler = nodeRequire.call(module, 'scheduler')
} catch (_err) {
  console.error("The react version you're using doesn't support Scheduling")
}
// in case this react version has a Scheduler implementation, we use it,
// if not, we just create a function calling our callback
const NormalPriority = Scheduler
  ? Scheduler.NormalPriority || Scheduler.unstable_NormalPriority
  : null

const isScheduleCallbackSupported = Scheduler !== undefined
let isModernScheduleCallbackSupported = null

const errorHandler = e => {
  // If the error originated from Scheduler, it means we're in v16.8.6
  if (
    e.message === 'callback is not a function' &&
    e.filename.includes('scheduler')
  ) {
    console.error(e.error.stack, e.error.detail)
    e.preventDefault()
  } else {
    console.error(e.error)
  }
}

export default function scheduleCallback(_, cb) {
  if (!isScheduleCallbackSupported) {
    return cb()
  }

  if (isModernScheduleCallbackSupported === null) {
    // patch console.error here
    const originalConsoleError = console.error
    console.error = function error(...args) {
      /* if console.error fired *with that specific message* */
      /* istanbul ignore next */
      const firstArgIsString = typeof args[0] === 'string'
      if (
        firstArgIsString &&
        args[0].indexOf('TypeError: callback is not a function') === 0
      ) {
        // v16.8.6
        isModernScheduleCallbackSupported = false
        globalObj.removeEventListener('error', errorHandler)
        console.error = originalConsoleError
        return cb()
      } else {
        originalConsoleError.apply(console, args)
        console.error = originalConsoleError
        return cb()
      }
    }

    globalObj.addEventListener('error', errorHandler)
    return Scheduler.unstable_scheduleCallback(NormalPriority, () => {
      console.error = originalConsoleError
      isModernScheduleCallbackSupported = true
      globalObj.removeEventListener('error', errorHandler)
      return cb()
    })
  } else if (isModernScheduleCallbackSupported === false) {
    return cb()
  }

  return Scheduler.unstable_scheduleCallback(NormalPriority, cb)
}

/* eslint no-console:0 */
