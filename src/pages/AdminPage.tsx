import { useTheme } from '../context/ThemeContext';
import { AdminPanel } from '../components/AdminPanel';

export function AdminPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-cosmic-midnight' : 'bg-ivory'} pt-24 pb-12 px-4`}>
      <div className="max-w-6xl mx-auto relative z-10 mt-6">
        <AdminPanel />
      </div>
    </div>
  );
}
