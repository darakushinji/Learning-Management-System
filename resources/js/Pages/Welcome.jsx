import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Welcome({ auth }) {
    useEffect(() => {
        gsap.utils.toA;

        // Image fade-in animation
        gsap.utils.toArray(".fade-in-image").forEach((image) => {
            gsap.to(image, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: image,
                    start: "top 90%",
                    toggleActions: "play none none none",
                },
            });
        });

        return () => {
            // Cleanup animations when component unmounts
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
            gsap.killTweensOf(".fade-in");
            gsap.killTweensOf(".fade-in-image");
            gsap.killTweensOf(".feature-card");
        };
    }, []);

    useEffect(() => {
        // Initial styles
        gsap.set([".title-description", ".hero-image"], {
            opacity: 0,
            y: 50,
            visibility: "hidden",
        });

        gsap.set(".hero-wrapper", { opacity: 1 });
        gsap.set(".word", { opacity: 0, y: 20, visibility: "hidden" });

        const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: 0.6 },
        });

        // Animate each word with stagger
        tl.to(".word", {
            opacity: 1,
            y: 0,
            visibility: "visible",
            stagger: 0.08,
        })
            .to(
                ".title-description",
                {
                    opacity: 1,
                    y: 0,
                    visibility: "visible",
                },
                ">0.3"
            )
            .to(
                ".hero-image",
                {
                    opacity: 1,
                    y: 0,
                    visibility: "visible",
                },
                ">0.3"
            );
    }, []);

    useEffect(() => {
        gsap.from(".feature-title", {
            opacity: 0,
            y: 50,
            stagger: 0.2,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#features",
                start: "top 80%",
            },
        });
    }, []);

    // feature-card
    useEffect(() => {
        gsap.from(".feature-card-left", {
            opacity: 0,
            x: -100,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#features",
                start: "top 80%",
            },
        });

        gsap.from(".feature-card-center", {
            opacity: 0,
            x: 50,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#features",
                start: "top 80%",
            },
        });

        gsap.from(".feature-card-right", {
            opacity: 0,
            x: 100,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#features",
                start: "top 80%",
            },
        });
    }, []);

    useEffect(() => {
        gsap.set(".feature-word", {
            opacity: 0,
            y: 30,
            visibility: "hidden",
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#features",
                start: "top 80%",
            },
        });

        tl.to(".feature-word", {
            opacity: 1,
            y: 0,
            visibility: "visible",
            stagger: 0.08,
            ease: "power3.out",
            duration: 0.6,
        });
    }, []);

    useEffect(() => {
        const steps = gsap.utils.toArray(".guide-step");

        steps.forEach((step, i) => {
            const direction = i % 2 === 0 ? -100 : 100;
            gsap.from(step, {
                x: direction,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: step,
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    useEffect(() => {
        gsap.set(
            [
                ".about-description",
                ".about-description-title",
                ".title-desc",
                ".dev-card",
            ],
            {
                opacity: 0,
                y: 50,
                visibility: "hidden",
            }
        );

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#about",
                start: "top 80%",
                toggleActions: "play none none none",
            },
            defaults: { ease: "power3.out", duration: 1 },
        });

        tl.to(".about-description", {
            opacity: 1,
            y: 0,
            visibility: "visible",
        })
            .to(
                ".about-description-title",
                {
                    opacity: 1,
                    y: 0,
                    visibility: "visible",
                },
                ">0.2"
            )
            .to(
                ".title-desc",
                {
                    opacity: 1,
                    y: 0,
                    visibility: "visible",
                },
                ">0.2"
            )
            .to(
                ".dev-card",
                {
                    opacity: 1,
                    y: 0,
                    visibility: "visible",
                    stagger: 0.3,
                },
                ">0.3"
            );
    }, []);

    const scrollToSection = (e, target) => {
        e.preventDefault();
        gsap.to(window, {
            duration: 1.5,
            scrollTo: target,
            ease: "power2.inOut",
        });
    };

    return (
        <>
            <Head title="Learning Management Repository" />
            <div className="relative bg-[#f9f9f9] text-black overflow-x-hidden font-poppins scroll-container">
                {/* Navbar */}
                <nav className="fixed top-0 left-0 w-full bg-white  z-50 py-4 px-8 flex items-center justify-around h-14">
                    <div className="w-3/6 flex items-center gap-2">
                        <img src="logo/paul.png" alt="" className="h-10 w-12" />
                    </div>
                    <div className="w-3/6 flex justify-center">
                        <ul className="flex space-x-12 text-gray-700 font-medium">
                            {["home", "features", "guide", "about"].map(
                                (section) => (
                                    <li key={section}>
                                        <a
                                            href={`#${section}`}
                                            onClick={(e) =>
                                                scrollToSection(
                                                    e,
                                                    `#${section}`
                                                )
                                            }
                                            className="hover:text-blue-500 transition"
                                        >
                                            {section.charAt(0).toUpperCase() +
                                                section.slice(1)}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                    <div className="w-3/6 flex justify-end">
                        {auth && auth.user ? (
                            <Link
                                href={
                                    auth.user.role === "admin"
                                        ? "/admin/dashboard"
                                        : auth.user.role === "instructor"
                                        ? "/instructor/dashboard"
                                        : "/student/dashboard"
                                }
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="text-gray-700 px-4 py-2 font-medium transition"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                </nav>

                <section
                    id="home"
                    className="relative section min-h-screen h-screen flex flex-col items-center justify-center
               bg-white text-center px-10 pt-20 overflow-hidden opacity-0 hero-wrapper"
                >
                    {/* Blue Gradient Accent Background */}
                    <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 rounded-full blur-3xl opacity-30 z-0 animate-pulse-slow" />
                    <div className="absolute bottom-0 -right-20 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100 to-blue-300 rounded-full blur-3xl opacity-40 z-0" />

                    {/* Main Content */}
                    <h1
                        id="hero-title"
                        className="relative z-10 text-7xl font-semibold text-gray-800 mt-4 hero-title flex flex-wrap justify-center"
                    >
                        {`Enhancing Education with Our Interactive Learning System`
                            .split(" ")
                            .map((word, index) => (
                                <span
                                    key={index}
                                    className="inline-block opacity-0 mr-2 word"
                                >
                                    {word}
                                </span>
                            ))}
                    </h1>

                    <p className="relative z-10 title-description text-xl text-gray-600 font-medium max-w-2xl mt-3 opacity-0">
                        Easily access and manage learning materials in one
                        place.
                    </p>

                    <div className="relative z-10 w-full flex items-center justify-center mt-10">
                        <img
                            src="/images/Untitled.jpg"
                            alt="Learning System"
                            className="w-[50%] max-w-[1100px] h-[auto] object-contain hero-image opacity-0"
                        />
                    </div>
                </section>

                <section
                    id="features"
                    className="relative section feature-card min-h-screen flex flex-col items-center justify-center bg-white text-center px-6 pt-20 overflow-hidden -mt-20"
                >
                    {/* Unique Gradient Accents */}
                    <div className="absolute top-10 right-[-150px] w-[350px] h-[350px] bg-gradient-to-tr from-blue-300 via-blue-400 to-blue-500 rounded-full blur-3xl opacity-30 z-0" />
                    <div className="absolute bottom-[-100px] left-[-100px] w-[250px] h-[250px] bg-gradient-to-br from-blue-100 to-blue-300 rounded-full blur-2xl opacity-40 z-0" />

                    {/* Title */}
                    <p className="feature-title relative z-10 text-xl text-blue-500 tracking-widest uppercase mb-2 feature-description">
                        Features
                    </p>
                    <h1
                        id="hero-title"
                        className="relative z-10 text-5xl font-semibold text-gray-800 mt-4 hero-title flex flex-wrap justify-center"
                    >
                        {`Discover tools that simplify, enhance, and transform your learning experience.`
                            .split(" ")
                            .map((word, index) => (
                                <span
                                    key={index}
                                    className="inline-block mr-2 feature-word"
                                >
                                    {word}
                                </span>
                            ))}
                    </h1>

                    {/* Features Grid */}
                    <div className="relative z-10 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                        {/* Feature Card 1 */}
                        <div className="feature-card-left bg-white shadow-lg rounded-2xl overflow-hidden transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl p-6 flex flex-col items-center text-center">
                            <img
                                src="/images/video.png"
                                alt="Learning System"
                                className="w-28 h-28 object-contain mb-4"
                            />
                            <h3 className="text-xl font-semibold text-gray-700">
                                Interactive Videos
                            </h3>
                            <p className="text-gray-500 mt-2">
                                Learn through engaging and easy-to-follow video
                                content tailored for you.
                            </p>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="feature-card-center bg-white shadow-lg rounded-2xl overflow-hidden transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl p-6 flex flex-col items-center text-center">
                            <img
                                src="/images/materials.png"
                                alt="Materials"
                                className="w-28 h-28 object-contain mb-4"
                            />
                            <h3 className="text-xl font-semibold text-gray-700">
                                Learning Materials
                            </h3>
                            <p className="text-gray-500 mt-2">
                                Access curated materials and resources to
                                support every topic you study.
                            </p>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="feature-card-right bg-white shadow-lg rounded-2xl overflow-hidden transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl p-6 flex flex-col items-center text-center">
                            <img
                                src="/images/assignment.png"
                                alt="Assignments"
                                className="w-28 h-28 object-contain mb-4"
                            />
                            <h3 className="text-xl font-semibold text-gray-700">
                                Smart Assignments
                            </h3>
                            <p className="text-gray-500 mt-2">
                                Submit, review, and track assignments with ease
                                and real-time feedback.
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    id="guide"
                    className="section min-h-screen h-screen flex flex-col items-center justify-center bg-white text-center px-10 pt-20"
                >
                    <p className="text-xl text-blue-400 tracking-widest">
                        GUIDE
                    </p>
                    <div className="relative h-[80vh] w-3/4 flex flex-col justify-center items-center">
                        {/* Vertical line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-400"></div>
                        {/* Steps */}
                        <div className="w-full flex flex-col gap-10">
                            <div className="flex justify-between items-center w-full">
                                <div className="w-1/2 text-right pr-10 guide-step">
                                    <h3 className="text-lg font-bold guide-step-1">
                                        Register & Log In
                                    </h3>
                                    <p className="text-gray-600 guide-step-desc-1">
                                        Create an account and access your
                                        dashboard
                                    </p>
                                </div>
                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                <div className="w-1/2"></div>
                            </div>

                            <div className="flex justify-between items-center w-full">
                                <div className="w-1/2"></div>
                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                <div className="w-1/2 text-left pl-10 guide-step">
                                    <h3 className="text-lg font-bold guide-step-2">
                                        Wait for Instructor
                                    </h3>
                                    <p className="text-gray-600 guide-step-desc-2">
                                        Your instructor will add you to class.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center w-full">
                                <div className="w-1/2 text-right pr-10 guide-step">
                                    <h3 className="text-lg font-bold guide-step-3">
                                        Explore Class Dashboard
                                    </h3>
                                    <p className="text-gray-600 guide-step-desc-3">
                                        Find discussions, materials, and
                                        assignments.
                                    </p>
                                </div>
                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                <div className="w-1/2"></div>
                            </div>

                            <div className="flex justify-between items-center w-full">
                                <div className="w-1/2"></div>
                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                <div className="w-1/2 text-left pl-10 guide-step">
                                    <h3 className="text-lg font-bold guide-step-4">
                                        Submit Assignments
                                    </h3>
                                    <p className="text-gray-600 guide-step-desc-4">
                                        View and complete tasks before the
                                        deadline.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center w-full">
                                <div className="w-1/2 text-right pr-10 guide-step">
                                    <h3 className="text-lg font-bold guide-step-5">
                                        Attend Live Classes
                                    </h3>
                                    <p className="text-gray-600 guide-step-desc-5">
                                        Join live sessions and interact in
                                        real-time.
                                    </p>
                                </div>
                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                <div className="w-1/2"></div>
                            </div>

                            <div className="flex justify-between items-center w-full">
                                <div className="w-1/2"></div>
                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                <div className="w-1/2 text-left pl-10 guide-step">
                                    <h3 className="text-lg font-bold guide-step-6">
                                        Check Grades and & Updates
                                    </h3>
                                    <p className="text-gray-600 guide-step-desc-6">
                                        Stay updated with the feedback and
                                        announcement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section
                    id="about"
                    className="section min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-6 py-16"
                >
                    {/* Title & Description */}
                    <div className="text-center mb-12">
                        <p className="text-xl text-blue-500 tracking-widest font-medium uppercase about-description">
                            Our Team
                        </p>
                        <h2 className="text-5xl font-bold text-gray-800 mt-2 about-description-title">
                            Meet the Creators
                        </h2>
                        <div className="w-16 h-1 bg-blue-500 mx-auto mt-3"></div>
                        <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-lg title-desc">
                            We are students from Pangasinan State University,
                            passionate about bringing innovative solutions to
                            life.
                        </p>
                    </div>

                    {/* Grid Layout for Developers */}
                    <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            {
                                name: "John Paul Sales",
                                role: "Full Stack Developer",
                                img: "us/paul.jpg",
                            },
                            {
                                name: "Reejay Figueres",
                                role: "Backend Developer",
                                img: "us/reejay.jpg",
                            },
                            {
                                name: "Angelvic Claudio",
                                role: "UI/UX Designer",
                                img: "us/angelvic.jpg",
                            },
                            {
                                name: "Margaret Rivera",
                                role: "Project Manager",
                                img: "us/marga.jpg",
                            },
                        ].map((dev, index) => (
                            <div
                                key={index}
                                className={`relative group dev-card transform transition duration-500 hover:-translate-y-3 ${
                                    index % 2 !== 0 ? "md:-translate-y-6" : ""
                                }`}
                            >
                                <div className="relative bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                                    <div className="w-full h-[280px] relative overflow-hidden">
                                        <img
                                            src={dev.img}
                                            alt={dev.name}
                                            className="w-full h-full object-cover rounded-t-2xl"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                            <p className="text-white font-semibold text-lg">
                                                👋 Hey there!
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-5 text-center">
                                        <p className="text-xl font-semibold text-gray-800">
                                            {dev.name}
                                        </p>
                                        <p className="text-sm text-blue-500 font-medium">
                                            {dev.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="w-full h-[350px] flex items-center justify-evenly bg-white shadow-md gap-11">
                    <div className="w-2/5 h-full flex flex-col justify-center px-10 gap-4">
                        <div className="flex flex-row items-center w-full">
                            <h1 className="text-2xl font-semibold">E D U</h1>
                            <img
                                src="logo/paul.png"
                                alt=""
                                className="h-12 w-14"
                            />
                        </div>
                        <p className="tracking-wide">
                            A collaborative learning platform designed for
                            seamless communication between instructors and
                            students. It provides tools for managing classes,
                            sharing, sharing materials, assigning coursework,
                            and conducting video-calls--all in one place. With
                            an intuitive interface, it enhances online learning
                            and engagement.
                        </p>
                    </div>
                    <div className="w-1/3 flex flex-col items-start justify-between gap-3">
                        <h1 className="text-xl font-semibold">Useful Link</h1>
                        <ul className="flex flex-col gap-3 text-gray-700 font-medium">
                            {["home", "features", "guide", "about"].map(
                                (section) => (
                                    <li key={section}>
                                        <a
                                            href={`#${section}`}
                                            onClick={(e) =>
                                                scrollToSection(
                                                    e,
                                                    `#${section}`
                                                )
                                            }
                                            className="hover:text-blue-500 transition"
                                        >
                                            {section.charAt(0).toUpperCase() +
                                                section.slice(1)}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                    <div className=" w-2/5 flex flex-col items-start justify-between gap-3 mb-16">
                        {" "}
                        <h1 className="text-xl font-semibold">Follow us</h1>
                        <ul className="flex flex-col gap-3  text-gray-700 font-medium">
                            <li>Facebook</li>
                            <li>Instragram</li>
                        </ul>
                    </div>
                </section>
            </div>
        </>
    );
}
