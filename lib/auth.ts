import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'
import { prisma } from './prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email as string,
            password: credentials.password as string,
          })

          if (authError || !authData.user) {
            return null
          }

          return {
            id: authData.user.id,
            email: authData.user.email || '',
            name: authData.user.user_metadata?.name || authData.user.email || '',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        
        // ユーザー同期処理
        try {
          await prisma.user.upsert({
            where: { id: user.id },
            update: { 
              email: user.email || '',
              name: user.name || user.email || '',
            },
            create: {
              id: user.id,
              email: user.email || '',
              name: user.name || user.email || '',
              role: 'ADMIN'
            }
          })
        } catch (error) {
          console.error('User sync error:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
        }
      }
      return session
    },
  },
})

export const getSession = () => auth()