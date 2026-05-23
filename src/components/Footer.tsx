import { showComingSoonToast } from "../utils/toast";

const footerSections = [
  {
    title: "About",
    links: ["About Us", "Careers", "Blog"],
  },
  {
    title: "Products",
    links: ["Spot Trading", "Margin Trading", "P2P Trading"],
  },
  {
    title: "Support",
    links: ["Help Center", "Contact Us", "API Docs"],
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy", "Risk Disclosure"],
  },
] as const;

function Footer() {
  return (
    <footer className="mt-10 border-t border-border bg-card text-foreground">
      <div className="px-4 py-8 md:px-10">
        <div className="grid grid-cols-2 gap-8 xl:grid-cols-4">
          {footerSections.map((section) => (
            <section
              key={section.title}
              aria-labelledby={`footer-${section.title}`}
            >
              <h2
                id={`footer-${section.title}`}
                className="font-semibold text-foreground"
              >
                {section.title}
              </h2>
              <ul className="mt-5 space-y-3 text-muted-foreground">
                {section.links.map((link: string) => (
                  <li key={link}>
                    <a
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        showComingSoonToast();
                      }}
                      className="transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2026 Test.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
