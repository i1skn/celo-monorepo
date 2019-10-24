import Web3 from 'web3'
import { testWithGanache } from '../../test-utils/ganache-test'
import Register from './register'

testWithGanache('account:register cmd', (web3: Web3) => {
  test('can register account', async () => {
    const accounts = await web3.eth.getAccounts()

    await Register.run(['--from', accounts[0]])
  })

  test('fails if from is missing', async () => {
    // const accounts = await web3.eth.getAccounts()

    await expect(Register.run()).rejects.toThrow('Missing required flag')
  })
})
