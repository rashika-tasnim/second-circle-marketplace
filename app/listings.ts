export type Listing = {
  id: number | string;
  title: string;
  price: number;
  category: string;
  place: string;
  condition: string;
  image: string;
  description: string;
  seller: string;
  memberSince: string;
  posted: string;
  userId?: string;
  isUserListing?: boolean;
};

export const listings: Listing[] = [
  { id: 1, title: "Oak reading chair", price: 650, category: "Furniture", place: "Bergen", condition: "Good", image: "https://images.unsplash.com/photo-1650476524564-f94dc9669067?auto=format&fit=crop&w=1400&q=86", description: "A comfortable solid-oak reading chair with a warm natural finish. It has a few light signs of use on the arms but remains sturdy, clean and ready for a new home.", seller: "Ingrid M.", memberSince: "2023", posted: "Today" },
  { id: 2, title: "Classic denim jacket", price: 320, category: "Clothing", place: "Oslo", condition: "Very good", image: "https://images.unsplash.com/photo-1485811661309-ab85183a729c?auto=format&fit=crop&w=1400&q=86", description: "Classic mid-blue denim jacket in very good condition. Comfortable regular fit, freshly washed, with no stains or damaged fastenings.", seller: "Maja L.", memberSince: "2024", posted: "Yesterday" },
  { id: 3, title: "City bicycle", price: 1900, category: "Sport", place: "Bergen", condition: "Good", image: "https://images.unsplash.com/photo-1529422643029-d4585747aaf2?auto=format&fit=crop&w=1400&q=86", description: "Reliable city bicycle with seven gears, working lights and a rear carrier. Recently serviced and used regularly for short commutes.", seller: "Jonas H.", memberSince: "2022", posted: "2 days ago" },
  { id: 4, title: "Film camera", price: 850, category: "Electronics", place: "Stavanger", condition: "Used", image: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1400&q=86", description: "A characterful 35 mm film camera with a manual lens and original strap. Shutter and light meter work; cosmetic wear is visible around the body.", seller: "Emil R.", memberSince: "2021", posted: "3 days ago" },
  { id: 5, title: "Ceramic table lamp", price: 280, category: "Home", place: "Bergen", condition: "Very good", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=86", description: "Small ceramic table lamp with a linen shade and warm ambient light. Fully working and well suited to a bedside table or reading corner.", seller: "Sofie A.", memberSince: "2025", posted: "4 days ago" },
  { id: 6, title: "Walnut side table", price: 500, category: "Furniture", place: "Oslo", condition: "Good", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=86", description: "Compact walnut side table with a simple silhouette and useful lower shelf. Stable construction with light surface marks from normal use.", seller: "Noah K.", memberSince: "2023", posted: "5 days ago" },
  { id: 7, title: "Noise-cancelling headphones", price: 720, category: "Electronics", place: "Trondheim", condition: "Very good", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=86", description: "Comfortable over-ear headphones with active noise cancellation, protective case and charging cable. Battery remains strong and all controls work.", seller: "Aksel T.", memberSince: "2022", posted: "6 days ago" },
  { id: 8, title: "Vintage leather jacket", price: 780, category: "Clothing", place: "Bergen", condition: "Good", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=86", description: "Soft vintage leather jacket with a broken-in finish and clean lining. Minor wear around the cuffs adds character without affecting use.", seller: "Lea N.", memberSince: "2024", posted: "1 week ago" },
  { id: 9, title: "Modern fiction bundle", price: 240, category: "Books", place: "Oslo", condition: "Very good", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=86", description: "A bundle of six contemporary novels in English. All books are clean, with only light shelf wear and no handwritten notes.", seller: "Nora S.", memberSince: "2025", posted: "1 week ago" },
  { id: 10, title: "Compact espresso maker", price: 950, category: "Home", place: "Stavanger", condition: "Good", image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1400&q=86", description: "Compact countertop espresso maker suitable for small kitchens. Regularly descaled and supplied with the portafilter and measuring spoon.", seller: "Oda V.", memberSince: "2021", posted: "8 days ago" },
  { id: 11, title: "Everyday running shoes", price: 430, category: "Sport", place: "Trondheim", condition: "Good", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=86", description: "Lightweight running shoes, EU size 39, used for a few short indoor sessions. Clean soles and plenty of cushioning remaining.", seller: "Thea B.", memberSince: "2023", posted: "9 days ago" },
  { id: 12, title: "Slim pine bookshelf", price: 600, category: "Furniture", place: "Bergen", condition: "Used", image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=1400&q=86", description: "A narrow solid-pine bookshelf that fits well in a hallway or small room. Stable and practical, with visible marks on two shelves.", seller: "Henrik D.", memberSince: "2020", posted: "10 days ago" },
];

export const categories = ["All", "Furniture", "Clothing", "Electronics", "Sport", "Home", "Books"];
