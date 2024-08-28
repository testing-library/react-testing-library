import '@testing-library/jest-dom/extend-expect'
import './failOnUnexpectedConsoleCalls'
import {TextEncoder} from 'util'
import {MessageChannel} from 'worker_threads'

global.TextEncoder = TextEncoder
// TODO: Revisit once https://github.com/jsdom/jsdom/issues/2448 is resolved
// This isn't perfect but good enough.
global.MessageChannel = MessageChannel
