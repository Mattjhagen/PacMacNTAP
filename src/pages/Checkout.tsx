import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CreditCard, ChevronRight, Lock, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCart, CartItem } from '../utils/storage';
import { checkoutService } from '../services/checkoutService';

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [processingStep, setProcessingStep] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cart.reduce((acc, item) => acc + item.price, 0);
  const monthlyItems = cart.filter(item => item.isFinanced);
  const monthlyTotal = monthlyItems.reduce((acc, item) => acc + (item.price || 0), 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || (!cardNumber && total > 0)) return;

    setStatus('processing');
    setProcessingStep('Authorizing secure checkout ledger...');
    
    // Simulate transaction latency updates
    setTimeout(() => {
      setProcessingStep('Registering cellular network route handshakes...');
    }, 1500);

    setTimeout(() => {
      setProcessingStep('Synchronizing adaptive AI billing profile...');
    }, 3000);

    const simType = (sessionStorage.getItem('pacmac_checkout_sim') as 'eSIM' | 'Physical SIM') || 'eSIM';
    const chosenDevice = cart.find(item => item.type === 'device')?.name || 
                         sessionStorage.getItem('pacmac_checkout_device') || 
                         'Unlocked Phone (BYOP)';

    const { success, error } = await checkoutService.processCheckout(
      email,
      name,
      address,
      cart,
      simType,
      chosenDevice
    );

    if (success) {
      setStatus('success');
    } else {
      setStatus('idle');
      alert(error || "Transaction authorization failed.");
    }
  };

  if (cart.length === 0 && status !== 'success') {
    return (
      <div className="relative min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-brand-gray-600 mx-auto" />
          <h2 className="text-lg font-semibold">Your shopping cart is empty</h2>
          <p className="text-xs text-brand-gray-400 font-light">Select a cell plan or device first.</p>
          <button
            onClick={() => navigate('/plans')}
            className="px-6 py-2.5 text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all"
          >
            Configure Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden pb-24 font-sans font-light">
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70vw] h-[35vh] radial-glow-gradient pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 md:pt-40">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Form details (Left 7 cols) */}
              <div className="lg:col-span-7 border border-white/5 bg-neutral-950/40 backdrop-blur-md rounded-xl p-8">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-white mb-6">
                  Account details
                </h1>

                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-[9px] font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                        First & Last Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Mercer"
                        className="w-full bg-neutral-950 border border-white/10 rounded px-4 py-3 text-sm focus:outline-none focus:border-white transition-all text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-[9px] font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@domain.com"
                        className="w-full bg-neutral-950 border border-white/10 rounded px-4 py-3 text-sm focus:outline-none focus:border-white transition-all font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-[9px] font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                      Billing / Shipping Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="120 Pine Street, San Francisco, CA"
                      className="w-full bg-neutral-950 border border-white/10 rounded px-4 py-3 text-sm focus:outline-none focus:border-white transition-all text-white"
                    />
                  </div>

                  {total > 0 && (
                    <div>
                      <label htmlFor="card" className="block text-[9px] font-mono text-brand-gray-400 uppercase tracking-wider mb-2">
                        Credit Card Number
                      </label>
                      <div className="relative">
                        <input
                          id="card"
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                          placeholder="•••• •••• •••• ••••"
                          className="w-full bg-neutral-950 border border-white/10 rounded pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-all font-mono text-white"
                        />
                        <CreditCard className="w-4 h-4 text-brand-gray-500 absolute left-4 top-3.5" />
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/5 pt-6 flex justify-between items-center text-xs text-brand-gray-500">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      SECURE BANK-GRADE LEDGER
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 text-center text-sm font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Authorize Setup & Activate Line
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Order summary (Right 5 cols) */}
              <div className="lg:col-span-5 border border-white/10 bg-neutral-950/80 rounded-xl p-8 flex flex-col justify-between shadow-lg">
                <div className="space-y-6">
                  <h3 className="font-mono text-xs text-brand-gray-400 uppercase tracking-widest border-b border-white/5 pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs">
                        <div>
                          <span className="font-semibold text-white block">{item.name}</span>
                          <span className="text-[10px] text-brand-gray-500 font-mono capitalize block mt-0.5">
                            {item.type === 'device' ? (item.isFinanced ? 'Monthly Finance' : 'Purchase Outright') : 'Setup Fee'}
                          </span>
                        </div>
                        <span className="font-mono text-brand-gray-300 font-medium">
                          ${item.price.toFixed(2)}{item.isFinanced ? '/mo' : ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-gray-400 font-mono">Total Upfront</span>
                      <span className="font-mono text-white font-semibold">
                        ${cart.filter(item => !item.isFinanced).reduce((acc, item) => acc + item.price, 0).toFixed(2)}
                      </span>
                    </div>

                    {monthlyTotal > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-brand-gray-400 font-mono">Monthly Financed Total</span>
                        <span className="font-mono text-white font-semibold">
                          ${monthlyTotal.toFixed(2)}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[9px] font-mono text-brand-gray-500 leading-relaxed mt-8">
                  By clicking authorizer, you establish cellular profile references. If eSIM is chosen, you will immediately download your scanner profile. Cancel anytime on your dashboard.
                </p>
              </div>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center border border-white/5 bg-neutral-950/40 rounded-xl p-8 py-16 space-y-6"
            >
              <RefreshCw className="w-10 h-10 text-white animate-spin mx-auto" />
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight text-white">Configuring cellular profile...</h2>
                <p className="text-xs text-brand-gray-400 font-mono">{processingStep}</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center border border-white/10 bg-neutral-950/80 rounded-xl p-8 py-12 space-y-6 shadow-2xl relative"
            >
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-xl font-semibold text-white">Line Setup Authorized</h2>
                <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                  Your cellular account has been configured. If you chose eSIM, scan your QR carrier profile. If physical, we mailed it.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                {sessionStorage.getItem('pacmac_checkout_sim') === 'Physical SIM' ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-2.5 text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all cursor-pointer"
                  >
                    Go to Customer Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/esim')}
                    className="w-full py-2.5 text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded transition-all cursor-pointer"
                  >
                    View eSIM QR Profile
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
