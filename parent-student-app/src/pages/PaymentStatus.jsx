import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Download } from 'lucide-react';
import axios from '../api/axios';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const reference = searchParams.get('reference');

    if (paymentId || reference) {
      // In a real app, we would call our backend to verify the payment status
      // even though OwnPay handles the webhook, the frontend needs to know.
      verifyPayment(paymentId || reference);
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  const verifyPayment = async (id) => {
    try {
      // Mocking verification for now. In production, this would hit GET /api/v1/payments/:id
      setTimeout(() => {
        setStatus('success');
        setPaymentInfo({
          amount: 5000,
          transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString()
        });
      }, 2000);
    } catch (err) {
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 px-6 text-center">
      {status === 'loading' ? (
        <div className="space-y-4">
          <div className="h-20 w-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-bold text-gray-900">Verifying Payment...</h2>
          <p className="text-gray-500">Please do not refresh or close this window.</p>
        </div>
      ) : status === 'success' ? (
        <>
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase">Payment Successful!</h2>
            <p className="text-gray-500 font-medium mt-2">Your payment has been received and processed.</p>
          </div>

          <div className="card w-full max-w-sm bg-gray-50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Amount Paid</span>
              <span className="font-bold">₹{(paymentInfo?.amount / 1).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Transaction ID</span>
              <span className="font-bold">{paymentInfo?.transactionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Date</span>
              <span className="font-bold">{paymentInfo?.date}</span>
            </div>
          </div>

          <div className="flex flex-col w-full max-w-sm gap-3">
            <button className="btn btn-primary w-full">
              <Download className="h-5 w-5 mr-2" /> Download Receipt
            </button>
            <Link to="/" className="btn bg-gray-100 text-gray-700 w-full">
              Back to Home <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase">Payment Failed</h2>
            <p className="text-gray-500 font-medium mt-2">Something went wrong while processing your payment.</p>
          </div>
          <p className="text-sm text-gray-400 max-w-xs">
            If any amount was deducted from your account, it will be refunded automatically within 5-7 business days.
          </p>
          <div className="flex flex-col w-full max-w-sm gap-3">
            <Link to="/fees" className="btn btn-primary w-full">Try Again</Link>
            <Link to="/" className="btn bg-gray-100 text-gray-700 w-full">Back to Home</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentStatus;
