// DamShop Store Service - Powered by Supabase Cloud + IndexedDB + LocalStorage
import { getItem, setItem, exportStoreBackup, importStoreBackup } from './storageEngine';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  fetchSupabaseCategories, 
  fetchSupabaseProducts, 
  fetchSupabaseOrders, 
  fetchSupabaseReviews,
  fetchSupabaseAdminAccounts,
  upsertSupabaseCategory,
  deleteSupabaseCategory,
  upsertSupabaseProduct,
  deleteSupabaseProduct,
  insertSupabaseOrder,
  updateSupabaseOrderStatus,
  deleteSupabaseOrder,
  insertSupabaseReview,
  upsertSupabaseAdminAccount,
  deleteSupabaseAdminAccount,
  subscribeToSupabaseRealtimeOrders,
  clearAllSupabaseData
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
  notificationsEnabled: true,
  enableQuantityDiscounts: true,
  discount2Items: 5,
  discount3Items: 10,
  discount4Items: 15,
  freeShippingMinAmount: 50000
};

const INITIAL_CATEGORIES = [];
const INITIAL_PRODUCTS = [];
const INITIAL_REVIEWS = [];
const INITIAL_ORDERS = [];

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
    safeSetLocalStorage('damshop_categories', []);
    setItem('categories', []);
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
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
    safeSetLocalStorage('damshop_products', []);
    setItem('products', []);
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
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
    const count = products.filter(p => {
      if (!p || !p.category) return false;
      const pCat = String(p.category).trim().toLowerCase();
      const cId = String(cat.id || '').trim().toLowerCase();
      const cName = String(cat.name || '').trim().toLowerCase();
      const cSlug = String(cat.slug || '').trim().toLowerCase();
      return pCat === cId || pCat === cName || (cSlug && pCat === cSlug);
    }).length;
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
    localStorage.setItem('damshop_orders', JSON.stringify([]));
    setItem('orders', []);
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
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
  const cleanPhone = orderData.phone || orderData.customerPhone || '';
  const cleanAddress = orderData.address || orderData.deliveryAddress || '';
  const cleanName = orderData.customerName || orderData.name || 'Client DamShop';

  const newOrder = {
    ...orderData,
    id: 'DS-' + Math.floor(1000 + Math.random() * 9000),
    customerName: cleanName,
    phone: cleanPhone,
    customerPhone: cleanPhone,
    address: cleanAddress,
    deliveryAddress: cleanAddress,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    status: 'En attente'
  };

  const updatedOrders = [newOrder, ...orders];
  safeSetLocalStorage('damshop_orders', updatedOrders);
  setItem('orders', updatedOrders);

  // Sync to Supabase Cloud Database immediately if configured
  if (isSupabaseConfigured()) {
    insertSupabaseOrder(newOrder).catch(err => {
      console.warn('Background Supabase order save error:', err);
    });
  }

  // Automatically deduct stock for ordered items
  const products = getProducts();
  const updatedProducts = products.map(product => {
    const orderedItem = (orderData.items || []).find(item => item.name === product.name);
    if (orderedItem) {
      const remainingStock = Math.max(0, (product.stock || 0) - orderedItem.quantity);
      return { ...product, stock: remainingStock };
    }
    return product;
  });
  safeSetLocalStorage('damshop_products', updatedProducts);
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

// Payment Method Formatter & Sanitizer
export const formatPaymentMethodLabel = (method) => {
  if (!method) return 'Paiement à la livraison (Espèces / Cash)';
  const str = String(method).toLowerCase();
  if (str.includes('mobile') || str.includes('momo') || str.includes('moov') || str.includes('yas') || str.includes('mixx')) {
    return 'Mobile Money (Moov Afrique / Mixx by Yas)';
  }
  if (str.includes('carte') || str.includes('visa') || str.includes('mastercard') || str.includes('bank')) {
    return 'Carte Bancaire (Visa / Mastercard)';
  }
  if (str.includes('cash') || str.includes('livraison') || str.includes('espèces') || str.includes('espece')) {
    return 'Paiement Cash à la Livraison (Espèces)';
  }
  return String(method)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim() || 'Paiement à la livraison (Cash)';
};

// Helper to sanitize strings for jsPDF (removes emojis & unsupported unicode symbols)
const sanitizeTextForPdf = (str) => {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–/g, '-')
    .trim();
};

export const getEffectiveUnitPrice = (basePrice, quantity, settings) => {
  const price = Number(basePrice) || 0;
  const qty = Number(quantity) || 1;
  if (!settings || settings.enableQuantityDiscounts === false) return price;

  const d2 = settings?.discount2Items !== undefined ? Number(settings.discount2Items) : 5;
  const d3 = settings?.discount3Items !== undefined ? Number(settings.discount3Items) : 10;

  if (qty === 2 && d2 > 0) {
    return price * (1 - d2 / 100);
  } else if (qty >= 3 && d3 > 0) {
    return price * (1 - d3 / 100);
  }
  return price;
};

// WhatsApp Generator & Formatting
export const generateWhatsAppLink = (order, settings) => {
  const phone = settings?.whatsappNumber || '2250700000000';
  const storeName = settings?.storeName || 'Xor Boutique';
  const paymentLabel = order.paymentMethod || 'Non spécifié';
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
      const productLink = `${window.location.origin}/?product=${item.id}`;
      text += `   🔗 Fiche Article & Photo : ${productLink}\n`;
    }
  });

  text += `\n💰 *TOTAL COMMANDE : ${formatCurrency(order.total)}*\n`;
  text += `💳 *Mode de Paiement :* ${paymentLabel}\n\n`;
  text += `Merci d'avance pour la confirmation et la livraison rapide ! 🚀`;

  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
};

// WhatsApp Paid Receipt Text Message Generator
export const generateWhatsAppPaidReceiptMessageText = (order, settings) => {
  const isPaid = order.status === 'Livré & Payé' || order.status === 'Payé' || order.status === 'Livré';
  const receiptUrl = `${window.location.origin}/?invoice=${order.id}`;

  const itemsSubtotal = (order.items || []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const deliveryFee = Math.max(0, Number(order.total || 0) - itemsSubtotal);
  const paymentLabel = formatPaymentMethodLabel(order.paymentMethod);

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
  text += `📞 *Tél :* ${order.phone || order.customerPhone || ''}\n`;
  text += `📍 *Adresse :* ${order.address || order.deliveryAddress || ''}\n`;
  text += `💳 *Mode de Paiement :* ${paymentLabel} (${isPaid ? 'RÉGLÉ / PAYÉ' : 'À RÉGLER À LA LIVRAISON'})\n\n`;
  text += `📦 *Détail des Articles :*\n`;
  (order.items || []).forEach((item) => {
    text += `- ${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})\n`;
  });
  text += `🚚 *Livraison :* ${deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Gratuite (Offerte)'}\n`;
  text += `💰 *MONTANT TOTAL : ${formatCurrency(order.total)}*\n\n`;
  text += `📄 *Lien Reçu PDF 1-Clic :*\n${receiptUrl}\n\n`;
  text += `Merci pour votre confiance sur *DamShop* ! À très bientôt. 🛍️`;

  return text;
};

// WhatsApp Paid Receipt Dispatch Link Generator
export const generateWhatsAppPaidReceiptLink = (order, settings) => {
  const phone = order.phone || order.customerPhone || settings?.whatsappNumber || '22890000000';
  const text = generateWhatsAppPaidReceiptMessageText(order, settings);
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
};

// Internal PDF Generator Helper (Returns fully-rendered jsPDF instance)
export const generateInvoicePdfDoc = async (order, settings, forceOfficialInvoice = false) => {
  const isPaid = forceOfficialInvoice || order.status === 'Livré & Payé' || order.status === 'Payé' || order.status === 'Livré' || order.status === 'Expédié';

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
  const goldColor = isPaid ? [4, 120, 87] : [217, 119, 6]; // #047857 Green if official/paid, #d97706 Gold if pending
  const grayColor = [100, 116, 139];  // #64748b

  // Header Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text(sanitizeTextForPdf(settings?.storeName || 'DamShop'), 20, 24);
  
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text('BOUTIQUE E-COMMERCE & HIGH-TECH', 20, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text(sanitizeTextForPdf(settings?.address || 'Lomé, Togo'), 20, 35);

  // Invoice Title & Status Meta Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...goldColor);
  const docTitle = isPaid ? `FACTURE ACQUITTÉE N° ${order.id}` : `BON DE COMMANDE N° ${order.id}`;
  doc.text(sanitizeTextForPdf(docTitle), 190, 24, { align: 'right' });
  
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date : ${order.date || new Date().toISOString().split('T')[0]}`, 190, 30, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPaid ? 4 : 180, isPaid ? 120 : 83, isPaid ? 87 : 9);
  const statusText = isPaid ? 'STATUT : PAYÉ & ACQUITTÉ (FACTURE OFFICIELLE)' : 'STATUT : À PAYER À LA LIVRAISON';
  doc.text(sanitizeTextForPdf(statusText), 190, 35, { align: 'right' });

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
  const clientText = sanitizeTextForPdf(`${order.customerName || ''} (${order.phone || order.customerPhone || ''})`);
  doc.text(clientText, 40, 51);

  doc.setFont('helvetica', 'bold');
  doc.text('LIVRAISON :', 24, 57);
  doc.setFont('helvetica', 'normal');
  const addressText = sanitizeTextForPdf(order.address || order.deliveryAddress || 'Lomé, Togo');
  doc.text(addressText, 44, 57);

  doc.setFont('helvetica', 'bold');
  doc.text('PAIEMENT :', 24, 63);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...accentColor);
  const paymentLabelClean = sanitizeTextForPdf(formatPaymentMethodLabel(order.paymentMethod));
  const paymentStatusClean = isPaid ? 'RÉGLÉ / PAYÉ' : 'À RÉGLER À LA LIVRAISON';
  doc.text(`${paymentLabelClean} (${paymentStatusClean})`, 44, 63);

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

  (order.items || []).forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    const cleanName = sanitizeTextForPdf(item.name || '').substring(0, 30);
    doc.text(cleanName, 23, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    const variantText = sanitizeTextForPdf(`${item.size ? 'T:' + item.size : ''} ${item.color ? ' C:' + item.color : ''}`);
    doc.text(variantText, 78, y);

    doc.setTextColor(...primaryColor);
    doc.text(String(item.quantity || 1), 115, y, { align: 'center' });
    doc.text(formatPdfPrice(item.price), 150, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatPdfPrice((item.price || 0) * (item.quantity || 1)), 188, y, { align: 'right' });

    y += 8;
  });

  // Subtotal, Delivery Fee & Total Breakdown Calculations
  const itemsSubtotal = (order.items || []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const totalAmount = Number(order.total || 0);
  const deliveryFeeAmount = Math.max(0, totalAmount - itemsSubtotal);

  // Table Line Separator
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 7;

  // Sous-total Articles Row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text('Sous-total Articles :', 140, y, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(formatPdfPrice(itemsSubtotal), 188, y, { align: 'right' });
  y += 6;

  // Frais de Livraison Row
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Frais de Livraison :', 140, y, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  if (deliveryFeeAmount > 0) {
    doc.setTextColor(...primaryColor);
    doc.text(formatPdfPrice(deliveryFeeAmount), 188, y, { align: 'right' });
  } else {
    doc.setTextColor(4, 120, 87);
    doc.text('Gratuit (Offerte)', 188, y, { align: 'right' });
  }
  y += 7;

  // Final Total Box Line
  doc.setDrawColor(226, 232, 240);
  doc.line(110, y - 2, 190, y - 2);
  y += 3;

  // Total Amount Highlight
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...goldColor);
  const labelTotal = isPaid ? 'TOTAL PAYÉ & ACQUITTÉ' : 'TOTAL À PAYER À LA LIVRAISON';
  doc.text(sanitizeTextForPdf(`${labelTotal} : ${formatPdfPrice(totalAmount)}`), 188, y, { align: 'right' });

  // Footer Copyright
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(sanitizeTextForPdf("Merci d'avoir effectué vos achats sur DamShop ! Document officiel."), 105, y, { align: 'center' });

  return doc;
};

// Direct Instant Native Vector PDF Receipt Generator (Downloads PDF file)
export const downloadInvoiceFile = async (order, settings, forceOfficialInvoice = false) => {
  try {
    const isPaid = forceOfficialInvoice || order.status === 'Livré & Payé' || order.status === 'Payé' || order.status === 'Livré' || order.status === 'Expédié';
    const doc = await generateInvoicePdfDoc(order, settings, forceOfficialInvoice);
    const fileNamePrefix = isPaid ? 'Facture_Acquittee' : 'Bon_De_Commande';
    doc.save(`${fileNamePrefix}_DamShop_${order.id}.pdf`);
  } catch (err) {
    console.error('jsPDF generation error:', err);
    window.print();
  }
};

// 1-Click WhatsApp Dispatch: Downloads PDF file + Opens WhatsApp (Mobile App & Desktop Web) with full text
export const shareOrSendPdfReceipt = async (order, settings, forceOfficialInvoice = false) => {
  const isPaid = forceOfficialInvoice || order.status === 'Livré & Payé' || order.status === 'Payé' || order.status === 'Livré';
  const fileNamePrefix = isPaid ? 'Facture_Acquittee' : 'Bon_De_Commande';
  const fileName = `${fileNamePrefix}_DamShop_${order.id}.pdf`;
  const waUrl = generateWhatsAppPaidReceiptLink(order, settings);

  // 1. Download & save valid PDF file locally to Downloads folder (Mobile & Desktop)
  try {
    const doc = await generateInvoicePdfDoc(order, settings, forceOfficialInvoice);
    doc.save(fileName);
  } catch (e) {
    console.warn('PDF Download Error:', e);
  }

  // 2. Open WhatsApp (App on mobile, Web on desktop) prefilled with full text & 1-click receipt link
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = waUrl;
  } else {
    window.open(waUrl, '_blank');
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
  const adminAccounts = getAdminAccounts();

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

  // Push Admin Accounts
  for (const acc of adminAccounts) {
    await upsertSupabaseAdminAccount(acc);
  }

  return true;
};

export const pullDataFromSupabase = async () => {
  if (!isSupabaseConfigured()) return false;

  try {
    const categories = await fetchSupabaseCategories();
    if (Array.isArray(categories)) {
      safeSetLocalStorage('damshop_categories', categories);
      setItem('categories', categories);
    }

    const products = await fetchSupabaseProducts();
    if (Array.isArray(products)) {
      safeSetLocalStorage('damshop_products', products);
      setItem('products', products);
      updateCategoryCounts(products);
    }

    // NON-DESTRUCTIVE ORDER SYNC & MERGE
    const cloudOrders = await fetchSupabaseOrders();
    if (Array.isArray(cloudOrders)) {
      const localOrders = getOrders();
      const mergedMap = new Map();

      // Add cloud orders first
      cloudOrders.forEach(o => mergedMap.set(o.id, o));

      // Merge local orders that haven't reached Supabase yet, and push them to cloud
      localOrders.forEach(localOrd => {
        if (!mergedMap.has(localOrd.id)) {
          mergedMap.set(localOrd.id, localOrd);
          // Push unsynced local order to Supabase
          insertSupabaseOrder(localOrd).catch(err => console.warn('Sync pending local order error:', err));
        }
      });

      const finalOrders = Array.from(mergedMap.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || a.date || 0).getTime();
        const timeB = new Date(b.createdAt || b.date || 0).getTime();
        return timeB - timeA;
      });

      safeSetLocalStorage('damshop_orders', finalOrders);
      setItem('orders', finalOrders);
    }

    const adminAccs = await fetchSupabaseAdminAccounts();
    if (Array.isArray(adminAccs)) {
      if (adminAccs.length > 0) {
        safeSetLocalStorage('damshop_admin_accounts', adminAccs);
        const settings = getSettings();
        saveSettings({ ...settings, adminAccounts: adminAccs });
      } else {
        // If Supabase table is empty on first setup, seed it with current local admin accounts
        const localAccs = getAdminAccounts();
        for (const acc of localAccs) {
          await upsertSupabaseAdminAccount(acc);
        }
      }
    }

    notifyStoreChange();
    return true;
  } catch (err) {
    console.warn('Pull Supabase data error:', err);
    return false;
  }
};

export const resetAllDataToDefaults = async (clearCloud = false) => {
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

    if (clearCloud && isSupabaseConfigured()) {
      await clearAllSupabaseData();
    }
  } catch (e) {
    console.warn('Purge cache error:', e);
  }
  notifyStoreChange();
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
  let accounts = null;

  // 1. Try reading from localStorage
  const data = localStorage.getItem('damshop_admin_accounts');
  if (data !== null) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        accounts = parsed;
      }
    } catch (e) {}
  }

  // 2. Fallback to settings.adminAccounts if localStorage is empty
  if (!accounts) {
    const settings = getSettings();
    if (settings && Array.isArray(settings.adminAccounts)) {
      accounts = settings.adminAccounts;
    }
  }

  // 3. Fallback to INITIAL_ADMIN_ACCOUNTS on absolute first load if no storage exists
  if (!accounts) {
    accounts = [...INITIAL_ADMIN_ACCOUNTS];
  }

  // 4. Always ensure super_admin (owner) exists
  const hasOwner = accounts.some(a => a.role === 'super_admin' || (a.username || '').trim().toLowerCase() === 'admin');
  if (!hasOwner) {
    accounts.unshift({
      id: 'acc_super',
      name: 'Propriétaire',
      username: 'admin',
      password: 'admin',
      role: 'super_admin'
    });
  }

  safeSetLocalStorage('damshop_admin_accounts', accounts);
  return accounts;
};

export const saveAdminAccount = (accountData) => {
  const accounts = getAdminAccounts();
  const cleanUsername = (accountData.username || '').trim();
  const cleanPassword = (accountData.password || '').trim();
  const cleanName = (accountData.name || '').trim();

  let targetId = accountData.id;
  if (!targetId) {
    targetId = 'acc_' + Date.now();
  }

  const formattedData = {
    ...accountData,
    id: targetId,
    name: cleanName,
    username: cleanUsername,
    password: cleanPassword,
    role: accountData.role || 'collaborator'
  };

  let updated;
  if (accountData.id) {
    updated = accounts.map(a => a.id === accountData.id ? { ...a, ...formattedData } : a);
  } else {
    updated = [...accounts, formattedData];
  }
  safeSetLocalStorage('damshop_admin_accounts', updated);
  
  // Sync to settings for cross-device & cloud backup
  const settings = getSettings();
  saveSettings({ ...settings, adminAccounts: updated });

  // Sync to Supabase Cloud Database if configured
  if (isSupabaseConfigured()) {
    upsertSupabaseAdminAccount(formattedData).catch(err => {
      console.warn('Background Supabase admin account sync error:', err);
    });
  }

  notifyStoreChange();
  return updated;
};

export const deleteAdminAccount = (id) => {
  // Prevent deleting super_admin. Keep account if id doesn't match OR if role is super_admin
  const accounts = getAdminAccounts().filter(a => a.id !== id || a.role === 'super_admin');
  safeSetLocalStorage('damshop_admin_accounts', accounts);
  
  const settings = getSettings();
  saveSettings({ ...settings, adminAccounts: accounts });

  // Delete from Supabase Cloud Database if configured
  if (isSupabaseConfigured()) {
    deleteSupabaseAdminAccount(id).catch(err => {
      console.warn('Background Supabase admin account delete error:', err);
    });
  }

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

// Visitor Country Geolocation Analytics Engine
const COUNTRY_NAMES_FR = {
  CI: "Côte d'Ivoire",
  TG: "Togo",
  BJ: "Bénin",
  SN: "Sénégal",
  ML: "Mali",
  BF: "Burkina Faso",
  GH: "Ghana",
  NG: "Nigeria",
  CM: "Cameroun",
  GA: "Gabon",
  CG: "Congo",
  CD: "RD Congo",
  GN: "Guinée",
  NE: "Niger",
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
  CA: "Canada",
  US: "États-Unis",
  GB: "Royaume-Uni",
  MA: "Maroc",
  TN: "Tunisie",
  DZ: "Algérie"
};

export const getCountryFlagEmoji = (code) => {
  if (!code || typeof code !== 'string' || code.length !== 2) return '🌐';
  const upper = code.toUpperCase();
  const codePoints = upper.split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const getCountryName = (code) => {
  if (!code) return 'Inconnu';
  const upper = code.toUpperCase();
  return COUNTRY_NAMES_FR[upper] || upper;
};

const INITIAL_VISITOR_ANALYTICS = {
  totalVisits: 148,
  lastUpdated: new Date().toISOString(),
  countries: {
    CI: { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', visits: 86, lastVisit: new Date().toISOString() },
    TG: { code: 'TG', name: 'Togo', flag: '🇹🇬', visits: 29, lastVisit: new Date(Date.now() - 3600000).toISOString() },
    BJ: { code: 'BJ', name: 'Bénin', flag: '🇧🇯', visits: 17, lastVisit: new Date(Date.now() - 7200000).toISOString() },
    FR: { code: 'FR', name: 'France', flag: '🇫🇷', visits: 11, lastVisit: new Date(Date.now() - 14400000).toISOString() },
    SN: { code: 'SN', name: 'Sénégal', flag: '🇸🇳', visits: 5, lastVisit: new Date(Date.now() - 28800000).toISOString() }
  }
};

export const getVisitorAnalytics = () => {
  const data = localStorage.getItem('damshop_visitor_analytics');
  if (!data) {
    safeSetLocalStorage('damshop_visitor_analytics', INITIAL_VISITOR_ANALYTICS);
    setItem('visitor_analytics', INITIAL_VISITOR_ANALYTICS);
    return INITIAL_VISITOR_ANALYTICS;
  }
  try {
    const parsed = JSON.parse(data);
    if (!parsed || !parsed.countries) return INITIAL_VISITOR_ANALYTICS;
    return parsed;
  } catch (e) {
    return INITIAL_VISITOR_ANALYTICS;
  }
};

export const trackVisitorCountry = async () => {
  try {
    // Only track once per browser session to prevent artificial spam
    if (sessionStorage.getItem('damshop_visited_session_tracked')) {
      return getVisitorAnalytics();
    }
    sessionStorage.setItem('damshop_visited_session_tracked', 'true');

    let countryCode = null;

    // Try Primary API: api.country.is
    try {
      const res = await fetch('https://api.country.is', { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.country) {
          countryCode = String(json.country).toUpperCase();
        }
      }
    } catch (e) {}

    // Fallback API: ipapi.co
    if (!countryCode) {
      try {
        const res = await fetch('https://ipapi.co/json/', { cache: 'no-cache' });
        if (res.ok) {
          const json = await res.json();
          if (json && json.country_code) {
            countryCode = String(json.country_code).toUpperCase();
          }
        }
      } catch (e) {}
    }

    // Fallback 3: Timezone inference
    if (!countryCode) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Abidjan')) countryCode = 'CI';
      else if (tz.includes('Lome')) countryCode = 'TG';
      else if (tz.includes('Porto-Novo') || tz.includes('Cotonou')) countryCode = 'BJ';
      else if (tz.includes('Dakar')) countryCode = 'SN';
      else if (tz.includes('Paris')) countryCode = 'FR';
      else countryCode = 'CI';
    }

    const analytics = getVisitorAnalytics();
    const currentCountries = analytics.countries || {};
    const existing = currentCountries[countryCode] || {
      code: countryCode,
      name: getCountryName(countryCode),
      flag: getCountryFlagEmoji(countryCode),
      visits: 0,
      lastVisit: new Date().toISOString()
    };

    const updatedCountries = {
      ...currentCountries,
      [countryCode]: {
        ...existing,
        code: countryCode,
        name: getCountryName(countryCode),
        flag: getCountryFlagEmoji(countryCode),
        visits: (existing.visits || 0) + 1,
        lastVisit: new Date().toISOString()
      }
    };

    const updatedAnalytics = {
      totalVisits: (analytics.totalVisits || 0) + 1,
      lastUpdated: new Date().toISOString(),
      countries: updatedCountries
    };

    safeSetLocalStorage('damshop_visitor_analytics', updatedAnalytics);
    setItem('visitor_analytics', updatedAnalytics);

    notifyStoreChange();
    return updatedAnalytics;
  } catch (err) {
    console.warn('Visitor tracking error:', err);
    return getVisitorAnalytics();
  }
};

export const resetVisitorAnalytics = () => {
  const fresh = {
    totalVisits: 0,
    lastUpdated: new Date().toISOString(),
    countries: {}
  };
  safeSetLocalStorage('damshop_visitor_analytics', fresh);
  setItem('visitor_analytics', fresh);
  notifyStoreChange();
  return fresh;
};

// Export Storage Backup & Supabase Tools
export { exportStoreBackup, importStoreBackup, isSupabaseConfigured };
