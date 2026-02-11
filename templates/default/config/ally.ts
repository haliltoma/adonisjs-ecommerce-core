import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

const allyConfig = defineConfig({
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID', ''),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET', ''),
    callbackUrl: env.get('GOOGLE_CALLBACK_URL', '/auth/google/callback'),
    prompt: 'select_account',
    scopes: ['openid', 'email', 'profile'],
  }),
  facebook: services.facebook({
    clientId: env.get('FACEBOOK_CLIENT_ID', ''),
    clientSecret: env.get('FACEBOOK_CLIENT_SECRET', ''),
    callbackUrl: env.get('FACEBOOK_CALLBACK_URL', '/auth/facebook/callback'),
    scopes: ['email'],
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
