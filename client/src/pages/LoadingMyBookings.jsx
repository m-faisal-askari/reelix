import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { CheckCircle2Icon, Loader2Icon, AlertCircleIcon, TicketIcon } from "lucide-react";
import toast from "react-hot-toast";

const LoadingMyBookings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { axios, getToken } = useAppContext();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [message, setMessage] = useState("Verifying your payment with Stripe...");

  useEffect(() => {
    let isMounted = true;

    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          // If no session_id is provided, redirect directly to my-bookings
          navigate("/my-bookings", { replace: true });
          return;
        }

        let token = null;
        try {
          token = await getToken();
        } catch {
          token = null;
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const { data } = await axios.post(
          "/api/booking/verify-stripe",
          { sessionId },
          { headers }
        );

        if (!isMounted) return;

        if (data.success) {
          setStatus("success");
          setMessage("Payment confirmed! Your tickets are ready.");
          toast.success("Payment successful! Seats confirmed.");
          setTimeout(() => {
            navigate("/my-bookings", { replace: true });
          }, 1500);
        } else {
          setStatus("error");
          setMessage(data.message || "Payment verification was unsuccessful.");
          toast.error(data.message || "Payment verification failed.");
          setTimeout(() => {
            navigate("/my-bookings", { replace: true });
          }, 2500);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("Could not verify payment status. Please check your bookings.");
        setTimeout(() => {
          navigate("/my-bookings", { replace: true });
        }, 2500);
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [sessionId, navigate, axios, getToken]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-gray-900/80 border border-primary/20 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-md shadow-2xl flex flex-col items-center">
        {status === "verifying" && (
          <>
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <TicketIcon className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1 border border-primary/40">
                <Loader2Icon className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Finalizing Your Booking</h2>
            <p className="text-sm text-gray-300">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
              <CheckCircle2Icon className="w-9 h-9 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Confirmed!</h2>
            <p className="text-sm text-gray-300">{message}</p>
            <p className="text-xs text-gray-400 mt-4">Redirecting to your tickets...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5">
              <AlertCircleIcon className="w-9 h-9 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification Notice</h2>
            <p className="text-sm text-gray-300">{message}</p>
            <p className="text-xs text-gray-400 mt-4">Redirecting to My Bookings...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingMyBookings;
