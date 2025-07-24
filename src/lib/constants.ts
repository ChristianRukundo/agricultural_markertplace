export const SITE_CONFIG = {
  name: "AgriConnect Rwanda",
  description:
    "Connecting farmers and buyers across Rwanda for fresh, quality produce",
  url: "https://agriconnect.rw",
  ogImage: "https://agriconnect.rw/og.jpg",
  links: {
    twitter: "https://twitter.com/agriconnectrw",
    facebook: "https://facebook.com/agriconnectrw",
    instagram: "https://instagram.com/agriconnectrw",
    linkedin: "https://linkedin.com/company/agriconnectrw",
  },
};

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Farmers", href: "/farmers" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export const CONTACT_INFO = {
  email: "info@agriconnect.rw",
  phone: "+250 788 000 000",
  address: "KG 9 Ave, Kigali, Rwanda",
  hours: "Monday - Friday: 8:00 AM - 6:00 PM",
  social: [
    { name: "Twitter", url: "https://twitter.com/agriconnectrw", icon: "🐦" },
    { name: "Facebook", url: "https://facebook.com/agriconnectrw", icon: "📘" },
    {
      name: "Instagram",
      url: "https://instagram.com/agriconnectrw",
      icon: "📸",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/company/agriconnectrw",
      icon: "🔗",
    },
  ],
};

// agriconnect-backend/src/server/routers/product.ts (or wherever ABOUT_INFO is defined)
export const ABOUT_INFO = {
  mission:
    "To revolutionize Rwanda's agricultural marketplace by connecting farmers directly with buyers, ensuring fair prices and fresh produce for all.",
  vision:
    "A thriving agricultural ecosystem where every farmer prospers and every consumer has access to quality, locally-grown produce.",
  // ADDED 'story' property
  story:
    "AgriConnect Rwanda was founded with a clear vision: to empower Rwandan farmers and provide consumers with direct access to fresh, high-quality produce. We recognized the challenges faced by smallholder farmers in reaching wider markets and the lack of transparency in the supply chain. Our platform leverages technology to bridge this gap, creating a seamless and efficient marketplace. From humble beginnings, we've grown into a vital link in Rwanda's agricultural sector, fostering sustainable growth and economic empowerment for our farming communities.",
  values: [
    {
      icon: "🌍", // Example icon - replace with actual icon components if available
      title: "Sustainability",
      description:
        "Promoting environmentally friendly farming practices for a healthier planet.",
    },
    {
      icon: "💰",
      title: "Fair Pricing",
      description:
        "Ensuring farmers receive equitable compensation for their hard work and produce.",
    },
    {
      icon: "✅",
      title: "Quality Assurance",
      description:
        "Guaranteeing fresh, high-quality products for all our buyers.",
    },
    {
      icon: "🤝",
      title: "Community Empowerment",
      description:
        "Building stronger, more connected agricultural communities in Rwanda.",
    },
  ],
  team: [
    {
      name: "Jean Baptiste Uwimana",
      role: "CEO & Founder",
      bio: "Agricultural economist with 15+ years experience in Rwanda's farming sector",
      image: "/team/jean.jpg",
    },
    {
      name: "Marie Claire Mukamana",
      role: "CTO",
      bio: "Technology leader passionate about digital transformation in agriculture",
      image: "/team/marie.jpg",
    },
    {
      name: "Paul Kagame Nzeyimana",
      role: "Head of Operations",
      bio: "Supply chain expert ensuring smooth operations across all regions",
      image: "/team/paul.jpg",
    },
  ],
};

export const TESTIMONIALS = [
  {
    name: "Emmanuel Habimana",
    role: "Tomato Farmer, Bugesera",
    content:
      "AgriConnect has transformed my farming business. I now sell directly to buyers at fair prices without middlemen taking huge cuts.",
    image: "/testimonials/emmanuel.jpg",
    rating: 5,
  },
  {
    name: "Grace Uwimana",
    role: "Restaurant Owner, Kigali",
    content:
      "The quality of produce I get through AgriConnect is exceptional. Fresh vegetables delivered right to my restaurant.",
    image: "/testimonials/grace.jpg",
    rating: 5,
  },
  {
    name: "David Nkurunziza",
    role: "Cooperative Leader, Huye",
    content:
      "Our cooperative has increased sales by 300% since joining AgriConnect. The platform is easy to use and very reliable.",
    image: "/testimonials/david.jpg",
    rating: 5,
  },
];

export const FEATURES = [
  {
    title: "Direct Farm-to-Market Connection",
    description:
      "Connect directly with farmers and buyers, eliminating middlemen and ensuring fair prices for all.",
    icon: "🌾",
  },
  {
    title: "Quality Assurance",
    description:
      "Every product is verified for quality, ensuring buyers receive fresh, high-grade produce.",
    icon: "✅",
  },
  {
    title: "Real-time Communication",
    description:
      "Chat directly with farmers and buyers to discuss orders, delivery, and special requirements.",
    icon: "💬",
  },
  {
    title: "Secure Payments",
    description:
      "Safe and secure payment processing with escrow protection for both parties.",
    icon: "🔒",
  },
  {
    title: "Location-based Discovery",
    description:
      "Find farmers and products in your area using our Rwanda-specific location system.",
    icon: "📍",
  },
  {
    title: "Mobile-First Design",
    description:
      "Access the platform anywhere, anytime with our mobile-optimized interface.",
    icon: "📱",
  },
];
