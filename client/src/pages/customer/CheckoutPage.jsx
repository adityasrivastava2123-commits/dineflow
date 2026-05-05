import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Phone, MessageSquare, ShoppingBag, Loader, Banknote } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, tableNumber, subtotal, dispatch } = useCart();

  const { appliedOffer, taxAmount, discountAmount, total } = location.state || {
    taxAmount: subtotal * 0.05,
    discountAmount: 0,
    total: subtotal * 1.05,
  };

  const [name, setName] = useState(localStorage.getItem('dineflow_name') || '');
  const [phone, setPhone] = useState(localStorage.getItem('dineflow_phone') || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (items.length === 0) { toast.error('Cart is empty'); return; }

    setLoading(true);
    try {
      const orderPayload = {
        restaurantSlug: slug,
        tableNumber,
        items: items.map((i) => ({
          menuItemId: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
          isVeg: i.isVeg,
          image: i.image,
        })),
        customerName: name,
        customerPhone: phone,
        notes,
        offerCode: appliedOffer?.code,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount: total,
        paymentMethod: 'cash',
      };

      const { data: order } = await createOrder(orderPayload);
      localStorage.setItem('dineflow_name', name);
      if (phone) localStorage.setItem('dineflow_phone', phone);
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Order placed! Pay at the counter. 🎉');
      navigate(`/order/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-100 flex items-center gap-4 p-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-stone-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">Place Order</h1>
      </div>

      <div className="p-4 space-y-4 pb-36">
        {/* Customer info */}
        <div className="card p-4 space-y-4">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" /> Your Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  type="tel"
                  className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Special notes */}
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-500" /> Order Notes
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests? (e.g. no nuts, less spicy...)"
            rows={3}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors resize-none"
          />
        </div>

        {/* Order summary */}
        <div className="card p-4 space-y-3">
          <h2 className="font-bold text-stone-800">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm text-stone-600">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 pt-2 space-y-1.5">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>GST (5%)</span><span>₹{taxAmount?.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 text-base pt-1 border-t border-stone-100">
              <span>Total</span><span>₹{total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment note */}
        <div className="flex items-center gap-2 text-sm text-stone-400 px-1">
          <Banknote className="w-4 h-4" />
          <span>Pay cash at the counter after your meal</span>
        </div>
      </div>

      {/* Place order button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 p-4 pb-safe max-w-lg mx-auto">
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
          {loading ? 'Placing order...' : `Place Order • ₹${total?.toFixed(0)}`}
        </button>
      </div>
    </div>
  );
}
