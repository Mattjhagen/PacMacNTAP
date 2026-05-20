import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

export default function CheckoutView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [cardName, setCardName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');

  const itemId = searchParams.get('item') || 'byop-esim';
  const finance = searchParams.get('finance') === 'true';

  let itemName = 'BYOP eSIM Activation';
  let price = 25.00;
  let subText = 'First month activation charge';

  if (itemId === 'pro-ultra') {
    itemName = 'PacMac Pro Ultra (Titanium)';
    price = finance ? 24.00 : 599.00;
    subText = finance ? 'Monthly financing configuration charge' : 'Outright retail purchase';
  } else if (itemId === 'light') {
    itemName = 'PacMac Light (Aluminum)';
    price = finance ? 12.00 : 299.00;
    subText = finance ? 'Monthly financing configuration charge' : 'Outright retail purchase';
  } else if (itemId === 'zero') {
    itemName = 'PacMac Zero (E-Ink)';
    price = finance ? 8.00 : 199.00;
    subText = finance ? 'Monthly financing configuration charge' : 'Outright retail purchase';
  } else if (itemId === 'byop-physical') {
    itemName = 'Triple-cut Physical SIM Order';
    price = 5.00;
    subText = 'Standard USPS shipping fee';
  }

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Write mock order log to localStorage so AdminDashboardPreview can display it
      const newOrder = {
        id: `PAC-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        item: itemName,
        amount: price,
        customer: cardName || "Matty Hagen",
        status: "COMPLETED",
        time: "Just now"
      };

      const currentOrders = JSON.parse(localStorage.getItem('pacmac_orders') || '[]');
      localStorage.setItem('pacmac_orders', JSON.stringify([newOrder, ...currentOrders]));

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }, 1800);
  };

  return (
    <section className="relative min-h-screen py-28 px-6 md:px-12 bg-black border-b border-white/5 overflow-hidden">
      {/* Structural side-borders */}
      <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />
      <div className="absolute right-[8%] top-0 bottom-0 w-[1px] bg-white/[0.03] hidden lg:block" />

      {/* Light leak visual */}
      <div className="absolute left-10 top-20 w-[450px] h-[350px] bg-white/[0.005] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch min-h-[65vh]">
          
          {/* Cart Summary (Left) */}
          <div className="lg:col-span-5 border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md text-left flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[9px] text-brand-gray-550 uppercase tracking-widest block">
                  ORDER SECURED // CHECKOUT
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  Summary details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-white/5 bg-black/60 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white block">{itemName}</span>
                    <span className="font-mono text-sm text-white">${price.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-brand-gray-450 font-sans font-light block">{subText}</span>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-brand-gray-450">Subtotal:</span>
                    <span className="text-white">${price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray-450">Estimated Shipping / Taxes:</span>
                    <span className="text-white">$0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5 mt-6">
              <div className="flex justify-between font-mono text-base font-bold">
                <span className="text-brand-gray-300">Total Due:</span>
                <span className="text-white">${price.toFixed(2)}</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-3 text-[10px] font-mono text-brand-gray-450">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Payment encrypted with standard SSL protocols. Supported by global gateways.</span>
              </div>
            </div>
          </div>

          {/* Form Checkout (Right) */}
          <div className="lg:col-span-7 border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md text-left">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Payment Authorized!</h3>
                <p className="text-xs text-brand-gray-450 font-mono">
                  Order completed successfully. Redirecting to your customer dashboard account portal...
                </p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Secure Checkout</h3>
                  <p className="text-xs text-brand-gray-400 font-light mt-1">
                    Provide billing info to process purchase directly through Stripe.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Matty Hagen"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-sans text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-brand-gray-500 uppercase block">CVV</label>
                      <input
                        type="password"
                        required
                        placeholder="•••"
                        maxLength={3}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-brand-gray-550 focus:border-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-150 disabled:bg-brand-gray-700 disabled:text-brand-gray-400 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Decrypting Key & Executing Settlement...
                      </>
                    ) : (
                      <>
                        Authorize Stripe payment of ${price.toFixed(2)}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
