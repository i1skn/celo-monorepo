import { BaseCommand } from '../../base'
import { newCheckBuilder } from '../../utils/checks'
import { displaySendTx } from '../../utils/cli'
import { Flags } from '../../utils/command'

export default class Register extends BaseCommand {
  static description = 'Register an account for Locked Gold'

  static flags = {
    ...BaseCommand.flags,
    from: Flags.address({ required: true }),
  }

  static args = []

  static examples = ['register']

  async run() {
    const res = this.parse(Register)
    this.kit.defaultAccount = res.flags.from
    const lockedGold = await this.kit.contracts.getLockedGold()

    await newCheckBuilder(this)
      .isNotAccount(res.flags.from)
      .runChecks()
    await displaySendTx('register', lockedGold.createAccount())
  }
}
