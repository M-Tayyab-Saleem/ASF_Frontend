import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getControls } from '../api';
import { Breadcrumb } from '../components/shared/Breadcrumb';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';
import { ControlList } from '../components/control/ControlList';
import { ControlDetail } from '../components/detail/ControlDetail';
import { ControlsOverview } from '../components/control/ControlsOverview';

export const ControlsPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchControls = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getControls();
        if (res.data?.success) setControls(res.data.data);
      } catch (err) {
        console.error('Error fetching controls:', err);
        setError('Failed to load controls.');
      } finally {
        setLoading(false);
      }
    };
    fetchControls();
  }, []);

  const handleSelectItem = (id) => {
    navigate(`/controls/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState message={error} />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'All Controls', to: '/controls' }
  ];
  if (itemId) {
    breadcrumbItems[0].to = '/controls';
    breadcrumbItems.push({ label: itemId });
  } else {
    delete breadcrumbItems[0].to;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] -mt-8">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 pt-8 px-0 sm:px-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 pb-6">
          {/* Left Panel - List View */}
          <div className="w-full md:w-[30%] flex flex-col min-h-0 bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/40 bg-white/50">
              <h2 className="font-semibold text-slate-800">Global Controls</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ControlList
                controls={controls}
                selectedId={itemId}
                onSelect={(id) => handleSelectItem(id)}
              />
            </div>
          </div>

          {/* Right Panel - Detail View */}
          <div className="hidden md:flex w-full md:w-[70%] flex-col min-h-0">
            {itemId ? (
              <ControlDetail controlId={itemId} />
            ) : (
              <ControlsOverview />
            )}
          </div>
          
          {/* Mobile Detail Overlay */}
          {itemId && (
             <div className="md:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col p-6">
                <button 
                  onClick={() => navigate('/controls')}
                  className="mb-4 text-primary"
                >
                   ← Back to List
                </button>
                <div className="flex-1 overflow-y-auto">
                   <ControlDetail controlId={itemId} />
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
