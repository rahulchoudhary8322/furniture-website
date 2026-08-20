import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FolderTree, Tag, Image, Settings, HelpCircle, Search, Edit, Trash2, Plus, Star, ShieldCheck, X, User, FileText, Printer } from 'lucide-react';

const woodTemplate = {
  banner_image: `${window.API_URL || 'http://localhost:5000'}/uploads/cat-furniture.jpg`,
  banner_title: 'Uncompromising Quality & Generational Craftsmanship',
  banner_subtitle: 'Artisanal Teak Wood Furniture Built to Stay in Your Family for Generations',
  story_title: 'Sustainably Harvested. Kiln-Dried. Expertly Hand-Carved.',
  story_desc: 'At SDC Canteen, we select only the finest grade of Indian Sheesham (Rosewood) and seasoned Teak Wood. Our lumber goes through a multi-stage seasoning process in modern kiln chambers to lower moisture contents to 8-12%, preventing seasonal warping, cracking, or joint split. Every contour is hand-carved by local traditional artisans in Churu, keeping heritage alive.',
  story_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  features: [
    {
      title: 'Heavy Duty Structural Durability',
      desc: 'Reinforced with double-tenon mortise joint blocks and industrial grade German adhesives. Supports up to 450kg load without structural squeaking.',
      image: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Eco-Friendly Non-Toxic VOC Finish',
      desc: 'Finished with organic, lead-free Italian polyurethane sealers. Safe for children, pets, and indoor allergen safety guidelines.',
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80'
    }
  ]
};

const electronicsTemplate = {
  banner_image: `${window.API_URL || 'http://localhost:5000'}/uploads/cat-electronics.jpg`,
  banner_title: 'Intelligent Technology. Certified Reliability.',
  banner_subtitle: 'Upgrade Your Home with SDC Canteen Inverter Appliances & Entertainment Displays',
  story_title: 'Authorized Distribution & Brand Care Protection',
  story_desc: 'SDC Canteen is the certified regional distribution partner for leading brands of LED TVs, Inverter ACs, smart refrigerators, and home cooling units. We deliver brand-sealed boxes directly from stock depots, ensuring 100% genuine products with manufacturer warranty certificates, GST invoice inputs, and official customer service installation.',
  story_image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80',
  features: [
    {
      title: 'Active Copper Coil Windings',
      desc: 'Motors and compressors are wound with 99.9% pure copper coils, preventing electrical overheating and maximizing dynamic cooling efficiency.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Eco Inverter Intelligent Power Save',
      desc: 'Regulates voltage fluctuations dynamically to save up to 45% electricity compared to standard 3-star rated home appliances.',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80'
    }
  ]
};

export default function AdminDashboard({ adminToken, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', 'attributes', 'banners', 'seo', 'reviews', 'orders'

  // Global Data Lists
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [contact, setContact] = useState({ phone: '', email: '', address: '', working_hours: '', whatsapp: '' });
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');

  // Sub-tabs for attributes panel
  const [attrSubTab, setAttrSubTab] = useState('brands');

  // Search filter inside products list
  const [prodSearch, setProdSearch] = useState('');

  // Form states for modals/editing
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding new

  // Product Form states
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pSalePrice, setPSalePrice] = useState('');
  const [pStock, setPStock] = useState('0');
  const [pCategoryId, setPCategoryId] = useState('');
  const [pBrandId, setPBrandId] = useState('');
  const [pMaterialId, setPMaterialId] = useState('');
  const [pColorId, setPColorId] = useState('');
  const [pIsFeatured, setPIsFeatured] = useState(false);
  const [pIsBestseller, setPIsBestseller] = useState(false);
  const [pIsNewArrival, setPIsNewArrival] = useState(false);
  const [pIsAvailable, setPIsAvailable] = useState(true);
  const [pWarranty, setPWarranty] = useState('1 Year Warranty');
  const [pDelivery, setPDelivery] = useState('Estimated delivery: 3-5 business days');
  const [pImages, setPImages] = useState(null); // FileList
  const [pSpecs, setPSpecs] = useState([{ key: '', val: '' }]);
  const [pFeatures, setPFeatures] = useState(['']);
  const [pAplusContent, setPAplusContent] = useState('');
  const [pAplusBannerFile, setPAplusBannerFile] = useState(null);
  const [pAplusStoryFile, setPAplusStoryFile] = useState(null);
  const [pAmazonLink, setPAmazonLink] = useState('');
  const [pFlipkartLink, setPFlipkartLink] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  // Category Form
  const [catName, setCatName] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [catImage, setCatImage] = useState(null);

  // Attributes Forms
  const [newBrandName, setNewBrandName] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#000000');

  // Banners Forms
  const [banTitle, setBanTitle] = useState('');
  const [banSubtitle, setBanSubtitle] = useState('');
  const [banLink, setBanLink] = useState('/');
  const [banImage, setBanImage] = useState(null);

  // SEO Form
  const [seoList, setSeoList] = useState([]);
  const [selectedSeoPage, setSelectedSeoPage] = useState('home');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Status/Alerts
  const [operationSuccess, setOperationSuccess] = useState('');
  const [operationError, setOperationError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!adminToken) {
      navigate('/admin-login');
    }
  }, [adminToken, navigate]);

  // Fetch data helpers
  const fetchProducts = () => {
    fetch(`${window.API_URL}/api/products`)
      .then(res => res.json())
      .then(res => { if (res.success) setProducts(res.data); });
  };

  const fetchCategories = () => {
    fetch(`${window.API_URL}/api/categories`)
      .then(res => res.json())
      .then(res => { if (res.success) setCategories(res.data); });
  };

  const fetchAttributes = () => {
    fetch(`${window.API_URL}/api/attributes/brands`)
      .then(res => res.json())
      .then(res => { if (res.success) setBrands(res.data); });

    fetch(`${window.API_URL}/api/attributes/materials`)
      .then(res => res.json())
      .then(res => { if (res.success) setMaterials(res.data); });

    fetch(`${window.API_URL}/api/attributes/colors`)
      .then(res => res.json())
      .then(res => { if (res.success) setColors(res.data); });
  };

  const fetchBanners = () => {
    fetch(`${window.API_URL}/api/admin/banners`)
      .then(res => res.json())
      .then(res => { if (res.success) setBanners(res.data); });
  };

  const fetchContactDetails = () => {
    fetch(`${window.API_URL}/api/admin/contact`)
      .then(res => res.json())
      .then(res => { if (res.success && res.data) setContact(res.data); });
  };

  const fetchSEO = () => {
    fetch(`${window.API_URL}/api/admin/seo`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setSeoList(res.data);
          const homeSeo = res.data.find(s => s.page_name === 'home');
          if (homeSeo) {
            setSeoTitle(homeSeo.title);
            setSeoDescription(homeSeo.description);
            setSeoKeywords(homeSeo.keywords);
          }
        }
      });
  };

  const fetchReviews = () => {
    fetch(`${window.API_URL}/api/products/admin/reviews`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(res => { if (res.success) setReviews(res.data); });
  };

  const fetchRegisteredUsers = () => {
    fetch(`${window.API_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(res => { 
        if (res.success) {
          setRegisteredUsers(res.data); 
        } else {
          console.error('Fetch users API error:', res.message);
        }
      })
      .catch(err => console.error('Fetch users network error:', err));
  };

  const fetchOrders = () => {
    setLoadingOrders(true);
    fetch(`${window.API_URL}/api/orders/admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setOrders(res.data);
        }
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error('Fetch orders error:', err);
        setLoadingOrders(false);
      });
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    fetch(`${window.API_URL}/api/orders/admin/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          triggerAlert(`Order status updated to "${newStatus}" successfully.`);
          fetchOrders();
        } else {
          triggerAlert(res.message || 'Status update failed.', true);
        }
      })
      .catch(err => {
        console.error(err);
        triggerAlert('Error updating status.', true);
      });
  };

  // Helper to build a hierarchical tree list of categories for the dropdown selector
  const getFormattedCategoriesList = () => {
    const mainCategories = categories.filter(c => c.parent_id === null);
    const result = [];

    mainCategories.forEach(main => {
      // Add the parent main category
      result.push({ ...main, displayName: main.name, isParent: true });
      
      // Find subcategories belonging to this main category
      const subCategories = categories.filter(c => c.parent_id === main.id);
      subCategories.forEach(sub => {
        result.push({ ...sub, displayName: `— ${sub.name}`, isParent: false });
        
        // Find nested sub-subcategories (if any exist)
        const subSubCategories = categories.filter(c => c.parent_id === sub.id);
        subSubCategories.forEach(subSub => {
          result.push({ ...subSub, displayName: `  ↳ ${subSub.name}`, isParent: false });
        });
      });
    });

    // Append any orphaned categories (that might have a parent_id but parent doesn't exist, just in case)
    categories.forEach(c => {
      if (!result.find(r => r.id === c.id)) {
        result.push({ ...c, displayName: c.name, isParent: false });
      }
    });

    return result;
  };

  // Load all data on tab switches or component mount
  useEffect(() => {
    if (!adminToken) return;
    fetchProducts();
    fetchCategories();
    fetchAttributes();
    fetchBanners();
    fetchContactDetails();
    fetchSEO();
    fetchReviews();
    fetchRegisteredUsers();
    fetchOrders();
  }, [adminToken, activeTab]);

  // Handle SEO Page Switch inside SEO Tab
  const handleSeoPageChange = (page) => {
    setSelectedSeoPage(page);
    const match = seoList.find(s => s.page_name === page);
    if (match) {
      setSeoTitle(match.title);
      setSeoDescription(match.description);
      setSeoKeywords(match.keywords);
    } else {
      setSeoTitle('');
      setSeoDescription('');
      setSeoKeywords('');
    }
  };

  // Helper to show flash alert
  const triggerAlert = (msg, isErr = false) => {
    if (isErr) {
      setOperationError(msg);
      setTimeout(() => setOperationError(''), 4000);
    } else {
      setOperationSuccess(msg);
      setTimeout(() => setOperationSuccess(''), 4000);
    }
  };

  // PRODUCT MODAL PREPARATION
  const openAddProduct = () => {
    setEditingProduct(null);
    setPName('');
    setPSku('');
    setPDescription('');
    setPPrice('');
    setPSalePrice('');
    setPStock('0');
    setPCategoryId(categories[0]?.id || '');
    setPBrandId(brands[0]?.id || '');
    setPMaterialId(materials[0]?.id || '');
    setPColorId(colors[0]?.id || '');
    setPIsFeatured(false);
    setPIsBestseller(false);
    setPIsNewArrival(false);
    setPIsAvailable(true);
    setPWarranty('1 Year Warranty');
    setPDelivery('Estimated delivery: 3-5 business days');
    setPImages(null);
    setPSpecs([{ key: '', val: '' }]);
    setPFeatures(['']);
    setPAplusContent('');
    setPAplusBannerFile(null);
    setPAplusStoryFile(null);
    setPAmazonLink('');
    setPFlipkartLink('');
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPSku(prod.sku);
    setPDescription(prod.description);
    setPPrice(String(prod.price));
    setPSalePrice(prod.sale_price ? String(prod.sale_price) : '');
    setPStock(String(prod.stock));
    setPCategoryId(String(prod.category_id));
    setPBrandId(prod.brand_id ? String(prod.brand_id) : '');
    setPMaterialId(prod.material_id ? String(prod.material_id) : '');
    setPColorId(prod.color_id ? String(prod.color_id) : '');
    setPIsFeatured(prod.is_featured === 1);
    setPIsBestseller(prod.is_best_seller === 1);
    setPIsNewArrival(prod.is_new_arrival === 1);
    setPIsAvailable(prod.is_available === 1);
    setPWarranty(prod.warranty || '1 Year Store Warranty');
    setPDelivery(prod.delivery_info || 'Estimated delivery: 3-5 business days');
    setPImages(null);
    
    // Parse specs and features
    try {
      const obj = typeof prod.specifications === 'string' ? JSON.parse(prod.specifications) : prod.specifications || {};
      const arr = Object.entries(obj).map(([key, val]) => ({ key, val }));
      setPSpecs(arr.length > 0 ? arr : [{ key: '', val: '' }]);
    } catch(e) {
      setPSpecs([{ key: '', val: '' }]);
    }

    try {
      const arr = typeof prod.features === 'string' ? JSON.parse(prod.features) : prod.features || [];
      setPFeatures(arr.length > 0 ? arr : ['']);
    } catch(e) {
      setPFeatures(['']);
    }

    setPAplusContent(prod.aplus_content ? String(prod.aplus_content) : '');
    setPAplusBannerFile(null);
    setPAplusStoryFile(null);
    setPAmazonLink(prod.amazon_link || '');
    setPFlipkartLink(prod.flipkart_link || '');

    setIsProductModalOpen(true);
  };

  // Dynamic input adjusters for specifications
  const addSpecRow = () => setPSpecs([...pSpecs, { key: '', val: '' }]);
  const updateSpecRow = (idx, field, value) => {
    const fresh = [...pSpecs];
    fresh[idx][field] = value;
    setPSpecs(fresh);
  };
  const removeSpecRow = (idx) => setPSpecs(pSpecs.filter((_, i) => i !== idx));

  // Dynamic input adjusters for features
  const addFeatureRow = () => setPFeatures([...pFeatures, '']);
  const updateFeatureRow = (idx, value) => {
    const fresh = [...pFeatures];
    fresh[idx] = value;
    setPFeatures(fresh);
  };
  const removeFeatureRow = (idx) => setPFeatures(pFeatures.filter((_, i) => i !== idx));

  // CRUD HANDLERS
  // 1. Save Product (Add / Edit)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!pName || !pPrice || !pCategoryId) return;

    // Build specs JSON string
    const specMap = {};
    pSpecs.forEach(row => {
      if (row.key.trim() && row.val.trim()) {
        specMap[row.key.trim()] = row.val.trim();
      }
    });

    const cleanFeatures = pFeatures.filter(f => f.trim() !== '');

    const formData = new FormData();
    formData.append('name', pName);
    formData.append('sku', pSku);
    formData.append('description', pDescription);
    formData.append('price', pPrice);
    if (pSalePrice) formData.append('sale_price', pSalePrice);
    formData.append('stock', pStock);
    formData.append('category_id', pCategoryId);
    if (pBrandId) formData.append('brand_id', pBrandId);
    if (pMaterialId) formData.append('material_id', pMaterialId);
    if (pColorId) formData.append('color_id', pColorId);
    formData.append('is_featured', String(pIsFeatured));
    formData.append('is_best_seller', String(pIsBestseller));
    formData.append('is_new_arrival', String(pIsNewArrival));
    formData.append('is_available', String(pIsAvailable));
    formData.append('warranty', pWarranty);
    formData.append('delivery_info', pDelivery);
    formData.append('specifications', JSON.stringify(specMap));
    formData.append('features', JSON.stringify(cleanFeatures));
    formData.append('aplus_content', pAplusContent);
    formData.append('amazon_link', pAmazonLink);
    formData.append('flipkart_link', pFlipkartLink);
    if (pAplusBannerFile) formData.append('aplus_banner_file', pAplusBannerFile);
    if (pAplusStoryFile) formData.append('aplus_story_file', pAplusStoryFile);

    if (pImages && pImages.length > 0) {
      for (let i = 0; i < pImages.length; i++) {
        formData.append('images', pImages[i]);
      }
    }

    try {
      let response;
      if (editingProduct) {
        // EDIT
        response = await fetch(`${window.API_URL}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: formData
        });
      } else {
        // ADD
        response = await fetch(`${window.API_URL}/api/products`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: formData
        });
      }

      const res = await response.json();
      if (res.success) {
        triggerAlert(editingProduct ? 'Product details updated successfully.' : 'New product successfully added to store.');
        setIsProductModalOpen(false);
        fetchProducts();
      } else {
        triggerAlert(res.message, true);
      }
    } catch(err) {
      console.error(err);
      triggerAlert('Failed to submit product form.', true);
    }
  };

  // 2. Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${window.API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        triggerAlert('Product removed successfully.');
        fetchProducts();
      } else {
        triggerAlert(data.message, true);
      }
    } catch (err) {
      triggerAlert('Server connectivity error.', true);
    }
  };

  // 3. Clear Product Images
  const handleClearProductImages = async (id) => {
    if (!window.confirm('Are you sure you want to delete all current images for this product?')) return;
    try {
      const response = await fetch(`${window.API_URL}/api/products/${id}/images`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        triggerAlert('Product gallery cleared. Please upload new images by editing product.');
        fetchProducts();
      }
    } catch(err) {
      console.error(err);
    }
  };

  // 4. Save Category (Add / Edit)
  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault();
    if (!catName) return;

    const formData = new FormData();
    formData.append('name', catName);
    formData.append('parent_id', catParentId || '');
    if (catImage) formData.append('image', catImage);

    try {
      let response;
      if (editingCategory) {
        // EDIT
        response = await fetch(`${window.API_URL}/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: formData
        });
      } else {
        // ADD
        response = await fetch(`${window.API_URL}/api/categories`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` },
          body: formData
        });
      }

      const res = await response.json();
      if (res.success) {
        triggerAlert(editingCategory ? 'Category updated successfully.' : 'Category added successfully.');
        setCatName('');
        setCatParentId('');
        setCatImage(null);
        setEditingCategory(null);
        fetchCategories();
      } else {
        triggerAlert(res.message, true);
      }
    } catch (err) {
      triggerAlert('Failed to save category.', true);
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatParentId(cat.parent_id ? String(cat.parent_id) : '');
    setCatImage(null);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatParentId('');
    setCatImage(null);
  };

  // 5. Delete Category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category? Warning: Subcategories and products mapped might fail or lose association.')) return;
    try {
      const response = await fetch(`${window.API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        triggerAlert('Category deleted successfully.');
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Attributes submissions (Brand, Material, Color)
  const handleAddAttribute = async (e, type) => {
    e.preventDefault();
    let body = {};
    let url = '';

    if (type === 'brand') {
      if (!newBrandName) return;
      body = { name: newBrandName };
      url = `${window.API_URL}/api/attributes/brands`;
    } else if (type === 'material') {
      if (!newMaterialName) return;
      body = { name: newMaterialName };
      url = `${window.API_URL}/api/attributes/materials`;
    } else if (type === 'color') {
      if (!newColorName || !newColorCode) return;
      body = { name: newColorName, code: newColorCode };
      url = `${window.API_URL}/api/attributes/colors`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(body)
      });
      const res = await response.json();
      if (res.success) {
        triggerAlert(`Added ${type} successfully.`);
        setNewBrandName('');
        setNewMaterialName('');
        setNewColorName('');
        setNewColorCode('#000000');
        fetchAttributes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAttribute = async (id, type) => {
    if (!window.confirm('Delete this attribute?')) return;
    let url = `${window.API_URL}/api/attributes/${type}s/${id}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const res = await response.json();
      if (res.success) {
        triggerAlert('Attribute deleted.');
        fetchAttributes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Add Banner Slide
  const handleAddBannerSubmit = async (e) => {
    e.preventDefault();
    if (!banTitle || !banImage) return;

    const formData = new FormData();
    formData.append('title', banTitle);
    formData.append('subtitle', banSubtitle);
    formData.append('link', banLink);
    formData.append('image', banImage);

    try {
      const response = await fetch(`${window.API_URL}/api/admin/banners`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: formData
      });
      const res = await response.json();
      if (res.success) {
        triggerAlert('Banner slider added successfully.');
        setBanTitle('');
        setBanSubtitle('');
        setBanLink('/');
        setBanImage(null);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Remove banner slide?')) return;
    try {
      await fetch(`${window.API_URL}/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      triggerAlert('Banner deleted.');
      fetchBanners();
    } catch(err) {
      console.error(err);
    }
  };

  // 8. Update SEO Metadata
  const handleSeoSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${window.API_URL}/api/admin/seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          page_name: selectedSeoPage,
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerAlert(`SEO tags for page ${selectedSeoPage} updated.`);
        fetchSEO();
      }
    } catch(err) {
      console.error(err);
    }
  };

  // 9. Update Store Contact details
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${window.API_URL}/api/admin/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(contact)
      });
      const data = await response.json();
      if (data.success) {
        triggerAlert('Store contact details updated successfully.');
        fetchContactDetails();
      }
    } catch(err) {
      console.error(err);
    }
  };

  // 10. Review Moderation delete
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const response = await fetch(`${window.API_URL}/api/products/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        triggerAlert('Review removed from storefront.');
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter products by search text
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(prodSearch.toLowerCase())
  );

  return (
    <div className="container section-padding admin-layout" style={{ minHeight: '80vh' }}>
      
      {/* 1. Left Sidebar Navigation */}
      <aside style={{ borderRight: '1px solid var(--border)', paddingRight: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Admin Console</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Store Controls Since 1998</span>
          </div>

          <button onClick={() => setActiveTab('products')} style={activeTab === 'products' ? activeNavStyle : navStyle} className={activeTab === 'products' ? 'active-nav-btn' : 'nav-btn'}>
            <Package size={16} /> Products
          </button>
          <button onClick={() => setActiveTab('categories')} style={activeTab === 'categories' ? activeNavStyle : navStyle} className={activeTab === 'categories' ? 'active-nav-btn' : 'nav-btn'}>
            <FolderTree size={16} /> Categories
          </button>
          <button onClick={() => setActiveTab('attributes')} style={activeTab === 'attributes' ? activeNavStyle : navStyle} className={activeTab === 'attributes' ? 'active-nav-btn' : 'nav-btn'}>
            <Tag size={16} /> Filter Attributes
          </button>
          <button onClick={() => setActiveTab('banners')} style={activeTab === 'banners' ? activeNavStyle : navStyle} className={activeTab === 'banners' ? 'active-nav-btn' : 'nav-btn'}>
            <Image size={16} /> Sliders & Contact
          </button>
          <button onClick={() => setActiveTab('seo')} style={activeTab === 'seo' ? activeNavStyle : navStyle} className={activeTab === 'seo' ? 'active-nav-btn' : 'nav-btn'}>
            <Settings size={16} /> SEO Config
          </button>
          <button onClick={() => setActiveTab('reviews')} style={activeTab === 'reviews' ? activeNavStyle : navStyle} className={activeTab === 'reviews' ? 'active-nav-btn' : 'nav-btn'}>
            <Star size={16} /> Review Moderation
          </button>
          <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeNavStyle : navStyle} className={activeTab === 'users' ? 'active-nav-btn' : 'nav-btn'}>
            <User size={16} /> Registered Users
          </button>
          <button onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? activeNavStyle : navStyle} className={activeTab === 'orders' ? 'active-nav-btn' : 'nav-btn'}>
            <FileText size={16} /> Customer Orders
          </button>

          <button onClick={onLogout} style={{ ...navStyle, color: '#C84B31', marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '15px' }} className="signout-btn">
            Sign Out
          </button>

        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
        
        {/* Flash messages alerts */}
        {operationSuccess && (
          <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#E2F3EB', color: '#2E7D32', borderRadius: '8px', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} />
            <span>{operationSuccess}</span>
          </div>
        )}
        {operationError && (
          <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#FCE8E6', color: '#C84B31', borderRadius: '8px', fontSize: '0.85rem' }}>
            <X size={16} />
            <span>{operationError}</span>
          </div>
        )}

        {/* TAB 1: PRODUCTS CRUDS */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Store Products</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your active furniture and appliances inventory</p>
              </div>
              <button onClick={openAddProduct} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Search Filter bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
              <input 
                type="text" 
                placeholder="Search SKU or Product Name..." 
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Products Table list */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto', backgroundColor: '#FFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }} className="admin-table">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px' }}>Image</th>
                    <th style={{ padding: '12px' }}>Name / SKU</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Price (₹)</th>
                    <th style={{ padding: '12px' }}>Stock</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const activePrice = p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price);
                    const imgUrl = p.primary_image ? `${window.API_URL}${p.primary_image}` : 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=80&q=80';
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>
                          <img src={imgUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: '600', display: 'block' }}>{p.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</span>
                        </td>
                        <td style={{ padding: '12px' }}>{p.category_name}</td>
                        <td style={{ padding: '12px' }}>
                          {p.sale_price ? (
                            <>
                              <span style={{ color: '#C84B31', fontWeight: 'bold' }}>₹{activePrice.toLocaleString()}</span>
                              <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.72rem', display: 'block' }}>₹{parseFloat(p.price).toLocaleString()}</span>
                            </>
                          ) : (
                            <span>₹{parseFloat(p.price).toLocaleString()}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.stock}</td>
                        <td style={{ padding: '12px' }}>
                          {p.is_available === 1 ? (
                            <span style={{ color: '#2E7D32', fontWeight: 'bold' }}>Active</span>
                          ) : (
                            <span style={{ color: '#C84B31', fontWeight: 'bold' }}>Inactive</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button onClick={() => openEditProduct(p)} style={{ color: 'var(--primary)', padding: '4px' }} title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleClearProductImages(p.id)} style={{ color: 'var(--accent)', padding: '4px' }} title="Clear Images">
                              <Image size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#C84B31', padding: '4px' }} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES CRUD */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }} className="grid-2">
            
            {/* Categories list */}
            <div>
              <h2>Store Categories</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Current flat listing of category nodes</p>
              
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto', backgroundColor: '#FFF' }}>
                <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '10px' }}>ID</th>
                      <th style={{ padding: '10px' }}>Name</th>
                      <th style={{ padding: '10px' }}>Slug</th>
                      <th style={{ padding: '10px' }}>Parent ID</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px' }}>{cat.id}</td>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{cat.name}</td>
                        <td style={{ padding: '10px', fontSize: '0.78rem' }}>{cat.slug}</td>
                        <td style={{ padding: '10px' }}>{cat.parent_id || 'Root'}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button onClick={() => startEditCategory(cat)} style={{ color: 'var(--primary)', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat.id)} style={{ color: '#C84B31', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add/Edit Category Form */}
            <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
              <h3>{editingCategory ? 'Edit Category / Subcategory' : 'Add Category / Subcategory'}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{editingCategory ? 'Modify name, hierarchy parent or category banner' : 'Define nesting relationships (e.g. Sofa sets -> L Shape Sofa)'}</p>
              
              <form onSubmit={handleCategoryFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter category name"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="form-control" 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--primary)' }}>Parent Category</label>
                  <select 
                    value={catParentId}
                    onChange={(e) => setCatParentId(e.target.value)}
                    className="form-control"
                  >
                    <option value="">None (Makes this a Root category)</option>
                    {getFormattedCategoriesList().map(c => (
                      <option 
                        key={c.id} 
                        value={c.id}
                        style={{ fontWeight: c.isParent ? 'bold' : 'normal', color: c.isParent ? 'var(--primary)' : 'inherit' }}
                      >
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category Thumbnail Image</label>
                  <input 
                    type="file" 
                    onChange={(e) => setCatImage(e.target.files[0])}
                    className="form-control" 
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {editingCategory && (
                    <button type="button" onClick={cancelEditCategory} className="btn btn-outline" style={{ flex: 1, padding: '10px' }}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                    {editingCategory ? 'Save Changes' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* TAB 3: ATTRIBUTES (BRANDS, MATERIALS, COLORS) */}
        {activeTab === 'attributes' && (
          <div>
            <h2>Filter Attributes Management</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Manage filters used on listing pages</p>

            {/* Sub tab selectors */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {['brand', 'material', 'color'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setAttrSubTab(tab)}
                  style={{
                    padding: '8px 16px', borderRadius: '4px', fontSize: '0.88rem', fontWeight: '600',
                    backgroundColor: attrSubTab === tab ? 'var(--primary)' : 'transparent',
                    color: attrSubTab === tab ? '#FFFFFF' : 'var(--text-muted)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {tab === 'brand' ? 'Brands' : tab === 'material' ? 'Materials' : 'Colors'}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }} className="grid-2">
              
              {/* Attribute List */}
              <div>
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto', backgroundColor: '#FFF' }}>
                  <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Name</th>
                        {attrSubTab === 'color' && <th style={{ padding: '10px' }}>Code</th>}
                        <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attrSubTab === 'brand' && brands.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px' }}>{b.id}</td>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{b.name}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button onClick={() => handleDeleteAttribute(b.id, 'brand')} style={{ color: '#C84B31' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                      {attrSubTab === 'material' && materials.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px' }}>{m.id}</td>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{m.name}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button onClick={() => handleDeleteAttribute(m.id, 'material')} style={{ color: '#C84B31' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                      {attrSubTab === 'color' && colors.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px' }}>{c.id}</td>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{c.name}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: c.code, verticalAlign: 'middle', marginRight: '8px' }}></span>
                            {c.code}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button onClick={() => handleDeleteAttribute(c.id, 'color')} style={{ color: '#C84B31' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add form */}
              <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                <h3>Add {attrSubTab}</h3>
                
                {attrSubTab === 'brand' && (
                  <form onSubmit={(e) => handleAddAttribute(e, 'brand')} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Brand Name</label>
                      <input type="text" required placeholder="e.g. SDC Premium, Sony" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className="form-control" />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Brand</button>
                  </form>
                )}

                {attrSubTab === 'material' && (
                  <form onSubmit={(e) => handleAddAttribute(e, 'material')} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Material Name</label>
                      <input type="text" required placeholder="e.g. Sheesham Wood, Teak Wood" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} className="form-control" />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Material</button>
                  </form>
                )}

                {attrSubTab === 'color' && (
                  <form onSubmit={(e) => handleAddAttribute(e, 'color')} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Color Name</label>
                      <input type="text" required placeholder="e.g. Forest Green, Royal Blue" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Hex Code Color Picker</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="color" value={newColorCode} onChange={(e) => setNewColorCode(e.target.value)} style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }} />
                        <input type="text" value={newColorCode} onChange={(e) => setNewColorCode(e.target.value)} className="form-control" />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Add Color</button>
                  </form>
                )}

              </div>

            </div>
          </div>
        )}

        {/* TAB 4: BANNERS SLIDER & CONTACT DETAILS */}
        {activeTab === 'banners' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }} className="grid-2">
            
            {/* Banner Slider uploads */}
            <div>
              <h2>Homepage Banners</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Slider displays active promotional panels on homepage</p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto', backgroundColor: '#FFF', marginBottom: '30px' }}>
                <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '10px' }}>Image</th>
                      <th style={{ padding: '10px' }}>Title</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map(b => {
                      const img = b.image_url.startsWith('/') ? `${window.API_URL}${b.image_url}` : b.image_url;
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px' }}>
                            <img src={img} alt="" style={{ width: '60px', height: '30px', objectFit: 'cover' }} />
                          </td>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{b.title}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button onClick={() => handleDeleteBanner(b.id)} style={{ color: '#C84B31' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Banner Form */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3>Add Banner Slide</h3>
                <form onSubmit={handleAddBannerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Banner Header Text *</label>
                    <input type="text" required value={banTitle} onChange={(e) => setBanTitle(e.target.value)} placeholder="e.g. Royal Living Room Furniture" className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Sub-heading Text</label>
                    <input type="text" value={banSubtitle} onChange={(e) => setBanSubtitle(e.target.value)} placeholder="e.g. Up to 35% discount with direct billing" className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Action Redirection Link</label>
                    <input type="text" value={banLink} onChange={(e) => setBanLink(e.target.value)} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Banner Background Image *</label>
                    <input type="file" required onChange={(e) => setBanImage(e.target.files[0])} className="form-control" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Banner Slide</button>
                </form>
              </div>

            </div>

            {/* Store Contact details edit */}
            <div>
              <h2>Store Contact Settings</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Displays across header and footer contact lines</p>

              <div className="glass-panel" style={{ padding: '30px' }}>
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Phones (Comma Separated)</label>
                    <input type="text" required value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>WhatsApp Number</label>
                    <input type="text" required value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Email Address</label>
                    <input type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Showroom Address</label>
                    <textarea rows="3" required value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} className="form-control"></textarea>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Working Hours</label>
                    <input type="text" required value={contact.working_hours} onChange={(e) => setContact({ ...contact, working_hours: e.target.value })} className="form-control" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Store Details</button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SEO METADATA PANEL */}
        {activeTab === 'seo' && (
          <div style={{ maxWidth: '650px' }}>
            <h2>Dynamic SEO Meta Config</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Edit dynamic meta tag outputs for web robots and social crawls</p>

            <div className="glass-panel" style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Select Target Page</label>
                <select value={selectedSeoPage} onChange={(e) => handleSeoPageChange(e.target.value)} className="form-control">
                  <option value="home">Home Page (Landing)</option>
                  <option value="about">About Us Page</option>
                  <option value="contact">Contact Details Page</option>
                  <option value="services">Services Page</option>
                </select>
              </div>

              <form onSubmit={handleSeoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>SEO Title Tag</label>
                  <input type="text" required value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="form-control" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Meta Description</label>
                  <textarea rows="3" required value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="form-control"></textarea>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Meta Keywords (Comma Separated)</label>
                  <input type="text" required value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} className="form-control" />
                </div>
                <button type="submit" className="btn btn-primary">Update Page Metadata</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: REVIEW MODERATION */}
        {activeTab === 'reviews' && (
          <div>
            <h2>Customer Reviews Moderation</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Review and filter commentary visible on product detail pages</p>

            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto', backgroundColor: '#FFF' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="admin-table">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px' }}>Product</th>
                    <th style={{ padding: '12px' }}>Customer</th>
                    <th style={{ padding: '12px' }}>Rating</th>
                    <th style={{ padding: '12px' }}>Comment</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(rev => (
                    <tr key={rev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{rev.product_name}</td>
                      <td style={{ padding: '12px' }}>{rev.customer_name}</td>
                      <td style={{ padding: '12px', color: 'var(--accent)' }}>
                        {[...Array(rev.rating)].map((_, i) => '★')}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>"{rev.comment}"</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteReview(rev.id)} style={{ color: '#C84B31' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: REGISTERED USERS LIST */}
        {activeTab === 'users' && (
          <div>
            <h2>Registered Customers</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>List of customers registered since launching database features</p>

            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto', backgroundColor: '#FFF' }}>
              <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="admin-table">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Username</th>
                    <th style={{ padding: '12px' }}>Full Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Phone</th>
                    <th style={{ padding: '12px' }}>Address</th>
                    <th style={{ padding: '12px' }}>City</th>
                    <th style={{ padding: '12px' }}>State</th>
                    <th style={{ padding: '12px' }}>Pincode</th>
                    <th style={{ padding: '12px' }}>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.id}</td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>@{u.username}</td>
                      <td style={{ padding: '12px' }}>{u.full_name || '-'}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>{u.phone || '-'}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.address || '-'}</td>
                      <td style={{ padding: '12px' }}>{u.city || '-'}</td>
                      <td style={{ padding: '12px' }}>{u.state || '-'}</td>
                      <td style={{ padding: '12px' }}>{u.pincode || '-'}</td>
                      <td style={{ padding: '12px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {registeredUsers.length === 0 && (
                    <tr>
                      <td colSpan="10" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No registered users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: CUSTOMER ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Customer Orders Panel</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage checkout purchases, track fulfillment states, and print commercial receipts</p>
              </div>
            </div>

            {/* Dashboard Stats Cards */}
            <div className="admin-stats-grid">
              <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--primary)', backgroundColor: '#FFF' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '650' }}>TOTAL RECEIVED</span>
                <h3 style={{ fontSize: '1.8rem', margin: '5px 0 0 0', fontWeight: 'bold' }}>{orders.length}</h3>
              </div>
              <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #E65100', backgroundColor: '#FFF' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '650' }}>PENDING DISPATCH</span>
                <h3 style={{ fontSize: '1.8rem', margin: '5px 0 0 0', fontWeight: 'bold', color: '#E65100' }}>
                  {orders.filter(o => o.status === 'pending').length}
                </h3>
              </div>
              <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #1A73E8', backgroundColor: '#FFF' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '650' }}>DISPATCHED</span>
                <h3 style={{ fontSize: '1.8rem', margin: '5px 0 0 0', fontWeight: 'bold', color: '#1A73E8' }}>
                  {orders.filter(o => o.status === 'dispatched').length}
                </h3>
              </div>
              <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #2E7D32', backgroundColor: '#FFF' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '650' }}>COMPLETED ORDERS</span>
                <h3 style={{ fontSize: '1.8rem', margin: '5px 0 0 0', fontWeight: 'bold', color: '#2E7D32' }}>
                  {orders.filter(o => o.status === 'completed').length}
                </h3>
              </div>
            </div>

            {/* Filter Search bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Search Order No., Customer Name or Phone..." 
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Orders Table */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflowX: 'auto', backgroundColor: '#FFF' }}>
              <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="admin-table">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px' }}>Order No</th>
                    <th style={{ padding: '12px' }}>Customer Name / @Username</th>
                    <th style={{ padding: '12px' }}>Phone</th>
                    <th style={{ padding: '12px' }}>Total Amount</th>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Change Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => 
                    o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.full_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.phone.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.customer_username.toLowerCase().includes(orderSearch.toLowerCase())
                  ).map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{o.order_number}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontWeight: '600', display: 'block' }}>{o.full_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{o.customer_username}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{o.phone}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{parseFloat(o.total).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '15px', fontSize: '0.72rem', fontWeight: 'bold', textTransform: 'capitalize',
                          backgroundColor: o.status === 'completed' ? '#E2F3EB' : o.status === 'dispatched' ? '#EBF3FE' : o.status === 'cancelled' ? '#FCE8E6' : '#FFF3E0',
                          color: o.status === 'completed' ? '#2E7D32' : o.status === 'dispatched' ? '#1A73E8' : o.status === 'cancelled' ? '#C84B31' : '#E65100'
                        }}>
                          {o.status === 'pending' ? 'Pending Dispatch' : o.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <select 
                          value={o.status} 
                          onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', display: 'inline-block' }}
                        >
                          <option value="pending">Pending Dispatch</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedOrder(o)}
                          className="btn btn-outline" 
                          style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FileText size={12} /> View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* DYNAMIC PRODUCT FORM MODAL (ADD / EDIT) */}
      {isProductModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{
            width: '100%', maxWidth: '850px', maxHeight: '90vh', backgroundColor: '#FFFFFF',
            borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--primary)', color: '#FFF' }}>
              <h3 style={{ color: '#FFF' }}>{editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Add New Catalog Product'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} style={{ color: '#FFF' }}><X size={20} /></button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleProductSubmit} style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              
              {/* Block 1: Basic details */}
              <div className="grid-2" style={{ gap: '20px' }}>
                <div className="form-group">
                  <label>Product Title *</label>
                  <input type="text" required className="form-control" value={pName} onChange={(e) => setPName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>SKU (Unique) *</label>
                  <input type="text" required className="form-control" value={pSku} onChange={(e) => setPSku(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Long Description *</label>
                <textarea rows="3" required className="form-control" value={pDescription} onChange={(e) => setPDescription(e.target.value)}></textarea>
              </div>

              {/* Block 2: Pricing & Stock */}
              <div className="grid-3" style={{ gap: '20px' }}>
                <div className="form-group">
                  <label>Original Price (₹) *</label>
                  <input type="number" required className="form-control" value={pPrice} onChange={(e) => setPPrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Sale Price (₹)</label>
                  <input type="number" className="form-control" value={pSalePrice} onChange={(e) => setPSalePrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Stock Count *</label>
                  <input type="number" required className="form-control" value={pStock} onChange={(e) => setPStock(e.target.value)} />
                </div>
              </div>

              {/* Block 3: Filters Map selects */}
              <div className="grid-4" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select required className="form-control" value={pCategoryId} onChange={(e) => setPCategoryId(e.target.value)}>
                    <option value="">Select Category</option>
                    {getFormattedCategoriesList().map(c => (
                      <option 
                        key={c.id} 
                        value={c.id} 
                        style={{ fontWeight: c.isParent ? 'bold' : 'normal', color: c.isParent ? 'var(--primary)' : 'inherit' }}
                      >
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <select className="form-control" value={pBrandId} onChange={(e) => setPBrandId(e.target.value)}>
                    <option value="">None</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Material</label>
                  <select className="form-control" value={pMaterialId} onChange={(e) => setPMaterialId(e.target.value)}>
                    <option value="">None</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <select className="form-control" value={pColorId} onChange={(e) => setPColorId(e.target.value)}>
                    <option value="">None</option>
                    {colors.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Block 4: Promotional checkboxes */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={pIsFeatured} onChange={(e) => setPIsFeatured(e.target.checked)} />
                  <span>Featured Product</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={pIsBestseller} onChange={(e) => setPIsBestseller(e.target.checked)} />
                  <span>Best Seller</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={pIsNewArrival} onChange={(e) => setPIsNewArrival(e.target.checked)} />
                  <span>New Arrival</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={pIsAvailable} onChange={(e) => setPIsAvailable(e.target.checked)} />
                  <span>Active & Available</span>
                </label>
              </div>

              {/* Block 5: Logistics & Warranty */}
              <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Warranty Terms</label>
                  <input type="text" className="form-control" value={pWarranty} onChange={(e) => setPWarranty(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Delivery Timeline</label>
                  <input type="text" className="form-control" value={pDelivery} onChange={(e) => setPDelivery(e.target.value)} />
                </div>
              </div>

              {/* Block 5.5: External E-commerce Links */}
              <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Amazon Product Link</label>
                  <input type="url" placeholder="https://amazon.in/dp/... or store URL" className="form-control" value={pAmazonLink} onChange={(e) => setPAmazonLink(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Flipkart Product Link</label>
                  <input type="url" placeholder="https://flipkart.com/... or store URL" className="form-control" value={pFlipkartLink} onChange={(e) => setPFlipkartLink(e.target.value)} />
                </div>
              </div>

              {/* Block 6: Dynamic Specifications List builder */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Product Specifications</span>
                  <button type="button" onClick={addSpecRow} style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold' }}>+ Add Row</button>
                </div>
                {pSpecs.map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input type="text" placeholder="Key (e.g. Wood, Capacity)" value={row.key} onChange={(e) => updateSpecRow(idx, 'key', e.target.value)} className="form-control" style={{ padding: '6px' }} />
                    <input type="text" placeholder="Value (e.g. Teak, 240L)" value={row.val} onChange={(e) => updateSpecRow(idx, 'val', e.target.value)} className="form-control" style={{ padding: '6px' }} />
                    <button type="button" onClick={() => removeSpecRow(idx)} style={{ color: '#C84B31' }}>Delete</button>
                  </div>
                ))}
              </div>

              {/* Block 7: Dynamic Features List builder */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Key Features List</span>
                  <button type="button" onClick={addFeatureRow} style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 'bold' }}>+ Add Feature</button>
                </div>
                {pFeatures.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input type="text" placeholder="Feature detail..." value={feat} onChange={(e) => updateFeatureRow(idx, e.target.value)} className="form-control" style={{ padding: '6px' }} />
                    <button type="button" onClick={() => removeFeatureRow(idx)} style={{ color: '#C84B31' }}>Delete</button>
                  </div>
                ))}
              </div>

              {/* Block 7.5: Amazon-Style A+ Content (JSON format) */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Amazon-Style A+ Content (JSON String)</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setPAplusContent(JSON.stringify(woodTemplate, null, 2))}
                      style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid var(--primary)', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }}
                    >
                      + Load Wood template
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPAplusContent(JSON.stringify(electronicsTemplate, null, 2))}
                      style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }}
                    >
                      + Load Electronic template
                    </button>
                  </div>
                </div>
                <textarea 
                  rows="6" 
                  placeholder='{"banner_image": "...", "banner_title": "...", "features": [...] }'
                  className="form-control" 
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '15px' }}
                  value={pAplusContent} 
                  onChange={(e) => setPAplusContent(e.target.value)}
                />
                
                {/* Visual file uploads for banner and story */}
                <div className="grid-2" style={{ gap: '15px', marginBottom: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>A+ Banner Poster Image</label>
                    <input 
                      type="file" 
                      onChange={(e) => setPAplusBannerFile(e.target.files[0])} 
                      className="form-control" 
                      style={{ padding: '6px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>A+ Story Craft Image</label>
                    <input 
                      type="file" 
                      onChange={(e) => setPAplusStoryFile(e.target.files[0])} 
                      className="form-control" 
                      style={{ padding: '6px' }}
                    />
                  </div>
                </div>
                
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>* uploading new files will replace the corresponding banner_image or story_image properties in the JSON on save.</span>
              </div>

              {/* Block 8: Multi file image upload */}
              <div className="form-group">
                <label>Upload Product Images (Select multiple photos)</label>
                <input type="file" multiple onChange={(e) => setPImages(e.target.files)} className="form-control" />
                {editingProduct && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Adding files will append to the current product gallery. Click "Clear Images" in table to start fresh.</span>}
              </div>

              {/* Modal footer submit */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>Save Product</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE BILL INVOICE MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1300, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          <div style={{
            width: '95vw', maxWidth: '750px', maxHeight: '90vh', backgroundColor: '#FFFFFF',
            borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--primary)', color: '#FFF' }}>
              <h3 style={{ color: '#FFF', margin: 0 }}>GST Billing Invoice</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ color: '#FFF', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Modal Body (Invoice Layout) */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }} id="printable-invoice">
              
              {/* Commercial Invoice Heading */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary)', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontFamily: "'Playfair Display', serif", margin: 0, color: 'var(--primary)' }}>SDC CANTEEN</h2>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold', letterSpacing: '0.5px' }}>Furniture & Electronics Showroom</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px', maxWidth: '280px', lineHeight: '1.4' }}>
                    Near Balaji Goshala, Salasar Ke Samne, Sujangarh Road, Salasar, Churu, Rajasthan – 331506
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>COMMERCIAL BILL</h3>
                  <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '4px 0 0 0' }}>Bill No: {selectedOrder.order_number}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 'bold', margin: '4px 0 0 0' }}>Status: {selectedOrder.status.toUpperCase()}</p>
                </div>
              </div>

              {/* Customer and Seller metadata */}
              <div className="invoice-meta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Billed To (Customer):</span>
                  <p style={{ fontWeight: 'bold', margin: '2px 0' }}>{selectedOrder.full_name}</p>
                  <p style={{ margin: '2px 0' }}>Phone: {selectedOrder.phone}</p>
                  <p style={{ margin: '2px 0', whiteSpace: 'pre-line' }}>Address: {selectedOrder.address}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem' }}>Supplier Details:</span>
                  <p style={{ fontWeight: 'bold', margin: '2px 0' }}>SDC Furniture & Electronic Canteen</p>
                  <p style={{ margin: '2px 0' }}>Email: anjanamobile7751@gmail.com</p>
                  <p style={{ margin: '2px 0' }}>GSTIN: 08AAAAA1111A1Z0 (Mock)</p>
                </div>
              </div>

              {/* Items List Breakdown */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F0F2F1', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--primary)' }}>Description of Goods</th>
                    <th style={{ padding: '8px', textAlign: 'center', color: 'var(--primary)', width: '60px' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right', color: 'var(--primary)', width: '120px' }}>Rate (₹)</th>
                    <th style={{ padding: '8px', textAlign: 'right', color: 'var(--primary)', width: '120px' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', fontWeight: '500' }}>{item.product_name}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{parseFloat(item.price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Price Calculations */}
              <div style={{ width: '100%', maxWidth: '300px', marginLeft: 'auto', fontSize: '0.82rem', borderTop: '2px solid var(--primary)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Taxable Subtotal</span>
                  <span>₹{parseFloat(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>CGST + SGST (18%)</span>
                  <span>₹{parseFloat(selectedOrder.gst).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '0.95rem' }}>
                  <span>GRAND TOTAL</span>
                  <span>₹{parseFloat(selectedOrder.total).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Term notes */}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '25px', paddingTop: '10px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <p style={{ margin: '2px 0' }}>Thank you for doing business with us! SDC showroom salutes your trust since 1998.</p>
                <p style={{ margin: '2px 0', fontStyle: 'italic' }}>Authorized Signatory Seal & Signature (SDC Canteen)</p>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--border)', backgroundColor: '#FDFDFD' }} className="no-print">
              <button 
                type="button" 
                onClick={() => setSelectedOrder(null)} 
                className="btn btn-outline" 
                style={{ padding: '8px 16px' }}
              >
                Close Modal
              </button>
              <button 
                type="button" 
                onClick={() => window.print()} 
                className="btn btn-primary" 
                style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Printer size={16} /> Print Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled tags */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print, header, footer, aside, .signout-btn, main > div > div, .form-control {
            display: none !important;
          }
        }
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        @media (max-width: 1024px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .admin-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
        }
        @media (max-width: 500px) {
          .invoice-meta-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          .invoice-meta-grid > div:last-child {
            text-align: left !important;
          }
        }
        .admin-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 30px;
        }
        .admin-table th {
          background-color: var(--primary) !important;
          color: var(--text-light) !important;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-size: 0.75rem;
          border-bottom: 2px solid var(--accent);
          padding: 12px 10px !important;
        }
        .admin-table td {
          border-bottom: 1px solid var(--border);
          padding: 12px 10px !important;
          vertical-align: middle;
        }
        .admin-table tr:hover {
          background-color: rgba(10, 42, 27, 0.02) !important;
        }
        
        /* Mobile Premium Enhancements */
        @media (max-width: 900px) {
          .admin-layout {
            grid-template-columns: 1fr !important;
            gap: 25px !important;
          }
          .admin-layout aside {
            border-right: none !important;
            background: linear-gradient(135deg, var(--primary), var(--primary-light)) !important;
            border-radius: 16px;
            padding: 20px !important;
            box-shadow: 0 8px 25px rgba(10, 42, 27, 0.12) !important;
            margin-bottom: 10px !important;
          }
          .admin-layout aside h3 {
            color: #FFFFFF !important;
          }
          .admin-layout aside span {
            color: var(--accent) !important;
            font-weight: 500;
          }
          .admin-layout aside > div {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          
          /* Navigation items styled as premium pills */
          .admin-layout aside button {
            width: auto !important;
            flex: 1 1 135px;
            justify-content: center;
            font-size: 0.8rem !important;
            padding: 10px 14px !important;
            border-radius: 30px !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            color: rgba(255, 255, 255, 0.85) !important;
            background: rgba(255, 255, 255, 0.04) !important;
            transition: all 0.2s ease-in-out !important;
            margin-top: 0 !important;
          }
          .admin-layout aside button:hover {
            background: rgba(255, 255, 255, 0.09) !important;
            color: #FFFFFF !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
          }
          
          /* Active pill style override */
          .admin-layout aside button.active-nav-btn {
            background: var(--accent) !important;
            color: var(--primary) !important;
            font-weight: 700 !important;
            border-color: var(--accent) !important;
            box-shadow: 0 4px 15px rgba(212, 155, 40, 0.25) !important;
          }
          
          /* Signout pill style override */
          .admin-layout aside button.signout-btn {
            border-color: rgba(200, 75, 49, 0.3) !important;
            background: rgba(200, 75, 49, 0.1) !important;
            color: #FFA494 !important;
            margin-top: 5px !important;
            flex: 1 1 100% !important;
          }
          .admin-layout aside button.signout-btn:hover {
            background: rgba(200, 75, 49, 0.2) !important;
            color: #FFFFFF !important;
            border-color: rgba(200, 75, 49, 0.5) !important;
          }
          
          /* Title headings scale down */
          .admin-layout h2 {
            font-size: 1.5rem !important;
            font-family: 'Playfair Display', serif;
            margin-bottom: 6px;
          }
          .admin-layout p {
            font-size: 0.8rem !important;
          }
          
          /* Table cells resize */
          .admin-table th, .admin-table td {
            padding: 10px 8px !important;
            font-size: 0.78rem !important;
          }
        }
      `}</style>

    </div>
  );
}

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '10px 14px',
  borderRadius: '6px',
  color: 'var(--text-muted)',
  fontSize: '0.9rem',
  fontWeight: '500',
  textAlign: 'left'
};

const activeNavStyle = {
  ...navStyle,
  backgroundColor: 'var(--accent-light)',
  color: 'var(--primary)',
  fontWeight: '700'
};
