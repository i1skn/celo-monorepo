import { Address } from '@celo/contractkit'
import { IArg } from '@oclif/parser/lib/args'
import { BaseCommand } from '../../base'
import { displaySendTx } from '../../utils/cli'
import { Args, Flags } from '../../utils/command'

export default class ValidatorDeregister extends BaseCommand {
  static description = 'Deregister from an ValidatorGroup'

  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true, description: "Signer or Validator's address" }),
  }

  static args: IArg[] = [
    Args.address('validatorAddress', { description: "Validator's address", required: false }),
  ]

  static examples = [
    'deregister --from 0x47e172f6cfb6c7d01c1574fa3e2be7cc73269d95',
    'deregister --from 0x47e172f6cfb6c7d01c1574fa3e2be7cc73269d95 0x97f7333c51897469e8d98e7af8653aab468050a3',
  ]

  async run() {
    const res = this.parse(ValidatorDeregister)

    this.kit.defaultAccount = res.flags.from
    const validatorAddress: Address = res.args.validatorAddress || res.args.from
    const validators = await this.kit.contracts.getValidators()

    await displaySendTx('deregister', await validators.deregisterValidator(validatorAddress))
  }
}
