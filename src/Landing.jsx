import React from 'react';
import { Users, Clock, MapPin, Shield, TrendingUp, Smartphone } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bharat-saffron/10 to-bharat-green/10" />

        <nav className="container mx-auto px-6 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-bharat-saffron to-bharat-green rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">VX</span>
              </div>
              <span className="text-2xl font-bold">Vortex</span>
            </div>
            <div className="flex gap-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#solutions" className="text-gray-300 hover:text-white transition-colors">Solutions</a>
              <a href="#impact" className="text-gray-300 hover:text-white transition-colors">Impact</a>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-bharat-saffron via-white to-bharat-green bg-clip-text text-transparent">
              Transforming the Sporting Venue Experience
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              A smart platform that eliminates crowd chaos, reduces wait times, and ensures seamless coordination at large-scale sporting events everywhere.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/app.html" className="btn-primary text-lg px-8 py-4">
                Launch Attendee App
              </a>
              <a href="/dashboard.html" className="btn-secondary text-lg px-8 py-4">
                Command Center
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-6 pb-16">
          <div className="grid grid-cols-4 gap-6">
            <StatItem number="40K+" label="Capacity Supported" />
            <StatItem number="75%" label="Reduced Wait Times" />
            <StatItem number="60s" label="Emergency Alert Delivery" />
            <StatItem number="99.9%" label="System Uptime" />
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">The Challenge</h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Large sporting venues face critical challenges that impact safety and attendee experience
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <ProblemCard
              icon={Users}
              title="Crowd Management"
              description="Unpredictable crowd movement leads to bottlenecks, safety risks, and potential stampede situations at high-capacity venues."
            />
            <ProblemCard
              icon={Clock}
              title="Long Wait Times"
              description="15-30 minute waits at concessions and entry gates frustrate attendees and reduce satisfaction scores."
            />
            <ProblemCard
              icon={Shield}
              title="Emergency Response"
              description="Delayed communication during incidents puts attendees at risk and complicates evacuation procedures."
            />
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Our Solution</h2>
          <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Vortex provides an integrated platform addressing every aspect of the venue experience
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <SolutionCard
              icon={Smartphone}
              title="Attendee Mobile App"
              description="PWA-based app for digital tickets, real-time navigation, mobile food ordering, and instant emergency alerts."
              features={[
                'QR-based digital ticketing',
                'Turn-by-turn venue navigation',
                'Mobile concessions ordering',
                'Live wait time updates',
                'Emergency push notifications'
              ]}
            />
            <SolutionCard
              icon={TrendingUp}
              title="Command Center Dashboard"
              description="Real-time monitoring and control center for venue operations, crowd analytics, and incident management."
              features={[
                'Live crowd density heatmaps',
                'Queue monitoring across venues',
                'Incident tracking and dispatch',
                'Staff location management',
                'Emergency alert broadcasting'
              ]}
            />
            <SolutionCard
              icon={MapPin}
              title="Digital Signage System"
              description="Dynamic displays throughout the venue showing wayfinding, wait times, and synchronized emergency messaging."
              features={[
                'Interactive venue maps',
                'Real-time wait time displays',
                'Dynamic wayfinding updates',
                'Emergency message synchronization',
                'Event information displays'
              ]}
            />
            <SolutionCard
              icon={Shield}
              title="Safety & Security Suite"
              description="AI-powered crowd analytics and automated emergency response systems for proactive safety management."
              features={[
                'AI crowd density detection',
                'Automated bottleneck alerts',
                'Multi-channel emergency broadcasts',
                'Evacuation route optimization',
                'Incident command system'
              ]}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>

          <div className="space-y-12">
            <FeatureRow
              reverse
              title="Pre-Arrival Experience"
              description="Start the journey before arriving at the venue"
              features={[
                'Digital ticket purchase and wallet integration',
                'Pre-bookable parking with navigation',
                'Virtual venue tours and seat preview',
                'Personalized arrival recommendations'
              ]}
              image="🎫"
            />

            <FeatureRow
              title="In-Venue Navigation"
              description="Never get lost in the crowd again"
              features={[
                'AR-powered turn-by-turn directions',
                'Real-time path optimization based on crowd density',
                'Accessibility-aware routing',
                '"Find My Seat" guidance from any entrance'
              ]}
              image="🧭"
            />

            <FeatureRow
              reverse
              title="Smart Concessions"
              description="Skip the queues, enjoy the game"
              features={[
                'Mobile ordering with pickup notifications',
                'Live wait time visibility for all food courts',
                'Dietary preference filtering',
                'Location-based special offers'
              ]}
              image="🍔"
            />

            <FeatureRow
              title="Emergency Response"
              description="Safety first, every moment"
              features={[
                'Sub-60 second alert delivery to 95%+ attendees',
                'Multi-channel broadcasting (SMS, push, signage, PA)',
                'Zone-specific evacuation guidance',
                'Real-time incident tracking and resolution'
              ]}
              image="🚨"
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Expected Impact</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <ImpactCard
              metric="40%"
              description="Reduction in average concession wait times"
              color="from-green-500 to-green-600"
            />
            <ImpactCard
              metric="3 min"
              description="Time for 90% attendees to find their seats"
              color="from-blue-500 to-blue-600"
            />
            <ImpactCard
              metric="25%"
              description="Improvement in post-event satisfaction scores"
              color="from-purple-500 to-purple-600"
            />
            <ImpactCard
              metric="₹2.5-4 Cr"
              description="Annual incremental revenue per venue"
              color="from-yellow-500 to-orange-500"
            />
            <ImpactCard
              metric="60 sec"
              description="Emergency alert delivery to 95% of attendees"
              color="from-red-500 to-red-600"
            />
            <ImpactCard
              metric="15%"
              description="Increase in concession sales through mobile ordering"
              color="from-pink-500 to-pink-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-bharat-saffron/20 to-bharat-green/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Venue?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Vortex is designed for unique venue challenges, built with compliance to modern data standards and optimized for high-performance sporting culture.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/app.html" className="btn-primary text-lg px-8 py-4">
              Try Attendee App
            </a>
            <a href="/dashboard.html" className="btn-secondary text-lg px-8 py-4">
              View Dashboard
            </a>
            <a href="/signage.html" className="btn-secondary text-lg px-8 py-4">
              See Signage
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>Vortex - Smart Venue Platform</p>
          <p className="text-sm mt-2">Built for large-scale sporting events</p>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ number, label }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-bharat-saffron">{number}</p>
      <p className="text-gray-400 mt-2">{label}</p>
    </div>
  );
}

function ProblemCard({ icon: Icon, title, description }) {
  return (
    <div className="card bg-gray-800 border border-gray-700 p-8">
      <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-red-400" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function SolutionCard({ icon: Icon, title, description, features }) {
  return (
    <div className="card bg-gray-800 border border-gray-700 p-8">
      <div className="w-14 h-14 bg-bharat-saffron/10 rounded-xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-bharat-saffron" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-bharat-saffron mt-1">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureRow({ reverse, title, description, features, image }) {
  return (
    <div className={`flex md:items-center gap-8 ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1">
        <div className="text-6xl mb-4">{image}</div>
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300">
              <span className="text-bharat-saffron">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ImpactCard({ metric, description, color }) {
  return (
    <div className={`card bg-gradient-to-br ${color} p-8 text-center`}>
      <p className="text-4xl font-bold mb-3">{metric}</p>
      <p className="text-white/80">{description}</p>
    </div>
  );
}

export default Landing;
