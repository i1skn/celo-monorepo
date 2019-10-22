import { BaseCommand } from '../../base'
import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'

export default class ValidatorDeAffiliate extends BaseCommand {
  static description = 'DeAffiliate to a ValidatorGroup'

  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true, description: "Signer or Validator's address" }),
  }

  static examples = ['deaffiliate --from 0x47e172f6cfb6c7d01c1574fa3e2be7cc73269d95']

  async run() {
    const res = this.parse(ValidatorDeAffiliate)
    this.kit.defaultAccount = res.flags.from
    const validators = await this.kit.contracts.getValidators()
    await displaySendTx('deaffiliate', validators.deaffiliate())
  }
}
