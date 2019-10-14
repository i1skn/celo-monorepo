import PhoneNumberInput from '@celo/react-components/components/PhoneNumberInput'
import ValidatedTextInput from '@celo/react-components/components/ValidatedTextInput'
import { shallow } from 'enzyme'
import * as React from 'react'
import { Text } from 'react-native'
import Autocomplete from 'react-native-autocomplete-input'
import * as renderer from 'react-test-renderer'

jest.mock('@celo/react-native-sms-retriever', () => {
  return {
    requestPhoneNumber: jest.fn(() => '+49030111111'),
  }
})

describe('PhoneNumberInput', () => {
  it('renders correctly with minimum props', () => {
    const tree = renderer.create(
      <PhoneNumberInput
        defaultCountry={'USA'}
        setE164Number={jest.fn()}
        setIsValidNumber={jest.fn()}
        setCountryCode={jest.fn()}
      />
    )
    expect(tree).toMatchSnapshot()
  })

  describe('when defaultCountry is falsy', () => {
    it('renders an AutoComplete', () => {
      const numberInput = shallow(
        <PhoneNumberInput
          defaultCountry={null}
          setE164Number={jest.fn()}
          setIsValidNumber={jest.fn()}
          setCountryCode={jest.fn()}
          inputCountryPlaceholder="Nations"
        />
      )
      expect(numberInput.find(Autocomplete).props()).toEqual(
        expect.objectContaining({ placeholder: 'Nations' })
      )
    })

    describe('#renderItem', () => {
      it('returns JSX with country name', () => {
        const mockSetCountryCode = jest.fn()
        const numberInput = shallow(
          <PhoneNumberInput
            defaultCountry={null}
            setE164Number={jest.fn()}
            setIsValidNumber={jest.fn()}
            setCountryCode={mockSetCountryCode}
            inputCountryPlaceholder="Nations"
          />
        )
        const instance = numberInput.instance()

        // @ts-ignore
        const renderedItem = shallow(instance.renderItem({ item: 'GB' }))
        expect(
          renderedItem
            .find(Text)
            .last()
            .children()
            .text()
        ).toEqual('UK')
      })
    })
  })
  describe('when defaultCountry is truthy', () => {
    let onEndEditingPhoneNumber: () => void

    beforeEach(() => {
      onEndEditingPhoneNumber = jest.fn()
    })

    const numberInput = () => {
      return shallow(
        <PhoneNumberInput
          defaultCountry={'USA'}
          setE164Number={jest.fn()}
          setIsValidNumber={jest.fn()}
          setCountryCode={jest.fn()}
          inputPhonePlaceholder="1800-867-5309"
          onEndEditingPhoneNumber={onEndEditingPhoneNumber}
        />
      )
    }

    it('does not render an AutoComplete', () => {
      expect(numberInput().find(Autocomplete).length).toEqual(0)
    })

    it('renders a TextInput', () => {
      expect(
        numberInput()
          .find('ValidatedTextInput')
          .props()
      ).toEqual(
        expect.objectContaining({
          placeholder: '1800-867-5309',
          onEndEditing: onEndEditingPhoneNumber,
        })
      )
    })
  })

  describe('Native phone picker', () => {
    it('can read phone', async () => {
      const wrapper = shallow<PhoneNumberInput>(
        <PhoneNumberInput
          setE164Number={jest.fn()}
          setCountryCode={jest.fn()}
          setIsValidNumber={jest.fn()}
        />
      )

      await wrapper.instance().triggerPhoneNumberRequest()

      wrapper.instance().setState({})

      expect(wrapper.find(ValidatedTextInput).props().value).toEqual('030 111111')

      expect(wrapper.instance().state.countryCallingCode).toEqual('+49')
      expect(
        wrapper.findWhere((node) => node.prop('testID') === 'contryCodeText').props().children
      ).toBe('+49')
      expect(
        wrapper.findWhere((node) => node.prop('testID') === 'CountryNameField').props().defaultValue
      ).toBe('Germany')
    })
  })
})
