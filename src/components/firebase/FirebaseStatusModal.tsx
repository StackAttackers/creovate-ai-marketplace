import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Key,
  RefreshCw,
  Palette,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import {
  getFirebaseStatus,
  configureFirebase,
  resetToDemoMode,
  loadSavedConfig,
  type FirebaseConfig,
} from '../../services/firebase/config';
import {
  testFirestoreConnection,
  fetchCreatorsFromFirestore,
  fetchAgenciesFromFirestore,
} from '../../services/firebase/firestore';
import type { CreatorProfile } from '../../types/creator';
import { SafeAvatar } from '../ui/SafeAvatar';
import { formatCurrency } from '../../utils/format';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirebaseStatusModal({ isOpen, onClose }: FirebaseStatusModalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'data' | 'config'>('status');
  const [status, setStatus] = useState(getFirebaseStatus);
  const [pingResult, setPingResult] = useState<{
    tested: boolean;
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Data Preview
  const [creatorsList, setCreatorsList] = useState<CreatorProfile[]>([]);
  const [agenciesList, setAgenciesList] = useState<CreatorProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CreatorProfile | null>(null);

  // Config Form
  const [configForm, setConfigForm] = useState<FirebaseConfig>(() => loadSavedConfig());
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccessMessage, setConfigSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const all = await fetchCreatorsFromFirestore();
    setCreatorsList(all);
    const agencies = await fetchAgenciesFromFirestore();
    setAgenciesList(agencies);
    setSelectedProfile((prev) => prev || (all.length > 0 ? all[0] : null));
  }, []);

  useEffect(() => {
    let active = true;
    if (isOpen) {
      Promise.all([fetchCreatorsFromFirestore(), fetchAgenciesFromFirestore()]).then(
        ([all, agencies]) => {
          if (active) {
            setCreatorsList(all);
            setAgenciesList(agencies);
            setSelectedProfile((prev) => prev || (all.length > 0 ? all[0] : null));
          }
        }
      );
    }
    return () => {
      active = false;
    };
  }, [isOpen]);

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    const result = await testFirestoreConnection();
    setPingResult({
      tested: true,
      ...result,
    });
    setIsPinging(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSuccessMessage(null);

    const success = await configureFirebase(configForm);
    setIsSavingConfig(false);
    setStatus(getFirebaseStatus());

    if (success) {
      setConfigSuccessMessage('Firebase initialized & connected to Cloud Firestore!');
      await loadData();
    } else {
      setConfigSuccessMessage('Configuration saved. Running in hybrid offline-first mode.');
    }
  };

  const handleResetDemo = async () => {
    await resetToDemoMode();
    setConfigForm({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    });
    setStatus(getFirebaseStatus());
    setConfigSuccessMessage('Switched back to standalone demo mode.');
    await loadData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0F1219] shadow-2xl overflow-hidden my-8"
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-[#161B26] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Firebase Backend Manager</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    status.isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {status.isConfigured ? 'Firestore Live' : 'Hybrid Local Mode'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Handling real-time data persistence for AI Agencies, AI Creators & Commercial Briefs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/5 hover:bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 gap-6 text-xs font-semibold bg-[#12151F]">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'status'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Connection & Collections</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'data'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Agency & Creator Records ({creatorsList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Firebase Credentials (.env)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: CONNECTION & COLLECTIONS */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Stat Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#161B26] border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Database Engine
                  </span>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Cloud Firestore</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    Project: <code className="text-emerald-300 font-mono text-[11px]">{status.projectId}</code>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#161B26] border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    AI Creators & Agencies
                  </span>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span>{creatorsList.length} Roster Profiles</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {agenciesList.length} Studios • {creatorsList.length - agenciesList.length} Solo Creators
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#161B26] border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Authentication Service
                  </span>
                  <div className="text-lg font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Firebase Auth</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    Roles: <code className="text-blue-300 font-mono text-[11px]">creator • agency • brand</code>
                  </span>
                </div>
              </div>

              {/* Collections Schema Diagram */}
              <div className="rounded-2xl bg-[#141822] border border-white/10 p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Firestore Collections Schema
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">/creatorProfiles/{'{uid}'}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                        Primary
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Stores verified AI creator and agency profiles, social handles, tools (Runway, Sora, Midjourney), categories, and ₹ INR pricing.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">/agencies/{'{uid}'}</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px]">
                        Studio View
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Dedicated collection for full-service generative AI production studios offering commercial retainers and team workflows.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">/users/{'{uid}'}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px]">
                        Auth Sync
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      User authentication records synchronizing email, displayName, and assigned role (<code className="text-blue-300">brand</code>, <code className="text-emerald-300">creator</code>, or <code className="text-purple-300">agency</code>).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">/campaigns &amp; /invitations</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">
                        Commercial
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Commercial campaign briefs submitted by brands, budget limits in ₹ INR, and direct creator collaboration invitations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Firestore Ping Connection Test */}
              <div className="p-5 rounded-2xl bg-[#141822] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white">Cloud Firestore Live Ping Check</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Tests real-time read and write round-trip latency to the Firebase Cloud database.
                  </p>
                  {pingResult && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {pingResult.success ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          {pingResult.message}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          {pingResult.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleTestPing}
                  disabled={isPinging}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-md shadow-emerald-600/30"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging Cloud...' : 'Test Firestore Ping'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AGENCY & CREATOR RECORDS INSPECTOR */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Live Data Explorer</h3>
                  <p className="text-xs text-gray-400">
                    Inspecting profiles stored in Firestore <code className="text-emerald-400 font-mono">creatorProfiles</code> and <code className="text-purple-400 font-mono">agencies</code>
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Data</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left List */}
                <div className="lg:col-span-5 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {creatorsList.map((c) => {
                    const isAgency = c.role === 'agency';
                    const isSelected = selectedProfile?.uid === c.uid;
                    return (
                      <div
                        key={c.uid}
                        onClick={() => setSelectedProfile(c)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                            : 'border-white/10 bg-[#161B26] hover:bg-[#1C2230] text-gray-300'
                        }`}
                      >
                        <SafeAvatar
                          src={c.avatarUrl}
                          name={c.displayName}
                          size="md"
                          shape="rounded"
                          className="shrink-0 border border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-white truncate">{c.displayName}</span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                isAgency ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {isAgency ? 'Agency' : 'Creator'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{c.headline}</p>
                          <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                            ₹{c.priceRange.min.toLocaleString('en-IN')} — ₹{c.priceRange.max.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Document Preview */}
                <div className="lg:col-span-7 bg-[#0B0D12] rounded-2xl border border-white/10 p-5 space-y-4">
                  {selectedProfile ? (
                    <>
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <SafeAvatar
                            src={selectedProfile.avatarUrl}
                            name={selectedProfile.displayName}
                            size="lg"
                            shape="rounded"
                            className="border border-white/10"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white">{selectedProfile.displayName}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  selectedProfile.role === 'agency'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {selectedProfile.role === 'agency' ? 'AI Agency Studio' : 'Solo Creator'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{selectedProfile.headline}</p>
                          </div>
                        </div>

                        <a
                          href={`/creators/${selectedProfile.uid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 transition-colors"
                        >
                          <span>Live Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-gray-400 block uppercase font-mono">Document ID</span>
                          <span className="font-mono text-emerald-400 text-[11px] truncate block">
                            {selectedProfile.uid}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <span className="text-[10px] text-gray-400 block uppercase font-mono">Rates in ₹ INR</span>
                          <span className="font-bold text-white text-[11px]">
                            {formatCurrency(selectedProfile.priceRange.min)} – {formatCurrency(selectedProfile.priceRange.max)}
                          </span>
                        </div>
                      </div>

                      {/* Tools Used */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                          AI Video Generation Tools
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProfile.tools.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Social Handles */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                          Social Media Channels
                        </span>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-300 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Instagram:</span>
                            <span className="font-mono text-white">
                              {selectedProfile.socialHandles?.instagram || '@creovate.ai'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Twitter / X:</span>
                            <span className="font-mono text-white">
                              {selectedProfile.socialHandles?.twitter || '@creovate_ai'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">YouTube / Reel Showcase:</span>
                            <span className="font-mono text-white">
                              {selectedProfile.socialHandles?.youtube || 'youtube.com/@creovate'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Raw JSON Toggle */}
                      <details className="text-[11px] text-gray-400 cursor-pointer">
                        <summary className="hover:text-white font-medium">View Firestore Document JSON</summary>
                        <pre className="mt-2 p-3 rounded-xl bg-black border border-white/10 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-40">
                          {JSON.stringify(selectedProfile, null, 2)}
                        </pre>
                      </details>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500 text-xs">
                      Select a creator or agency to inspect their Firestore document.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIREBASE CONFIGURATION FORM */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#161B26] border border-white/10 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Connect Your Firebase Web App</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Paste your Firebase configuration values below to connect directly to your live Google Cloud Firebase project. You can also specify these in your root <code className="text-emerald-300 font-mono">.env</code> file.
                  </p>
                </div>
              </div>

              {configSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{configSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Firebase API Key (VITE_FIREBASE_API_KEY)
                    </label>
                    <input
                      type="text"
                      value={configForm.apiKey}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Project ID (VITE_FIREBASE_PROJECT_ID)
                    </label>
                    <input
                      type="text"
                      value={configForm.projectId}
                      onChange={(e) => setConfigForm({ ...configForm, projectId: e.target.value })}
                      placeholder="creovate-ai"
                      className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Auth Domain (VITE_FIREBASE_AUTH_DOMAIN)
                    </label>
                    <input
                      type="text"
                      value={configForm.authDomain}
                      onChange={(e) => setConfigForm({ ...configForm, authDomain: e.target.value })}
                      placeholder="creovate-ai.firebaseapp.com"
                      className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Storage Bucket (VITE_FIREBASE_STORAGE_BUCKET)
                    </label>
                    <input
                      type="text"
                      value={configForm.storageBucket}
                      onChange={(e) => setConfigForm({ ...configForm, storageBucket: e.target.value })}
                      placeholder="creovate-ai.appspot.com"
                      className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Messaging Sender ID (VITE_FIREBASE_MESSAGING_SENDER_ID)
                    </label>
                    <input
                      type="text"
                      value={configForm.messagingSenderId}
                      onChange={(e) => setConfigForm({ ...configForm, messagingSenderId: e.target.value })}
                      placeholder="123456789012"
                      className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      App ID (VITE_FIREBASE_APP_ID)
                    </label>
                    <input
                      type="text"
                      value={configForm.appId}
                      onChange={(e) => setConfigForm({ ...configForm, appId: e.target.value })}
                      placeholder="1:123456789012:web:abcdef..."
                      className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-3.5 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Reset to Standalone Demo
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isSavingConfig ? 'Connecting...' : 'Apply Firebase Configuration'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
