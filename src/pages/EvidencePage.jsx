import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { getRecentEvidenceDashboard } from '../api';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EvidenceFeed } from '../components/detail/EvidenceFeed';
import { Breadcrumb } from '../components/shared/Breadcrumb';

export const EvidencePage = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        // Fetch with no limit (or a high limit) to get all evidence for the page
        const response = await getRecentEvidenceDashboard({ limit: 100 });
        if (response.data?.success) {
          setEvidenceList(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load evidence', err);
        setError('Failed to load evidence');
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-8">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 pt-8 px-0 sm:px-6">
        <Breadcrumb items={[{ label: 'Evidence Feed' }]} />
        
        <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl overflow-hidden flex flex-col mb-6">
          <div className="p-6 border-b border-white/40">
            <h1 className="text-2xl font-bold text-[#0D1514] flex items-center gap-3">
              <FileText className="text-[#00B097]" size={24} />
              Evidence Feed
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              A comprehensive timeline of all uploaded evidence across your controls.
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {error ? (
              <div className="text-center text-rose-500 py-8 bg-rose-50 rounded-xl">{error}</div>
            ) : (
              <EvidenceFeed evidenceList={evidenceList} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
