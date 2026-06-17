import React from "react";

export default function ConceptsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">히어로 이미지 대체 컨셉 3가지 (CSS/React 기반)</h1>
          <p className="text-slate-500">
            이미지 생성 한도로 인해, 순수 코드(Tailwind CSS)로 구현한 3가지 컨셉입니다. 
            마음에 드는 디자인을 선택해주시면 메인 페이지에 정식으로 적용해 드립니다.
          </p>
        </div>

        {/* Concept 1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">컨셉 1: 추상적 AI 노드 시각화 (Abstract AI Nodes)</h2>
          <p className="text-sm text-slate-500">Vercel 스타일의 기하학적 선과 점이 연결되는 테크니컬한 느낌을 줍니다.</p>
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-slate-200 bg-slate-900 flex items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            
            {/* Central Node */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
              <div className="w-12 h-12 rounded-full bg-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.8)]"></div>
            </div>

            {/* Connecting Lines and smaller nodes */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="rgba(99,102,241,0.4)" strokeWidth="2" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite_reverse]" style={{ transformOrigin: "50% 50%" }} />
              <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="rgba(99,102,241,0.4)" strokeWidth="2" strokeDasharray="4 4" className="animate-[spin_15s_linear_infinite]" style={{ transformOrigin: "50% 50%" }} />
              <line x1="50%" y1="50%" x2="70%" y2="80%" stroke="rgba(99,102,241,0.4)" strokeWidth="2" />
              <line x1="50%" y1="50%" x2="30%" y2="70%" stroke="rgba(99,102,241,0.4)" strokeWidth="2" />
            </svg>
            
            <div className="absolute top-[30%] left-[20%] w-4 h-4 rounded-full bg-slate-300"></div>
            <div className="absolute top-[20%] right-[20%] w-6 h-6 rounded-full bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]"></div>
            <div className="absolute bottom-[20%] right-[30%] w-3 h-3 rounded-full bg-slate-400"></div>
            <div className="absolute bottom-[30%] left-[30%] w-5 h-5 rounded-full bg-slate-200"></div>
          </div>
        </section>

        {/* Concept 2 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">컨셉 2: 다크 모드 캘린더 대시보드 목업 (UI Dashboard)</h2>
          <p className="text-sm text-slate-500">실제 서비스를 연상시키는 다크/글래스모피즘 기반의 세련된 일정 관리 UI입니다.</p>
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-slate-200 bg-slate-50 flex items-center justify-center p-8">
            <div className="w-full h-full max-w-2xl bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-700">
              {/* Fake Window Header */}
              <div className="h-10 bg-slate-800/80 border-b border-slate-700 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              {/* Fake UI Body */}
              <div className="flex-1 flex p-4 gap-4">
                {/* Sidebar */}
                <div className="w-1/4 h-full bg-slate-800/50 rounded-lg flex flex-col gap-3 p-3">
                  <div className="h-8 bg-indigo-500/20 text-indigo-400 rounded flex items-center px-2 text-xs font-semibold">Meeting AI</div>
                  <div className="h-6 bg-slate-700/50 rounded w-3/4"></div>
                  <div className="h-6 bg-slate-700/50 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-700/50 rounded w-2/3"></div>
                </div>
                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Top Bar */}
                  <div className="h-12 bg-slate-800/50 rounded-lg flex items-center justify-between px-4">
                    <div className="h-4 w-32 bg-slate-700 rounded"></div>
                    <div className="h-6 w-20 bg-indigo-500 rounded-md"></div>
                  </div>
                  {/* Calendar Grid Fake */}
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-3 flex flex-col gap-2">
                      <div className="h-4 w-12 bg-slate-600 rounded"></div>
                      <div className="h-10 bg-indigo-500/80 rounded mt-auto flex items-center px-2 text-[10px] text-white">Client Sync</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-3"></div>
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-3 flex flex-col gap-2">
                      <div className="h-4 w-12 bg-slate-600 rounded"></div>
                      <div className="h-10 bg-slate-600 rounded flex items-center px-2 text-[10px] text-slate-300">Team Wrap-up</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Concept 3 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">컨셉 3: 미니멀 3D &apos;Core&apos; (Isometric Core)</h2>
          <p className="text-sm text-slate-500">안정적이고 강력한 AI 엔진(Core)을 은유적으로 표현한 3D 입체 디자인입니다.</p>
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-slate-200 bg-slate-50 flex items-center justify-center">
            {/* Isometric CSS Cube representing CoreDXI */}
            <div className="relative w-48 h-48 animate-bounce" style={{ transformStyle: "preserve-3d", transform: "rotateX(-30deg) rotateY(45deg)" }}>
              {/* Top Face */}
              <div className="absolute w-full h-full bg-indigo-400 border border-indigo-300" style={{ transform: "rotateX(90deg) translateZ(96px)" }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                   <div className="w-1/2 h-1/2 bg-white blur-md"></div>
                </div>
              </div>
              {/* Front Face */}
              <div className="absolute w-full h-full bg-indigo-600 border border-indigo-500" style={{ transform: "translateZ(96px)" }}>
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                   <div className="w-3/4 h-2 bg-indigo-400/50 rounded"></div>
                   <div className="w-1/2 h-2 bg-indigo-400/50 rounded"></div>
                </div>
              </div>
              {/* Right Face */}
              <div className="absolute w-full h-full bg-indigo-800 border border-indigo-700" style={{ transform: "rotateY(90deg) translateZ(96px)" }}></div>
            </div>
            
            {/* Floating blocks */}
            <div className="absolute w-12 h-12 bg-slate-300 rounded shadow-lg top-1/4 left-1/4" style={{ transform: "rotateX(-30deg) rotateY(45deg)" }}></div>
            <div className="absolute w-16 h-16 bg-slate-200 rounded shadow-lg bottom-1/4 right-1/4" style={{ transform: "rotateX(-30deg) rotateY(45deg)" }}></div>
          </div>
        </section>

      </div>
    </div>
  );
}
