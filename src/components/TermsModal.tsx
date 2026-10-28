import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  AlertTriangle, 
  X, 
  Lock, 
  Copyright,
  EyeOff,
  Cookie,
  Baby,
  Mail,
  FileText,
  CheckCircle2,
  Scale,
  Gavel,
  HeartHandshake,
  Ban,
  Clock,
  Code2,
  Building,
  ExternalLink
} from 'lucide-react';

export type TermsTab = 'all' | 'rules' | 'terms' | 'privacy' | 'dmca' | 'license';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSuggestForm?: () => void;
  initialTab?: TermsTab;
}

export const TermsModal: React.FC<TermsModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenSuggestForm,
  initialTab = 'all' 
}) => {
  const [activeTab, setActiveTab] = useState<TermsTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const email1 = "ishaany83@gmail.com";
  const email2 = "ishaan.yadav@franklinsabers.org";
  const effectiveDate = "October 27, 2026";
  const documentVersion = "3.2.0 (Comprehensive AGPLv3 Legal Edition)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/70 flex flex-col max-h-[94vh] overflow-hidden"
        id="terms-modal-container"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-white flex items-center gap-2 truncate">
                <span>GameLand Penguin — Legal Framework &amp; Community Rules</span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Operated by Ishaan Yadav / Penguin Tech 2 • Version {documentVersion} • {effectiveDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            id="close-terms-modal-btn"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-950/50 border-b border-slate-800 overflow-x-auto text-xs scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-all-policies"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Complete Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-community-rules"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Rules &amp; Fair Play</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-terms-of-service"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Terms of Service Agreement</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-privacy-policy"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy &amp; COPPA</span>
          </button>

          <button
            onClick={() => setActiveTab('dmca')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dmca'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-dmca"
          >
            <Copyright className="w-3.5 h-3.5 text-rose-400" />
            <span>DMCA Notice &amp; Takedowns</span>
          </button>

          <button
            onClick={() => setActiveTab('license')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'license'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="tab-license"
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>GNU AGPL v3.0 License</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 bg-slate-950/70 p-5 sm:p-8 overflow-y-auto space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed custom-scrollbar">

          {/* ======================================================== */}
          {/* SECTION: COMMUNITY RULES & FAIR PLAY GUIDELINES          */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'rules') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm sm:text-base border-b border-amber-500/20 pb-2">
                <Gavel className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="uppercase tracking-wide">Community Rules &amp; Acceptable Use Policy (AUP)</h3>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs">
                <p className="font-bold flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Notice for Students, Players &amp; Educational Users:</span>
                </p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  GameLand Penguin operates as an educational, accessible web arcade. To maintain our unblocked status on academic networks and Chromebooks, every player agrees to the six mandatory conduct rules below.
                </p>
              </div>

              <div className="space-y-3">
                {/* Rule 1 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                      <span>Rule 1.0 — Academic Responsibility &amp; Classroom Honor Code</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">Mandatory</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                    GameLand is intended for recreational free time, study halls (with teacher consent), lunch breaks, or outside of school hours. <strong>Users must never access or play games during active classroom instruction, teacher lectures, tests, or exams.</strong> Respect school faculty, follow institutional Acceptable Use Policies, and prioritize your education.
                  </p>
                </div>

                {/* Rule 2 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                      <span>Rule 2.0 — Zero Tolerance for Harassment, Cyberbullying &amp; Slurs</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">Strict Enforcement</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                    Every player deserves a safe and friendly space. The following are strictly banned: hate speech, racial or religious slurs, cyberbullying, sexual harassment, targeted harassment, doxxing (revealing real-world identities), and offensive or profane usernames. Violations will result in immediate permanent account termination.
                  </p>
                </div>

                {/* Rule 3 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                      <span>Rule 3.0 — Fair Play, Anti-Botting &amp; Score Exploit Policy</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">Integrity</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                    Players shall not use automated clickers, bot scripts, memory injection utilities, modified web proxies, or WebSocket spoofing tools to artificially alter leaderboards, fabricate game completion times, duplicate daily login streaks, or forge Fish Coins. Legitimate high scores are celebrated; cheaters will have points wiped.
                  </p>
                </div>

                {/* Rule 4 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-[10px] font-black shrink-0">4</span>
                      <span>Rule 4.0 — Account Security &amp; Personally Identifiable Information (PII)</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-rose-400">Safety First</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                    Users must never disclose their real full names, residential addresses, personal phone numbers, school student ID credentials, or social media handles in game suggestion boxes or community feedback forms. GameLand administrators will never solicit your account password.
                  </p>
                </div>

                {/* Rule 5 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-[10px] font-black shrink-0">5</span>
                      <span>Rule 5.0 — System Stability &amp; Anti-Abuse Standards</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400">Security</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                    Any intentional attempt to disrupt, degrade, overload, or compromise GameLand Penguin—including Distributed Denial of Service (DDoS), Cross-Site Scripting (XSS), SQL injection, server payload flooding, or mass bot account registration—is strictly prohibited and may be reported to institutional authorities.
                  </p>
                </div>

                {/* Rule 6 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-[10px] font-black shrink-0">6</span>
                      <span>Rule 6.0 — Administrative Authority &amp; Penalty Escalation</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-400">Governance</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                    Site operators retain absolute discretion to investigate alleged infractions. Penalties operate on an escalating tier: <em>(i) Formal Warning; (ii) Forfeiture of Virtual Coins and Streaks; (iii) Temporary Access Suspension (24–72 hours); (iv) Permanent Revocation of User Profile &amp; Network Blacklist.</em>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION: FORMAL TERMS OF SERVICE AGREEMENT               */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'terms') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-cyan-400 font-black text-sm sm:text-base border-b border-cyan-500/20 pb-2">
                <Scale className="w-5 h-5 text-cyan-400 shrink-0" />
                <h3 className="uppercase tracking-wide">Master Terms of Service Agreement</h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-4 text-xs">
                {/* 1. Binding Contract */}
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">1.0</span>
                    <span>Binding Contractual Assent &amp; Legal Capacity</span>
                  </h4>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    This Terms of Service Agreement (&quot;Agreement&quot;) constitutes a legally binding contract between you (&quot;User&quot; or &quot;Licensee&quot;) and the operators of GameLand Penguin (&quot;Penguin Tech 2&quot;, &quot;Ishaan Yadav&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By browsing, registering an account, executing game embeds, or accessing any subdomains or features, you affirm that you have read, understood, and agreed to be legally bound by this Agreement. If you are under the legal age of majority in your jurisdiction (typically 18 years of age), you represent that your parent, legal guardian, or authorized educator has reviewed and consented to these Terms on your behalf.
                  </p>
                </div>

                {/* 2. Educational Mission */}
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">2.0</span>
                    <span>Educational &amp; Non-Commercial Arcade Mission</span>
                  </h4>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    GameLand Penguin is operated as an open, accessible, non-commercial educational project designed to showcase client-side web development, containerized microservices on Google Cloud Run, and high-performance HTML5 canvas gaming. All features are offered free of charge. No monetary subscriptions, real-money transactions, or microtransaction fees exist on the platform.
                  </p>
                </div>

                {/* 3. Open Source AGPLv3 */}
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">3.0</span>
                    <span>Open-Source Licensing under GNU AGPL v3.0</span>
                  </h4>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    The core source code of the GameLand Penguin web portal framework is licensed under the <strong>GNU Affero General Public License Version 3 (AGPL-3.0)</strong>, published by the Free Software Foundation. You are free to inspect, audit, copy, modify, and redistribute the platform&apos;s source code in accordance with the AGPLv3. Per Section 13 of the AGPLv3, if you run a modified version of this software over a computer network to provide services to third parties, you must prominently offer all users access to the Corresponding Source code of your modified version.
                  </p>
                </div>

                {/* 4. Virtual Items & Economy */}
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">4.0</span>
                    <span>Virtual Economy, Fish Coins, Streaks &amp; VIP Perks</span>
                  </h4>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    &quot;Fish Coins&quot;, login streak milestones, mystery gifts, virtual avatar cosmetics, and VIP badges (Gold, Platinum, Diamond) are purely intangible virtual elements provided solely for amusement. <strong>Virtual items have zero pecuniary, monetary, or real-world cash value</strong> and do not constitute property rights. They cannot be redeemed, sold, bartered, or exchanged for fiat currency or tangible goods. We reserve the unrestricted right to recalibrate, adjust, or wipe virtual balances to preserve competitive balance or remedy software bugs.
                  </p>
                </div>

                {/* 5. Sandboxed Iframes & Upstream Content */}
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">5.0</span>
                    <span>Third-Party Embeds, Web Proxies &amp; Sandboxed Execution</span>
                  </h4>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    Arcade games and web proxy links presented on GameLand are delivered via HTML5 sandboxed iframes (e.g., Polytrack, Retro Bowl, Escape Road). GameLand Penguin does not develop, host proprietary rights in, or exercise editorial control over upstream third-party code repositories. Third-party titles remain the exclusive intellectual property of their respective creators. We make no representations or warranties regarding the security, uptime, or content accuracy of external third-party hosts.
                  </p>
                </div>

                {/* 6. Disclaimer of Warranties */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>6.0 — Comprehensive Disclaimer of Warranties (&quot;AS IS&quot;)</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed uppercase">
                    TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW AND PER SECTIONS 15 AND 16 OF THE GNU AGPL V3, GAMELAND PENGUIN, ITS DEVELOPERS, CONTRIBUTORS, AND MAINTAINERS PROVIDE THE APPLICATION, GAMES, PROXIES, AND SERVERS &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED. WE EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT ACCESS WILL BE UNINTERRUPTED, VIRUS-FREE, OR COMPATIBLE WITH EVERY INSTITUTIONAL NETWORK ENVIRONMENT.
                  </p>
                </div>

                {/* 7. Limitation of Liability */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>7.0 — Comprehensive Limitation of Liability</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed uppercase">
                    IN NO EVENT SHALL ISHAAN YADAV, PENGUIN TECH 2, FRANKLIN SABERS CONTRIBUTORS, OR SYSTEM OPERATORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING PROCUREMENT OF SUBSTITUTE GOODS; LOSS OF LOCAL STORAGE BROWSER DATA; LOSS OF SAVES; SCHOOL DISCIPLINARY ACTIONS; REVOCATION OF DISTRICT CHROMEBOOK PRIVILEGES; OR BUSINESS/ACADEMIC INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, ARISING IN ANY WAY OUT OF THE USE OF OR INABILITY TO USE THIS SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                  </p>
                </div>

                {/* 8. Indemnification */}
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">8.0</span>
                    <span>User Indemnification</span>
                  </h4>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    You agree to indemnify, defend, and hold harmless Ishaan Yadav, Penguin Tech 2, and associated maintainers from and against any third-party claims, liabilities, damages, losses, and reasonable legal fees arising out of or in any way connected with: <em>(a) your violation of these Terms; (b) your violation of school district computer use policies; or (c) your willful misconduct or unauthorized access to platform servers.</em>
                  </p>
                </div>

                {/* 9. Governing Law */}
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">9.0</span>
                    <span>Governing Law, Jurisdiction &amp; Dispute Resolution</span>
                  </h4>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    This Agreement and any disputes arising out of your interaction with GameLand Penguin shall be governed by and construed in accordance with the laws of the State of Wisconsin, United States of America, without regard to conflict of law principles. Parties agree to attempt informal, good-faith resolution of any grievance prior to initiating formal legal proceedings.
                  </p>
                </div>

                {/* 10. Severability */}
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">10.0</span>
                    <span>Severability &amp; Entire Understanding</span>
                  </h4>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    If any provision of this Agreement is held to be unlawful, void, or for any reason unenforceable by a court of competent jurisdiction, that provision shall be deemed severable and shall not affect the validity and enforceability of any remaining provisions. This document represents the entire understanding between the User and GameLand Penguin concerning the subject matter herein.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION: PRIVACY POLICY & STUDENT DATA PROTECTION        */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'privacy') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-400 font-black text-sm sm:text-base border-b border-emerald-500/20 pb-2">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="uppercase tracking-wide">Privacy Policy &amp; Children&apos;s Online Privacy (COPPA)</h3>
              </div>

              {/* Privacy Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Zero Invasive Tracking</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No behavioral advertising trackers, no device fingerprinting, and no cross-site advertising cookies.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Cookie className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">No Data Brokerage</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      User data is strictly never sold, rented, monetized, or shared with third-party data brokers.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Baby className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">COPPA &amp; FERPA Safe</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Complies with the Children&apos;s Online Privacy Protection Act. Safe for school devices and minors under 13.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>1. Minimalist Data Collection Principle</span>
                  </h4>
                  <p className="text-slate-300 pl-5 leading-relaxed">
                    GameLand collects only the bare minimum technical information required to persist your game saves and virtual profile: your chosen alphanumeric nickname/handle, an encrypted password hash (via client-side salt hashing), points balance, and avatar cosmetics. We do not require, request, or store telephone numbers, physical addresses, biometric data, or location data.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>2. Local Browser Storage Primacy</span>
                  </h4>
                  <p className="text-slate-300 pl-5 leading-relaxed">
                    Most application state—including favorite bookmarks, audio volume preferences, and unlocked local titles—is maintained strictly within your device&apos;s local browser storage (<code>localStorage</code>). This data remains on your physical machine and is never transmitted to outside analytics providers.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>3. Children&apos;s Online Privacy Protection Act (15 U.S.C. §§ 6501–6506)</span>
                  </h4>
                  <p className="text-slate-300 pl-5 leading-relaxed">
                    GameLand does not condition a child&apos;s participation in a game on disclosing more personal information than is reasonably necessary. Parents and legal guardians have the right to inspect or request the deletion of any registered pseudonym or account data associated with their child by contacting the administrators at the official email addresses below.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>4. Account Deletion &amp; Data Erasure</span>
                  </h4>
                  <p className="text-slate-300 pl-5 leading-relaxed">
                    Users can permanently delete their account records at any time. Simply submit a deletion request to <code>ishaany83@gmail.com</code> or ask an administrator in the support form. All corresponding database entries and server backups will be permanently purged within 48 business hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION: DMCA COPYRIGHT & TAKEDOWN PROCEDURES            */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'dmca') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-rose-400 font-black text-sm sm:text-base border-b border-rose-500/20 pb-2">
                <Copyright className="w-5 h-5 text-rose-400 shrink-0" />
                <h3 className="uppercase tracking-wide">DMCA Copyright Policy &amp; Notice of Takedown</h3>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  GameLand Penguin complies with Title 17, United States Code, Section 512 (the Digital Millennium Copyright Act or &quot;DMCA&quot;). It is our policy to respond with expeditious action to clear notices of alleged copyright infringement in accordance with federal law.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-rose-300 text-xs sm:text-sm">Requirements for Filing a DMCA Takedown Notice:</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>A physical or electronic signature of a person authorized to act on behalf of the owner of the copyright interest.</li>
                    <li>Clear identification of the copyrighted work claimed to have been infringed.</li>
                    <li>Identification of the material claimed to be infringing (including exact game title, slug, and direct URL on GameLand Penguin).</li>
                    <li>Information sufficient to permit us to contact you, including legal name, mailing address, telephone number, and email address.</li>
                    <li>A statement that you have a good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
                    <li>A statement, under penalty of perjury, that the information in your notification is accurate and that you are authorized to act on behalf of the owner.</li>
                  </ol>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  Please deliver all official DMCA notices to our designated copyright agent via email at: <strong><a href={`mailto:${email1}`} className="text-cyan-300 underline">{email1}</a></strong> (cc: <strong><a href={`mailto:${email2}`} className="text-cyan-300 underline">{email2}</a></strong>). Material verified to infringe valid copyrights will be disabled or removed within 24 to 48 hours.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION: GNU AGPL V3.0 SOFTWARE LICENSE NOTICE           */}
          {/* ======================================================== */}
          {(activeTab === 'all' || activeTab === 'license') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-purple-400 font-black text-sm sm:text-base border-b border-purple-500/20 pb-2">
                <Code2 className="w-5 h-5 text-purple-400 shrink-0" />
                <h3 className="uppercase tracking-wide">Open Source License Notice — GNU AGPL v3.0</h3>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-purple-500/30 text-xs">
                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200">
                  <h4 className="font-black text-xs sm:text-sm flex items-center gap-2 mb-1">
                    <span>GNU AFFERO GENERAL PUBLIC LICENSE (AGPL-3.0)</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Copyright &copy; 2026 Penguin Tech 2 / Ishaan Yadav. Everyone is permitted to copy and distribute verbatim copies of this license document. This program is free software: you can redistribute it and/or modify it under the terms of the GNU AGPL v3 as published by the Free Software Foundation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Guaranteed User Freedoms:</span>
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                      <li>Freedom to run the program for any purpose.</li>
                      <li>Freedom to inspect and study how the software works.</li>
                      <li>Freedom to redistribute exact copies to help friends.</li>
                      <li>Freedom to improve and release modified versions.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copyleft Reciprocity Obligations:</span>
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                      <li>Derivative works must be released under AGPLv3.</li>
                      <li>All copyright and license notices must be preserved.</li>
                      <li>Network deployments must offer source code access.</li>
                      <li>No proprietary DRM restrictions may be applied.</li>
                    </ul>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  To view the complete, unabridged text of the GNU AGPL v3 license, refer to the <code>LICENSE</code> file located in the root directory of this repository or visit <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">gnu.org/licenses/agpl-3.0 <ExternalLink className="w-3 h-3" /></a>.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION: OFFICIAL CONTACT, LEGAL NOTICE & SUPPORT        */}
          {/* ======================================================== */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/30 space-y-3 shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-xs sm:text-sm">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>Legal Inquiries, Administrator Contact &amp; Formal Notices</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                Official Maintainer: Ishaan Yadav
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              For any formal correspondence regarding Terms compliance, Community Rule appeals, student data deletion, or intellectual property notifications, please communicate directly via our verified email channels:
            </p>

            <div className="flex flex-wrap gap-2.5 text-xs pt-1">
              <a 
                href={`mailto:${email1}`}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-2 transition-all shadow-sm font-semibold cursor-pointer"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Primary: {email1}</span>
              </a>
              <a 
                href={`mailto:${email2}`}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-2 transition-all shadow-sm font-semibold cursor-pointer"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Academic: {email2}</span>
              </a>
            </div>

            {onOpenSuggestForm && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] text-slate-400">Have a game suggestion or general feedback?</span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSuggestForm();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
                  id="terms-open-suggest-form-btn"
                >
                  Open Player Suggestion Form
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">GameLand Penguin &bull; Version {documentVersion}</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black transition-all shadow-md active:scale-95 cursor-pointer"
            id="close-terms-footer-btn"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
