import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { login, loginWithGoogle } from '../../services/api';
import { setToken, setUser } from '../../store/slices/authSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await login(email, password);
      
      localStorage.setItem('token', response.token);
      dispatch(setToken(response.token));
      dispatch(setUser(response.user));
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) return;
      
      await loginWithGoogle(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2B2B2B] rounded-lg p-8">
        <div className="flex justify-center mb-8">
          <img src="/bezi-logo-light.svg" alt="Bezi" className="h-12 w-12" />
        </div>
        
        <h1 className="text-2xl font-semibold text-center text-white mb-8">
          Log in or Sign Up to Bezi
        </h1>

        <div className="mb-6">
          <div className="bg-[#1C1C1C] rounded-lg overflow-hidden">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Failed to sign in with Google')}
              theme="filled_black"
              size="large"
              width="100%"
              text="continue_with"
              useOneTap
            />
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-400 bg-[#2B2B2B]">or</span>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-[#1C1C1C] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#CEF23F] transition-colors"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#1C1C1C] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#CEF23F] transition-colors"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#CEF23F] text-black font-medium py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Continue
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            By registering, you agree to Bezi's{' '}
            <a href="#" className="text-[#CEF23F] hover:underline">Privacy Policy</a>
            {' '}and{' '}
            <a href="#" className="text-[#CEF23F] hover:underline">Terms of Use</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 