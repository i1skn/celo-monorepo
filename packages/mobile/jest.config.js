const defaultConfig = require('../../jest.config.js')
const reactNativeJestPreset = require('react-native/jest-preset')

// module.exports = {
//   ...defaultConfig,
//   globals: {
//     navigator: true,
//     'ts-jest': {
//       // Disables type-check when running tests as it takes valuable time
//       // and is redundant with the tsc build step
//       isolatedModules: true,
//       babelConfig: true,
//     },
//     window: true,
//   },
//   // Override default platform to android for now
//   haste: {
//     ...reactNativeJestPreset.haste,
//     defaultPlatform: 'android',
//   },
//   moduleNameMapper: {
//     '@celo/mobile': '<rootDir>',
//     '^crypto-js$': '<rootDir>/node_modules/crypto-js',
//     'react-native-svg': '<rootDir>/../../node_modules/react-native-svg-mock',
//   },
//   modulePathIgnorePatterns: ['<rootDir>/node_modules/(.*)/node_modules/react-native'],
//   preset: 'react-native',
//   setupFilesAfterEnv: ['<rootDir>/jest_setup.ts'],
//   snapshotSerializers: ['enzyme-to-json/serializer'],
//   transformIgnorePatterns: [
//     'node_modules/(?!(@celo/)?react-native|@react-navigation|redux-persist|date-fns)',
//   ],
// }

// jest.config.js
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  ...tsjPreset,
  globals: {
    navigator: true,
    'ts-jest': {
      babelConfig: true,
      isolatedModules: true,
      tsConfig: 'tsconfig.test.json',
    },
    window: true,
  },
  haste: {
    defaultPlatform: 'android',
    platforms: ['android', 'ios', 'native'],
  },
  moduleNameMapper: {
    '@celo/mobile': '<rootDir>',
    '^crypto-js$': '<rootDir>/node_modules/crypto-js',
    'react-native-svg': '<rootDir>/../../node_modules/react-native-svg-mock',
  },
  modulePathIgnorePatterns: ['<rootDir>/node_modules/(.*)/node_modules/react-native'],
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest_setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e'],
  transform: {
    ...tsjPreset.transform,
    '\\.js$': '<rootDir>/../../node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@celo/)?react-native|@react-navigation|@react-native-community|react-navigation|redux-persist|date-fns)',
  ],
}
