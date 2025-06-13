import { RevealOnScroll } from "../RevealOnScroll"

export const Projects = ()=> {
    return (
        <section id="projects" className="min-h-screen flex items-center justify-center py-20">
        <RevealOnScroll>
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-fuchsia-500 to-blue-400 bg-clip-text text-transparent text-center"> Featured Projects </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-fuchsia-500/40 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all">
                        <h3 className="text-xl font-bold mb-2"> 📨{" "} E-mail Sending Application</h3>
                        <p className="text-gray-400 mb-4">
                            Automated email dispatch system built with Java Spring Boot, managing recipients from a text file.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {["Java","SpringBoot","HTML","CSS3", "JavaScript"].map((tech,key)=>(
                                    <span key={key} className="bg-fuchsia-500/10 text-fuchsia-500 py-1 px-3 rounded-full text-sm hover:bg-fuchsia-500/20 hover:shadow-[0_2px_8px_rgba(59,130,2246,0.2)] transition">
                                        {tech}
                                    </span>
                                ))}
                            
                        </div>
                        <div className="flex justify-between items-center">
                            <a href="https://github.com/bhargava562/EmailSender" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors my-4">View Project in GitHub</a>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-fuchsia-500/40 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] transition-all">
                        <h3 className="text-xl font-bold mb-2"> 🌱{" "} Plant Care Reminder System</h3>
                        <p className="text-gray-400 mb-4">
                            Comprehensive solution for storing plant details, offering a dashboard for tracking watering and fertilizing schedules.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {["Java", "JavaFX", "PostgreSQL"].map((tech,key)=>(
                                    <span key={key} className="bg-fuchsia-500/10 text-fuchsia-500 py-1 px-3 rounded-full text-sm hover:bg-fuchsia-500/20 hover:shadow-[0_2px_8px_rgba(59,130,2246,0.2)] transition">
                                        {tech}
                                    </span>
                                ))}
                            
                        </div>
                        <div className="flex justify-between items-center">
                            <a href="https://github.com/bhargava562/plantBuddy" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors my-4">View Project in GitHub</a>
                        </div>
                    </div>

                </div>
            </div>
            </RevealOnScroll>
        </section>
    )
}
