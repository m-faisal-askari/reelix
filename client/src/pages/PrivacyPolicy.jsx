import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { ShieldCheckIcon, LockIcon, EyeIcon, UserCheckIcon, ArrowLeftIcon, FileTextIcon } from "lucide-react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: ShieldCheckIcon,
      title: "1. Information We Collect",
      content:
        "When you use Reelix, we collect information you provide directly to us—including your name, email address, profile picture (via authentication providers like Clerk), as well as details about the movies, showtimes, theaters, and seats you reserve.",
    },
    {
      icon: EyeIcon,
      title: "2. How We Use Your Information",
      content:
        "We use the collected information to process cinema ticket reservations, maintain accurate seating layouts, deliver booking confirmations, provide customer support, and communicate important service updates regarding your movie screenings.",
    },
    {
      icon: LockIcon,
      title: "3. Data Security & Protection",
      content:
        "We implement industry-standard encryption, authenticated API endpoints, and secure database protocols to protect your personal and transaction data against unauthorized access, alteration, or disclosure.",
    },
    {
      icon: UserCheckIcon,
      title: "4. Your Privacy Rights",
      content:
        "You have the right to access, update, or cancel your bookings at any time via your 'My Bookings' dashboard. You may also request the deletion of your account and associated personal data by contacting our support team.",
    },
    {
      icon: FileTextIcon,
      title: "5. Third-Party Services",
      content:
        "Reelix integrates with trusted service providers—including The Movie Database (TMDB) for film catalog metadata and Clerk for user authentication. These third parties handle information in accordance with their respective privacy policies.",
    },
  ];

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-32 md:pt-40 pb-20 min-h-screen text-gray-300">
      <BlurCircle top="80px" left="60px" />
      <BlurCircle bottom="40px" right="60px" />

      {/* Back to Home */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto pb-8 border-b border-primary/20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-medium mb-3">
          <ShieldCheckIcon className="w-3.5 h-3.5" />
          <span>Legal & Privacy</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Last updated: October 2026. This Privacy Policy describes how Reelix collects, uses, and safeguards your personal data.
        </p>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto mt-8 space-y-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition duration-200"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2.5 mb-2.5">
                <span className="p-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
                  <Icon className="w-4 h-4" />
                </span>
                {section.title}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed pl-9">
                {section.content}
              </p>
            </div>
          );
        })}

        {/* Contact Us Box */}
        <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30 mt-10">
          <h3 className="text-base font-semibold text-white mb-2">
            Questions or Concerns?
          </h3>
          <p className="text-sm text-gray-300">
            If you have any questions regarding this Privacy Policy or your personal information, please contact us at:
          </p>
          <div className="mt-3 text-sm space-y-1 text-gray-200">
            <p>
              <strong className="text-primary font-medium">Email:</strong>{" "}
              privacy@reelix.com / contact@reelix.com
            </p>
            <p>
              <strong className="text-primary font-medium">Phone:</strong>{" "}
              +1-234-567-890
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
