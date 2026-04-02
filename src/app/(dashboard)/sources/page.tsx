'use client';

import { useState, useEffect, useCallback } from 'react';

interface Source {
  id: string;
  name: string;
  type: string;
  url: string | null;
  status: string;
  error_message: string | null;
  supplier: string | null;
  chunks_count: number;
  products_count: number;
  created_at: string;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [supplierInput, setSupplierInput] = useState('');
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [result, setResult] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    const res = await fetch('/api/sources');
    if (res.ok) {
      setSources(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  async function handleSeedAll(priority: string) {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/sources/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      setSeedResult(`Completado: ${data.completed} exitosas, ${data.errors} con error, ${data.skipped} ya cargadas`);
      fetchSources();
    } catch (e) {
      setSeedResult(`Error: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
    setSeeding(false);
  }

  async function handleIngest(e: React.FormEvent) {
    e.preventDefault();
    setIngesting(true);
    setResult(null);
    try {
      const body = mode === 'url'
        ? { type: 'url', url: urlInput, name: nameInput || undefined }
        : { type: 'text', text: textInput, name: nameInput, supplier: supplierInput || undefined };
      const res = await fetch('/api/sources/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(`Completado: ${data.chunksCreated} fragmentos, ${data.productsCreated} productos`);
        setUrlInput(''); setTextInput(''); setNameInput(''); setSupplierInput('');
        fetchSources();
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
    setIngesting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta fuente y todos sus datos?')) return;
    await fetch('/api/sources', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchSources();
  }

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Procesando' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
    error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' },
  };

  const totalChunks = sources.reduce((a, s) => a + s.chunks_count, 0);
  const totalProducts = sources.reduce((a, s) => a + s.products_count, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Fuentes de información</h2>
        <p className="text-sm text-gray-500">Cargá las URLs de los proveedores para alimentar la base de conocimiento</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Fuentes', value: sources.length, color: '#001F5F' },
            { label: 'Proveedores', value: new Set(sources.map(s => s.supplier).filter(Boolean)).size, color: '#0c4da2' },
            { label: 'Fragmentos', value: totalChunks, color: '#D80E29' },
            { label: 'Productos', value: totalProducts, color: '#525252' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold" style={{color: stat.color}}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Seed all suppliers */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Cargar proveedores de Iluminar Peusso</h3>
          <p className="text-xs text-gray-500 mb-4">
            Descarga e indexa automáticamente los catálogos de todos los proveedores configurados. Los que ya fueron cargados se omiten.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleSeedAll('high')}
              disabled={seeding}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              style={{backgroundColor: '#001F5F'}}
            >
              {seeding ? 'Procesando...' : 'Cargar prioritarios (7)'}
            </button>
            <button
              onClick={() => handleSeedAll('all')}
              disabled={seeding}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              {seeding ? 'Procesando...' : 'Cargar todos (30)'}
            </button>
          </div>
          {seeding && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Descargando e indexando proveedores... esto puede tardar unos minutos
            </div>
          )}
          {seedResult && (
            <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${seedResult.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {seedResult}
            </div>
          )}
        </div>

        {/* Manual ingest */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Agregar fuente manual</h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('url')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'url' ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={mode === 'url' ? {backgroundColor: '#001F5F'} : undefined}
            >
              URL
            </button>
            <button
              onClick={() => setMode('text')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'text' ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={mode === 'text' ? {backgroundColor: '#001F5F'} : undefined}
            >
              Texto / Ficha técnica
            </button>
          </div>
          <form onSubmit={handleIngest} className="space-y-3">
            {mode === 'url' ? (
              <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://www.proveedor.com.ar/productos/" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
            ) : (
              <>
                <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Pegá la ficha técnica o info del producto..." rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" required />
                <input type="text" value={supplierInput} onChange={e => setSupplierInput(e.target.value)} placeholder="Proveedor (ej: Lucciola)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </>
            )}
            <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Nombre descriptivo (opcional)" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button type="submit" disabled={ingesting} className="text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50" style={{backgroundColor: '#001F5F'}}>
              {ingesting ? 'Procesando...' : 'Cargar fuente'}
            </button>
          </form>
          {result && (
            <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${result.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {result}
            </div>
          )}
        </div>

        {/* Sources list */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Fuentes cargadas ({sources.length})</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Cargando...</div>
          ) : sources.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-gray-500 text-sm">No hay fuentes cargadas</p>
              <p className="text-gray-400 text-xs mt-1">Usá &quot;Cargar prioritarios&quot; para empezar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sources.map(source => {
                const sc = statusConfig[source.status] || statusConfig.error;
                return (
                  <div key={source.id} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{source.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        {source.supplier && <span className="font-medium">{source.supplier}</span>}
                        <span>{source.chunks_count} frag.</span>
                        <span>{source.products_count} prod.</span>
                        {source.url && <span className="truncate max-w-[250px]">{source.url}</span>}
                      </div>
                      {source.error_message && <p className="text-xs text-red-500 mt-0.5 truncate">{source.error_message}</p>}
                    </div>
                    <button onClick={() => handleDelete(source.id)} className="text-gray-400 hover:text-red-500 transition p-1" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
