import { useStore } from '@/lib/store';
import LoginScreen from '@/screens/LoginScreen';
import RoleSelectionScreen from '@/screens/RoleSelectionScreen';
import CitizenDashboard from '@/screens/CitizenDashboard';
import AuthorityDashboard from '@/screens/AuthorityDashboard';
import WorkforceDashboard from '@/screens/WorkforceDashboard';
import InfluencerDashboard from '@/screens/InfluencerDashboard';
import ToastContainer from '@/components/ui/Toast';

function App() {
  const { currentUser, pendingUser } = useStore();

  return (
    <>
      {!currentUser && !pendingUser && <LoginScreen />}
      {!currentUser && pendingUser && <RoleSelectionScreen />}
      {currentUser?.role === 'citizen' && <CitizenDashboard />}
      {currentUser?.role === 'authority' && <AuthorityDashboard />}
      {currentUser?.role === 'workforce' && <WorkforceDashboard />}
      {currentUser?.role === 'influencer' && <InfluencerDashboard />}
      <ToastContainer />
    </>
  );
}

export default App;
