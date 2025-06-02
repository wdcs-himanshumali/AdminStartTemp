// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'

// import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// import axiosInstance from './axios'
import axios from 'axios'

export const authOptions: NextAuthOptions = {
  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: 'Credentials',
      type: 'credentials',

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        try {
          console.log('Making login request to:', 'http://localhost:3000/api/auth/login')
          console.log('Request payload:', {
            email,
            password,
            device_info: {
              fcm_token: 'string',
              device_id: 'string',
              device_name: 'string',
              platform_type: 'Android',
              api_version: '1.0',
              os_version: '14.0',
              latitude: 37.7749,
              longitude: -122.4194,
              app_version: '1.2.3'
            }
          })

          const response = await axios.post(
            'http://localhost:3000/api/auth/login',
            {
              email,
              password,
              device_info: {
                fcm_token: 'string',
                device_id: 'string',
                device_name: 'string',
                platform_type: 'Android',
                api_version: '1.0',
                os_version: '14.0',
                latitude: 37.7749,
                longitude: -122.4194,
                app_version: '1.2.3'
              }
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'app-type': 'web',
                'Accept-Language': 'en'
              }
            }
          )

          console.log('Login response:', response.data)

          const data = response.data

          if (data.statusCode === 200) {
            // Return user data and access token exactly as per the API response
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role_id: data.user.role_id,
              access_token: data.access_token
            }
          }

          return null
        } catch (e: any) {
          console.error('Login error:', e.response?.data || e.message)

          // Throw the exact error message from the API
          throw new Error(e.response?.data?.message || 'Authentication failed')
        }
      }
    })

    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    // })

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: 'jwt',

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: '/login'
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user }) {
      if (user) {
        /*
         * For adding custom parameters to user in session, we first need to add those parameters
         * in token which then will be available in the `session()` callback
         */
        token.id = Number(user.id)
        token.email = user.email
        token.name = user.name
        token.role_id = Number(user.role_id)
        token.access_token = user.access_token
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // ** Add custom params to user in session which are added in `jwt()` callback via `token` parameter
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role_id = token.role_id
        session.access_token = token.access_token
      }

      return session
    }
  }
}
