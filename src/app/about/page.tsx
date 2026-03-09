'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Target, Users, MapPin, Award, TrendingUp, Zap, Package, Rocket, Mail, ArrowRight, LayoutDashboard, Star, Calendar } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { useUserRole } from '@/lib/hooks/use-user-role'

export default function AboutPage() {
  const { profile, isCoach, isAdmin } = useUserRole()
  const dashboardHref = (isCoach || isAdmin) ? '/admin' : '/locker'

  return (
    <div className="flex min-h-screen">
      <InfoSidebar hideMobileNav />
      <main className="flex-1 pb-24 lg:pb-20">
      {/* Hero Image Banner */}
      <div className="relative px-6 py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/coach rachel psp.webp"
          alt="Coach Rachel at PSP"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/90" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full">
            <span className="text-orange font-semibold">Based in Chesapeake, Serving Hampton Roads</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            About <span className="text-gradient-orange">PSP.Pro</span>
          </h1>
          <p className="text-xl text-white mb-6 max-w-2xl mx-auto leading-relaxed">
            Elite softball, basketball, and soccer training based in Chesapeake, VA — serving the Hampton Roads region with focused skill development and mechanics improvement.
          </p>
          <p className="text-2xl font-bold text-white">
            Progression Over Perfection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href={profile ? dashboardHref : '/get-started'} className="btn-primary">
              {profile ? 'Go to Dashboard' : 'Join the Team'}
            </Link>
            <Link href={profile ? '/booking' : '/pricing'} className="btn-ghost border-white/30 text-white hover:border-white/50">
              View Programs
            </Link>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 md:p-8">
      {/* Mission Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-white leading-relaxed mb-6">
          At PSP.Pro, we believe in <span className="text-orange font-bold">Progression Over Perfection</span>. Our mission is to develop elite softball, basketball, and soccer athletes through science-based training methodologies that focus on continuous improvement.
        </p>

        <p className="text-slate-500 dark:text-white/80 leading-relaxed">
          We specialize in velocity development, mechanics refinement, and overall athletic performance enhancement for athletes of all levels.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 hover:border-orange/40 transition-all">
            <h3 className="text-xl font-bold mb-3 text-orange">Softball Training</h3>
            <p className="text-slate-600 dark:text-white leading-relaxed">
              Specialized pitching, hitting, and fielding programs designed to maximize speed, power, and consistency.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 hover:border-cyan/40 transition-all">
            <h3 className="text-xl font-bold mb-3 text-cyan">Basketball & Soccer</h3>
            <p className="text-slate-600 dark:text-white leading-relaxed">
              Comprehensive athletic training focusing on speed, agility, strength, and game performance.
            </p>
          </div>
        </div>

        {/* Inline image */}
        <div className="mt-6 relative h-64 md:h-80 rounded-xl overflow-hidden">
          <Image
            src="/images/over the shoulder psp pitching.webp"
            alt="PSP coaching session"
            fill
            quality={80}
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        </div>
      </div>

      {/* Meet the Coaches */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Meet the Coaches</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-white leading-relaxed mb-8">
          Since 2017, Loren &amp; Rachel Bagley have owned and operated Proper Sports Performance — bringing elite-level coaching to athletes of all ages across Chesapeake and Hampton Roads.
        </p>

        {/* Loren */}
        <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src="/images/Praticing Soccer Drills.webp"
                alt="Coach Loren Bagley"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange">Loren Bagley</h3>
              <p className="text-sm text-slate-500 dark:text-white/60 flex items-center gap-1.5 mt-0.5">
                <Star className="w-3.5 h-3.5 text-orange" />
                Athletic Performance &amp; Skills Development Specialist
              </p>
            </div>
          </div>

          <p className="text-slate-600 dark:text-white/80 leading-relaxed mb-4">
            Since 2018, Loren has been developing athletes through individualized and group performance training with a specialized focus on core strength, speed, power, and game-specific skill execution in basketball and soccer.
          </p>

          <p className="text-slate-600 dark:text-white/80 leading-relaxed mb-4">
            His approach goes beyond drills — he builds complete athletes. With a deep understanding of performance mechanics and sport IQ, he emphasizes disciplined execution, progressive overload, and skill refinement under game-realistic conditions.
          </p>

          <p className="text-lg font-bold text-orange mb-4">
            Discipline. Determination. Dedication.
          </p>

          <p className="text-slate-600 dark:text-white/80 leading-relaxed mb-4">
            A former multi-sport varsity athlete at Hickory High School, Loren competed on nationally ranked soccer teams (Top 12 in the U.S. during 2003-04 and Top 2 in 2004-05). He continued his soccer career at Virginia Wesleyan College before playing for the Hampton Roads Piranhas PDL team. In basketball, he earned three varsity letters and tied the school record for most three-pointers in a single game.
          </p>

          <p className="text-slate-600 dark:text-white/80 leading-relaxed">
            Today, Loren channels his competitive experience into developing athletes who move faster, think sharper, and perform stronger under pressure. He thrives on seeing measurable growth, breakthrough moments, and the joy athletes experience when preparation meets opportunity.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-orange/10 border border-orange/20 text-orange text-xs font-semibold rounded-full">Basketball</span>
            <span className="px-3 py-1 bg-orange/10 border border-orange/20 text-orange text-xs font-semibold rounded-full">Soccer</span>
            <span className="px-3 py-1 bg-orange/10 border border-orange/20 text-orange text-xs font-semibold rounded-full">Speed &amp; Agility</span>
            <span className="px-3 py-1 bg-orange/10 border border-orange/20 text-orange text-xs font-semibold rounded-full">Strength &amp; Power</span>
          </div>
        </div>

        {/* Rachel */}
        <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src="/images/coach rachel psp.webp"
                alt="Coach Rachel Bagley"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-cyan">Rachel Bagley</h3>
              <p className="text-sm text-slate-500 dark:text-white/60 flex items-center gap-1.5 mt-0.5">
                <Star className="w-3.5 h-3.5 text-cyan" />
                Softball Pitching Specialist &amp; Hall of Fame Inductee
              </p>
            </div>
          </div>

          <p className="text-slate-600 dark:text-white/80 leading-relaxed mb-4">
            Rachel is a former collegiate softball pitcher with an impressive career at Patrick Henry Community College, where she was inducted into the Hall of Fame and helped lead her team to a Region X Championship. She continued her success at UVA Wise, competing at the Division II level and winning a conference championship.
          </p>

          <p className="text-slate-600 dark:text-white/80 leading-relaxed mb-4">
            Throughout her career, Rachel earned numerous accolades including Pitcher of the Year and First &amp; Second Team All-Conference honors every year she competed.
          </p>

          <p className="text-slate-600 dark:text-white/80 leading-relaxed mb-4">
            Rachel has been coaching pitchers for over 12 years. Passionate about using her God-given abilities, she is dedicated to impacting the next generation, building confidence in young athletes, and working with players of all ages.
          </p>

          <p className="text-slate-500 dark:text-white/60 text-sm leading-relaxed">
            Beyond coaching, Rachel and Loren stay busy raising their two boys, ages 4 and 1.
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-cyan/10 border border-cyan/20 text-cyan text-xs font-semibold rounded-full">Softball Pitching</span>
            <span className="px-3 py-1 bg-cyan/10 border border-cyan/20 text-cyan text-xs font-semibold rounded-full">Mechanics Analysis</span>
            <span className="px-3 py-1 bg-cyan/10 border border-cyan/20 text-cyan text-xs font-semibold rounded-full">Velocity Development</span>
            <span className="px-3 py-1 bg-cyan/10 border border-cyan/20 text-cyan text-xs font-semibold rounded-full">Hall of Fame</span>
          </div>
        </div>

        {/* CTA to coaches page */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/booking" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-amber-500 text-white font-bold rounded-xl hover:from-orange/90 hover:to-amber-500/90 transition-all shadow-lg shadow-orange/20 text-sm">
            <Calendar className="w-4 h-4" />
            Book a Session
          </Link>
          <Link href="/coaches" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-700 dark:text-white/70 rounded-xl hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all text-sm font-semibold">
            View All Coaches
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Approach Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Approach</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-white leading-relaxed mb-6">
          We combine cutting-edge technology with proven training methodologies to deliver measurable results.
        </p>

        <h3 className="text-xl font-bold mb-4 text-white">Training Specialties</h3>
        <ul className="space-y-3 text-slate-600 dark:text-white">
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Velocity Development</strong> – Increase throwing velocity through biomechanics and strength training</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Mechanics Analysis</strong> – Video breakdown and corrective exercises for optimal movement patterns</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Power Development</strong> – Build explosive strength for hitting and throwing</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Speed & Agility</strong> – Improve athletic movement and on-field performance</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Recovery & Mobility</strong> – Prevent injury and optimize recovery for peak performance</span>
          </li>
        </ul>
      </div>

      {/* Location Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Location</h2>
        </div>

        <h3 className="text-xl font-bold mb-3 text-white">Based in Chesapeake, Serving Hampton Roads</h3>

        <p className="text-lg text-slate-600 dark:text-white leading-relaxed mb-4">
          Our home base is Chesapeake, VA — and we serve athletes throughout the 757: Virginia Beach, Norfolk, Portsmouth, Suffolk, and the surrounding Hampton Roads area.
        </p>

        <p className="text-slate-500 dark:text-white/80 mb-6">
          Chesapeake · Virginia Beach · Norfolk · Portsmouth · Suffolk · Hampton Roads
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 hover:border-orange/40 transition-all">
            <h3 className="text-lg font-bold mb-3 text-orange">Data-Driven Training</h3>
            <p className="text-slate-600 dark:text-white leading-relaxed">
              Video analysis, real velocity tracking, and performance charts to measure your progress every session.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 hover:border-cyan/40 transition-all">
            <h3 className="text-lg font-bold mb-3 text-cyan">Expert Coaching</h3>
            <p className="text-slate-600 dark:text-white leading-relaxed">
              Experienced coaches dedicated to helping athletes reach their full potential.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Values</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-white mb-6">
          Our core values guide everything we do at PSP.Pro
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 text-center">
            <Award className="w-12 h-12 text-orange mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Excellence</h3>
            <p className="text-slate-500 dark:text-white/80">Striving for the highest standards in every training session</p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 text-center">
            <TrendingUp className="w-12 h-12 text-cyan mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Progress</h3>
            <p className="text-slate-500 dark:text-white/80">Celebrating continuous improvement over perfection</p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 text-center">
            <Users className="w-12 h-12 text-orange mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Community</h3>
            <p className="text-slate-500 dark:text-white/80">Building a supportive environment for athlete growth</p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 text-center">
            <Target className="w-12 h-12 text-cyan mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Results</h3>
            <p className="text-slate-500 dark:text-white/80">Delivering measurable outcomes through proven methods</p>
          </div>
        </div>
      </div>

      {/* Continue Exploring */}
      <div className="command-panel">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Continue Exploring</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/pricing" className="glass-card-hover p-6 text-center group">
            <Package className="w-8 h-8 text-orange mb-3 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-orange transition-colors">View Pricing</h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">Training programs & packages</p>
            <div className="inline-flex items-center gap-1 text-orange text-sm font-semibold mt-3">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href={profile ? dashboardHref : '/get-started'} className="glass-card-hover p-6 text-center group">
            {profile ? <LayoutDashboard className="w-8 h-8 text-cyan mb-3 mx-auto" /> : <Rocket className="w-8 h-8 text-cyan mb-3 mx-auto" />}
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan transition-colors">
              {profile ? 'Your Dashboard' : 'Join the Team'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">
              {profile ? 'Back to your training hub' : 'Join our training family'}
            </p>
            <div className="inline-flex items-center gap-1 text-cyan text-sm font-semibold mt-3">
              <span>{profile ? 'Go to Dashboard' : 'Join Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/contact" className="glass-card-hover p-6 text-center group">
            <Mail className="w-8 h-8 text-orange mb-3 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-orange transition-colors">Contact Us</h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">Questions? We&apos;re here to help</p>
            <div className="inline-flex items-center gap-1 text-orange text-sm font-semibold mt-3">
              <span>Reach Out</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
      </div>
      </main>

    </div>
  )
}
