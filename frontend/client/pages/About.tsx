import { Link } from "react-router-dom";
import { ArrowLeft, Target, Users, Zap } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-brand-blue-darker hover:text-brand-blue-dark transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-relaxed">
            About
            <span className="block bg-gradient-to-r from-brand-green via-brand-cyan to-brand-blue bg-clip-text text-transparent">
              PriceWise
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            We're on a mission to help smart shoppers save money by making price comparison simple, transparent, and accessible.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-brand-green/10 to-brand-teal/10 rounded-xl p-8 border border-brand-green/20">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-green to-brand-teal rounded-lg flex items-center justify-center mb-4">
              <Target size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
            <p className="text-gray-700">
              Empower shoppers with instant access to price comparisons across multiple stores, enabling informed purchasing decisions and maximum savings.
            </p>
          </div>

          <div className="bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 rounded-xl p-8 border border-brand-cyan/20">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan to-brand-blue rounded-lg flex items-center justify-center mb-4">
              <Zap size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Approach</h3>
            <p className="text-gray-700">
              Using cutting-edge technology, we gather real-time pricing data from multiple stores and present it in an easy-to-understand format.
            </p>
          </div>

          <div className="bg-gradient-to-br from-brand-blue-dark/10 to-brand-teal/10 rounded-xl p-8 border border-brand-blue-dark/20">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-blue-dark to-brand-teal rounded-lg flex items-center justify-center mb-4">
              <Users size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Community</h3>
            <p className="text-gray-700">
              Join thousands of smart shoppers who use PriceWise to save money on their grocery shopping and make the most of their budget.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Why Choose PriceWise?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Pricing</h3>
                <p className="text-gray-600">Get instant access to current prices from multiple stores, updated regularly for accuracy.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Comparison</h3>
                <p className="text-gray-600">Compare prices side-by-side across stores and see your potential savings at a glance.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Shopping Lists</h3>
                <p className="text-gray-600">Create and manage shopping lists with optimized store selections for maximum savings.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Free to Use</h3>
                <p className="text-gray-600">Access all our price comparison tools at no cost. No hidden fees or subscriptions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-green to-brand-teal rounded-xl p-12 text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Saving?</h2>
          <p className="text-white text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of smart shoppers and start comparing prices today. Every dollar saved counts!
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-white text-brand-blue-darker font-semibold rounded-lg hover:shadow-lg transition-shadow"
          >
            Compare Prices Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
