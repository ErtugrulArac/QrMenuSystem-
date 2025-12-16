'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  ename: string;
  image: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ename: '',
    image: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.ename || !formData.image) {
      alert('Lütfen tüm alanları doldurunuz');
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setCategories(
            categories.map((c) =>
              c.id === editingId ? { ...c, ...formData } : c
            )
          );
          setEditingId(null);
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const newCategory = await res.json();
          setCategories([...categories, newCategory]);
        }
      }
      setFormData({ name: '', ename: '', image: '' });
      setShowModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      ename: category.ename,
      image: category.image,
    });
    setEditingId(category.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategori silinirken hata oluştu');
    }
  };

  const handleOpenModal = () => {
    setFormData({ name: '', ename: '', image: '' });
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='flex-1'>
          <h2 className='text-xl md:text-2xl font-bold text-gray-900'>Kategoriler</h2>
          <p className='text-gray-600 text-xs md:text-sm mt-1'>
            Toplam {categories.length} kategori
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className='flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium text-sm md:text-base w-full sm:w-auto'
        >
          <FiPlus className='w-4 md:w-5 h-4 md:h-5' />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className='text-center py-12 md:py-16 bg-white rounded-xl border-2 border-dashed border-gray-300'>
          <div className='w-16 md:w-20 h-16 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl md:text-4xl'>📂</span>
          </div>
          <h3 className='text-lg md:text-xl font-semibold text-gray-900 mb-2'>Henüz kategori yok</h3>
          <p className='text-sm md:text-base text-gray-600 mb-6'>İlk kategorinizi ekleyerek başlayın</p>
          <button
            onClick={handleOpenModal}
            className='inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base'
          >
            <FiPlus className='w-5 h-5' />
            İlk Kategoriyi Ekle
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
          {categories.map((category) => (
            <div
              key={category.id}
              className='group bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all duration-300'
            >
              <div className='relative h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden'>
                <img
                  src={category.image}
                  alt={category.name}
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </div>
              <div className='p-4 md:p-5'>
                <div className='mb-3 md:mb-4'>
                  <h3 className='font-bold text-gray-900 text-base md:text-lg truncate group-hover:text-blue-600 transition-colors'>
                    {category.name}
                  </h3>
                  <p className='text-xs md:text-sm text-gray-500 mt-1 truncate'>
                    🌍 {category.ename}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleEdit(category)}
                    className='flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 md:py-2.5 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors text-xs md:text-sm font-medium'
                  >
                    <FiEdit2 className='w-3.5 md:w-4 h-3.5 md:h-4' />
                    <span>Düzenle</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className='flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-2 md:py-2.5 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors text-xs md:text-sm font-medium'
                  >
                    <FiTrash2 className='w-3.5 md:w-4 h-3.5 md:h-4' />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
          <div className='bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-slideUp'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
              <div>
                <h3 className='text-xl md:text-2xl font-bold text-gray-900'>
                  {editingId ? '✏️ Kategoriyi Düzenle' : '➕ Yeni Kategori Ekle'}
                </h3>
                <p className='text-xs md:text-sm text-gray-600 mt-1'>
                  {editingId ? 'Kategori bilgilerini güncelleyin' : 'Yeni bir kategori oluşturun'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className='p-2 hover:bg-red-100 rounded-lg transition-colors group'
              >
                <FiX className='w-5 h-5 text-gray-600 group-hover:text-red-600' />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className='p-6 space-y-5 max-h-[70vh] overflow-y-auto'>
              {/* Turkish Name */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <span className='text-lg'>🇹🇷</span>
                  Kategori Adı (Türkçe)
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm md:text-base'
                  placeholder='Örn: Atıştırmalıklar'
                  required
                />
              </div>

              {/* English Name */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <span className='text-lg'>🇬🇧</span>
                  Kategori Adı (İngilizce)
                </label>
                <input
                  type='text'
                  value={formData.ename}
                  onChange={(e) =>
                    setFormData({ ...formData, ename: e.target.value })
                  }
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm md:text-base'
                  placeholder='Örn: Appetizers'
                  required
                />
              </div>

              {/* Image URL */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'>
                  <span className='text-lg'>🖼️</span>
                  Resim URL
                </label>
                <input
                  type='url'
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm md:text-base'
                  placeholder='https://example.com/image.jpg'
                  required
                />
                <p className='text-xs text-gray-500 mt-2'>
                  💡 Unsplash, Pexels veya kendi sunucunuzdan resim URL'si ekleyin
                </p>
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className='mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                  <p className='text-xs font-semibold text-gray-700 mb-2'>🔍 Önizleme:</p>
                  <div className='relative h-48 rounded-lg overflow-hidden'>
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

              {/* Action Buttons */}
              <div className='flex gap-3 pt-4 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-semibold text-sm md:text-base'
                >
                  ❌ İptal
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all font-semibold shadow-md hover:shadow-lg text-sm md:text-base'
                >
                  {editingId ? '✅ Güncelle' : '➕ Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
