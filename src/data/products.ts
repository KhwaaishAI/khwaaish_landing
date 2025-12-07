export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  quantity: string;
  image: string;
}

export const demoProducts: Product[] = [
  {
    id: "1",
    name: "Dolo 650 Tablet",
    manufacturer: "MICRO LABS",
    originalPrice: 32.13,
    currentPrice: 24.10,
    discount: 25,
    quantity: "15 Tablet(s) in Strip*",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop"
  },
  {
    id: "2",
    name: "Leemol 650mg",
    manufacturer: "LEEFORD CARE LTD",
    originalPrice: 31.50,
    currentPrice: 16.70,
    discount: 47,
    quantity: "15 Tablet(s) in Strip*",
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=200&fit=crop"
  },
  {
    id: "3",
    name: "Crocin Advance",
    manufacturer: "GSK PHARMA",
    originalPrice: 45.00,
    currentPrice: 38.25,
    discount: 15,
    quantity: "10 Tablet(s) in Strip*",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=200&fit=crop"
  },
  {
    id: "4",
    name: "Paracetamol 500mg",
    manufacturer: "CIPLA LTD",
    originalPrice: 28.00,
    currentPrice: 19.60,
    discount: 30,
    quantity: "10 Tablet(s) in Strip*",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop"
  },
  {
    id: "5",
    name: "Combiflam Tablet",
    manufacturer: "SANOFI INDIA",
    originalPrice: 52.00,
    currentPrice: 41.60,
    discount: 20,
    quantity: "20 Tablet(s) in Strip*",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=200&fit=crop"
  },
  {
    id: "6",
    name: "Disprin Tablet",
    manufacturer: "RECKITT BENCKISER",
    originalPrice: 18.50,
    currentPrice: 14.80,
    discount: 20,
    quantity: "10 Tablet(s) in Strip*",
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&h=200&fit=crop"
  },
  {
    id: "7",
    name: "Saridon Tablet",
    manufacturer: "BAYER ZYDUS",
    originalPrice: 35.00,
    currentPrice: 29.75,
    discount: 15,
    quantity: "10 Tablet(s) in Strip*",
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=200&fit=crop"
  },
  {
    id: "8",
    name: "Aspirin 75mg",
    manufacturer: "BAYER PHARMA",
    originalPrice: 22.00,
    currentPrice: 17.60,
    discount: 20,
    quantity: "14 Tablet(s) in Strip*",
    image: "https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=300&h=200&fit=crop"
  }
];
