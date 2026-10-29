import Image from "next/image";
import "@/style/layout/footer.css";
const year = new Date().getUTCFullYear();
export default function AppFooter() {
  return <footer className="app-footer"><div className="container"><div className="footer-content"><div className="footer-brand"><a className="brand" href="/"><Image src="/images/logo-mark.png" width={35} height={35} alt=""/><span>PokeBonk</span></a><p>Plan a run with Pokémon kits, attack and item comparisons, Lab costs and guides for Classic, Survival and co-op. Independent fan guidance for PokeBonk players.</p></div><nav aria-label="Legal"><a href="/privacy-policy">Privacy Policy</a><a href="/terms">Terms of Service</a><a href="/copyright">Copyright</a><a href="/about">About Us</a><a href="/contact">Contact Us</a></nav></div><div className="footer-bottom"><p>Copyright © {year} pokebonkdb.org. All rights reserved.</p><p>Independent fan site. Not affiliated with the PokeBonk creator, Nintendo, The Pokémon Company, Creatures or GAME FREAK.</p></div></div></footer>;
}
