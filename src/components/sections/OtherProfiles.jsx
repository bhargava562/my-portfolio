import { RevealOnScroll } from "../RevealOnScroll"

export const OtherProfiles = ()=> {
    return (
        <section id="otherprofile" className="flex items-center justify-center py-20">
        <RevealOnScroll>
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-fuchsia-500 to-blue-400 bg-clip-text text-transparent text-center"> Follow Me On! </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <a href="https://linkedin.com/in/bhargava-a-a1426b325/" target="_blank" className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all"><img src="/LinkedIn_logo.png"/>LinkedIn</a>
                    <a href="https://github.com/bhargava562" target="_blank" className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all"><img src="/Github_logo.png"/>GitHub</a>
                    <a href="https://g.dev/bhargava_A" target="_blank" className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all"><img src="/GDG_Logo.png"/>Google Developer</a>
                    <a href="https://codolio.com/profile/bhargavA45" target="_blank" className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all"><img src="/codolio.png"/>Codolio</a>
                    <a href="https://devpost.com/bhargava-anandakumar" target="_blank" className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all"><img src="/devpost.png"/>Devpost</a>
                </div>
            </div>
        </RevealOnScroll>
        </section>
    )
}
