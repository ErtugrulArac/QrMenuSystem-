'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  ename: string;
  categoryId: string;
  image: string;
  price: number;
  description: string;
  edescription: string;
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ename: '',
    categoryId: '',
    image: '',
    price: '',
    description: '',
    edescription: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.ename ||
      !formData.categoryId ||
      !formData.image ||
      !formData.price
    ) {
      alert('Lütfen tüm zorunlu alanları doldurunuz');
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(
            products.map((p) => (p.id === editingId ? updated : p))
          );
          setEditingId(null);
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const newProduct = await res.json();
          setProducts([...products, newProduct]);
        }
      }
      setFormData({
        name: '',
        ename: '',
        categoryId: '',
        image: '',
        price: '',
        description: '',
        edescription: '',
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      ename: product.ename,
      categoryId: product.categoryId,
      image: product.image,
      price: product.price.toString(),
      description: product.description,
      edescription: product.edescription,
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ürün silinirken hata oluştu');
    }
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      ename: '',
      categoryId: '',
      image: '',
      price: '',
      description: '',
      edescription: '',
    });
    setEditingId(null);
    setShowModal(true);
  };

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Bilinmeyen';
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500'></div>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='flex-1'>
          <h2 className='text-xl md:text-2xl font-bold text-gray-900'>Ürünler</h2>
          <p className='text-gray-600 text-xs md:text-sm mt-1'>
            Toplam {products.length} ürün
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className='flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg font-medium text-sm md:text-base w-full sm:w-auto'
        >
          <FiPlus className='w-4 md:w-5 h-4 md:h-5' />
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className='text-center py-12 md:py-16 bg-white rounded-xl border-2 border-dashed border-gray-300'>
          <div className='w-16 md:w-20 h-16 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl md:text-4xl'>🍔</span>
          </div>
          <h3 className='text-lg md:text-xl font-semibold text-gray-900 mb-2'>Henüz ürün yok</h3>
          <p className='text-sm md:text-base text-gray-600 mb-6'>İlk ürününüzü ekleyerek başlayın</p>
          <button
            onClick={handleOpenModal}
            className='inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm md:text-base'
          >
            <FiPlus className='w-5 h-5' />
            İlk Ürünü Ekle
          </button>
        </div>
      ) : (
        <div className='space-y-3 md:space-y-4'>
          {products.map((product) => (
            <div
              key={product.id}
              className='bg-white rounded-lg md:rounded-xl border-2 border-gray-200 p-3 md:p-4 hover:border-green-500 hover:shadow-lg transition-all'
            >
              <div className='flex gap-3 md:gap-4'>
                <div className='w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden'>
                  <img
                    src={product.image}
                    alt={product.name}
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-bold text-gray-900 text-sm md:text-base truncate'>{product.name}</h3>
                      <p className='text-xs text-gray-500 mt-0.5 truncate'>🌍 {product.ename}</p>
                      <div className='mt-2 flex items-center gap-2 flex-wrap'>
                        <span className='text-xs bg-gray-100 px-2 py-1 rounded whitespace-nowrap'>
                          📁 {getCategoryName(product.categoryId)}
                        </span>
                        <span className='text-base md:text-lg font-bold text-green-600 whitespace-nowrap'>
                          💰 ₺{product.price}
                        </span>
                      </div>
                      {product.description && (
                        <p className='text-xs text-gray-600 mt-2 line-clamp-2 hidden md:block'>
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className='flex sm:flex-col gap-2 w-full sm:w-auto'>
                      <button
                        onClick={() => handleEdit(product)}
                        className='flex-1 sm:flex-initial flex items-center justify-center gap-1 p-2 md:p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors min-w-[80px] sm:min-w-0'
                        title='Düzenle'
                      >
                        <FiEdit2 className='w-4 md:w-5 h-4 md:h-5' />
                        <span className='text-xs md:text-sm font-medium sm:hidden'>Düzenle</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className='flex-1 sm:flex-initial flex items-center justify-center gap-1 p-2 md:p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors min-w-[80px] sm:min-w-0'
                        title='Sil'
                      >
                        <FiTrash2 className='w-4 md:w-5 h-4 md:h-5' />
                        <span className='text-xs md:text-sm font-medium sm:hidden'>Sil</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
          <div className='bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-slideUp max-h-[90vh] flex flex-col'>
            <div className='flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl flex-shrink-0'>
              <div>
                <h3 className='text-lg md:text-2xl font-bold text-gray-900'>
                  {editingId ? '✏️ Ürünü Düzenle' : '➕ Yeni Ürün Ekle'}
                </h3>
                <p className='text-xs md:text-sm text-gray-600 mt-1'>
                  {editingId ? 'Ürün bilgilerini güncelleyin' : 'Yeni bir ürün oluşturun'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className='p-2 hover:bg-red-100 rounded-lg transition-colors group flex-shrink-0'
              >
                <FiX className='w-5 h-5 text-gray-600 group-hover:text-red-600' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto flex-1'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                    <span className='text-base md:text-lg'>🇹🇷</span>
                    Ürün Adı (Türkçe) *
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm md:text-base'
                    placeholder='Örn: Çiçek Pastırma'
                    required
                  />
                </div>

                <div>
                  <label className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                    <span className='text-base md:text-lg'>🇬🇧</span>
                    Ürün Adı (İngilizce) *
                  </label>
                  <input
                    type='text'
                    value={formData.ename}
                    onChange={(e) =>
                      setFormData({ ...formData, ename: e.target.value })
                    }
                    className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm md:text-base'
                    placeholder='Örn: Flower Pastirma'
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                    <span className='text-base md:text-lg'>📁</span>
                    Kategori *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm md:text-base'
                    required
                  >
                    <option value=''>Kategori Seçiniz</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                    <span className='text-base md:text-lg'>💰</span>
                    Fiyat (₺) *
                  </label>
                  <input
                    type='number'
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm md:text-base'
                    placeholder='0.00'
                    step='0.01'
                    min='0'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                  <span className='text-base md:text-lg'>🖼️</span>
                  Resim URL *
                </label>
                <input
                  type='url'
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm md:text-base'
                  placeholder='https://example.com/image.jpg'
                  required
                />
                <p className='text-xs text-gray-500 mt-2'>
                  💡 Unsplash, Pexels veya kendi sunucunuzdan resim URL'si ekleyin
                </p>
              </div>

              {formData.image && (
                <div className='p-3 md:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                  <p className='text-xs font-semibold text-gray-700 mb-2'>🔍 Önizleme:</p>
                  <div className='relative h-40 md:h-48 rounded-lg overflow-hidden'>
                    <img
                      src={formData.image}
                      alt='Preview'
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300?text=Resim+Yüklenemedi';
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                  <span className='text-base md:text-lg'>🇹🇷</span>
                  Açıklama (Türkçe)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm md:text-base resize-none'
                  placeholder='Ürün açıklaması... (Opsiyonel)'
                  rows={3}
                />
              </div>

              <div>
                <label className='flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                  <span className='text-base md:text-lg'>🇬🇧</span>
                  Açıklama (İngilizce)
                </label>
                <textarea
                  value={formData.edescription}
                  onChange={(e) =>
                    setFormData({ ...formData, edescription: e.target.value })
                  }
                  className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm md:text-base resize-none'
                  placeholder='Product description... (Optional)'
                  rows={3}
                />
              </div>
            </form>

            <div className='flex gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0'>
              <button
                type='button'
                onClick={() => setShowModal(false)}
                className='flex-1 px-4 py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors font-semibold text-sm md:text-base'
              >
                ❌ İptal
              </button>
              <button
                type='submit'
                onClick={handleSubmit}
                className='flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 active:scale-95 transition-all font-semibold shadow-md hover:shadow-lg text-sm md:text-base'
              >
                {editingId ? '✅ Güncelle' : '➕ Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
