import React, {Fragment} from 'react'
import {initReactI18next, I18nextProvider, Trans} from 'react-i18next'
import i18n from 'i18next'
import Backend from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import {render, cleanup, getByTestId, fireEvent} from 'react-testing-library'
import 'jest-dom/extend-expect'

const resources = {
  en: {
    translation: {
      'Welcome to React': 'Welcome to React and react-i18next',
    },
  },
  pt: {
    translation: {
      'Welcome to React': 'Bem vindo ao React e ao react-i18next',
    },
  },
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: resources.en,
      pt: resources.pt,
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  })

const renderWithi18next = Component => {
  let rerender = () => {}
  const Comp = React.cloneElement(Component, {
    changeLanguage: lng => {
      i18n.changeLanguage(lng)
      rerender(<I18nextProvider i18n={i18n}>{Comp}</I18nextProvider>)
    },
  })
  const defaultRender = render(
    <I18nextProvider i18n={i18n}>{Comp}</I18nextProvider>,
  )
  rerender = defaultRender.rerender
  return defaultRender
}

const MainView = props => {
  return (
    <Fragment>
      <div className="App-header">
        <button
          data-testid="pt-trans"
          onClick={() => props.changeLanguage('pt')}
        >
          pt
        </button>
        <button
          data-testid="en-trans"
          onClick={() => props.changeLanguage('en')}
        >
          en
        </button>
      </div>
      <h1 data-testid="text-trans">
        <Trans>Welcome to React</Trans>
      </h1>
    </Fragment>
  )
}

afterEach(cleanup)

describe('lets make some tests', () => {
  test('it should test lang', () => {
    const {container} = renderWithi18next(<MainView />)
    expect(getByTestId(container, 'text-trans')).toBeDefined()
    expect(getByTestId(container, 'text-trans')).toHaveTextContent(
      'Welcome to React and react-i18next',
    )
    fireEvent.click(getByTestId(container, 'pt-trans'))
    expect(getByTestId(container, 'text-trans')).toHaveTextContent(
      'Bem vindo ao React e ao react-i18next',
    )
  })
})
