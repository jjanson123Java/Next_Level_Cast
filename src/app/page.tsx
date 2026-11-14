import Image from "next/image";
import Link from "next/link";
import { WelcomeAudio } from "@/components/welcome-audio";
import { getSession } from "@/features/auth/session";
import { getCatalog } from "@/features/media/catalog";

type LandingAction = { href: string; label: string };

export function getLandingAction(session: Awaited<ReturnType<typeof getSession>>, catalog: Awaited<ReturnType<typeof getCatalog>>): LandingAction {
  if (session?.role === "admin") return { href: "/admin", label: "Open Admin Dashboard" };
  const published = catalog.flatMap((category) => category.episodes).filter((episode) => episode.status === "published").sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  if (session?.role === "subscriber" && session.status === "active") {
    const latest = published.find((episode) => episode.hasFullMedia);
    return latest ? { href: `/shows/${latest.slug}`, label: "Play Latest Episode" } : { href: "/shows", label: "Browse All Shows" };
  }
  const start = published.find((episode) => episode.isStartHere);
  return start ? { href: `/shows/${start.slug}`, label: "Start Here — Watch Free" } : { href: "/shows", label: "Browse Free Episodes" };
}
export default async function HomePage() {
  const [session, catalog] = await Promise.all([getSession(), getCatalog()]);
  const primaryAction = getLandingAction(session, catalog);
  const featured = catalog.filter((category) => category.featuredPosition !== null).sort((a, b) => (a.featuredPosition ?? 99) - (b.featuredPosition ?? 99)).slice(0, 2);
  const isSubscriber = session?.role === "subscriber" && session.status === "active";

  return <main className="nlcHome">
    <WelcomeAudio enabled={isSubscriber} />
    <section className="nlcHero">
      <div className="nlcHeroCopy">
        <span className="kicker">Welcome to the lobby</span>
        <h1>Next level.<br /><span>Level completed.</span></h1>
        <p>Your chill weekly save point for honest reviews, gaming culture, co-op stories, and the games worth your time—without sweaty gatekeeping.</p>
        <div className="buttonRow"><Link className="button primary" href={primaryAction.href}>{primaryAction.label}</Link><Link className="button secondary" href="/shows">Browse all episodes</Link></div>
        {!session ? <p>Already in the squad? <Link href="/sign-in">Sign in</Link></p> : null}
      </div>
      <div className="nlcHeroArt"><Image src="/brand/next-level-cast-hero.png" alt="Next Level Cast gaming studio" width={960} height={540} priority /></div>
    </section>
    <section className="nlcWelcome">
      <Image src="/brand/next-level-cast-cover.png" alt="Leveled Up cover" width={420} height={420} />
      <div><span className="kicker">Start Here · Always free</span><h2>Leveled Up</h2><p>Your chill weekly gaming digest, brought to you by Next Level Cast. Every player archetype is welcome.</p><Link className="textLink" href={primaryAction.href}>Enter the lobby →</Link></div>
    </section>
    <section className="nlcFeatured">
      <div className="sectionHeading"><div><span className="kicker">Selected by the host</span><h2>Featured category episodes</h2></div><p>Catch the newest conversations selected for the Next Level Cast home page.</p></div>
      <div className="nlcCardGrid">
        {featured.map((category, index) => { const episode = category.episodes[0]; return <article className="nlcEpisodeCard" key={category.id}>
          <div className="nlcCategoryArt"><Image src={index === 0 ? "/brand/episode-retro-revival.png" : "/brand/episode-next-gen-audio.png"} alt="" width={640} height={360} /></div>
          <span className="kicker">{category.name}</span><h3>{episode?.title ?? category.name}</h3><p>{episode?.summary ?? "New episodes coming soon."}</p>
          <Link className="textLink" href={episode ? `/shows/${episode.slug}` : `/shows?category=${category.slug}`}>{episode ? "Preview episode" : "View category"} →</Link>
        </article>; })}
        <article className="nlcEpisodeCard nlcAllCategories"><div className="nlcCategoryArt"><Image src="/brand/next-level-cast-cover.png" alt="" width={640} height={360} /></div><span className="kicker">Every category</span><h3>Choose another lobby</h3><p>Explore every current category and find the next conversation made for your playstyle.</p><Link aria-label="Explore every category" className="textLink" href="/shows">Explore every category →</Link></article>
      </div>
    </section>
    <section className="nlcNewsletter"><div><span className="kicker">Stay in the party</span><h2>New episodes. No spam.</h2><p>Create a free account for the full archive, downloads, and future Next Level Cast updates.</p></div><Link className="button primary" href="/signup">Sign Up Free</Link></section>
  </main>;
}

