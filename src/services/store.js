// DamShop Store Service - Powered by Supabase Cloud + IndexedDB + LocalStorage
import { getItem, setItem, exportStoreBackup, importStoreBackup } from './storageEngine';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  fetchSupabaseCategories, 
  fetchSupabaseProducts, 
  fetchSupabaseOrders, 
  fetchSupabaseReviews,
  upsertSupabaseCategory,
  deleteSupabaseCategory,
  upsertSupabaseProduct,
  deleteSupabaseProduct,
  insertSupabaseOrder,
  updateSupabaseOrderStatus,
  deleteSupabaseOrder,
  insertSupabaseReview,
  subscribeToSupabaseRealtimeOrders
} from './supabaseClient';

const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`LocalStorage quota exceeded for ${key}. Data safely saved in IndexedDB fallback.`, err);
  }
};

const INITIAL_SETTINGS = {
  storeName: 'Xor Boutique',
  whatsappNumber: '2250700000000',
  currency: 'FCFA',
  deliveryFee: 2500,
  address: 'Abidjan, Côte d\'Ivoire',
  notificationsEnabled: true
};

const INITIAL_CATEGORIES = [
  {
    id: 'cat_femme',
    name: 'Femme',
    slug: 'femme',
    description: 'Collection haute couture, robes, sacs et accessoires pour femme.',
    icon: 'Sparkles',
    color: '#f472b6',
    count: 12
  },
  {
    id: 'cat_homme',
    name: 'Homme',
    slug: 'homme',
    description: 'Vestes, montres et mode élégante pour homme moderne.',
    icon: 'User',
    color: '#60a5fa',
    count: 10
  },
  {
    id: 'cat_gadgets',
    name: 'Gadgets',
    slug: 'gadgets',
    description: 'Appareils high-tech, audio haute fidélité et objets connectés.',
    icon: 'Cpu',
    color: '#a78bfa',
    count: 8
  },
  {
    id: 'cat_accessoires',
    name: 'Accessoires',
    slug: 'accessoires',
    description: 'Bijoux, lunettes de soleil et maroquinerie de luxe.',
    icon: 'Watch',
    color: '#fbbf24',
    count: 6
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Sac à Main Cuir Signature DamShop',
    category: 'cat_femme',
    price: 85000,
    originalPrice: 110000,
    rating: 4.9,
    stock: 12,
    isFeatured: true,
    sizes: ['Unique'],
    colors: ['Noir Marbre', 'Bordeaux', 'Beige Doré'],
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    description: 'Sac en cuir véritable finition artisanale avec détails dorés. Spacieux et élégant pour le quotidien et les soirées.'
  },
  {
    id: 'prod_2',
    name: 'Écouteurs Noise-Canceling Phantom X',
    category: 'cat_gadgets',
    price: 145000,
    originalPrice: 175000,
    rating: 4.8,
    stock: 8,
    isFeatured: true,
    sizes: ['Standard'],
    colors: ['Noir Noir', 'Argent Brossé'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    description: 'Réduction de bruit active avancée, autonomie 40 heures et qualité sonore audiophile Hi-Res Audio.'
  },
  {
    id: 'prod_3',
    name: 'Montre Chronographe Noir Mat',
    category: 'cat_homme',
    price: 120000,
    originalPrice: 150000,
    rating: 4.7,
    stock: 3,
    isFeatured: true,
    sizes: ['42mm', '44mm'],
    colors: ['Noir Onyx', 'Bleu Nuit'],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    description: 'Mouvement automatique suisse, verre saphir inrayable et bracelet en acier brossé noir mat.'
  },
  {
    id: 'prod_4',
    name: 'Robe de Soirée Émeraude Silk',
    category: 'cat_femme',
    price: 95000,
    originalPrice: 125000,
    rating: 5.0,
    stock: 0,
    isFeatured: false,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Vert Émeraude', 'Rouge Rubis'],
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
    description: 'Robe longue en soie naturelle émeraude avec coupe fluide et décolleté élégant.'
  },
  {
    id: 'prod_5',
    name: 'Enceinte Bluetooth Minimaliste Velvet',
    category: 'cat_gadgets',
    price: 65000,
    originalPrice: 80000,
    rating: 4.6,
    stock: 15,
    isFeatured: true,
    sizes: ['Compact'],
    colors: ['Gris Anthracite', 'Blanc Pur'],
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
    description: 'Son à 360° immersif, étanche IPX7 et boîtier en aluminium brossé au design épuré.'
  },
  {
    id: 'prod_6',
    name: 'Veste Blazer Tailored Homme',
    category: 'cat_homme',
    price: 110000,
    originalPrice: 135000,
    rating: 4.8,
    stock: 9,
    isFeatured: false,
    sizes: ['48', '50', '52', '54'],
    colors: ['Bleu Marine', 'Gris Laine'],
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    description: 'Veste sur-mesure en laine peignée premium avec doublure en satin d’exception.'
  },
  {
    id: 'prod_7',
    name: 'Lunettes de Soleil Titane Gold',
    category: 'cat_accessoires',
    price: 55000,
    originalPrice: 70000,
    rating: 4.9,
    stock: 2,
    isFeatured: false,
    sizes: ['Unique'],
    colors: ['Or 18k', 'Argent'],
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
    description: 'Monture ultra-légère en titane doré avec verres polarisés UV400 haute définition.'
  },
  {
    id: 'prod_8',
    name: 'Drone de Poche Ultra HD Horizon X',
    category: 'cat_gadgets',
    price: 280000,
    originalPrice: 320000,
    rating: 4.9,
    stock: 4,
    isFeatured: true,
    sizes: ['Pro Pack'],
    colors: ['Carbone Mat'],
    image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&q=80&w=800',
    description: 'Caméra 4K HDR stabilisée sur 3 axes, capteurs d’obstacles et pilotage autonome par IA.'
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev_1',
    productId: 'prod_1',
    userName: 'Mariam K.',
    rating: 5,
    comment: 'Qualité incroyable ! Le cuir est magnifique et le sac est encore plus beau en vrai.',
    date: '2026-07-20'
  },
  {
    id: 'rev_2',
    productId: 'prod_2',
    userName: 'Koffi A.',
    rating: 5,
    comment: 'Le réducteur de bruit est bluffant. Livraison en moins de 24h à Abidjan.',
    date: '2026-07-22'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'DS-9821',
    customerName: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+225 0708091011',
    date: '2026-07-24',
    total: 210000,
    paymentMethod: 'Mobile Money (Orange)',
    status: 'Expédié',
    items: [
      { name: 'Écouteurs Noise-Canceling Phantom X', quantity: 1, price: 145000, size: 'Standard', color: 'Noir Noir' },
      { name: 'Enceinte Bluetooth Minimaliste Velvet', quantity: 1, price: 65000, size: 'Compact', color: 'Gris Anthracite' }
    ]
  }
];

// Event Listeners for Live Reactive State Updates & Order Notifications
const listeners = new Set();
const orderNotificationListeners = new Set();

export const subscribeToStore = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const subscribeToOrderNotifications = (callback) => {
  orderNotificationListeners.add(callback);
  return () => orderNotificationListeners.delete(callback);
};

const notifyStoreChange = () => {
  listeners.forEach(callback => callback());
};

// Web Audio Pleasant Notification Chime Generator
const playOrderChimeSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15); // G5
    osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.15); // C6

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

// System Native Web Push Notification Request & Trigger
export const requestNotificationPermission = async () => {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  } catch (e) {}
};

const triggerSystemNativeNotification = (order) => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 Nouvelle Commande DamShop !', {
        body: `${order.customerName} a passé la commande N° ${order.id} pour ${order.total} FCFA`,
        icon: '/favicon.svg'
      });
    }
  } catch (e) {}
};

// Settings Functions
export const getSettings = () => {
  const data = localStorage.getItem('damshop_settings');
  return data ? JSON.parse(data) : INITIAL_SETTINGS;
};

export const saveSettings = (newSettings) => {
  const updated = { ...getSettings(), ...newSettings };
  safeSetLocalStorage('damshop_settings', updated);
  setItem('settings', updated);
  notifyStoreChange();
  return updated;
};

// Category Functions
export const getCategories = () => {
  const data = localStorage.getItem('damshop_categories');
  if (!data) {
    safeSetLocalStorage('damshop_categories', INITIAL_CATEGORIES);
    setItem('categories', INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  }
  return JSON.parse(data);
};

export const saveCategory = (categoryData) => {
  const categories = getCategories();
  let targetCat;
  let updated;
  if (categoryData.id) {
    targetCat = { ...categoryData };
    updated = categories.map(cat => cat.id === categoryData.id ? { ...cat, ...categoryData } : cat);
  } else {
    targetCat = {
      ...categoryData,
      id: 'cat_' + Date.now(),
      slug: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
      count: 0
    };
    updated = [targetCat, ...categories];
  }
  safeSetLocalStorage('damshop_categories', updated);
  setItem('categories', updated);
  
  if (isSupabaseConfigured()) {
    upsertSupabaseCategory(targetCat).catch(err => console.warn('Supabase category sync:', err));
  }

  notifyStoreChange();
  return updated;
};

export const deleteCategory = (id) => {
  const categories = getCategories().filter(c => c.id !== id);
  safeSetLocalStorage('damshop_categories', categories);
  setItem('categories', categories);

  if (isSupabaseConfigured()) {
    deleteSupabaseCategory(id).catch(err => console.warn('Supabase category delete sync:', err));
  }

  notifyStoreChange();
  return categories;
};

// Product Functions
export const getProducts = () => {
  const data = localStorage.getItem('damshop_products');
  if (!data) {
    safeSetLocalStorage('damshop_products', INITIAL_PRODUCTS);
    setItem('products', INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(data);
};

export const saveProduct = (productData) => {
  const products = getProducts();
  let targetProd;
  let updated;
  if (productData.id) {
    targetProd = { ...productData };
    updated = products.map(p => p.id === productData.id ? { ...p, ...productData } : p);
  } else {
    targetProd = {
      ...productData,
      id: 'prod_' + Date.now(),
      rating: 5.0,
      stock: productData.stock !== undefined ? Number(productData.stock) : 10,
      isFeatured: false,
      sizes: productData.sizes || ['Unique'],
      colors: productData.colors || ['Standard']
    };
    updated = [targetProd, ...products];
  }
  safeSetLocalStorage('damshop_products', updated);
  setItem('products', updated);
  updateCategoryCounts(updated);

  if (isSupabaseConfigured()) {
    upsertSupabaseProduct(targetProd).catch(err => console.warn('Supabase product sync:', err));
  }

  notifyStoreChange();
  return updated;
};

export const updateProductStock = (productId, newStock) => {
  const products = getProducts();
  const updated = products.map(p => p.id === productId ? { ...p, stock: Math.max(0, Number(newStock)) } : p);
  safeSetLocalStorage('damshop_products', updated);
  setItem('products', updated);

  const updatedProduct = updated.find(p => p.id === productId);
  if (updatedProduct && isSupabaseConfigured()) {
    upsertSupabaseProduct(updatedProduct).catch(err => console.warn('Supabase stock sync:', err));
  }

  notifyStoreChange();
  return updated;
};

export const deleteProduct = (id) => {
  const products = getProducts().filter(p => p.id !== id);
  safeSetLocalStorage('damshop_products', products);
  setItem('products', products);
  updateCategoryCounts(products);

  if (isSupabaseConfigured()) {
    deleteSupabaseProduct(id).catch(err => console.warn('Supabase product delete sync:', err));
  }

  notifyStoreChange();
  return products;
};

const updateCategoryCounts = (products) => {
  const categories = getCategories();
  const updatedCategories = categories.map(cat => {
    const count = products.filter(p => p.category === cat.id).length;
    return { ...cat, count };
  });
  safeSetLocalStorage('damshop_categories', updatedCategories);
  setItem('categories', updatedCategories);
};

// Wishlist Functions
export const getWishlist = () => {
  const data = localStorage.getItem('damshop_wishlist');
  if (!data) return [];
  try {
    const list = JSON.parse(data);
    if (!Array.isArray(list)) return [];
    const products = getProducts();
    const validList = list.filter(id => products.some(p => p.id === id));
    if (validList.length !== list.length) {
      localStorage.setItem('damshop_wishlist', JSON.stringify(validList));
    }
    return validList;
  } catch (e) {
    return [];
  }
};

export const clearWishlist = () => {
  localStorage.setItem('damshop_wishlist', JSON.stringify([]));
  setItem('wishlist', []);
  notifyStoreChange();
  return [];
};

export const toggleWishlist = (productId) => {
  const wishlist = getWishlist();
  let updated;
  if (wishlist.includes(productId)) {
    updated = wishlist.filter(id => id !== productId);
  } else {
    updated = [...wishlist, productId];
  }
  localStorage.setItem('damshop_wishlist', JSON.stringify(updated));
  setItem('wishlist', updated);
  notifyStoreChange();
  return updated;
};

// Reviews Functions
export const getReviews = (productId = null) => {
  const data = localStorage.getItem('damshop_reviews');
  const reviews = data ? JSON.parse(data) : INITIAL_REVIEWS;
  if (productId) {
    return reviews.filter(r => r.productId === productId);
  }
  return reviews;
};

export const addReview = (reviewData) => {
  const reviews = getReviews();
  const newReview = {
    ...reviewData,
    id: 'rev_' + Date.now(),
    date: new Date().toISOString().split('T')[0]
  };
  const updated = [newReview, ...reviews];
  localStorage.setItem('damshop_reviews', JSON.stringify(updated));
  setItem('reviews', updated);

  const prodReviews = updated.filter(r => r.productId === reviewData.productId);
  const avgRating = Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1));

  const products = getProducts();
  const updatedProducts = products.map(p => p.id === reviewData.productId ? { ...p, rating: avgRating } : p);
  localStorage.setItem('damshop_products', JSON.stringify(updatedProducts));
  setItem('products', updatedProducts);

  notifyStoreChange();
  return newReview;
};

// Cart Functions
export const getCart = () => {
  const data = localStorage.getItem('damshop_cart');
  if (!data) return [];
  try {
    const rawCart = JSON.parse(data);
    if (!Array.isArray(rawCart)) return [];
    
    // Filter out any corrupted items
    const validCart = rawCart.filter(item => 
      item && 
      item.product && 
      item.product.id && 
      item.product.name && 
      typeof item.product.price === 'number' && 
      !isNaN(item.product.price)
    );

    if (validCart.length !== rawCart.length) {
      localStorage.setItem('damshop_cart', JSON.stringify(validCart));
      setItem('cart', validCart);
    }
    return validCart;
  } catch (e) {
    return [];
  }
};

export const addToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
  if (!product || !product.id) return getCart();

  const normalizedPrice = Number(product.price) || 0;
  const safeProduct = {
    ...product,
    price: normalizedPrice,
    stock: product.stock !== undefined && product.stock !== null ? Number(product.stock) : 10
  };

  const cart = getCart();
  const size = selectedSize || safeProduct.sizes?.[0] || 'Unique';
  const color = selectedColor || safeProduct.colors?.[0] || 'Standard';

  const existingIndex = cart.findIndex(item => 
    item && item.product && item.product.id === safeProduct.id && item.size === size && item.color === color
  );

  let updatedCart;
  if (existingIndex > -1) {
    updatedCart = [...cart];
    updatedCart[existingIndex].quantity = Math.max(1, updatedCart[existingIndex].quantity + (Number(quantity) || 1));
  } else {
    updatedCart = [...cart, { product: safeProduct, quantity: Math.max(1, Number(quantity) || 1), size, color }];
  }

  localStorage.setItem('damshop_cart', JSON.stringify(updatedCart));
  setItem('cart', updatedCart);
  notifyStoreChange();
  return updatedCart;
};

export const updateCartQuantity = (index, quantity) => {
  const cart = getCart();
  let updatedCart;
  if (quantity <= 0) {
    updatedCart = cart.filter((_, i) => i !== index);
  } else {
    updatedCart = cart.map((item, i) => i === index ? { ...item, quantity } : item);
  }
  localStorage.setItem('damshop_cart', JSON.stringify(updatedCart));
  setItem('cart', updatedCart);
  notifyStoreChange();
  return updatedCart;
};

export const clearCart = () => {
  localStorage.setItem('damshop_cart', JSON.stringify([]));
  setItem('cart', []);
  notifyStoreChange();
};

// Order Functions & Automatic Stock Deduction + Order Notifications
export const getOrders = () => {
  const data = localStorage.getItem('damshop_orders');
  if (!data) {
    localStorage.setItem('damshop_orders', JSON.stringify(INITIAL_ORDERS));
    setItem('orders', INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }
  return JSON.parse(data);
};

// Admin Notification System
const INITIAL_NOTIFICATIONS = [];

export const getNotifications = () => {
  const data = localStorage.getItem('damshop_notifications');
  if (data === null) {
    localStorage.setItem('damshop_notifications', JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const addNotification = (notif) => {
  const list = getNotifications();
  const newNotif = {
    id: 'notif_' + Date.now(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notif
  };
  const updated = [newNotif, ...list];
  localStorage.setItem('damshop_notifications', JSON.stringify(updated));
  notifyStoreChange();
  return updated;
};

export const markNotificationsAsRead = () => {
  const list = getNotifications();
  const updated = list.map(n => ({ ...n, read: true }));
  localStorage.setItem('damshop_notifications', JSON.stringify(updated));
  notifyStoreChange();
  return updated;
};

export const clearNotifications = () => {
  localStorage.setItem('damshop_notifications', JSON.stringify([]));
  notifyStoreChange();
  return [];
};

export const placeOrder = (orderData) => {
  const orders = getOrders();
  const newOrder = {
    ...orderData,
    id: 'DS-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split('T')[0],
    status: 'En attente'
  };
  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem('damshop_orders', JSON.stringify(updatedOrders));
  setItem('orders', updatedOrders);

  // Automatically deduct stock for ordered items
  const products = getProducts();
  const updatedProducts = products.map(product => {
    const orderedItem = orderData.items.find(item => item.name === product.name);
    if (orderedItem) {
      const remainingStock = Math.max(0, (product.stock || 0) - orderedItem.quantity);
      return { ...product, stock: remainingStock };
    }
    return product;
  });
  localStorage.setItem('damshop_products', JSON.stringify(updatedProducts));
  setItem('products', updatedProducts);

  clearCart();

  // Add Admin Notification
  addNotification({
    title: 'Nouvelle Commande Client ! 🛍️',
    message: `${newOrder.customerName} (${newOrder.phone}) a passé la commande N° ${newOrder.id} (${formatCurrency(newOrder.total)})`,
    type: 'order',
    orderId: newOrder.id
  });

  // Trigger Notifications (Sound + Native Push + Toast Listener)
  playOrderChimeSound();
  triggerSystemNativeNotification(newOrder);
  orderNotificationListeners.forEach(cb => cb(newOrder));

  notifyStoreChange();
  return newOrder;
};

export const updateOrderStatus = (orderId, newStatus) => {
  const orders = getOrders();
  const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
  localStorage.setItem('damshop_orders', JSON.stringify(updated));
  setItem('orders', updated);
  notifyStoreChange();
  return updated;
};

export const deleteOrder = (orderId) => {
  const orders = getOrders().filter(o => o.id !== orderId);
  localStorage.setItem('damshop_orders', JSON.stringify(orders));
  setItem('orders', orders);

  if (isSupabaseConfigured()) {
    deleteSupabaseOrder(orderId).catch(err => console.warn('Supabase delete order error:', err));
  }

  notifyStoreChange();
  return orders;
};

// WhatsApp Generator & Formatting
export const generateWhatsAppLink = (order, settings) => {
  const phone = settings?.whatsappNumber || '2250700000000';
  const storeName = settings?.storeName || 'DamShop';
  let text = `Bonjour *${storeName}* ! 👋\nJe souhaite valider ma commande *N° ${order.id}*.\n\n`;
  text += `👤 *Client :* ${order.customerName}\n`;
  text += `📞 *Tel :* ${order.phone}\n`;
  text += `📍 *Adresse de livraison :* ${order.address}\n\n`;
  text += `📦 *Articles Commandés :*\n`;

  (order.items || []).forEach((item, index) => {
    text += `\n${index + 1}. *${item.name}*\n`;
    text += `   • Quantité : ${item.quantity}\n`;
    text += `   • Tailles/Couleurs : ${item.size || 'Standard'}, ${item.color || 'Standard'}\n`;
    text += `   • Prix : ${formatCurrency(item.price * item.quantity)}\n`;
    if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
      text += `   🖼️ Photo Produit : ${item.image}\n`;
    } else if (item.id) {
      const productLink = `${window.location.origin}${window.location.pathname}?product=${item.id}`;
      text += `   🔗 Fiche Article & Photo : ${productLink}\n`;
    }
  });

  text += `\n💰 *TOTAL COMMANDE : ${formatCurrency(order.total)}*\n`;
  text += `💳 *Mode de Paiement :* ${order.paymentMethod || 'Paiement à la livraison'}\n\n`;
  text += `Merci d'avance pour la confirmation et la livraison rapide ! 🚀`;

  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
};

// WhatsApp Paid Receipt Text Message Generator
export const generateWhatsAppPaidReceiptMessageText = (order, settings) => {
  const isPaid = order.status === 'Livré & Payé' || order.status === 'Payé';
  const baseUrl = window.location.origin + window.location.pathname;
  const receiptUrl = `${baseUrl}?invoice=${order.id}`;

  let text = `Bonjour *${order.customerName}* ! 👋\n`;
  if (isPaid) {
    text += `Votre commande *N° ${order.id}* a bien été livrée et réglée avec succès ! 🎉\n\n`;
    text += `🧾 *REÇU DE PAIEMENT ACQUITTÉ DamShop*\n`;
  } else {
    text += `Voici le récapitulatif de votre commande *N° ${order.id}*.\n\n`;
    text += `📋 *BON DE COMMANDE (À PAIEMENT À LA LIVRAISON)*\n`;
  }

  text += `-----------------------------------------\n`;
  text += `👤 *Client :* ${order.customerName}\n`;
  text += `📞 *Tél :* ${order.phone}\n`;
  text += `💰 *Montant Total :* ${formatCurrency(order.total)}\n`;
  text += `📍 *Adresse :* ${order.address}\n`;
  text += `💳 *Mode :* ${order.paymentMethod}\n\n`;
  text += `📦 *Détail des Articles :*\n`;
  order.items.forEach((item) => {
    text += `- ${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})\n`;
  });
  text += `\n📄 *Lien Reçu PDF 1-Clic :*\n${receiptUrl}\n\n`;
  text += `Merci pour votre confiance sur *DamShop* ! À très bientôt. 🛍️`;

  return text;
};

// WhatsApp Paid Receipt Dispatch Link Generator
export const generateWhatsAppPaidReceiptLink = (order, settings) => {
  const phone = order.phone || settings?.whatsappNumber || '2250700000000';
  const text = generateWhatsAppPaidReceiptMessageText(order, settings);
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
};

// 1-Click Share Native PDF File + Full Text (Mobile) or Download + Link (Desktop)
export const shareOrSendPdfReceipt = async (order, settings) => {
  const isPaid = order.status === 'Livré & Payé' || order.status === 'Payé';
  const fileNamePrefix = isPaid ? 'Facture_Acquittee' : 'Bon_De_Commande';
  const fileName = `${fileNamePrefix}_DamShop_${order.id}.pdf`;
  const fullText = generateWhatsAppPaidReceiptMessageText(order, settings);

  // Always generate/download PDF first for safety
  await downloadInvoiceFile(order, settings);

  // Try Native Mobile File Share API if supported
  if (navigator.share && navigator.canShare && window.jspdf) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      // Generate blob in memory
      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `Facture DamShop N° ${order.id}`,
          text: fullText,
          files: [pdfFile]
        });
        return;
      }
    } catch (e) {
      console.warn('Native Web Share file fallback:', e);
    }
  }

  // Desktop PC Fallback: Open WhatsApp Web chat with receipt URL link
  const waUrl = generateWhatsAppPaidReceiptLink(order, settings);
  window.open(waUrl, '_blank');
};

// Direct Instant Native Vector PDF Receipt Generator (Distinguishes Unpaid vs Paid Invoice)
export const downloadInvoiceFile = async (order, settings) => {
  try {
    const isPaid = order.status === 'Livré & Payé' || order.status === 'Payé';

    // Dynamically load jsPDF UMD script if not available
    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const formatPdfPrice = (amount) => {
      if (amount === undefined || amount === null) return '0 FCFA';
      const formatted = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${formatted} FCFA`;
    };

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Color Palette
    const primaryColor = [15, 23, 42];  // #0f172a
    const accentColor = [37, 99, 235];   // #2563eb
    const goldColor = isPaid ? [4, 120, 87] : [217, 119, 6]; // #047857 Green if paid, #d97706 Gold if pending
    const grayColor = [100, 116, 139];  // #64748b

    // Header Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text('DamShop', 20, 24);
    
    doc.setFontSize(9);
    doc.setTextColor(...accentColor);
    doc.text('BOUTIQUE E-COMMERCE & HIGH-TECH', 20, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...grayColor);
    doc.text(settings?.address || 'Abidjan, Cote d\'Ivoire', 20, 35);

    // Invoice Title & Status Meta Right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...goldColor);
    const docTitle = isPaid ? `FACTURE ACQUITTEE N° ${order.id}` : `BON DE COMMANDE N° ${order.id}`;
    doc.text(docTitle, 190, 24, { align: 'right' });
    
    doc.setFontSize(8.5);
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date : ${order.date}`, 190, 30, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPaid ? 4 : 180, isPaid ? 120 : 83, isPaid ? 87 : 9);
    const statusText = isPaid ? 'STATUT : PAYE & ACQUITTE (RECU OFFICIEL)' : 'STATUT : A PAYER A LA LIVRAISON';
    doc.text(statusText, 190, 35, { align: 'right' });

    // Horizontal Separator Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(20, 40, 190, 40);

    // Customer & Shipping Info Card (Gray Filled Box)
    doc.setFillColor(isPaid ? 240 : 248, isPaid ? 253 : 250, isPaid ? 244 : 252);
    doc.roundedRect(20, 44, 170, 28, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    doc.text('CLIENT :', 24, 51);
    doc.setFont('helvetica', 'normal');
    doc.text(`${order.customerName} (${order.phone})`, 40, 51);

    doc.setFont('helvetica', 'bold');
    doc.text('LIVRAISON :', 24, 57);
    doc.setFont('helvetica', 'normal');
    doc.text(`${order.address || 'Abidjan, Cote d\'Ivoire'}`, 44, 57);

    doc.setFont('helvetica', 'bold');
    doc.text('PAIEMENT :', 24, 63);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...accentColor);
    doc.text(`${order.paymentMethod || 'Mobile Money'} (${isPaid ? 'REGLÉ' : 'À RÉGLER AT DELIVERY'})`, 44, 63);

    // Table Header Row
    let y = 80;
    doc.setFillColor(241, 245, 249);
    doc.rect(20, y - 5, 170, 7, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text('ARTICLE', 23, y);
    doc.text('VARIANTE', 78, y);
    doc.text('QTE', 115, y, { align: 'center' });
    doc.text('P.U (FCFA)', 150, y, { align: 'right' });
    doc.text('TOTAL (FCFA)', 188, y, { align: 'right' });

    y += 8;

    // Table Items Rows
    doc.setFontSize(8.5);

    order.items.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      const cleanName = String(item.name || '').substring(0, 30);
      doc.text(cleanName, 23, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayColor);
      const variantText = `${item.size ? 'T:' + item.size : ''} ${item.color ? ' C:' + item.color : ''}`;
      doc.text(variantText, 78, y);

      doc.setTextColor(...primaryColor);
      doc.text(String(item.quantity), 115, y, { align: 'center' });
      doc.text(formatPdfPrice(item.price), 150, y, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(formatPdfPrice(item.price * item.quantity), 188, y, { align: 'right' });

      y += 8;
    });

    // Total Line Separator
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    y += 9;

    // Total Amount Highlight
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...goldColor);
    const labelTotal = isPaid ? 'TOTAL PAYÉ & ACQUITTÉ' : 'TOTAL À PAYER À LA LIVRAISON';
    doc.text(`${labelTotal} : ${formatPdfPrice(order.total)}`, 188, y, { align: 'right' });

    // Footer Copyright
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text('Merci d\'avoir effectue vos achats sur DamShop ! Document officiel.', 105, y, { align: 'center' });

    // Save File
    const fileNamePrefix = isPaid ? 'Facture_Acquittee' : 'Bon_De_Commande';
    doc.save(`${fileNamePrefix}_DamShop_${order.id}.pdf`);
  } catch (err) {
    console.error('jsPDF generation error:', err);
    window.print();
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

// ========================================================
// SUPABASE BULK SYNC UTILITIES FOR ADMIN DASHBOARD
// ========================================================

export const pushAllDataToSupabase = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase n\'est pas configuré. Veuillez indiquer votre URL et clé Anon Supabase.');
  }

  const categories = getCategories();
  const products = getProducts();
  const orders = getOrders();
  const reviews = getReviews();

  // Push Categories
  for (const cat of categories) {
    await upsertSupabaseCategory(cat);
  }

  // Push Products
  for (const prod of products) {
    await upsertSupabaseProduct(prod);
  }

  // Push Orders
  for (const ord of orders) {
    await insertSupabaseOrder(ord);
  }

  // Push Reviews
  for (const rev of reviews) {
    await insertSupabaseReview(rev);
  }

  return true;
};

export const pullDataFromSupabase = async () => {
  if (!isSupabaseConfigured()) return false;

  try {
    const categories = await fetchSupabaseCategories();
    if (categories && categories.length > 0) {
      localStorage.setItem('damshop_categories', JSON.stringify(categories));
      setItem('categories', categories);
    }

    const products = await fetchSupabaseProducts();
    if (products && products.length > 0) {
      localStorage.setItem('damshop_products', JSON.stringify(products));
      setItem('products', products);
    }

    const orders = await fetchSupabaseOrders();
    if (orders && orders.length > 0) {
      localStorage.setItem('damshop_orders', JSON.stringify(orders));
      setItem('orders', orders);
    }

    notifyStoreChange();
    return true;
  } catch (err) {
    console.warn('Pull Supabase data error:', err);
    return false;
  }
};

export const resetAllDataToDefaults = () => {
  try {
    const demoProdIds = ['prod_1', 'prod_2', 'prod_3', 'prod_4'];
    const demoCatIds = ['cat_1', 'cat_2', 'cat_3', 'cat_4', 'cat_5'];
    const demoOrderIds = ['DS-9821'];

    // Filter out initial sample demo items so old sample items are permanently purged
    const activeProducts = getProducts().filter(p => !demoProdIds.includes(p.id));
    const activeCategories = getCategories().filter(c => !demoCatIds.includes(c.id));
    const activeOrders = getOrders().filter(o => !demoOrderIds.includes(o.id));
    const activeSettings = getSettings();

    // Clear temporary caches
    localStorage.removeItem('damshop_wishlist');
    localStorage.removeItem('damshop_cart');
    localStorage.removeItem('damshop_reviews');
    safeSetLocalStorage('damshop_notifications', []);

    // Save cleaned active data (no demo sample items, preserving user's own added items)
    safeSetLocalStorage('damshop_categories', activeCategories);
    safeSetLocalStorage('damshop_products', activeProducts);
    safeSetLocalStorage('damshop_orders', activeOrders);
    safeSetLocalStorage('damshop_settings', activeSettings);

    setItem('categories', activeCategories);
    setItem('products', activeProducts);
    setItem('orders', activeOrders);
    setItem('settings', activeSettings);

    if (window.indexedDB) {
      window.indexedDB.deleteDatabase('DamShopDB');
    }
  } catch (e) {
    console.warn('Purge cache error:', e);
  }
  window.location.reload();
};

// Multi-Admin Team Accounts & Roles Management
const INITIAL_ADMIN_ACCOUNTS = [
  {
    id: 'acc_super',
    name: 'Propriétaire',
    username: 'admin',
    password: 'admin',
    role: 'super_admin'
  },
  {
    id: 'acc_collab',
    name: 'Collaborateur (Gestionnaire)',
    username: 'collaborateur',
    password: 'damshop123',
    role: 'collaborator'
  }
];

export const getAdminAccounts = () => {
  const data = localStorage.getItem('damshop_admin_accounts');
  if (!data) {
    safeSetLocalStorage('damshop_admin_accounts', INITIAL_ADMIN_ACCOUNTS);
    return INITIAL_ADMIN_ACCOUNTS;
  }
  return JSON.parse(data);
};

export const saveAdminAccount = (accountData) => {
  const accounts = getAdminAccounts();
  let updated;
  if (accountData.id) {
    updated = accounts.map(a => a.id === accountData.id ? { ...a, ...accountData } : a);
  } else {
    const newAcc = {
      ...accountData,
      id: 'acc_' + Date.now(),
      role: accountData.role || 'collaborator'
    };
    updated = [...accounts, newAcc];
  }
  safeSetLocalStorage('damshop_admin_accounts', updated);
  notifyStoreChange();
  return updated;
};

export const deleteAdminAccount = (id) => {
  const accounts = getAdminAccounts().filter(a => a.id !== id && a.role !== 'super_admin');
  safeSetLocalStorage('damshop_admin_accounts', accounts);
  notifyStoreChange();
  return accounts;
};

export const getActiveAdminSession = () => {
  const data = localStorage.getItem('damshop_current_admin_session') || sessionStorage.getItem('damshop_current_admin_session');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  return { username: 'admin', role: 'super_admin', name: 'Propriétaire (Super Admin)' };
};

export const setActiveAdminSession = (userObj, remember = true) => {
  const payload = JSON.stringify(userObj);
  if (remember) {
    localStorage.setItem('damshop_current_admin_session', payload);
  } else {
    sessionStorage.setItem('damshop_current_admin_session', payload);
  }
};

// Export Storage Backup & Supabase Tools
export { exportStoreBackup, importStoreBackup, isSupabaseConfigured };
