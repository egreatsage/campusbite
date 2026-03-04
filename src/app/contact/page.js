import Navbar from "@/components/Navbar";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us - CampusBite"
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
  
      <div className="max-w-2xl mx-auto pt-24 px-4">
        <ContactForm />
      </div>
    </div>
  );
}