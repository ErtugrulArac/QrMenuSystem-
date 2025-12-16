'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiArrowLeft, FiCheck, FiX, FiEdit2 } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Campaign {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  discount: string;
  bgGradient: string;
  active: boolean;
  createdAt: string;
  duration?: number | null;
  durationUnit?: 'minutes' | 'hours' | 'days';
}

interface Announcement {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  bgGradient: string;
  active: boolean;
  createdAt: string;
  icon?: string;
}

const gradients = [
  { name: 'Kırmızı', value: 'from-red-600 to-red-400' },
  { name: 'Turuncu', value: 'from-orange-600 to-yellow-500' },
  { name: 'Mavi', value: 'from-blue-600 to-cyan-500' },
  { name: 'Mor', value: 'from-purple-600 to-pink-500' },
  { name: 'Yeşil', value: 'from-green-600 to-emerald-500' },
  { name: 'İndigo', value: 'from-indigo-600 to-blue-500' },
];

export default function CampaignsManagement() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'announcements'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    discount: '',
    icon: '📢',
    bgGradient: 'from-red-600 to-red-400',
    duration: null as number | null,
    durationUnit: 'minutes' as 'minutes' | 'hours' | 'days',
  });

  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Kampanyalar yüklenirken hata:', error);
      toast.error('Kampanyalar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Duyurular yüklenirken hata:', error);
      toast.error('Duyurular yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchAnnouncements();
  }, [fetchCampaigns, fetchAnnouncements]);

  const handleAdd = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Lütfen tüm zorunlu alanları doldurunuz!');
      return;
    }

    const endpoint = activeTab === 'campaigns' ? '/api/campaigns' : '/api/announcements';
    const successMsg = activeTab === 'campaigns' ? 'Kampanya eklendi!' : 'Duyuru eklendi!';

    try {
      setIsLoading(true);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newItem = await response.json();
        if (activeTab === 'campaigns') {
          setCampaigns([...campaigns, newItem]);
        } else {
          setAnnouncements([...announcements, newItem]);
        }
        resetForm();
        toast.success(successMsg);
      } else {
        toast.error(activeTab === 'campaigns' ? 'Kampanya eklenemedi' : 'Duyuru eklenemedi');
      }
    } catch (error) {
      console.error('Ekleme hatası:', error);
      toast.error('İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      discount: '',
      icon: '📢',
      bgGradient: 'from-red-600 to-red-400',
      duration: null,
      durationUnit: 'minutes',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const endpoint = activeTab === 'campaigns' ? `/api/campaigns/${id}` : `/api/announcements/${id}`;
    try {
      setIsLoading(true);
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (response.ok) {
        if (activeTab === 'campaigns') {
          setCampaigns(campaigns.filter(c => c.id !== id));
          toast.success('Kampanya silindi!');
        } else {
          setAnnouncements(announcements.filter(a => a.id !== id));
          toast.success('Duyuru silindi!');
        }
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Silme işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const endpoint = activeTab === 'campaigns' ? `/api/campaigns/${id}` : `/api/announcements/${id}`;
    try {
      setIsLoading(true);
      const response = await fetch(endpoint, {
        method: activeTab === 'campaigns' ? 'PATCH' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });

      if (response.ok) {
        if (activeTab === 'campaigns') {
          setCampaigns(campaigns.map(c => c.id === id ? { ...c, active: !currentActive } : c));
        } else {
          setAnnouncements(announcements.map(a => a.id === id ? { ...a, active: !currentActive } : a));
        }
        toast.success(currentActive ? 'Devre dışı bırakıldı' : 'Etkinleştirildi');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      toast.error('Durum güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: Campaign | Announcement) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      titleEn: item.titleEn,
      description: item.description,
      descriptionEn: item.descriptionEn,
      discount: 'discount' in item ? item.discount : '',
      icon: 'icon' in item ? item.icon || '📢' : '📢',
      bgGradient: item.bgGradient,
      duration: 'duration' in item ? item.duration || null : null,
      durationUnit: 'durationUnit' in item ? item.durationUnit || 'minutes' : 'minutes',
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Lütfen tüm zorunlu alanları doldurunuz!');
      return;
    }

    const endpoint = activeTab === 'campaigns' ? `/api/campaigns/${editingId}` : `/api/announcements/${editingId}`;
    try {
      setIsLoading(true);
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updated = await response.json();
        if (activeTab === 'campaigns') {
          setCampaigns(campaigns.map(c => c.id === editingId ? updated : c));
          toast.success('Kampanya güncellendi!');
        } else {
          setAnnouncements(announcements.map(a => a.id === editingId ? updated : a));
          toast.success('Duyuru güncellendi!');
        }
        resetForm();
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Güncelleme başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-40 w-full'>
        <div className='w-full px-4 md:px-8 py-4 md:py-6'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
            <div className='flex items-start gap-3 md:gap-4 flex-1'>
              <Link href="/dashboard" className='p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0'>
                <FiArrowLeft className='w-5 md:w-6 h-5 md:h-6 text-gray-600' />
              </Link>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>Kampanya Yönetimi</h1>
                <p className='text-gray-600 text-xs md:text-sm mt-1'>Duyuru ve kampanyaları yönetin</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              disabled={isLoading}
              className='flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm md:text-base whitespace-nowrap flex-shrink-0'
            >
              <FiPlus className='w-4 md:w-5 h-4 md:h-5' />
              <span className='hidden sm:inline'>{activeTab === 'campaigns' ? 'Kampanya' : 'Duyuru'} Ekle</span>
              <span className='sm:hidden'>Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white border-b border-gray-200 w-full'>
        <div className='w-full px-4 md:px-8'>
          <div className='flex gap-2 md:gap-4'>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 md:px-6 py-3 font-semibold text-sm md:text-base border-b-2 transition-colors ${
                activeTab === 'campaigns'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kampanyalar ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 md:px-6 py-3 font-semibold text-sm md:text-base border-b-2 transition-colors ${
                activeTab === 'announcements'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Duyurular ({announcements.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full px-4 md:px-8 py-6 md:py-8'>
        {activeTab === 'campaigns' ? (
          campaigns.length === 0 ? (
            <div className='text-center py-8 md:py-12 bg-white rounded-xl border-2 border-dashed border-gray-300'>
              <p className='text-gray-600 mb-4 text-base md:text-lg'>Henüz kampanya eklenmemiş</p>
              <button
                onClick={() => setShowModal(true)}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base'
              >
                İlk Kampanayı Ekle
              </button>
            </div>
          ) : (
            <div className='space-y-3 md:space-y-4'>
              {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`bg-gradient-to-br ${campaign.bgGradient} rounded-lg md:rounded-xl p-3 md:p-4 text-white shadow-lg transition-all duration-300 ${
                  !campaign.active ? 'opacity-60' : ''
                }`}
              >
                {/* Header Row - Title + Actions */}
                <div className='flex justify-between items-start gap-2 mb-3'>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-base md:text-xl font-bold truncate'>{campaign.title}</h3>
                    <span className='text-xs opacity-75 block truncate'>{campaign.titleEn}</span>
                  </div>

                  {/* Actions - Compact Icons */}
                  <div className='flex gap-1 flex-shrink-0'>
                    <button
                      onClick={() => handleEdit(campaign)}
                      disabled={isLoading}
                      className='p-1.5 md:p-2 bg-blue-500/40 hover:bg-blue-500/60 text-white rounded transition-colors disabled:opacity-50'
                      title='Düzenle'
                    >
                      <FiEdit2 className='w-3.5 md:w-4 h-3.5 md:h-4' />
                    </button>
                    <button
                      onClick={() => handleToggleActive(campaign.id, campaign.active)}
                      disabled={isLoading}
                      className={`p-1.5 md:p-2 rounded transition-colors ${
                        campaign.active
                          ? 'bg-white/20 hover:bg-white/30'
                          : 'bg-gray-400/50 hover:bg-gray-400/70'
                      } disabled:opacity-50`}
                      title={campaign.active ? 'Devre dışı bırak' : 'Etkinleştir'}
                    >
                      {campaign.active ? <FiCheck className='w-3.5 md:w-4 h-3.5 md:h-4' /> : <FiX className='w-3.5 md:w-4 h-3.5 md:h-4' />}
                    </button>
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      disabled={isLoading}
                      className='p-1.5 md:p-2 bg-red-500/40 hover:bg-red-500/60 text-white rounded transition-colors disabled:opacity-50'
                      title='Sil'
                    >
                      <FiTrash2 className='w-3.5 md:w-4 h-3.5 md:h-4' />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className='mb-3'>
                  <p className='text-white/90 text-xs md:text-sm line-clamp-2 mb-1'>{campaign.description}</p>
                  <p className='text-white/75 text-xs opacity-90'>{campaign.descriptionEn}</p>
                </div>

                {/* Badge */}
                <div className='flex justify-between items-center'>
                  <div className='inline-block bg-white/25 px-2.5 md:px-3 py-1 rounded font-bold text-xs md:text-sm'>
                    {campaign.discount}
                  </div>
                  {campaign.duration && (
                    <span className='text-xs opacity-75'>⏱ {campaign.duration} {campaign.durationUnit || 'dk'}</span>
                  )}
                </div>
              </div>
              ))}
            </div>
          )
        ) : (
          announcements.length === 0 ? (
            <div className='text-center py-8 md:py-12 bg-white rounded-xl border-2 border-dashed border-gray-300'>
              <p className='text-gray-600 mb-4 text-base md:text-lg'>Henüz duyuru eklenmemiş</p>
              <button
                onClick={() => setShowModal(true)}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base'
              >
                İlk Duyuruyu Ekle
              </button>
            </div>
          ) : (
            <div className='space-y-3 md:space-y-4'>
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`bg-gradient-to-br ${announcement.bgGradient} rounded-lg md:rounded-xl p-3 md:p-4 text-white shadow-lg transition-all duration-300 ${
                    !announcement.active ? 'opacity-60' : ''
                  }`}
                >
                  <div className='flex justify-between items-start gap-2 mb-3'>
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      <span className='text-2xl'>{announcement.icon || '📢'}</span>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base md:text-xl font-bold truncate'>{announcement.title}</h3>
                        <span className='text-xs opacity-75 block truncate'>{announcement.titleEn}</span>
                      </div>
                    </div>

                    <div className='flex gap-1 flex-shrink-0'>
                      <button
                        onClick={() => handleEdit(announcement)}
                        disabled={isLoading}
                        className='p-1.5 md:p-2 bg-blue-500/40 hover:bg-blue-500/60 text-white rounded transition-colors disabled:opacity-50'
                        title='Düzenle'
                      >
                        <FiEdit2 className='w-3.5 md:w-4 h-3.5 md:h-4' />
                      </button>
                      <button
                        onClick={() => handleToggleActive(announcement.id, announcement.active)}
                        disabled={isLoading}
                        className={`p-1.5 md:p-2 rounded transition-colors ${
                          announcement.active
                            ? 'bg-white/20 hover:bg-white/30'
                            : 'bg-gray-400/50 hover:bg-gray-400/70'
                        } disabled:opacity-50`}
                        title={announcement.active ? 'Devre dışı bırak' : 'Etkinleştir'}
                      >
                        {announcement.active ? <FiCheck className='w-3.5 md:w-4 h-3.5 md:h-4' /> : <FiX className='w-3.5 md:w-4 h-3.5 md:h-4' />}
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        disabled={isLoading}
                        className='p-1.5 md:p-2 bg-red-500/40 hover:bg-red-500/60 text-white rounded transition-colors disabled:opacity-50'
                        title='Sil'
                      >
                        <FiTrash2 className='w-3.5 md:w-4 h-3.5 md:h-4' />
                      </button>
                    </div>
                  </div>

                  <div className='mb-3'>
                    <p className='text-white/90 text-xs md:text-sm line-clamp-2 mb-1'>{announcement.description}</p>
                    <p className='text-white/75 text-xs opacity-90'>{announcement.descriptionEn}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-3 md:p-4 z-50'>
          <div className='bg-white rounded-lg md:rounded-xl p-4 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6'>
              {editingId 
                ? (activeTab === 'campaigns' ? 'Kampanyayı Düzenle' : 'Duyuruyu Düzenle')
                : (activeTab === 'campaigns' ? 'Kampanya Ekle' : 'Duyuru Ekle')
              }
            </h2>

            <div className='space-y-3 md:space-y-4'>
              {/* Title TR */}
              <div>
                <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                  Başlık (Türkçe) *
                </label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder='örn: Hafta Sonu Özel'
                  className='w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Title EN */}
              <div>
                <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                  Başlık (İngilizce) *
                </label>
                <input
                  type='text'
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder='eg. Weekend Special'
                  className='w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Description TR */}
              <div>
                <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                  Açıklama (Türkçe) *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder='Kampanya hakkında detaylı bilgi'
                  className='w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                />
              </div>

              {/* Description EN */}
              <div>
                <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                  Açıklama (İngilizce) *
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder='Campaign details in English'
                  className='w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={3}
                />
              </div>

              {/* Kampanya için Discount + Duration */}
              {activeTab === 'campaigns' && (
                <>
                  <div>
                    <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                      İndirim Etiketi *
                    </label>
                    <input
                      type='text'
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder='örn: %20, 2+1, Keşfet'
                      className='w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>

                  <div>
                    <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                      Geri Sayım Süresi
                      <span className='text-xs text-gray-500 ml-2'>(İsteğe bağlı)</span>
                    </label>
                    <div className='flex gap-2 mb-2'>
                      <input
                        type='number'
                        min='1'
                        value={formData.duration === null ? '' : formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder='Örn: 30'
                        className='flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                      <select
                        value={formData.durationUnit}
                        onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value as 'minutes' | 'hours' | 'days' })}
                        className='px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value='minutes'>Dakika</option>
                        <option value='hours'>Saat</option>
                        <option value='days'>Gün</option>
                      </select>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Boş bırakırsanız geri sayım gösterilmez
                    </p>
                  </div>
                </>
              )}

              {/* Duyuru için Icon */}
              {activeTab === 'announcements' && (
                <div>
                  <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                    Emoji/İkon
                  </label>
                  <div className='flex gap-2'>
                    {['📢', '🎉', '⚠️', '💡', '🎁', '🔔', '✨', '🚀'].map((emoji) => (
                      <button
                        key={emoji}
                        type='button'
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                          formData.icon === emoji
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gradient */}
              <div>
                <label className='block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2'>
                  Renk Şeması *
                </label>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                  {gradients.map((grad) => (
                    <button
                      key={grad.value}
                      onClick={() => setFormData({ ...formData, bgGradient: grad.value })}
                      className={`p-2 md:p-4 rounded-lg font-medium transition-all border-2 ${
                        formData.bgGradient === grad.value
                          ? 'border-gray-900 shadow-lg'
                          : 'border-transparent'
                      }`}
                      style={{
                        backgroundImage: `linear-gradient(135deg, var(--color-start), var(--color-end))`,
                      }}
                    >
                      <div className={`bg-gradient-to-br ${grad.value} p-3 md:p-6 rounded text-white font-bold text-xs md:text-sm text-center`}>
                        {grad.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex gap-2 md:gap-3 mt-6 md:mt-8'>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                disabled={isLoading}
                className='flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50'
              >
                İptal
              </button>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                disabled={isLoading}
                className='flex-1 px-3 md:px-4 py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50'
              >
                {isLoading ? 'İşleniyor...' : editingId ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
