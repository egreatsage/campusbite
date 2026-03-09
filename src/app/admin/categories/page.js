
import ManageCategories from "@/components/ManageCategories";

import { auth } from "@/lib/auth";


export default async function ManageCategoriesPage() {
  
  const session = await auth();

 
  return <ManageCategories session={session} />;
}