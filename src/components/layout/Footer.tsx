import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

const CONTACT_INFO = {
  email: "hello@agriconnect.rw",
  phone: "+250 788 123 456",
  address: "Kigali, Rwanda",
  social: {
    facebook: "https://facebook.com/agriconnect",
    twitter: "https://twitter.com/agriconnect",
    instagram: "https://instagram.com/agriconnect",
  },
}

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold gradient-text">AgriConnect</span>
            </div>
            <p className="text-muted-foreground">
              Connecting farmers directly with sellers for a sustainable agricultural future.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/products" className="block text-muted-foreground hover:text-foreground transition-colors">
                Browse Products
              </Link>
              <Link href="/farmers" className="block text-muted-foreground hover:text-foreground transition-colors">
                Find Farmers
              </Link>
              <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">For Users</h3>
            <div className="space-y-2">
              <Link
                href="/auth/register"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Join as Farmer
              </Link>
              <Link
                href="/auth/register"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Join as Seller
              </Link>
              <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{CONTACT_INFO.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{CONTACT_INFO.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{CONTACT_INFO.address}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Link
                href={CONTACT_INFO.social.facebook}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href={CONTACT_INFO.social.twitter}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href={CONTACT_INFO.social.instagram}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 AgriConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
