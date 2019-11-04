/* istanbul ignore file */
// the part of this file that we need tested is definitely being run
// and the part that is not cannot easily have useful tests written
// anyway. So we're just going to ignore coverage for this file
/**
 * copied from React's enqueueTask.js
 */

let didWarnAboutMessageChannel = false
let enqueueTask
try {
  // read require off the module object to get around the bundlers.
  // we don't want them to detect a require and bundle a Node polyfill.
  const requireString = `require${Math.random()}`.slice(0, 7)
  const nodeRequire = module && module[requireString]
  // assuming we're in node, let's try to get node's
  // version of setImmediate, bypassing fake timers if any.
  enqueueTask = nodeRequire('timers').setImmediate
} catch (_err) {
  // we're in a browser
  // we can't use regular timers because they may still be faked
  // so we try MessageChannel+postMessage instead
  enqueueTask = callback => {
    const supportsMessageChannel = typeof MessageChannel === 'function'
    if (supportsMessageChannel) {
      const channel = new MessageChannel()
      channel.port1.onmessage = callback
      channel.port2.postMessage(undefined)
    } else if (didWarnAboutMessageChannel === false) {
      didWarnAboutMessageChannel = true

      // eslint-disable-next-line no-console
      console.error(
        'This browser does not have a MessageChannel implementation, ' +
          'so enqueuing tasks via await act(async () => ...) will fail. ' +
          'Please file an issue at https://github.com/facebook/react/issues ' +
          'if you encounter this warning.',
      )
    }
  }
}

export default function flushMicroTasks() {
  return {
    then(resolve) {
      enqueueTask(resolve)
    },
  }
}
