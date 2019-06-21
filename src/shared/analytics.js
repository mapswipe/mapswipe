import analytics from '@segment/analytics-react-native'
import config from '../../config.json'

analytics
  .setup(config.segment.write_key, {
    using: [],
    recordScreenViews: true,
    trackAppLifecycleEvents: true,
    trackAttributionData: true,
    android: {
      flushInterval: 60,
      collectDeviceId: true
    },
    ios: {
      trackAdvertising: true,
      trackDeepLinks: true
    }
  })
  .then(() =>
    console.log('Analytics is ready')
  )
  .catch(err =>
    console.error('Something went wrong', err)
  )
