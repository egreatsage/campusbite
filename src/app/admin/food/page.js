// Remove "use client" from this file entirely
import ManageFoodClient from "@/components/ManageFoodClient";
import { auth } from "@/lib/auth";


export default async function ManageFoodPage() {
  // Safe to call auth() here because this is a Server Component
  const session = await auth();

  // Pass the session down to the client component
  return <ManageFoodClient session={session} />;
}