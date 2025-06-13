import { RevealOnScroll } from "../RevealOnScroll"

export const About = ()=>{
    const frontEndSkills = ["React","HTML5","CSS3","JavaScript","TailwindCSS"]
    const backEndSkills = ["Java","Python","Spring","SpringBoot","Hibernate"]
    const dataBaseSkills = ["MySQL","PostgreSQL","MongoDB","MSSQLServer"]
    const devopsSkills = ["Git","GitHub","Google Cloud Platform"]
    const aiMlSkills = ["Python","AI Agents","Google ADK (Agent Development Kit)", "Scikit-learn", "Pandas", "NumPy", "Machine Learning" ];
    const otherTools = ["VS Code","IntelliJ IDEA", "JUnit", "Postman", "Agile", "Scrum"]
    return (
        <section id="about" className="min-h-screen flex items-center justify-center py-20">
        <RevealOnScroll>
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-fuchsia-500 to-blue-400 bg-clip-text text-transparent text-center">About Me</h2>
                <div className="max-w-6xl rounded-xl p-8 border-white/10 border hover:-translate-y-1 transition-all">
                    <p className="text-gray-300 mb-6">
                        As a dedicated Fullstack Developer, I thrive on bringing ideas to life through robust and scalable applications.
                        My expertise spans dynamic frontends with React and powerful backends with Java and Spring Boot.
                        I'm driven by a passion for solving complex problems and continuously expanding my technical toolkit to deliver impactful solutions.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                            <h3 className="text-xl font-bold mb-4">FrontEnd Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {frontEndSkills.map((tech,key)=>(
                                    <span key={key} className="bg-fuchsia-500/10 text-fuchsia-500 py-1 px-3 rounded-full text-sm hover:bg-fuchsia-500/20 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                            <h3 className="text-xl font-bold mb-4">BackEnd Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {backEndSkills.map((tech,key)=>(
                                    <span key={key} className="bg-fuchsia-500/10 text-fuchsia-500 py-1 px-3 rounded-full text-sm hover:bg-fuchsia-500/20 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                            <h3 className="text-xl font-bold mb-4">Databases</h3>
                            <div className="flex flex-wrap gap-2">
                                {dataBaseSkills.map((tech,key)=>(
                                    <span key={key} className="bg-fuchsia-500/10 text-fuchsia-500 py-1 px-3 rounded-full text-sm hover:bg-fuchsia-500/20 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                            <h3 className="text-xl font-bold mb-4">DevOps & Cloud</h3>
                            <div className="flex flex-wrap gap-2">
                                {devopsSkills.map((tech,key)=>(
                                    <span key={key} className="bg-fuchsia-500/10 text-fuchsia-500 py-1 px-3 rounded-full text-sm hover:bg-fuchsia-500/20 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                            <h3 className="text-xl font-bold mb-4">AI/Machine Learning</h3>
                            <div className="flex flex-wrap gap-2">
                                {aiMlSkills.map((tech,key)=>(
                                    <span key={key} className="bg-fuchsia-500/10 text-fuchsia-500 py-1 px-3 rounded-full text-sm hover:bg-fuchsia-500/20 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl p-6 hover:-translate-y-1 transition-all">
                            <h3 className="text-xl font-bold mb-4">Tools & Other</h3>
                            <div className="flex flex-wrap gap-2">
                                {otherTools.map((tech,key)=>(
                                    <span key={key} className="bg-fuchsia-500/10 text-fuchsia-500 py-1 px-3 rounded-full text-sm hover:bg-fuchsia-500/20 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-6 rounded-xl border-white/10 border hover:border-fuchsia-500/40 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] hover:-translate-y-1 transition-all">
                        <h3 className="text-xl font-bold mb-4">🏫 Education</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-4">
                            <li>
                                <strong> B.Tech. Computer Science and Business Systems</strong> - RMK Engineering College (2024-2028)  
                            <br />
                                <b>Relevant Coursework:</b> DataStructures and Algorithms, Web Development, Artificial Intelligence
                            </li>
                            <li>
                                <strong> Higher Secondary Education</strong> - Jaya Matriculation Hr Sec School (2023-2024)
                                <br />
                                <b>Stream:</b> Computer Science and Mathematics
                                <br />
                                <b>Grade:</b> 90.5%
                            </li>
                        </ul>
                        
                    </div>
                    <div className="p-6 rounded-xl border-white/10 hover:border-fuchsia-500/40 hover:shadow-[0_2px_8px_rgba(59,130,246,0.1)] border hover:-translate-y-1 transition-all">
                        <h3 className="text-xl font-bold mb-4">💼 Work Experience</h3>
                        <div className="space-y-4 text-gray-300">
                            <div>
                                <h4><strong>React JS Developer intern at TEN: Brain Research</strong> (03.jun.2024 - Present)</h4>
                                <p>Developed a dynamic and responsive personal portfolio website using React.js, applying core principles and building interactive user interfaces to solidify my frontend skills.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </RevealOnScroll>
        </section>
    )
}
