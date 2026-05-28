import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, RefreshCcw, Download, ShieldCheck, Link2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AppState = 'upload' | 'processing' | 'success';

// Translations for UI
const translations: Record<string, Record<string, string>> = {
  en: {
    heroTitle: "Convert Complex PDFs with",
    heroHighlight: "Perfect Layout Retention",
    heroDesc: "Premium support for multi-column native ",
    heroKhmer: "Khmer language script (ភាសាខ្មែរ)",
    heroDescEnd: " and complex OpenXML reconstruction.",
    howItWorks: "How it works",
    about: "About Us",
    getStarted: "Get Started",
    clickToUpload: "Click to upload or drag & drop",
    onlyPdf: "Only PDF files up to 20MB",
    cancel: "Cancel",
    convertToWord: "Convert Document",
    docLanguage: "Document Language:",
    formatLabel: "Output Format:",
    wordOption: "Word (.docx)",
    excelOption: "Excel (.xlsx)",
    upload: "Upload",
    processing: "Processing",
    download: "Download",
    uploadingPdf: "Uploading PDF",
    analyzingLayout: "Analyzing Page Layout & Bounding Boxes",
    runningOcr: "Running Deep OCR Engine",
    reconstructing: "Reconstructing OpenXML Structure & Finalizing",
    conversionComplete: "Conversion Complete!",
    conversionCompleteDesc: "Your PDF has been successfully reconstructed.",
    outputFile: "Output File",
    editablePreview: "Editable Preview",
    downloadWordBtn: "Download .docx Document",
    downloadExcelBtn: "Download .xlsx Document",
    convertAnother: "Convert Another File",
    privacyText: "Files are fully encrypted and automatically deleted after 60 minutes.",
    privacyTitle: "Privacy Guaranteed: ",
    // New Keys
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    namePlaceholder: "Enter your full name",
    allRightsReserved: "All rights reserved. Professional OCR layout restoration suite.",
    aboutHeader: "About Kroma PDF",
    aboutSubtitle: "The Ultimate Document Layout Restoration Platform",
    aboutDescDetail: "Kroma PDF is an advanced desktop-quality document converter. We utilize cutting-edge AI neural networks to analyze physical page visual grids, segmenting cells, paragraph bounds, text lines, and images to prevent word scrambling. While generic converters generate messy absolute positioning blocks, Kroma PDF produces native, editable Microsoft Word flowable documents and well-structured Excel grids.",
    howItWorksHeader: "Intelligent Conversion Process",
    howItWorksSubtitle: "How Kroma PDF Restores Layouts Perfectly",
    step1Title: "1. Advanced Document Ingestion",
    step1Desc: "Upload any standard or raw-scanned PDF structure. The system preserves multi-font families and raw vector alignments.",
    step2Title: "2. Deep Vision OCR Pipeline",
    step2Desc: "Our vision model processes tables, cells, lines, and lists, applying unique corrections for Khmer Glyphs (ស្រៈនិស្ស័យ និងជើងអក្សរ).",
    step3Title: "3. Direct OpenXML Synthesis",
    step3Desc: "Rather than HTML proxies, we generate core .docx / .xlsx files directly, resulting in normal flowable, editable documents.",
    creatorLabel: "About the Creator",
    creatorName: "Udomkevin Vat",
    creatorRole: "Web Founder",
    creatorDesc: "Crafted with architectural precision, focusing on seamless full-stack performance and flawless bilingual design.",
  },
  km: {
    heroTitle: "បម្លែងឯកសារ PDF ជាមួយនឹង",
    heroHighlight: "ការរក្សាទម្រង់ដើមបានល្អឥតខ្ចោះ",
    heroDesc: "គាំទ្រយ៉ាងល្អសម្រាប់ការប្រើប្រាស់",
    heroKhmer: "ភាសាខ្មែរ",
    heroDescEnd: " និងការរៀបចំរចនាសម្ព័ន្ធ OpenXML ។",
    howItWorks: "របៀបប្រើប្រាស់",
    about: "អំពីយើង",
    getStarted: "ចាប់ផ្តើម",
    clickToUpload: "ចុចដើម្បីបញ្ចូលឯកសារ ឬអូសទម្លាក់ទីនេះ",
    onlyPdf: "ត្រឹមតែឯកសារ PDF ទំហំត្រឹម 20MB ប៉ុណ្ណោះ",
    cancel: "បោះបង់",
    convertToWord: "បម្លែងឯកសារ",
    docLanguage: "ភាសាឯកសារ៖",
    formatLabel: "ទម្រង់ឯកសារ៖",
    wordOption: "Word (.docx)",
    excelOption: "Excel (.xlsx)",
    upload: "បញ្ចូល",
    processing: "កំពុងដំណើរការ",
    download: "ទាញយក",
    uploadingPdf: "កំពុងបញ្ចូល PDF",
    analyzingLayout: "កំពុងវិភាគទម្រង់ទំព័រ និងគម្លាតរឹម",
    runningOcr: "កំពុងដំណើរការប្រព័ន្ធ OCR កម្រិតជ្រៅ",
    reconstructing: "កំពុងរៀបចំរចនាសម្ព័ន្ធ OpenXML និងបញ្ចប់",
    conversionComplete: "ការបម្លែងបានជោគជ័យ!",
    conversionCompleteDesc: "ឯកសារ PDF របស់អ្នកត្រូវបានបម្លែងទៅជាទម្រង់ដែលអាចកែសម្រួលបាន។",
    outputFile: "ឯកសារលទ្ធផល",
    editablePreview: "មើលជាមុន (អាចកែបាន)",
    downloadWordBtn: "ទាញយកឯកសារ .docx",
    downloadExcelBtn: "ទាញយកឯកសារ .xlsx",
    convertAnother: "បម្លែងឯកសារផ្សេងទៀត",
    privacyText: "ឯកសារត្រូវបានអ៊ិនគ្រីប និងលុបដោយស្វ័យប្រវត្តិក្រោយពេល 60 នាទី។",
    privacyTitle: "ធានាឯកជនភាព៖ ",
    // New Keys
    signIn: "ចូលគណនី",
    signUp: "ចុះឈ្មោះ",
    signOut: "ចាកចេញ",
    emailPlaceholder: "បញ្ចូលអុីម៉ែលរបស់អ្នក",
    passwordPlaceholder: "បញ្ចូលលេខសម្ងាត់របស់អ្នក",
    namePlaceholder: "បញ្ចូលឈ្មោះពេញរបស់អ្នក",
    allRightsReserved: "រក្សាសិទ្ធិគ្រប់យ៉ាង។ កម្មវិធីរក្សាទម្រង់ឯកសារ និង OCR កម្រិតវិជ្ជាជីវៈ។",
    aboutHeader: "អំពី Kroma PDF",
    aboutSubtitle: "ប្រព័ន្ធលំដាប់កំពូលសម្រាប់ការបម្លែងនិងរក្សាទ្រង់ទ្រាយឯកសារ PDF",
    aboutDescDetail: "Kroma PDF គឺជាប្រព័ន្ធបម្លែងឯកសារកម្រិតខ្ពស់ដែលមានគុណភាពខ្ពស់ដូចកម្មវិធីកុំព្យូទ័រ។ យើងប្រើប្រាស់បច្ចេកវិទ្យា AI ឈានមុខគេ ដើម្បីវិភាគប្លង់ឯកសារដូចជា តារាង កថាខណ្ឌ ជួរអក្សរ និងរូបភាព ដើម្បីការពារកុំឱ្យអក្សររញ៉េរញ៉ៃ។ ខណៈពេលដែលកម្មវិធីបម្លែងទូទៅបង្កើតកូដដែលមានទីតាំងមិនរៀបរយ Kroma PDF បង្កើតឯកសារ Microsoft Word និង Excel ដែលមានរចនាសម្ព័ន្ធត្រឹមត្រូវ និងងាយស្រួលកែប្រែ។",
    howItWorksHeader: "ដំណើរការនៃការបម្លែងដ៏ឆ្លាតវៃ",
    howItWorksSubtitle: "របៀបដែល Kroma PDF រក្សាប្លង់ឯកសារបានល្អឥតខ្ចោះ",
    step1Title: "១. ការបញ្ចូលឯកសារកម្រិតខ្ពស់",
    step1Desc: "អូសនិងទម្លាក់ឯកសារ PDF គ្រប់ប្រភេទ។ ប្រព័ន្ធរបស់យើងគាំទ្ររាល់ទម្រង់ពុម្ពអក្សរចម្រុះ និងរចនាសម្ព័ន្ធតម្រឹមវ៉ិចទ័រទាំងអស់។",
    step2Title: "២. បច្ចេកវិទ្យា Vision OCR ស៊ីជម្រៅ",
    step2Desc: "ម៉ូដែលចក្ខុវិស័យរបស់យើងដំណើរការលើតារាង ក្រឡា ជួរឈរ ព្រមទាំងផ្តល់ការកែតម្រូវពិសេសសម្រាប់តួអក្សរខ្មែរ (ស្រៈនិស្ស័យ និងជើងអក្សរ)។",
    step3Title: "៣. ការបង្កើត OpenXML ដោយផ្ទាល់",
    step3Desc: "យើងបង្កើតឯកសារ .docx និង .xlsx ដោយផ្ទាល់ពីរចនាសម្ព័ន្ធកូដដើម ដែលធ្វើឱ្យអ្នកទទួលបានឯកសារដែលអាចអូស ឬវាយអត្ថបទបន្តបានធម្មតា។",
    creatorLabel: "អំពីអ្នកបង្កើត",
    creatorName: "វ៉ាត ឧត្តមខេវិន",
    creatorRole: "អ្នកបង្កើតវេបសាយ",
    creatorDesc: "បង្កើតឡើងដើម្បីភាពងាយស្រួលដល់ប្រជាជនខ្មែរជាពិសេស ដោយអាច ​បម្លែងប្រភេទ file ពី PDF ទៅជាប្រភេទ file ដែលអាចកែបានយ៉ាងរហ័ស។",
  }
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [selectedLanguage, setSelectedLanguage] = useState('Auto-Detect');
  const [khmerFont, setKhmerFont] = useState('Khmer OS Battambang');
  const [outputFormat, setOutputFormat] = useState<'docx' | 'xlsx'>('docx');
  const [uiLang, setUiLang] = useState<'en' | 'km'>('en');
  const [file, setFile] = useState<File | null>(null);
  
  // Processing States
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[uiLang];

  // Auth local state
  const [user, setUser] = useState<{ email: string; name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('kroma_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Mobile menu open / closed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 20 * 1024 * 1024) {
        console.warn('File size exceeds 20MB limit.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const startConversion = async () => {
    if (!file) return;
    setAppState('processing');
    setProgress(0);
    setStatusText(t.uploadingPdf + '...');
    setPreviewText('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', selectedLanguage);
    formData.append('khmerFont', khmerFont);
    formData.append('format', outputFormat);

    try {
      const response = await fetch('/api/convert-pdf', {
        method: 'POST',
        body: formData,
      });
      
      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        throw new Error(`Server returned non-JSON response: ${rawText.substring(0, 50)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      setTaskId(data.task_id);
      
    } catch (error: any) {
      console.error(error);
      setPreviewText(`Network or Server Error: ${error.message || 'Failed to connect'}. Please ensure the server is running and try again.`);
      setStatusText('Network Error');
      setAppState('success'); // Show error state
    }
  };

  // Poll for status
  useEffect(() => {
    if (appState !== 'processing' || !taskId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/task/${taskId}`);
        const rawText = await response.text();
        
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (err) {
           throw new Error(`Invalid status response: ${rawText.substring(0, 50)}`);
        }

        if (!response.ok) throw new Error(data.error || 'Status fetch failed');
        
        setProgress(data.progress);
        
        if (data.status === 'failed') {
           setStatusText(data.previewText || 'Error processing document');
           setPreviewText(data.previewText || 'Unknown Error');
           setAppState('success');
           clearInterval(interval);
           return;
        }
        
        if (data.progress < 25) setStatusText(t.uploadingPdf + '...');
        else if (data.progress < 50) setStatusText(t.analyzingLayout + '...');
        else if (data.progress < 75) setStatusText(t.runningOcr + '...');
        else if (data.progress < 100) setStatusText(t.reconstructing + '...');
        else setStatusText('Finalizing...');

        if (data.status === 'completed' && data.progress === 100) {
          clearInterval(interval);
          if (data.previewText) {
             setPreviewText(data.previewText);
          }
          setTimeout(() => {
            setAppState('success');
          }, 500); // Slight delay for smooth transition
        }
      } catch (error) {
        console.error(error);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [appState, taskId, t]);

  const resetFlow = () => {
    setFile(null);
    setTaskId(null);
    setProgress(0);
    setStatusText('');
    setPreviewText('');
    setAppState('upload');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    if (!taskId) return;
    try {
      const resp = await fetch(`/api/download/${taskId}`);
      if (!resp.ok) throw new Error('Download failed');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_${file?.name ? file.name.replace('.pdf', '') : 'document'}.${outputFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setStatusText(`Download failed: ${err.message}`);
      setAppState('success');
    }
  };

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  // Auth submissions mock handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail || !authPassword) {
      setAuthError(uiLang === 'km' ? 'សូមបំពេញអ៊ីម៉ែលនិងលេខសម្ងាត់' : 'Please fill in both email and password.');
      return;
    }

    if (authTab === 'signup') {
      if (!authName) {
        setAuthError(uiLang === 'km' ? 'សូមបំពេញឈ្មោះរបស់អ្នក' : 'Please fill in your name.');
        return;
      }
      
      const newUser = { email: authEmail, name: authName };
      localStorage.setItem('kroma_user', JSON.stringify(newUser));
      setUser(newUser);
      setAuthSuccess(uiLang === 'km' ? 'ការចុះឈ្មោះទទួលបានជោគជ័យ!' : 'Account created successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        setAuthSuccess('');
      }, 1000);
    } else {
      const loggedUser = { email: authEmail, name: authEmail.split('@')[0] };
      localStorage.setItem('kroma_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setAuthSuccess(uiLang === 'km' ? 'ការចូលប្រើប្រាស់បានជោគជ័យ!' : 'Signed in successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthSuccess('');
      }, 1000);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('kroma_user');
    setUser(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={cn("min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 overflow-x-hidden", uiLang === 'km' ? 'font-khmer' : '')}>
      {/* Navigation */}
      <nav className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 w-full shadow-sm">
        <div className="flex items-center space-x-2">
          <img 
            src="/logo.png" 
            alt="Kroma PDF Logo" 
            className="w-11 h-11 object-contain"
            referrerPolicy="no-referrer"
          />
          {/* Brand Name "Kroma PDF" is visible on ALL viewports (both desktop and mobile) */}
          <span className="font-bold text-xl tracking-tight text-slate-900 font-sans">
            Kroma <span className="text-indigo-600">PDF</span>
          </span>
        </div>
        
        {/* Desktop Menu links */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-medium text-slate-600">
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-600 cursor-pointer text-slate-700 bg-transparent border-none transition-colors">{t.howItWorks}</button>
          <button onClick={() => scrollToSection('about')} className="hover:text-indigo-600 cursor-pointer text-slate-700 bg-transparent border-none transition-colors">{t.about}</button>
          
          <div className="flex items-center space-x-2">
             <div className="flex items-center space-x-1 border border-slate-200 rounded px-2.5 py-1 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
               <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
               <select 
                 className="bg-transparent text-slate-700 font-khmer text-xs appearance-none focus:outline-none cursor-pointer pl-1 pr-4"
                 value={uiLang}
                 onChange={(e) => setUiLang(e.target.value as 'en' | 'km')}
               >
                 <option value="en">EN</option>
                 <option value="km">ខ្មែរ</option>
               </select>
               <svg className="w-3 h-3 text-slate-400 pointer-events-none -ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
             </div>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium px-3 py-1.5 rounded-full truncate max-w-[150px]">
                Hi, {user.name || user.email}
              </span>
              <button 
                onClick={handleSignOut}
                className="text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-colors cursor-pointer"
              >
                {t.signOut}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => { setAuthTab('signin'); setIsAuthModalOpen(true); }}
                className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors cursor-pointer"
              >
                {t.signIn}
              </button>
              <button 
                onClick={() => { setAuthTab('signup'); setIsAuthModalOpen(true); }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-semibold cursor-pointer"
              >
                {t.getStarted}
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu bar support (hamburger icon toggle) */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Fast select language icon */}
          <div className="flex items-center border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 cursor-pointer">
             <select 
               className="bg-transparent text-slate-700 font-khmer text-[11px] appearance-none focus:outline-none cursor-pointer pr-1"
               value={uiLang}
               onChange={(e) => setUiLang(e.target.value as 'en' | 'km')}
             >
               <option value="en">EN</option>
               <option value="km">ខ្មែរ</option>
             </select>
          </div>

          <button 
            id="mobile-menu-burger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-505 cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden w-full bg-white border-b border-slate-200 px-6 py-4 flex flex-col space-y-3 shadow-md z-20 sticky top-16"
          >
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('how-it-works'); }} className="text-left w-full hover:text-indigo-600 py-2 font-medium text-slate-700 border-b border-slate-100 bg-transparent text-sm">{t.howItWorks}</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollToSection('about'); }} className="text-left w-full hover:text-indigo-600 py-2 font-medium text-slate-700 border-b border-slate-100 bg-transparent text-sm">{t.about}</button>
            
            {user ? (
              <div className="flex flex-col space-y-2 pt-2">
                <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-3 py-2 rounded-lg text-center truncate">
                  Hi, {user.name || user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t.signOut}
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setAuthTab('signin'); setIsAuthModalOpen(true); }}
                  className="w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t.signIn}
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setAuthTab('signup'); setIsAuthModalOpen(true); }}
                  className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow"
                >
                  {t.getStarted}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-start pt-12 pb-24 px-4 sm:px-6 w-full max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mb-10 mt-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-[1.1]">
            {t.heroTitle} <span className="text-indigo-600">{t.heroHighlight}</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
            {t.heroDesc} <span className="font-semibold text-slate-800 font-khmer">{t.heroKhmer}</span>{t.heroDescEnd}
          </p>
        </div>

        {/* Interactive Conversion Component */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden flex flex-col relative min-h-[450px]">
          
          <div className="bg-slate-50 border-b border-slate-100 px-6 sm:px-8 py-4 flex justify-between items-center z-10 shrink-0">
            <div className="flex space-x-2">
               <div className="w-3 h-3 rounded-full bg-red-400"></div>
               <div className="w-3 h-3 rounded-full bg-amber-400"></div>
               <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-mono text-slate-400 hidden sm:block font-sans">
              TASK_ID: {taskId || 'PENDING'}
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-600 uppercase tracking-widest font-sans">
              {appState === 'processing' && <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>}
              {appState === 'upload' ? 'SYSTEM READY' : appState === 'processing' ? 'PROCESSING ENGINE ACTIVE' : 'TASK COMPLETE'}
            </div>
          </div>

          <div className="flex-1 flex flex-col relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* STATE A: UPLOAD */}
              {appState === 'upload' && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center"
              >
                <div 
                   className={cn(
                     "w-full max-w-2xl border-2 border-dashed rounded-xl p-12 transition-colors cursor-pointer group flex flex-col items-center justify-center relative bg-slate-50",
                     file ? "border-indigo-400 bg-indigo-50/30" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80"
                   )}
                   onClick={() => !file && fileInputRef.current?.click()}
                   onDragOver={(e) => e.preventDefault()}
                   onDrop={(e) => {
                     e.preventDefault();
                     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const droppedFile = e.dataTransfer.files[0];
                        if (droppedFile.type !== 'application/pdf') {
                            console.warn('Please upload a PDF file.');
                            return;
                        }
                        if (droppedFile.size > 20 * 1024 * 1024) {
                            console.warn('File size exceeds 20MB limit.');
                            return;
                        }
                        setFile(droppedFile);
                     }
                   }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf" 
                    onChange={handleFileSelect}
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-indigo-100 text-indigo-600">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="font-semibold text-slate-800 text-lg font-sans">{file.name}</p>
                      <p className="text-slate-500 text-sm mt-1 font-sans">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      
                      <div className="mt-8 flex flex-col gap-5 w-full max-w-[280px] mx-auto">
                         {/* Document Language Choice */}
                         <div className="flex flex-col gap-1.5 w-full text-left">
                            <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">{t.docLanguage}</span>
                            <select 
                              className="w-full bg-white border border-slate-300 text-slate-800 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-khmer text-sm shadow-sm cursor-pointer"
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="khmer">Khmer (ភាសាខ្មែរ)</option>
                              <option value="Auto-Detect">Auto-Detect</option>
                              <option value="english">English</option>
                              <option value="french">French</option>
                              <option value="chinese">Chinese</option>
                            </select>
                         </div>

                         {/* Khmer Font Choice */}
                         {(selectedLanguage.toLowerCase() === 'khmer' || selectedLanguage === 'Auto-Detect') && (
                           <div className="flex flex-col gap-1.5 w-full text-left">
                              <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider font-sans">Khmer Font:</span>
                              <select 
                                className="w-full bg-white border border-slate-300 text-slate-800 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-khmer text-sm shadow-sm cursor-pointer"
                                value={khmerFont}
                                onChange={(e) => setKhmerFont(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="Khmer OS Battambang">Khmer OS Battambang (Standard Windows)</option>
                                <option value="Khmer MN">Khmer MN (Standard Mac)</option>
                                <option value="Khmer OS Siemreap">Khmer OS Siemreap (Modern)</option>
                                <option value="Khmer OS Content">Khmer OS Content</option>
                                <option value="Leelawadee UI">Leelawadee UI (Windows UI)</option>
                              </select>
                           </div>
                         )}

                         {/* Output Format Choice */}
                         <div className="flex flex-col gap-1.5 w-full text-left">
                            <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">{t.formatLabel}</span>
                            <select 
                              className="w-full bg-white border border-slate-300 text-slate-800 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm shadow-sm cursor-pointer"
                              value={outputFormat}
                              onChange={(e) => setOutputFormat(e.target.value as 'docx' | 'xlsx')}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="docx">{t.wordOption}</option>
                              <option value="xlsx">{t.excelOption}</option>
                            </select>
                         </div>
                         
                         {/* Action Buttons */}
                         <div className="flex gap-3 justify-center mt-3 w-full">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                             className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                           >
                             {t.cancel}
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); startConversion(); }}
                             className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
                           >
                              {outputFormat === 'docx' ? t.convertToWord : t.convertToExcel}
                           </button>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-200 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="font-bold text-slate-800 text-lg">{t.clickToUpload}</p>
                      <p className="text-slate-500 text-sm mt-2">{t.onlyPdf}</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* STATE B: PROCESSING */}
            {appState === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10"
              >
                  <div className="w-full flex items-center justify-between mb-10 px-2 sm:px-4 max-w-lg mx-auto">
                      <div className="flex flex-col items-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">✓</div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">{t.upload}</span>
                      </div>
                      <div className="flex-1 h-[2px] bg-indigo-600 mx-1.5 sm:mx-4"></div>
                      <div className="flex flex-col items-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold ring-4 ring-indigo-100 font-sans">2</div>
                          <span className="text-[10px] uppercase font-bold text-indigo-600 font-sans">{t.processing}</span>
                      </div>
                      <div className="flex-1 h-[2px] bg-slate-200 mx-1.5 sm:mx-4"></div>
                      <div className="flex flex-col items-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold font-sans">3</div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">{t.download}</span>
                      </div>
                  </div>

                  <div className="w-full max-w-lg space-y-6 text-center">
                      <div className="space-y-2">
                          <div className="flex justify-between text-sm font-medium mb-1 font-sans">
                              <span className="text-indigo-600 font-bold">{statusText}</span>
                              <span className="text-slate-500">{progress}%</span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-indigo-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-left bg-slate-50 border border-slate-100 p-5 rounded-xl font-sans text-sm">
                          <div className="flex items-center space-x-3">
                              {progress >= 25 ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div>}
                              <span className={progress >= 25 ? "text-slate-500" : "text-indigo-600 font-medium font-sans"}>{t.uploadingPdf} ({file?.name})</span>
                          </div>
                          <div className="flex items-center space-x-3">
                              {progress >= 50 ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : progress >= 25 ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0"></div>}
                              <span className={progress >= 50 ? "text-slate-500 font-sans" : progress >= 25 ? "text-indigo-600 font-medium font-sans" : "text-slate-400 font-sans"}>{t.analyzingLayout}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                              {progress >= 75 ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : progress >= 50 ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0"></div>}
                              <span className={progress >= 75 ? "text-slate-500 font-sans" : progress >= 50 ? "text-indigo-600 font-medium font-sans" : "text-slate-400 font-sans"}>{t.runningOcr}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                              {progress >= 100 ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : progress >= 75 ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0"></div> : <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0"></div>}
                              <span className={progress >= 100 ? "text-slate-500 font-sans" : progress >= 75 ? "text-indigo-600 font-medium font-sans" : "text-slate-400 font-sans"}>{t.reconstructing}</span>
                          </div>
                      </div>
                  </div>
              </motion.div>
            )}

            {/* STATE C: SUCCESS */}
            {appState === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col md:flex-row w-full bg-white animate-fade-in"
              >
                {/* Left side: Preview Icon */}
                <div className="w-full md:w-5/12 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col items-center justify-center p-6 sm:p-10 text-center md:min-h-[400px]">
                   <div className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 ring-8 shadow-inner", statusText.includes('Failed') ? "bg-red-100 ring-red-50" : "bg-green-100 ring-green-50")}>
                     {statusText.includes('Failed') ? <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" /> : <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />}
                   </div>
                   <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{statusText.includes('Failed') ? "Conversion Failed" : t.conversionComplete}</h3>
                   <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto">
                     {statusText.includes('Failed') ? "There was an error generating your perfect DOCX." : t.conversionCompleteDesc}
                   </p>
                </div>

                {/* Right side: Download Actions & Editable Preview */}
                <div className="w-full md:w-7/12 flex flex-col p-6 sm:p-8 justify-center">
                    
                    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm mb-6 flex flex-col overflow-hidden">
                       <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
                           <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
                             <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px]" title={`converted_${file?.name || 'document'}.${outputFormat}`}>
                               {statusText.includes('Failed') ? "error_report.txt" : `converted_${file?.name ? file.name.replace('.pdf', '') : 'document'}.${outputFormat}`}
                             </p>
                           </div>
                           <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 font-sans">
                             {statusText.includes('Failed') ? 'LOGS' : t.editablePreview}
                           </span>
                       </div>
                       <div className="p-5 bg-white min-h-[160px] max-h-[160px] overflow-y-auto">
                          <div 
                             contentEditable={!statusText.includes('Failed')} 
                             suppressContentEditableWarning
                             className={cn(
                               "w-full h-full outline-none text-slate-800 whitespace-pre-wrap leading-relaxed",
                               statusText.includes('Failed') ? "font-mono text-sm text-red-600" : (selectedLanguage.toLowerCase() === 'khmer' || previewText.match(/[\u1780-\u17FF]/) ? "font-khmer text-lg" : "text-sm font-sans")
                             )}
                          >
                             {previewText ? (
                               <p>{previewText}</p>
                             ) : (
                               selectedLanguage.toLowerCase() === 'khmer' ? (
                                 <p>នេះគឺជាឯកសារដែលបានបម្លែងពី PDF។ អ្នកអាចកែសម្រួលអត្ថបទនៅទីនេះមុនពេលទាញយកបាន។ ទីតាំង និងទម្រង់ត្រូវបានរក្សាទុកយ៉ាងត្រឹមត្រូវ។</p>
                               ) : (
                                 <p>This is a preview of the converted document. You can edit this rich-text visual wrapper directly. The backend ensures perfect layout retention from the source PDF including tables and multiple columns.</p>
                               )
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        {!statusText.includes('Failed') && (
                          <button 
                             onClick={handleDownload}
                             className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:bg-indigo-700 transition-all active:scale-[0.98] cursor-pointer"
                          >
                            <Download className="w-5 h-5" />
                            {outputFormat === 'docx' ? t.downloadWordBtn : t.downloadExcelBtn}
                          </button>
                        )}
                    </div>
                    
                    <div className="mt-6 text-center w-full">
                       <button 
                         onClick={resetFlow}
                         className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group cursor-pointer bg-transparent border-none"
                       >
                         <RefreshCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-500" />
                         {t.convertAnother}
                       </button>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Security Banner */}
        <div className="mt-8 flex items-start sm:items-center bg-white/60 backdrop-blur-sm border border-slate-200 px-5 py-3 rounded-xl sm:rounded-full space-x-3 text-xs sm:text-sm text-slate-500 shadow-sm w-full max-w-2xl">
           <svg className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
           <span className="leading-relaxed"><strong>{t.privacyTitle}</strong>{t.privacyText}</span>
        </div>

        {/* How it works Section */}
        <section id="how-it-works" className="w-full max-w-4xl mt-24 pt-16 border-t border-slate-200">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
               {t.howItWorksHeader}
             </h2>
             <p className="text-slate-500 text-normal max-w-xl mx-auto">
               {t.howItWorksSubtitle}
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
               <div className="absolute top-4 right-4 text-xs font-mono font-bold text-slate-300">01</div>
               <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 font-bold text-lg">↑</div>
               <h3 className="font-bold text-slate-800 text-base mb-2">{t.step1Title}</h3>
               <p className="text-slate-500 text-xs leading-relaxed">{t.step1Desc}</p>
             </div>
             
             <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
               <div className="absolute top-4 right-4 text-xs font-mono font-bold text-slate-300">02</div>
               <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 font-bold text-lg">🔎</div>
               <h3 className="font-bold text-slate-800 text-base mb-2">{t.step2Title}</h3>
               <p className="text-slate-500 text-xs leading-relaxed">{t.step2Desc}</p>
             </div>
             
             <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
               <div className="absolute top-4 right-4 text-xs font-mono font-bold text-slate-300">03</div>
               <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 font-bold text-lg">💾</div>
               <h3 className="font-bold text-slate-800 text-base mb-2">{t.step3Title}</h3>
               <p className="text-slate-500 text-xs leading-relaxed">{t.step3Desc}</p>
             </div>
           </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full max-w-4xl mt-24 pt-16 border-t border-slate-200">
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-12 shadow-xl relative overflow-hidden">
             {/* Gradient visual decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl transform -translate-x-16 translate-y-16"></div>
             
             <div className="relative z-10 max-w-2xl">
               <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">{t.about}</div>
               <h2 className="text-2xl sm:text-3xl font-bold mb-4 font-sans leading-snug">
                 {t.aboutHeader}
               </h2>
               <p className="text-slate-300 text-sm leading-relaxed mb-6 font-sans">
                 {t.aboutDescDetail}
               </p>
               <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-300 font-sans mb-8">
                  <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">✓ Multi-Column Flow Tracking</span>
                  <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">✓ OCR Bounding Alignment</span>
                  <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">✓ Native Khmer Unicode Support</span>
               </div>

               {/* Web Creator Profile Section */}
               <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center space-x-4">
                   <img src="/creator_profile.png" alt="Udom Kevin Profile Avatar" className="w-12 h-12 object-cover rounded-full shadow-md shrink-0 border border-slate-700 bg-slate-800" referrerPolicy="no-referrer" />
                   <div>
                     <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold block mb-0.5">{t.creatorLabel}</span>
                     <h4 className="text-white font-bold text-base font-sans">{t.creatorName}</h4>
                     <p className="text-xs text-slate-400 font-sans">{t.creatorRole}</p>
                   </div>
                 </div>
                 <div className="text-xs text-slate-300 leading-relaxed max-w-sm">
                   {t.creatorDesc}
                 </div>
               </div>
             </div>
          </div>
        </section>


      </main>

      {/* Auth Modal overlay wrapper */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden flex flex-col relative"
            >
              <button 
                onClick={() => { setIsAuthModalOpen(false); setAuthError(''); setAuthSuccess(''); }}
                className="absolute top-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors focus:outline-none cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              <div className="flex border-b border-slate-200">
                <button 
                  type="button"
                  onClick={() => { setAuthTab('signin'); setAuthError(''); setAuthSuccess(''); }}
                  className={cn(
                    "flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider cursor-pointer",
                    authTab === 'signin' ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/10" : "text-slate-500 hover:text-slate-700 bg-transparent"
                  )}
                >
                  {t.signIn}
                </button>
                <button 
                  type="button"
                  onClick={() => { setAuthTab('signup'); setAuthError(''); setAuthSuccess(''); }}
                  className={cn(
                    "flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider cursor-pointer",
                    authTab === 'signup' ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/10" : "text-slate-500 hover:text-slate-700 bg-transparent"
                  )}
                >
                  {t.signUp}
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4 font-sans">
                {authError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-semibold leading-relaxed">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-lg text-xs font-semibold leading-relaxed">
                    {authSuccess}
                  </div>
                )}

                {authTab === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">{uiLang === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}</label>
                    <input 
                      type="text" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-sans"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">{uiLang === 'km' ? 'អុីម៉ែល (Email)' : 'Email Address'}</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">{uiLang === 'km' ? 'លេខសម្ងាត់' : 'Password'}</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-sans"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs uppercase tracking-widest text-white rounded-lg transition-colors shadow-md mt-4 cursor-pointer"
                >
                  {authTab === 'signin' ? t.signIn : t.signUp}
                </button>

                <div className="text-center pt-2 text-xs text-slate-500">
                  {authTab === 'signin' ? (
                    <span>{uiLang === 'km' ? 'មិនទាន់មានគណនីមែនទេ?' : "Don't have an account?"} <button type="button" onClick={() => { setAuthTab('signup'); setAuthError(''); }} className="text-indigo-600 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">{t.signUp}</button></span>
                  ) : (
                    <span>{uiLang === 'km' ? 'មានគណនីរួចហើយមែនទេ?' : "Already have an account?"} <button type="button" onClick={() => { setAuthTab('signin'); setAuthError(''); }} className="text-indigo-600 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">{t.signIn}</button></span>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blueprint is fully hidden/removed from footer per request */}
      <footer className="py-6 bg-white border-t border-slate-200 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400 flex-shrink-0 mt-auto font-sans text-center">
         <div>&copy; 2026 Kroma PDF &bull; {t.allRightsReserved}. Professional OCR layout restoration suite.</div>
      </footer>
    </div>
  );
}
