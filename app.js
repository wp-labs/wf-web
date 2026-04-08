document.addEventListener("DOMContentLoaded", function () {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mainNav = document.getElementById("mainNav");
    const navLinks = document.querySelectorAll(".nav-link");
    const copyBtn = document.getElementById("copyBtn");
    const installCommand = document.getElementById("installCommand");

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener("click", function () {
            this.classList.toggle("active");
            mainNav.classList.toggle("active");
            document.body.style.overflow = mainNav.classList.contains("active")
                ? "hidden"
                : "";
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", function () {
                mobileMenuBtn.classList.remove("active");
                mainNav.classList.remove("active");
                document.body.style.overflow = "";
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href !== "#") {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    const sections = document.querySelectorAll("section[id]");

    function updateActiveNav() {
        const scrollPos = window.scrollY + 120;

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute("id");

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }

    window.addEventListener("scroll", updateActiveNav);
    updateActiveNav();

    if (copyBtn && installCommand) {
        copyBtn.addEventListener("click", async function () {
            const text =
                "cargo run --manifest-path ../warp-fusion/Cargo.toml --bin wfusion -- run --config ../wp-reactor/examples/wfusion.toml";

            try {
                await navigator.clipboard.writeText(text);
                copyBtn.classList.add("copied");
                setTimeout(() => copyBtn.classList.remove("copied"), 1200);
            } catch (_error) {
                const range = document.createRange();
                range.selectNodeContents(installCommand);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
        });
    }

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate-fade-in");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document
        .querySelectorAll(".card, .metric-card, .connector-card, .code-block, .comparison-card")
        .forEach((element) => observer.observe(element));

    const header = document.querySelector(".header");
    window.addEventListener("scroll", function () {
        if (!header) {
            return;
        }

        if (window.scrollY > 50) {
            header.style.background = "rgba(13, 17, 23, 0.98)";
            header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.3)";
        } else {
            header.style.background = "rgba(13, 17, 23, 0.95)";
            header.style.boxShadow = "none";
        }
    });
});
