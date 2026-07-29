import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase Credentials from localStorage or Environment Variables
export function getSupabaseConfig() {
  const url = localStorage.getItem('damshop_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem('damshop_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url: url.trim(), key: key.trim() };
}

// Check if Supabase is properly configured
export function isSupabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http') && key.length > 10);
}

// Singleton Supabase Client Instance
let supabaseInstance = null;

export function getSupabase() {
  if (!isSupabaseConfigured()) return null;

  const { url, key } = getSupabaseConfig();
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false
      }
    });
  }
  return supabaseInstance;
}

// Reset instance when credentials are updated in Admin Dashboard
export function resetSupabaseInstance() {
  supabaseInstance = null;
}

// Save Supabase credentials to localStorage
export function saveSupabaseConfig(url, key) {
  if (url) localStorage.setItem('damshop_supabase_url', url.trim());
  else localStorage.removeItem('damshop_supabase_url');

  if (key) localStorage.setItem('damshop_supabase_key', key.trim());
  else localStorage.removeItem('damshop_supabase_key');

  resetSupabaseInstance();
}

// ========================================================
// API DATA FETCHERS & SYNCHRONIZERS
// ========================================================

// 1. Categories
export async function fetchSupabaseCategories() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase fetch categories warning:', err.message);
    return null;
  }
}

export async function upsertSupabaseCategory(category) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        id: category.id,
        name: category.name,
        icon: category.icon || 'Sparkles'
      })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Supabase save category error:', err);
    return null;
  }
}

export async function deleteSupabaseCategory(id) {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase delete category error:', err);
    return false;
  }
}

// 2. Products
export async function fetchSupabaseProducts() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map snake_case to camelCase if needed
    return data.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      category: p.category,
      image: p.image,
      images: p.images || [],
      description: p.description,
      stock: p.stock || 0,
      sizes: p.sizes || [],
      colors: p.colors || [],
      isFeatured: p.is_featured || false
    }));
  } catch (err) {
    console.warn('Supabase fetch products warning:', err.message);
    return null;
  }
}

export async function upsertSupabaseProduct(product) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const payload = {
      id: product.id,
      name: product.name,
      price: product.price,
      original_price: product.originalPrice || null,
      category: product.category,
      image: product.image,
      images: product.images || [],
      description: product.description,
      stock: product.stock,
      sizes: product.sizes || [],
      colors: product.colors || [],
      is_featured: product.isFeatured || false
    };

    const { data, error } = await supabase
      .from('products')
      .upsert(payload)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Supabase save product error:', err);
    return null;
  }
}

export async function deleteSupabaseProduct(id) {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase delete product error:', err);
    return false;
  }
}

// 3. Orders
export async function fetchSupabaseOrders() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(o => ({
      id: o.id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerWhatsapp: o.customer_whatsapp,
      customerCity: o.customer_city,
      deliveryAddress: o.delivery_address,
      items: o.items || [],
      total: Number(o.total),
      status: o.status,
      paymentMethod: o.payment_method,
      notes: o.notes,
      createdAt: o.created_at
    }));
  } catch (err) {
    console.warn('Supabase fetch orders warning:', err.message);
    return null;
  }
}

export async function insertSupabaseOrder(order) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const payload = {
      id: order.id,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_whatsapp: order.customerWhatsapp || order.customerPhone,
      customer_city: order.customerCity || 'Lomé',
      delivery_address: order.deliveryAddress,
      items: order.items,
      total: order.total,
      status: order.status || 'pending',
      payment_method: order.paymentMethod || 'cash',
      notes: order.notes || ''
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(payload)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Supabase insert order error:', err);
    return null;
  }
}

export async function updateSupabaseOrderStatus(orderId, status) {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase update order status error:', err);
    return false;
  }
}

export async function deleteSupabaseOrder(id) {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase delete order error:', err);
    return false;
  }
}

// 4. Reviews
export async function fetchSupabaseReviews(productId) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (productId) query = query.eq('product_id', productId);

    const { data, error } = await query;
    if (error) throw error;

    return data.map(r => ({
      id: r.id,
      productId: r.product_id,
      userName: r.user_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at
    }));
  } catch (err) {
    console.warn('Supabase fetch reviews warning:', err.message);
    return null;
  }
}

export async function insertSupabaseReview(review) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const payload = {
      id: review.id,
      product_id: review.productId,
      user_name: review.userName,
      rating: review.rating,
      comment: review.comment
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert(payload)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Supabase insert review error:', err);
    return null;
  }
}

// Clear All Data in Supabase Cloud Database (Purge demo/old data)
export async function clearAllSupabaseData() {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    await supabase.from('products').delete().neq('id', '___none___');
    await supabase.from('categories').delete().neq('id', '___none___');
    await supabase.from('orders').delete().neq('id', '___none___');
    await supabase.from('reviews').delete().neq('id', '___none___');
    return true;
  } catch (err) {
    console.error('Clear Supabase data error:', err);
    return false;
  }
}

// Real-Time Subscriptions for Orders
export function subscribeToSupabaseRealtimeOrders(onNewOrder) {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:orders')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        if (payload.new && onNewOrder) {
          const newOrder = {
            id: payload.new.id,
            customerName: payload.new.customer_name,
            customerPhone: payload.new.customer_phone,
            customerWhatsapp: payload.new.customer_whatsapp,
            customerCity: payload.new.customer_city,
            deliveryAddress: payload.new.delivery_address,
            items: payload.new.items || [],
            total: Number(payload.new.total),
            status: payload.new.status,
            paymentMethod: payload.new.payment_method,
            notes: payload.new.notes,
            createdAt: payload.new.created_at
          };
          onNewOrder(newOrder);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// 6. Admin Accounts & Collaborators Cloud Database Helpers
export async function fetchSupabaseAdminAccounts() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('admin_accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(acc => ({
      id: acc.id,
      name: acc.name,
      username: acc.username,
      password: acc.password,
      role: acc.role || 'collaborator'
    }));
  } catch (err) {
    console.warn('Supabase fetch admin accounts warning:', err.message);
    return null;
  }
}

export async function upsertSupabaseAdminAccount(account) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const payload = {
      id: account.id,
      name: account.name,
      username: account.username,
      password: account.password,
      role: account.role || 'collaborator'
    };

    const { data, error } = await supabase
      .from('admin_accounts')
      .upsert(payload)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.error('Supabase upsert admin account error:', err);
    return null;
  }
}

export async function deleteSupabaseAdminAccount(id) {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('admin_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase delete admin account error:', err);
    return false;
  }
}

