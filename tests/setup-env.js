import '@testing-library/jest-dom/extend-expect'
import './failOnUnexpectedConsoleCalls'
import {TextEncoder} from 'util'

global.TextEncoder = TextEncoder
