import type { FormEvent, ChangeEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

type Slide = {
  _id: string
  title: string
  subtitle: string
  imageUrl: string
}

type SlideDraft = {
  title: string
  subtitle: string
  image: File | null
}

type Product = {
  _id: string
  name: string
  description: string
  longDescription?: string
  price: number
  currency: string
  mainImageUrl: string
  gallery: { url: string }[]
  links: {
    shopee?: string
    tiktok?: string
    whatsapp?: string
  }
}

type ProductDraft = {
  name: string
  description: string
  longDescription: string
  price: string
  currency: string
  mainImage: File | null
  gallery: File[]
  links: {
    shopee: string
    tiktok: string
    whatsapp: string
  }
}

const API_URL = import.meta.env.VITE_API_URL ?? 'https://adra-backend.vercel.app'

const defaultSlideDraft: SlideDraft = {
  title: '',
  subtitle: '',
  image: null,
}

const defaultProductDraft: ProductDraft = {
  name: '',
  description: '',
  longDescription: '',
  price: '',
  currency: 'IDR',
  mainImage: null,
  gallery: [],
  links: {
    shopee: '',
    tiktok: '',
    whatsapp: '',
  },
}

const AdminDashboard = () => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') ?? '')
  const [slides, setSlides] = useState<Slide[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingSlides, setLoadingSlides] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    setupCode: '',
  })
  const [newSlide, setNewSlide] = useState<SlideDraft>(defaultSlideDraft)
  const [slideDrafts, setSlideDrafts] = useState<Record<string, SlideDraft>>({})
  const [newProduct, setNewProduct] = useState<ProductDraft>(defaultProductDraft)
  const [productDrafts, setProductDrafts] = useState<Record<string, ProductDraft>>({})
  const [newProductMainPreview, setNewProductMainPreview] = useState<string | null>(null)
  const [newProductGalleryPreviews, setNewProductGalleryPreviews] = useState<string[]>([])
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [isDeletingProductId, setIsDeletingProductId] = useState<string | null>(null)
  const [isUpdatingProductId, setIsUpdatingProductId] = useState<string | null>(null)
  const [deletedGalleryIndices, setDeletedGalleryIndices] = useState<Record<string, number[]>>({})
  const [productMainImagePreviews, setProductMainImagePreviews] = useState<Record<string, string>>({})
  const [productGalleryPreviews, setProductGalleryPreviews] = useState<Record<string, string[]>>({})

  useEffect(() => {
    return () => {
      if (newProductMainPreview) {
        URL.revokeObjectURL(newProductMainPreview)
      }
    }
  }, [newProductMainPreview])

  useEffect(() => {
    return () => {
      newProductGalleryPreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [newProductGalleryPreviews])

  const isAuthenticated = Boolean(token)

  const showFeedback = useCallback((type: 'message' | 'error', text: string) => {
    if (type === 'message') {
      setMessage(text)
      setError(null)
    } else {
      setError(text)
      setMessage(null)
    }
  }, [])

  const fetchSlides = useCallback(async () => {
    setLoadingSlides(true)
    try {
      const response = await fetch(`${API_URL}/api/slides`)
      if (!response.ok) {
        throw new Error('Gagal mengambil data slide')
      }
      const data: Slide[] = await response.json()
      setSlides(data)
      setSlideDrafts(
        data.reduce<Record<string, SlideDraft>>((acc, slide) => {
          acc[slide._id] = {
            title: slide.title,
            subtitle: slide.subtitle,
            image: null,
          }
          return acc
        }, {})
      )
    } catch (err) {
      console.error(err)
      showFeedback('error', err instanceof Error ? err.message : 'Gagal memuat slide')
    } finally {
      setLoadingSlides(false)
    }
  }, [showFeedback])

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch(`${API_URL}/api/products`)
      if (!response.ok) {
        throw new Error('Gagal mengambil data produk')
      }
      const data: Product[] = await response.json()
      setProducts(data)
      setProductDrafts(
        data.reduce<Record<string, ProductDraft>>((acc, product) => {
          acc[product._id] = {
            name: product.name,
            description: product.description,
            longDescription: product.longDescription ?? '',
            price: product.price.toString(),
            currency: product.currency ?? 'IDR',
            mainImage: null,
            gallery: [],
            links: {
              shopee: product.links?.shopee ?? '',
              tiktok: product.links?.tiktok ?? '',
              whatsapp: product.links?.whatsapp ?? '',
            },
          }
          return acc
        }, {})
      )
    } catch (err) {
      console.error(err)
      showFeedback('error', err instanceof Error ? err.message : 'Gagal memuat produk')
    } finally {
      setLoadingProducts(false)
    }
  }, [showFeedback])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSlides()
      fetchProducts()
    }
  }, [fetchSlides, fetchProducts, isAuthenticated])

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setError(null)

    const endpoint = authTab === 'login' ? 'login' : 'register'
    const payload: Record<string, string> = {
      email: authForm.email,
      password: authForm.password,
    }

    if (authTab === 'register') {
      payload.setupCode = authForm.setupCode
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message ?? 'Permintaan gagal')
      }

      if (endpoint === 'login') {
        localStorage.setItem('adminToken', data.token)
        setToken(data.token)
        showFeedback('message', 'Berhasil masuk')
      } else {
        showFeedback('message', 'Admin baru berhasil dibuat. Silakan login.')
        setAuthTab('login')
      }
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Kesalahan tidak diketahui')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken('')
    setSlides([])
    setSlideDrafts({})
    setNewSlide(defaultSlideDraft)
    setProducts([])
    setProductDrafts({})
    setNewProduct(defaultProductDraft)
    if (newProductMainPreview) {
      URL.revokeObjectURL(newProductMainPreview)
    }
    newProductGalleryPreviews.forEach((url) => URL.revokeObjectURL(url))
    setNewProductMainPreview(null)
    setNewProductGalleryPreviews([])
  }

  const authorizedFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Token tidak ditemukan')
    }

    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${token}`)

    return fetch(url, { ...options, headers })
  }

  const handleNewProductMainImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setNewProduct((prev) => ({ ...prev, mainImage: file }))
    setNewProductMainPreview((prevPreview) => {
      if (prevPreview) URL.revokeObjectURL(prevPreview)
      return file ? URL.createObjectURL(file) : null
    })
  }

  const handleClearNewProductMainImage = () => {
    setNewProduct((prev) => ({ ...prev, mainImage: null }))
    setNewProductMainPreview((prevPreview) => {
      if (prevPreview) URL.revokeObjectURL(prevPreview)
      return null
    })
  }

  const handleNewProductGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : []
    setNewProduct((prev) => ({ ...prev, gallery: files }))
    setNewProductGalleryPreviews((prevPreviews) => {
      prevPreviews.forEach((url) => URL.revokeObjectURL(url))
      return files.map((file) => URL.createObjectURL(file))
    })
  }

  const handleRemoveNewGalleryImage = (index: number) => {
    setNewProduct((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== index),
    }))
    setNewProductGalleryPreviews((prev) => {
      if (prev[index]) {
        URL.revokeObjectURL(prev[index])
      }
      return prev.filter((_, idx) => idx !== index)
    })
  }

  const handleCreateSlide = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newSlide.image) {
      showFeedback('error', 'Gambar wajib diunggah')
      return
    }

    const formData = new FormData()
    formData.append('title', newSlide.title)
    formData.append('subtitle', newSlide.subtitle)
    formData.append('image', newSlide.image)

    try {
      const response = await authorizedFetch(`${API_URL}/api/slides`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message ?? 'Gagal membuat slide')
      }

      setNewSlide(defaultSlideDraft)
      showFeedback('message', 'Slide berhasil ditambahkan')
      fetchSlides()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal membuat slide')
    }
  }

  const handleUpdateSlide = async (slideId: string) => {
    const draft = slideDrafts[slideId]

    if (!draft) {
      return
    }

    if (!draft.title && !draft.subtitle && !draft.image) {
      showFeedback('error', 'Tidak ada perubahan untuk disimpan')
      return
    }

    const formData = new FormData()
    if (draft.title) formData.append('title', draft.title)
    if (draft.subtitle) formData.append('subtitle', draft.subtitle)
    if (draft.image) formData.append('image', draft.image)

    try {
      const response = await authorizedFetch(`${API_URL}/api/slides/${slideId}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message ?? 'Gagal memperbarui slide')
      }

      showFeedback('message', 'Slide berhasil diperbarui')
      fetchSlides()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal memperbarui slide')
    }
  }

  const handleDeleteSlide = async (slideId: string) => {
    if (!window.confirm('Hapus slide ini?')) {
      return
    }

    try {
      const response = await authorizedFetch(`${API_URL}/api/slides/${slideId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message ?? 'Gagal menghapus slide')
      }

      showFeedback('message', 'Slide dihapus')
      fetchSlides()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menghapus slide')
    }
  }

  const authFormTitle = authTab === 'login' ? 'Masuk Admin' : 'Daftar Admin'

  const renderSlideCard = (slide: Slide) => {
    const draft = slideDrafts[slide._id] ?? defaultSlideDraft

    return (
      <div key={slide._id} className="border rounded-lg p-4 shadow-sm space-y-4 bg-white">
        <div className="flex flex-col md:flex-row gap-4">
          <img src={slide.imageUrl} alt={slide.title} className="w-full md:w-48 h-32 object-cover rounded" />
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">Judul</label>
              <input
                type="text"
                value={draft.title}
                onChange={(event) =>
                  setSlideDrafts((prev) => ({
                    ...prev,
                    [slide._id]: { ...draft, title: event.target.value },
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Subjudul</label>
              <textarea
                value={draft.subtitle}
                onChange={(event) =>
                  setSlideDrafts((prev) => ({
                    ...prev,
                    [slide._id]: { ...draft, subtitle: event.target.value },
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Ganti Gambar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setSlideDrafts((prev) => ({
                    ...prev,
                    [slide._id]: { ...draft, image: event.target.files?.[0] ?? null },
                  }))
                }
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleUpdateSlide(slide._id)}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition"
          >
            Simpan
          </button>
          <button
            onClick={() =>
              setSlideDrafts((prev) => ({
                ...prev,
                [slide._id]: {
                  title: slide.title,
                  subtitle: slide.subtitle,
                  image: null,
                },
              }))
            }
            className="px-4 py-2 rounded border border-gray-300 text-gray-700"
          >
            Reset
          </button>
          <button
            onClick={() => handleDeleteSlide(slide._id)}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500 transition"
          >
            Hapus
          </button>
        </div>
      </div>
    )
  }

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newProduct.mainImage) {
      showFeedback('error', 'Gambar utama wajib diunggah')
      return
    }

    const formData = new FormData()
    formData.append('name', newProduct.name)
    formData.append('description', newProduct.description)
    if (newProduct.longDescription) formData.append('longDescription', newProduct.longDescription)
    formData.append('price', newProduct.price)
    formData.append('currency', newProduct.currency || 'IDR')
    formData.append('mainImage', newProduct.mainImage)
    newProduct.gallery.forEach((file) => formData.append('gallery', file))
    formData.append('links', JSON.stringify(newProduct.links))

    setIsCreatingProduct(true)

    try {
      const response = await authorizedFetch(`${API_URL}/api/products`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message ?? 'Gagal membuat produk')
      }

      setNewProduct(defaultProductDraft)
      if (newProductMainPreview) {
        URL.revokeObjectURL(newProductMainPreview)
      }
      newProductGalleryPreviews.forEach((url) => URL.revokeObjectURL(url))
      setNewProductMainPreview(null)
      setNewProductGalleryPreviews([])
      showFeedback('message', 'Produk berhasil ditambahkan')
      fetchProducts()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal membuat produk')
    } finally {
      setIsCreatingProduct(false)
    }
  }

  const handleUpdateProduct = async (productId: string) => {
    const draft = productDrafts[productId]
    if (!draft) return

    setIsUpdatingProductId(productId)
    const formData = new FormData()
    formData.append('name', draft.name)
    formData.append('description', draft.description)
    formData.append('longDescription', draft.longDescription)
    formData.append('price', draft.price)
    formData.append('currency', draft.currency)
    formData.append('links', JSON.stringify(draft.links))
    
    // Kirim deletedGalleryIndices jika ada
    const deletedIndices = deletedGalleryIndices[productId] || []
    if (deletedIndices.length > 0) {
      formData.append('deletedGalleryIndices', JSON.stringify(deletedIndices))
    }
    
    if (draft.mainImage) {
      formData.append('mainImage', draft.mainImage)
    }
    draft.gallery.forEach((file) => formData.append('gallery', file))

    try {
      const response = await authorizedFetch(`${API_URL}/api/products/${productId}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message ?? 'Gagal memperbarui produk')
      }

      // Reset deleted indices setelah berhasil
      setDeletedGalleryIndices((prev) => {
        const newState = { ...prev }
        delete newState[productId]
        return newState
      })
      
      // Cleanup preview URLs setelah berhasil
      if (productMainImagePreviews[productId]) {
        URL.revokeObjectURL(productMainImagePreviews[productId])
        setProductMainImagePreviews((prev) => {
          const newState = { ...prev }
          delete newState[productId]
          return newState
        })
      }
      if (productGalleryPreviews[productId]) {
        productGalleryPreviews[productId].forEach((url) => URL.revokeObjectURL(url))
        setProductGalleryPreviews((prev) => {
          const newState = { ...prev }
          delete newState[productId]
          return newState
        })
      }
      
      showFeedback('message', 'Produk berhasil diperbarui')
      fetchProducts()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal memperbarui produk')
    } finally {
      setIsUpdatingProductId(null)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Hapus produk ini?')) return
    try {
      const response = await authorizedFetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message ?? 'Gagal menghapus produk')
      }
      showFeedback('message', 'Produk dihapus')
      fetchProducts()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menghapus produk')
    } finally {
      setIsDeletingProductId(null)
    }
  }

  const handleDeleteGalleryItem = async (productId: string, galleryIndex: number) => {
    try {
      const formData = new FormData()
      formData.append('deletedGalleryIndices', JSON.stringify([galleryIndex]))

      const response = await authorizedFetch(`${API_URL}/api/products/${productId}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message ?? 'Gagal menghapus gallery item')
      }

      showFeedback('message', 'Gallery item dihapus')
      fetchProducts()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Gagal menghapus gallery item')
    }
  }

  const renderProductCard = (product: Product) => {
    const draft = productDrafts[product._id] ?? defaultProductDraft

    return (
      <div key={product._id} className="border rounded-lg p-4 shadow-sm space-y-4 bg-white">
        <div className="grid gap-4 md:grid-cols-[200px,1fr]">
          <img src={product.mainImageUrl} alt={product.name} className="w-full h-40 object-cover rounded" />
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">Nama Produk</label>
              <input
                type="text"
                value={draft.name}
                onChange={(event) =>
                  setProductDrafts((prev) => ({
                    ...prev,
                    [product._id]: { ...draft, name: event.target.value },
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Deskripsi singkat</label>
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setProductDrafts((prev) => ({
                    ...prev,
                    [product._id]: { ...draft, description: event.target.value },
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Deskripsi lengkap</label>
              <textarea
                value={draft.longDescription}
                onChange={(event) =>
                  setProductDrafts((prev) => ({
                    ...prev,
                    [product._id]: { ...draft, longDescription: event.target.value },
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">Harga (IDR)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.price}
                  onChange={(event) =>
                    setProductDrafts((prev) => ({
                      ...prev,
                      [product._id]: { ...draft, price: event.target.value },
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Mata uang</label>
                <input
                  type="text"
                  value={draft.currency}
                  onChange={(event) =>
                    setProductDrafts((prev) => ({
                      ...prev,
                      [product._id]: { ...draft, currency: event.target.value.toUpperCase() },
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['shopee', 'tiktok', 'whatsapp'] as const).map((linkKey) => (
                <div key={linkKey}>
                  <label className="block text-xs font-medium text-gray-500 capitalize">{linkKey}</label>
                  <input
                    type="url"
                    value={draft.links[linkKey]}
                    placeholder="https://"
                    onChange={(event) =>
                      setProductDrafts((prev) => ({
                        ...prev,
                        [product._id]: {
                          ...draft,
                          links: { ...draft.links, [linkKey]: event.target.value },
                        },
                      }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-500">Ganti gambar utama</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    if (file) {
                      const previewUrl = URL.createObjectURL(file)
                      // Cleanup preview lama jika ada
                      if (productMainImagePreviews[product._id]) {
                        URL.revokeObjectURL(productMainImagePreviews[product._id])
                      }
                      setProductMainImagePreviews((prev) => ({
                        ...prev,
                        [product._id]: previewUrl,
                      }))
                    } else {
                      // Cleanup jika file dihapus
                      if (productMainImagePreviews[product._id]) {
                        URL.revokeObjectURL(productMainImagePreviews[product._id])
                        setProductMainImagePreviews((prev) => {
                          const newState = { ...prev }
                          delete newState[product._id]
                          return newState
                        })
                      }
                    }
                    setProductDrafts((prev) => ({
                      ...prev,
                      [product._id]: { ...draft, mainImage: file },
                    }))
                  }}
                  className="w-full text-sm"
                />
                
                {/* Preview gambar utama yang sudah ada */}
                {!draft.mainImage && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Gambar utama saat ini:</p>
                    <div className="relative">
                      <img
                        src={product.mainImageUrl}
                        alt="Main image"
                        className="w-full h-32 object-cover rounded border border-gray-200"
                      />
                    </div>
                  </div>
                )}
                
                {/* Preview gambar utama baru */}
                {draft.mainImage && productMainImagePreviews[product._id] && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Gambar utama baru:</p>
                    <div className="relative">
                      <img
                        src={productMainImagePreviews[product._id]}
                        alt="New main image"
                        className="w-full h-32 object-cover rounded border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (productMainImagePreviews[product._id]) {
                            URL.revokeObjectURL(productMainImagePreviews[product._id])
                            setProductMainImagePreviews((prev) => {
                              const newState = { ...prev }
                              delete newState[product._id]
                              return newState
                            })
                          }
                          setProductDrafts((prev) => ({
                            ...prev,
                            [product._id]: { ...draft, mainImage: null },
                          }))
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Ganti gallery</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    const files = event.target.files ? Array.from(event.target.files) : []
                    // Cleanup preview lama jika ada
                    if (productGalleryPreviews[product._id]) {
                      productGalleryPreviews[product._id].forEach((url) => URL.revokeObjectURL(url))
                    }
                    // Buat preview URLs baru
                    const previewUrls = files.map((file) => URL.createObjectURL(file))
                    setProductGalleryPreviews((prev) => ({
                      ...prev,
                      [product._id]: previewUrls,
                    }))
                    setProductDrafts((prev) => ({
                      ...prev,
                      [product._id]: { ...draft, gallery: files },
                    }))
                  }}
                  className="w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Mengunggah file baru akan mengganti semua gallery lama.</p>
                
                {/* Gallery yang sudah ada */}
                {product.gallery && product.gallery.length > 0 && draft.gallery.length === 0 && (() => {
                  const deletedIndices = deletedGalleryIndices[product._id] || []
                  const visibleGallery = product.gallery.filter((_, idx) => !deletedIndices.includes(idx))
                  
                  return visibleGallery.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Gallery saat ini ({visibleGallery.length} gambar):</p>
                      <div className="grid grid-cols-3 gap-2">
                        {product.gallery.map((img, idx) => {
                          if (deletedIndices.includes(idx)) return null
                          return (
                            <div key={idx} className="relative">
                              <img
                                src={img.url}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-20 object-cover rounded border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletedGalleryIndices((prev) => ({
                                    ...prev,
                                    [product._id]: [...(prev[product._id] || []), idx],
                                  }))
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Preview gallery baru */}
                {draft.gallery.length > 0 && productGalleryPreviews[product._id] && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Gallery baru ({draft.gallery.length} gambar):</p>
                    <div className="grid grid-cols-3 gap-2">
                      {draft.gallery.map((_, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={productGalleryPreviews[product._id][idx]}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-20 object-cover rounded border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Cleanup URL yang dihapus
                              if (productGalleryPreviews[product._id][idx]) {
                                URL.revokeObjectURL(productGalleryPreviews[product._id][idx])
                              }
                              // Update preview URLs
                              const newPreviewUrls = productGalleryPreviews[product._id].filter((_, i) => i !== idx)
                              setProductGalleryPreviews((prev) => ({
                                ...prev,
                                [product._id]: newPreviewUrls,
                              }))
                              // Update gallery files
                              const newGallery = draft.gallery.filter((_, i) => i !== idx)
                              setProductDrafts((prev) => ({
                                ...prev,
                                [product._id]: { ...draft, gallery: newGallery },
                              }))
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleUpdateProduct(product._id)}
            disabled={isUpdatingProductId === product._id}
            className={`px-4 py-2 rounded bg-blue-600 text-white transition ${
              isUpdatingProductId === product._id ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500'
            }`}
          >
            {isUpdatingProductId === product._id ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
          <button
            onClick={() => {
              // Cleanup preview URLs
              if (productMainImagePreviews[product._id]) {
                URL.revokeObjectURL(productMainImagePreviews[product._id])
                setProductMainImagePreviews((prev) => {
                  const newState = { ...prev }
                  delete newState[product._id]
                  return newState
                })
              }
              if (productGalleryPreviews[product._id]) {
                productGalleryPreviews[product._id].forEach((url) => URL.revokeObjectURL(url))
                setProductGalleryPreviews((prev) => {
                  const newState = { ...prev }
                  delete newState[product._id]
                  return newState
                })
              }
              setProductDrafts((prev) => ({
                ...prev,
                [product._id]: {
                  ...defaultProductDraft,
                  name: product.name,
                  description: product.description,
                  longDescription: product.longDescription ?? '',
                  price: product.price.toString(),
                  currency: product.currency ?? 'IDR',
                  links: {
                    shopee: product.links?.shopee ?? '',
                    tiktok: product.links?.tiktok ?? '',
                    whatsapp: product.links?.whatsapp ?? '',
                  },
                },
              }))
              setDeletedGalleryIndices((prev) => {
                const newState = { ...prev }
                delete newState[product._id]
                return newState
              })
            }}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setIsDeletingProductId(product._id)
              handleDeleteProduct(product._id)
            }}
            disabled={isDeletingProductId === product._id}
            className={`px-4 py-2 rounded bg-red-600 text-white transition ${
              isDeletingProductId === product._id ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-500'
            }`}
          >
            {isDeletingProductId === product._id ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2 text-center">
        <a href="/" className="text-3xl font-bold">Admin Dashboard</a>
        <p className="text-gray-600">Kelola hero slides dan katalog produk.</p>
      </header>

      {(message || error) && (
        <div
          className={`rounded px-4 py-3 ${
            message ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message ?? error}
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-2 rounded font-semibold ${
                authTab === 'login' ? 'bg-gray-900 text-white' : 'border border-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2 rounded font-semibold ${
                authTab === 'register' ? 'bg-gray-900 text-white' : 'border border-gray-300'
              }`}
            >
              Register
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">{authFormTitle}</h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              {authTab === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setup Code</label>
                  <input
                    type="text"
                    required
                    value={authForm.setupCode}
                    onChange={(event) => setAuthForm((prev) => ({ ...prev, setupCode: event.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gunakan kode yang sama dengan `ADMIN_SETUP_CODE`.</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full rounded bg-gray-900 text-white py-2 font-semibold hover:bg-gray-800 transition"
              >
                {authTab === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <>
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="space-x-2">
              <button
                onClick={fetchSlides}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700"
              >
                Muat ulang
              </button>
              <button
                onClick={fetchProducts}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700"
              >
                Muat produk
              </button>
              <button onClick={handleLogout} className="px-4 py-2 rounded bg-gray-900 text-white">
                Keluar
              </button>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>{loadingSlides ? 'Memuat slide...' : `${slides.length} slide`}</p>
              <p>{loadingProducts ? 'Memuat produk...' : `${products.length} produk`}</p>
            </div>
          </div>

          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Tambah Slide Baru</h2>
            <form onSubmit={handleCreateSlide} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input
                  type="text"
                  required
                  value={newSlide.title}
                  onChange={(event) => setNewSlide((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul</label>
                <textarea
                  required
                  value={newSlide.subtitle}
                  onChange={(event) => setNewSlide((prev) => ({ ...prev, subtitle: event.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(event) =>
                    setNewSlide((prev) => ({ ...prev, image: event.target.files?.[0] ?? null }))
                  }
                  className="w-full text-sm"
                />
              </div>
              <button type="submit" className="px-4 py-2 rounded bg-emerald-600 text-white">
                Simpan Slide
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Daftar Slide</h2>
            {slides.length === 0 ? (
              <p className="text-gray-500">Belum ada slide yang tersimpan.</p>
            ) : (
              <div className="space-y-4">{slides.map((slide) => renderSlideCard(slide))}</div>
            )}
          </section>

          <section className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Tambah Produk Baru</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.price}
                    onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi singkat</label>
                <textarea
                  required
                  value={newProduct.description}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi lengkap</label>
                <textarea
                  value={newProduct.longDescription}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, longDescription: event.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {(['shopee', 'tiktok', 'whatsapp'] as const).map((linkKey) => (
                  <div key={linkKey}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{linkKey}</label>
                    <input
                      type="url"
                      placeholder="https://"
                      value={newProduct.links[linkKey]}
                      onChange={(event) =>
                        setNewProduct((prev) => ({
                          ...prev,
                          links: { ...prev.links, [linkKey]: event.target.value },
                        }))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar utama</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleNewProductMainImageChange}
                    className="w-full text-sm"
                  />
                  {newProductMainPreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={newProductMainPreview}
                        alt="Preview gambar utama"
                        className="h-20 w-20 rounded object-cover"
                      />
                      <div className="text-sm text-gray-600">
                        <p className="font-semibold">{newProduct.mainImage?.name}</p>
                        {newProduct.mainImage && (
                          <p>{`${(newProduct.mainImage.size / 1024).toFixed(1)} KB`}</p>
                        )}
                        <button
                          type="button"
                          onClick={handleClearNewProductMainImage}
                          className="mt-1 rounded border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gallery (opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewProductGalleryChange}
                    className="w-full text-sm"
                  />
                  {newProductGalleryPreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {newProductGalleryPreviews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative">
                          <img src={preview} alt={`Preview gallery ${index + 1}`} className="h-20 w-full rounded object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewGalleryImage(index)}
                            className="absolute top-1 right-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={isCreatingProduct}
                className={`px-4 py-2 rounded bg-blue-600 text-white transition ${
                  isCreatingProduct ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500'
                }`}
              >
                {isCreatingProduct ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Daftar Produk</h2>
              {products.length > 0 && <p className="text-sm text-gray-500">{products.length} produk</p>}
            </div>
            {products.length === 0 ? (
              <p className="text-gray-500">Belum ada produk yang tersimpan.</p>
            ) : (
              <div className="space-y-4">{products.map((product) => renderProductCard(product))}</div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default AdminDashboard