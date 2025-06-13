import { RevealOnScroll } from "../RevealOnScroll"

export const Home = ()=> {
    return (
    <section id="home" className="min-h-screen flex items-center justify-center relative">
        <RevealOnScroll>
        <div className="relative text-center z-10 px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-fuchsia-600 to-cyan-400 bg-clip-text text-transparent leading-right">Hi, I'm Bhargava A</h1>
            <p className="text-gray-100 text-lg mb-8 max-w-lg mx-auto">
                I'm a Fullstack Developer specializing in React for dynamic frontends and Java with Spring Boot for robust backends.
                I'm passionate about crafting impactful applications, solving complex problems, and continuously expanding my technical expertise.
            </p>
            <div className="flex justify-center space-x-4">
                <a href="#projects" className="bg-cyan-500 text-white py-3 px-6 rounded font-medium transition relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">View Projects</a>
                <a href="#contact" className="border border-fuchsia-500/50 text-fuchsia-500 py-3 px-6 rounded font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:bg-fuchsia-500/10">Contact Me!</a>
            </div>
        </div>
        </RevealOnScroll>
    </section>
    )
}
