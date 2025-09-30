import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      console.log('🔐 Google sign-in successful:', user.email);
      
      try {
        // Save user to backend database
        console.log('📡 Calling backend to save user...');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account?.providerAccountId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const result = await response.json();
        console.log('📦 Backend response:', result);

        if (result.success) {
          console.log('💾 User saved to database with ID:', result.user.id);
          user.backendId = result.user.id;
          return true;
        } else {
          console.error('❌ Backend failed to save user:', result.error);
          return false;
        }
      } catch (error) {
        console.error('❌ Backend authentication error:', error);
        // Allow sign-in to continue even if backend fails (for testing)
        return true;
      }
    },
    async session({ session, token }: any) {
      if (token.backendId) {
        session.user.backendId = token.backendId;
      }
      console.log('📋 Session active for:', session.user.email);
      return session;
    },
    async jwt({ token, user }: any) {
      if (user?.backendId) {
        token.backendId = user.backendId;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
