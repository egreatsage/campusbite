// lib/auth.config.js
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Adds the user's role and ID to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // Exposes the role and ID to the client-side session
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  providers: [], // We leave this empty here!
};