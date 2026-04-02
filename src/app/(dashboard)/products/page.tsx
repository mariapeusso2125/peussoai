'use client';

import { useState, useEffect, useCallback } from 'react';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  supplier: string | null;
  category: string | null;
  subcategory: string | null;
  sku: string | null;
  description: string | null;
  technical_specs: string | null;
  image_urls: string | null;
}

interface Filters {
  brands: string[];
  categories: string[];
  suppliers: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filters>({ brands: [], categories: [], suppliers: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSupplier) params.set('supplier', selectedSupplier);

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setFilters(data.filters || { brands: [], categories: [], suppliers: [] });
    setLoading(false);
  }, [search, selectedBrand, selectedCategory, selectedSupplier]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function getImageUrls(product: Product): string[] {
    if (!product.image_urls) return [];
    try { return JSON.parse(product.image_urls); } catch { return []; }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
        <p className="text-sm text-gray-500">Catálogo de productos indexados desde las fuentes cargadas</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navy-light focus:border-navy-light outline-none"
          />
        </div>
        <select
          value={selectedSupplier}
          onChange={e => setSelectedSupplier(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-navy-light outline-none"
        >
          <option value="">Todos los proveedores</option>
          {filters.suppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-navy-light outline-none"
        >
          <option value="">Todas las marcas</option>
          {filters.brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-navy-light outline-none"
        >
          <option value="">Todas las categorías</option>
          {filters.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-400 text-sm">Cargando productos...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-gray-500 text-sm">No hay productos cargados</p>
            <p className="text-gray-400 text-xs mt-1">Cargá fuentes desde la sección &quot;Fuentes&quot; para indexar productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => {
              const images = getImageUrls(product);
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
                >
                  {images.length > 0 ? (
                    <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {product.supplier && (
                        <span className="text-xs bg-navy/5 text-navy px-2 py-0.5 rounded-full">{product.supplier}</span>
                      )}
                      {product.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category}</span>
                      )}
                    </div>
                    {product.sku && (
                      <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedProduct.supplier && <span className="text-xs bg-navy/5 text-navy px-2 py-0.5 rounded-full">{selectedProduct.supplier}</span>}
                    {selectedProduct.brand && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{selectedProduct.brand}</span>}
                    {selectedProduct.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{selectedProduct.category}</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {getImageUrls(selectedProduct).length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {getImageUrls(selectedProduct).map((url, i) => (
                    <img key={i} src={url} alt={`${selectedProduct.name} ${i + 1}`} className="h-48 rounded-lg object-cover" />
                  ))}
                </div>
              )}

              {selectedProduct.sku && (
                <p className="text-sm text-gray-600 mb-2"><span className="font-medium">SKU:</span> {selectedProduct.sku}</p>
              )}
              {selectedProduct.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4>
                  <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                </div>
              )}
              {selectedProduct.technical_specs && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Especificaciones técnicas</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedProduct.technical_specs}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Count badge */}
      <div className="bg-white border-t border-gray-200 px-6 py-2 text-xs text-gray-400">
        {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
