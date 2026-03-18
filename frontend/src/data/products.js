import laptopImg from "@/assets/product-laptop.jpg";
import phoneImg from "@/assets/product-phone.jpg";
import headphonesImg from "@/assets/product-headphones.jpg";
import smartwatchImg from "@/assets/product-smartwatch.jpg";
import tabletImg from "@/assets/product-tablet.jpg";
import speakerImg from "@/assets/product-speaker.jpg";
import cameraImg from "@/assets/product-camera.jpg";
import keyboardImg from "@/assets/product-keyboard.jpg";
import mouseImg from "@/assets/product-mouse.jpg";
import powerbankImg from "@/assets/product-powerbank.jpg";
import lampImg from "@/assets/product-lamp.jpg";
import bagImg from "@/assets/product-bag.jpg";
import earbudsImg from "@/assets/product-earbuds.jpg";
import monitorImg from "@/assets/product-monitor.jpg";

export const categories = [
  "Tout",
  "Ordinateurs",
  "Smartphones & Tablettes",
  "Audio",
  "Photo & Vidéo",
  "Accessoires",
  "Bureau",
] ;

export const products = [
  // Ordinateurs
  {
    id: "1",
    name: "Laptop Gamer Pro",
    price: 1500,
    image: laptopImg,
    description: "Puissant laptop pour gaming et travail, écran 15.6\" haute résolution, RTX 4070.",
    stock: 10,
    category: "Ordinateurs",
  },
  {
    id: "14",
    name: "Laptop Ultrabook",
    price: 1100,
    image: laptopImg,
    description: "Ultrabook léger et performant, idéal pour les professionnels en déplacement.",
    stock: 15,
    category: "Ordinateurs",
  },
  {
    id: "13",
    name: "Moniteur 4K 27\"",
    price: 450,
    image: monitorImg,
    description: "Écran 4K UHD 27 pouces, couleurs précises pour le design et la photo.",
    stock: 12,
    category: "Ordinateurs",
  },
  {
    id: "15",
    name: "Moniteur Curved 32\"",
    price: 650,
    image: monitorImg,
    description: "Écran incurvé 32 pouces QHD 165Hz, parfait pour le gaming immersif.",
    stock: 8,
    category: "Ordinateurs",
  },

  // Smartphones & Tablettes
  {
    id: "2",
    name: "Smartphone Pro",
    price: 900,
    image: phoneImg,
    description: "Smartphone haut de gamme avec caméra 108MP et batterie longue durée.",
    stock: 20,
    category: "Smartphones & Tablettes",
  },
  {
    id: "16",
    name: "Smartphone Lite",
    price: 350,
    image: phoneImg,
    description: "Smartphone abordable avec un bel écran AMOLED et double caméra.",
    stock: 35,
    category: "Smartphones & Tablettes",
  },
  {
    id: "5",
    name: "Tablette 10\"",
    price: 500,
    image: tabletImg,
    description: "Tablette 10 pouces idéale pour le divertissement et la productivité.",
    stock: 18,
    category: "Smartphones & Tablettes",
  },
  {
    id: "17",
    name: "Tablette Pro 12\"",
    price: 850,
    image: tabletImg,
    description: "Tablette professionnelle 12 pouces avec stylet et clavier inclus.",
    stock: 10,
    category: "Smartphones & Tablettes",
  },

  // Audio
  {
    id: "3",
    name: "Casque Audio Premium",
    price: 120,
    image: headphonesImg,
    description: "Casque sans fil avec réduction de bruit active et son Hi-Fi.",
    stock: 30,
    category: "Audio",
  },
  {
    id: "6",
    name: "Enceinte Bluetooth",
    price: 80,
    image: speakerImg,
    description: "Enceinte portable Bluetooth 5.0 avec basses profondes, étanche IPX7.",
    stock: 40,
    category: "Audio",
  },
  {
    id: "12",
    name: "Écouteurs Sans Fil",
    price: 65,
    image: earbudsImg,
    description: "Écouteurs true wireless avec ANC, 30h d'autonomie avec le boîtier.",
    stock: 50,
    category: "Audio",
  },
  {
    id: "18",
    name: "Enceinte Home Cinema",
    price: 250,
    image: speakerImg,
    description: "Barre de son surround avec caisson de basses sans fil, Dolby Atmos.",
    stock: 12,
    category: "Audio",
  },

  // Photo & Vidéo
  {
    id: "7",
    name: "Appareil Photo Hybride",
    price: 980,
    image: cameraImg,
    description: "Appareil photo hybride 24MP, vidéo 4K, stabilisation 5 axes.",
    stock: 8,
    category: "Photo & Vidéo",
  },
  {
    id: "4",
    name: "Smartwatch Sport",
    price: 250,
    image: smartwatchImg,
    description: "Montre connectée avec GPS, suivi cardiaque et 7 jours d'autonomie.",
    stock: 25,
    category: "Photo & Vidéo",
  },
  {
    id: "19",
    name: "Caméra Action 4K",
    price: 320,
    image: cameraImg,
    description: "Caméra d'action 4K 60fps, étanche 10m, stabilisation électronique.",
    stock: 20,
    category: "Photo & Vidéo",
  },

  // Accessoires
  {
    id: "8",
    name: "Clavier Mécanique",
    price: 95,
    image: keyboardImg,
    description: "Clavier mécanique compact sans fil, switches tactiles, rétroéclairage RGB.",
    stock: 35,
    category: "Accessoires",
  },
  {
    id: "9",
    name: "Souris Sans Fil",
    price: 55,
    image: mouseImg,
    description: "Souris ergonomique sans fil, capteur 16000 DPI, 70h d'autonomie.",
    stock: 45,
    category: "Accessoires",
  },
  {
    id: "10",
    name: "Batterie Externe 20000mAh",
    price: 40,
    image: powerbankImg,
    description: "Power bank compacte avec charge rapide USB-C et double sortie.",
    stock: 60,
    category: "Accessoires",
  },
  {
    id: "20",
    name: "Sacoche Laptop Cuir",
    price: 85,
    image: bagImg,
    description: "Sacoche en cuir véritable pour laptop jusqu'à 15\", compartiments multiples.",
    stock: 20,
    category: "Accessoires",
  },

  // Bureau
  {
    id: "11",
    name: "Lampe de Bureau LED",
    price: 65,
    image: lampImg,
    description: "Lampe articulée LED avec 5 niveaux de luminosité et port USB intégré.",
    stock: 30,
    category: "Bureau",
  },
  {
    id: "21",
    name: "Sac à Dos Tech",
    price: 110,
    image: bagImg,
    description: "Sac à dos antivol avec compartiment laptop, port USB et imperméable.",
    stock: 25,
    category: "Bureau",
  },
  {
    id: "22",
    name: "Clavier Ergonomique",
    price: 130,
    image: keyboardImg,
    description: "Clavier ergonomique split avec repose-poignets, idéal pour le bureau.",
    stock: 15,
    category: "Bureau",
  },
];
