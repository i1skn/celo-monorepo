// Make console logs display nicely in firebase logs
// see https://github.com/firebase/firebase-functions/issues/612#issuecomment-648384797
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import 'firebase-functions/lib/logger/compat'
import Stripe from 'stripe'
import { getNetworkConfig } from './config'
import {
  AccountPool,
  processRequest,
  RequestRecord,
  RequestStatus,
  RequestType,
} from './database-helper'

const PROCESSOR_RUNTIME_OPTS: functions.RuntimeOptions = {
  // When changing this, check that actionTimeoutMS is less than this number
  timeoutSeconds: 120,
  memory: '512MB',
}
admin.initializeApp(functions.config().firebase)

const db = admin.database()

const SECOND = 1000

export const createPaymentIntent = functions.https.onRequest(async (req, res) => {
  // We're only using alfajores for now
  const network = 'alfajores'
  const config = getNetworkConfig(network)

  const stripe = new Stripe(config.stripeApiKey, {
    apiVersion: '2020-08-27',
  })

  const { amount, currencyCode, celoAddress } = req.body

  if (!celoAddress) {
    throw new Error(`Invalid address: '${celoAddress}'`)
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currencyCode,
    description: `Payment for ${celoAddress}`,
    metadata: {
      celoAddress,
      network,
    },
  })
  const clientSecret = paymentIntent.client_secret

  res.json({
    description: `Created payment intent for ${amount} ${currencyCode} ${celoAddress} on ${network}`,
    intentId: paymentIntent.id,
    clientSecret,
    status: paymentIntent.status,
  })
})

// TODO: secure this, check webhook signing!
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body

  console.log('Received event', event)

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent: Stripe.Response<Stripe.PaymentIntent> = event.data.object
      console.log(
        `Inserting payment request to ${paymentIntent.metadata.celoAddress} on ${paymentIntent.metadata.network}`
      )
      const { celoAddress, network } = paymentIntent.metadata
      const requestRef = db.ref(`${network}/requests/${paymentIntent.id}`)
      await requestRef.transaction((record: RequestRecord): RequestRecord | undefined => {
        if (record) {
          console.log('Payment intent already exist!')
          return // Abort the transaction
        }
        return {
          beneficiary: celoAddress,
          status: RequestStatus.Pending,
          type: RequestType.Faucet,
          createdAt: Date.now(),
        }
      })
      break
    default:
      // Unexpected event type
      return res.status(400).end()
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true })
})

export const paymentRequestProcessor = functions
  .runWith(PROCESSOR_RUNTIME_OPTS)
  .database.ref('/{network}/requests/{request}')
  .onCreate(async (snap, ctx) => {
    const network: string = ctx.params.network
    const config = getNetworkConfig(network)
    const pool = new AccountPool(db, network, {
      retryWaitMS: SECOND,
      getAccountTimeoutMS: 20 * SECOND,
      actionTimeoutMS: 90 * SECOND,
    })
    return processRequest(snap, pool, config)
  })

// From https://firebase.googleblog.com/2019/04/schedule-cloud-functions-firebase-cron.html
// export const scheduledFunctionCrontab = functions.pubsub.schedule('5 11 * * *').onRun((context) => {
//   console.log('This will be run every day at 11:05 AM UTC!')
// })
