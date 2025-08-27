// Data dummy untuk katalog template
export const catalogTemplates = [
  {
    id: 1,
    slug: "elegant-classic",
    name: "Elegant Classic",
    category: "Classic",
    description: "Desain klasik dengan sentuhan elegan untuk pernikahan tradisional",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop",
    price: 75000,
    originalPrice: 100000,
    features: ["Animasi Smooth", "Music Player", "RSVP Form", "Gallery"],
    isPopular: true,
    isPremium: true
  },
  {
    id: 2,
    slug: "modern-minimalist",
    name: "Modern Minimalist",
    category: "Modern",
    description: "Desain minimalis modern dengan layout yang clean dan responsive",
    thumbnail: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=600&fit=crop",
    price: 85000,
    originalPrice: 120000,
    features: ["Parallax Effect", "Video Background", "Countdown Timer", "Maps"],
    isPopular: false,
    isPremium: true
  },
  {
    id: 3,
    slug: "floral-garden",
    name: "Floral Garden",
    category: "Floral",
    description: "Template dengan tema bunga dan taman yang romantis",
    thumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=600&fit=crop",
    price: 65000,
    originalPrice: 90000,
    features: ["Flower Animation", "Soft Colors", "Love Story", "Guest Book"],
    isPopular: true,
    isPremium: false
  },
  {
    id: 4,
    slug: "vintage-royal",
    name: "Vintage Royal",
    category: "Vintage",
    description: "Desain vintage dengan nuansa kerajaan yang mewah",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=600&fit=crop",
    price: 95000,
    originalPrice: 130000,
    features: ["Gold Accents", "Royal Typography", "Luxury Design", "Premium Layout"],
    isPopular: false,
    isPremium: true
  },
  {
    id: 5,
    slug: "rustic-nature",
    name: "Rustic Nature",
    category: "Rustic",
    description: "Template dengan tema alam dan nuansa pedesaan yang hangat",
    thumbnail: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=600&fit=crop",
    price: 70000,
    originalPrice: 95000,
    features: ["Wood Texture", "Nature Elements", "Warm Colors", "Outdoor Theme"],
    isPopular: false,
    isPremium: false
  },
  {
    id: 6,
    slug: "beach-tropical",
    name: "Beach Tropical",
    category: "Beach",
    description: "Template dengan tema pantai dan suasana tropis yang segar",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    price: 80000,
    originalPrice: 110000,
    features: ["Ocean Waves", "Tropical Colors", "Beach Elements", "Summer Vibes"],
    isPopular: true,
    isPremium: true
  },
  {
    id: 7,
    slug: "luxury-gold",
    name: "Luxury Gold",
    category: "Luxury",
    description: "Template mewah dengan aksen emas untuk pernikahan eksklusif",
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=600&fit=crop",
    price: 120000,
    originalPrice: 160000,
    features: ["Gold Animation", "Luxury Elements", "Premium Typography", "Exclusive Design"],
    isPopular: false,
    isPremium: true
  },
  {
    id: 8,
    slug: "simple-clean",
    name: "Simple Clean",
    category: "Minimalist",
    description: "Desain sederhana dan bersih untuk pasangan yang menyukai kesederhanaan",
    thumbnail: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=600&fit=crop",
    price: 50000,
    originalPrice: 75000,
    features: ["Clean Layout", "Simple Animation", "Easy Customization", "Fast Loading"],
    isPopular: true,
    isPremium: false
  },
  {
    id: 9,
    slug: "romantic-pink",
    name: "Romantic Pink",
    category: "Romantic",
    description: "Template romantis dengan dominasi warna pink yang lembut",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop",
    price: 75000,
    originalPrice: 100000,
    features: ["Pink Theme", "Heart Animation", "Romantic Elements", "Love Story"],
    isPopular: false,
    isPremium: false
  },
  {
    id: 10,
    slug: "dark-elegant",
    name: "Dark Elegant",
    category: "Dark",
    description: "Template elegan dengan tema gelap yang sophisticated",
    thumbnail: "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&h=600&fit=crop",
    price: 90000,
    originalPrice: 125000,
    features: ["Dark Theme", "Elegant Typography", "Sophisticated Design", "Night Mode"],
    isPopular: false,
    isPremium: true
  },
  {
    id: 11,
    slug: "boho-chic",
    name: "Boho Chic",
    category: "Boho",
    description: "Template dengan gaya bohemian yang artistik dan unik",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop",
    price: 85000,
    originalPrice: 115000,
    features: ["Boho Elements", "Artistic Design", "Unique Layout", "Creative Typography"],
    isPopular: true,
    isPremium: true
  },
  {
    id: 12,
    slug: "traditional-javanese",
    name: "Traditional Javanese",
    category: "Traditional",
    description: "Template dengan nuansa tradisional Jawa yang kental",
    thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=600&fit=crop",
    price: 95000,
    originalPrice: 130000,
    features: ["Javanese Ornaments", "Traditional Colors", "Cultural Elements", "Heritage Design"],
    isPopular: false,
    isPremium: true
  }
];

export const templateCategories = [
  { name: "Semua", slug: "all", count: catalogTemplates.length },
  { name: "Classic", slug: "classic", count: catalogTemplates.filter(t => t.category === "Classic").length },
  { name: "Modern", slug: "modern", count: catalogTemplates.filter(t => t.category === "Modern").length },
  { name: "Floral", slug: "floral", count: catalogTemplates.filter(t => t.category === "Floral").length },
  { name: "Vintage", slug: "vintage", count: catalogTemplates.filter(t => t.category === "Vintage").length },
  { name: "Minimalist", slug: "minimalist", count: catalogTemplates.filter(t => t.category === "Minimalist").length },
  { name: "Luxury", slug: "luxury", count: catalogTemplates.filter(t => t.category === "Luxury").length },
  { name: "Beach", slug: "beach", count: catalogTemplates.filter(t => t.category === "Beach").length },
  { name: "Romantic", slug: "romantic", count: catalogTemplates.filter(t => t.category === "Romantic").length }
];

export const getTemplatesByCategory = (category) => {
  if (category === "all" || !category) {
    return catalogTemplates;
  }
  return catalogTemplates.filter(template => 
    template.category.toLowerCase() === category.toLowerCase()
  );
};

export const getTemplateBySlug = (slug) => {
  return catalogTemplates.find(template => template.slug === slug);
};

export const getPopularTemplates = () => {
  return catalogTemplates.filter(template => template.isPopular);
};

export const getPremiumTemplates = () => {
  return catalogTemplates.filter(template => template.isPremium);
};
