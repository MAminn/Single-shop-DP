import { useState, type FC } from "react";
import { Link } from "#root/components/Link";
import { Button } from "#root/components/ui/button";
import { ChevronRight, Mail, ExternalLink } from "lucide-react";

// Custom Icon Components to replace the unavailable TikTok icon
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-labelledby="facebook-title"
  >
    <title id="facebook-title">Facebook</title>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-labelledby="instagram-title"
  >
    <title id="instagram-title">Instagram</title>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-labelledby="tiktok-title"
  >
    <title id="tiktok-title">TikTok</title>
    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    <path d="M15 8c0 5 4 8 5 8" />
    <path d="M9 16v8" />
    <path d="M15 20V4c0-2 2-3 4-3" />
  </svg>
);

// Default social links
const defaultSocialLinks = [
  {
    id: "facebook",
    name: "Facebook",
    url: "https://www.facebook.com/people/Lebsey/61573656966243",
    icon: FacebookIcon,
  },
  {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/lebsey_mall/",
    icon: InstagramIcon,
  },
  {
    id: "tiktok",
    name: "TikTok",
    url: "https://www.tiktok.com/@lebsey_mall?is_from_webapp=1&sender_device=pc",
    icon: TikTokIcon,
  },
];

// Default navigation links
const defaultFooterLinks = [
  {
    id: "shop",
    title: "Shop",
    links: [
      { id: "men", name: "Men's Collection", url: "/featured/men" },
      { id: "women", name: "Women's Collection", url: "/featured/women" },
      { id: "all-products", name: "All Products", url: "/featured/products" },
      { id: "brands", name: "Brands", url: "/featured/brands" },
    ],
  },
  {
    id: "customer-service",
    title: "Customer Service",
    links: [
      { id: "contact", name: "Contact Us", url: "mailto:cs@lebsey.com" },
      { id: "faq", name: "FAQ", url: "#faq" },
      { id: "shipping", name: "Shipping & Returns", url: "#" },
      { id: "privacy", name: "Privacy Policy", url: "#" },
    ],
  },
];

interface FooterProps {
  brandName?: string;
  description?: string;
  socialLinks?: Array<{
    id: string;
    name: string;
    url: string;
    icon: FC;
  }>;
  footerLinks?: Array<{
    id: string;
    title: string;
    links: Array<{
      id: string;
      name: string;
      url: string;
    }>;
  }>;
  showNewsletter?: boolean;
}

export const Footer: FC<FooterProps> = ({
  brandName = "Lebsey",
  description = "Simplifying online fashion shopping by bringing together multiple brands and designers in one seamless marketplace.",
  socialLinks = defaultSocialLinks,
  footerLinks = defaultFooterLinks,
  showNewsletter = true,
}) => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the newsletter subscription
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">{brandName}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {description}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-accent-lb transition-colors duration-300"
                  aria-label={`Visit our ${social.name} page`}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          {footerLinks.map((column) => (
            <div key={column.id}>
              <h3 className="text-lg font-semibold mb-6">{column.title}</h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.url}
                      className="text-gray-400 hover:text-accent-lb transition-colors duration-300 text-sm flex items-center"
                    >
                      {link.url.startsWith("mailto:") ? (
                        <Mail className="mr-2 h-4 w-4" />
                      ) : link.url.startsWith("http") ? (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      ) : (
                        <ChevronRight className="mr-2 h-4 w-4" />
                      )}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for the latest products, trends, and
                exclusive offers.
              </p>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col space-y-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lb"
                />
                <Button
                  type="submit"
                  className="bg-accent-lb text-white hover:bg-accent-db transition-colors"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom footer */}
        <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <p className="mt-2">
            <Link
              href="#"
              className="text-gray-500 hover:text-accent-lb transition-colors mx-2"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-gray-500 hover:text-accent-lb transition-colors mx-2"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-gray-500 hover:text-accent-lb transition-colors mx-2"
            >
              Cookie Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
