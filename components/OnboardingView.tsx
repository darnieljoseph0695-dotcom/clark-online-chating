
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { generateBio } from '../services/geminiService';

interface OnboardingViewProps {
  onComplete: (user: UserProfile) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: 21,
    interests: [] as string[],
    bio: '',
    location: 'San Francisco, CA',
    photo: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonInterests = ['Travel', 'Cooking', 'Music', 'Hiking', 'Gaming', 'Fitness', 'Art', 'Coffee', 'Photography'];

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setCameraActive(false);
      alert("Could not access camera. Please use file upload instead.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setFormData(p => ({ ...p, photo: dataUrl }));
        
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(p => ({ ...p, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBio = async () => {
    if (formData.interests.length === 0) return;
    setIsGenerating(true);
    const bio = await generateBio(formData.interests);
    setFormData(prev => ({ ...prev, bio }));
    setIsGenerating(false);
  };

  const handleSubmit = () => {
    const newUser: UserProfile = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: formData.name,
      age: formData.age,
      bio: formData.bio,
      interests: formData.interests,
      location: formData.location,
      photos: [formData.photo || 'https://picsum.photos/seed/' + Math.random() + '/600/800'],
      distance: Math.floor(Math.random() * 15) + 1
    };
    onComplete(newUser);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col justify-center animate-fadeIn relative overflow-hidden bg-slate-900">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

      {step === 1 && (
        <div className="space-y-8 z-10">
          <div className="space-y-2">
            <h1 className="text-6xl font-black gradient-text italic">Clark.</h1>
            <p className="text-slate-400 text-lg">Real connections start here.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl p-4 text-white placeholder-slate-600 focus:border-pink-500 outline-none transition-all"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Age</label>
              <input 
                type="number" 
                value={formData.age}
                onChange={(e) => setFormData(p => ({ ...p, age: parseInt(e.target.value) || 18 }))}
                className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl p-4 text-white outline-none focus:border-pink-500 transition-all"
                min="18"
              />
            </div>
          </div>
          <button 
            disabled={!formData.name || formData.age < 18}
            onClick={() => setStep(2)}
            className="w-full gradient-bg p-5 rounded-2xl font-black text-white shadow-xl shadow-pink-500/20 disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-95"
          >
            NEXT
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 z-10">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black text-white">Profile Photo</h2>
            <p className="text-slate-400">Choose how you want to be seen.</p>
          </div>

          <div className="relative aspect-[3/4] w-full bg-slate-800 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-2xl">
            {formData.photo ? (
              <div className="w-full h-full relative">
                <img src={formData.photo} className="w-full h-full object-cover" alt="Captured" />
                <button 
                  onClick={() => setFormData(p => ({ ...p, photo: '' }))}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            ) : cameraActive ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <div className="flex gap-4">
                  <button 
                    onClick={startCamera} 
                    className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-slate-700 hover:bg-slate-600 transition"
                  >
                    <i className="fa-solid fa-camera text-3xl text-pink-500"></i>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Camera</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-slate-700 hover:bg-slate-600 transition"
                  >
                    <i className="fa-solid fa-folder-open text-3xl text-blue-400"></i>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Choose File</span>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </div>
            )}
            
            {cameraActive && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <button 
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white bg-pink-500 flex items-center justify-center shadow-2xl animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-white/50"></div>
                </button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 bg-slate-800 p-4 rounded-2xl font-bold text-slate-400">Back</button>
            <button 
              disabled={!formData.photo}
              onClick={() => setStep(3)} 
              className="flex-[2] gradient-bg p-4 rounded-2xl font-black text-white disabled:opacity-30"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 z-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Your Interests</h2>
            <p className="text-slate-400">Select at least 3 categories.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {commonInterests.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-5 py-2.5 rounded-xl border-2 transition-all ${
                  formData.interests.includes(interest) 
                  ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/30 scale-105 font-bold' 
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex-1 bg-slate-800 p-4 rounded-2xl font-bold text-slate-400">Back</button>
            <button 
              disabled={formData.interests.length < 3}
              onClick={() => setStep(4)} 
              className="flex-[2] gradient-bg p-4 rounded-2xl font-black text-white disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-8 z-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">About You</h2>
            <p className="text-slate-400">Tell others who you are.</p>
          </div>

          <div className="relative group">
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              rows={6}
              className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl p-5 text-white placeholder-slate-600 focus:border-pink-500 outline-none transition-all resize-none font-medium"
              placeholder="A few words about yourself..."
            />
            <button 
              onClick={handleGenerateBio}
              disabled={isGenerating}
              className="absolute bottom-4 right-4 bg-pink-500/20 text-pink-400 px-4 py-2 rounded-xl hover:bg-pink-500/30 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
              {isGenerating ? 'AI Writing...' : 'AI Help'}
            </button>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(3)} className="flex-1 bg-slate-800 p-4 rounded-2xl font-bold text-slate-400">Back</button>
            <button 
              disabled={!formData.bio}
              onClick={handleSubmit} 
              className="flex-[2] gradient-bg p-4 rounded-2xl font-black text-white disabled:opacity-30 shadow-2xl shadow-pink-500/20"
            >
              Create Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingView;
