import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: number
    email: string
    name: string
    role_id: number
    access_token: string
  }

  interface Session {
    user: {
      id: number
      email: string
      name: string
      role_id: number
    }
    access_token: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number
    email: string
    name: string
    role_id: number
    access_token: string
  }
}
