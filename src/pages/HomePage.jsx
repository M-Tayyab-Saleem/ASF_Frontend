import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStrategies } from '../api';
import { StrategyGrid } from '../components/strategy/StrategyGrid';
import { StrategyCard } from '../components/strategy/StrategyCard';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { EmptyState } from '../components/shared/EmptyState';

export const HomePage = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await getStrategies();
        if (response.data && response.data.success) {
          setStrategies(response.data.data);
        } else {
          setStrategies([]);
        }
      } catch (err) {
        console.error('Error fetching strategies:', err);
        setError('Failed to load strategies');
      } finally {
        setLoading(false);
      }
    };
    fetchStrategies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <EmptyState message={error} />;
  }

  return (
    <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl  text-text-primary mb-4">
            AI Security Framework
          </h1>
          <p className="text-text-secondary text-lg">
            Select a strategy to explore capabilities, controls, and tools
          </p>
        </div>

        {strategies.length > 0 ? (
          <StrategyGrid>
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.strategyId}
                strategy={strategy}
                onClick={() => navigate(`/strategy/${strategy.strategyId}`)}
              />
            ))}
          </StrategyGrid>
        ) : (
          <EmptyState message="No strategies found." />
        )}
      </div>
    </div>
  );
};
