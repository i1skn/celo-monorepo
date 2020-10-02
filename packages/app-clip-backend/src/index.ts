import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import Stripe from 'stripe'
import { getNetworkConfig } from './config'
import { AccountPool, processRequest } from './database-helper'

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
  const config = getNetworkConfig('alfajores')

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
    },
  })
  const clientSecret = paymentIntent.client_secret

  res.json({
    description: `Created payment intent for ${amount} ${currencyCode} ${celoAddress}`,
    clientSecret,
  })
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
