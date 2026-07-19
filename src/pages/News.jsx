import styles from "./News.module.css";
import Navbar from "../components/Navbar";
import "../styles/theme.css";

function PulseTag({ label }) {
  return (
    <span className={styles.pulseTag}>
      <svg viewBox="0 0 60 20" className={styles.pulseTagIcon}>
        <path
          d="M0 10 H18 L22 3 L27 17 L31 10 H60"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}

// Photos from /public — swap or add more here and everything below
// will keep cycling through them automatically.
const GALLERY = ["/1.jpg", "/2.jpg", "/3.jpg", "/download.jpg"];

// Separate list for the "More Updates" cards — 3.jpg is excluded here
// because its pale top crops awkwardly in this card's wide, short image box.
const MORE_UPDATES_IMAGES = ["/1.jpg", "/2.jpg", "/download.jpg"];

const FEATURED = {
  date: "8 Jul 2026",
  tag: "URGENT",
  title: "O- reserves hit a two-year low across three partner hospitals",
  excerpt:
    "City General, Riverside, and St. Anne's are all reporting critical shortages of O-negative. Here's what's driving the drop and where to give this week.",
  image: GALLERY[0],
};

const SIDEBAR_STORIES = [
  {
    date: "6 Jul 2026",
    title: "Meet the donor who's given blood 47 times",
    category: "PROFILE",
  },
  {
    date: "3 Jul 2026",
    title:
      "Community Blood partners with City General for a 24/7 emergency response line",
    category: "PARTNERSHIP",
  },
  {
    date: "30 Jun 2026",
    title: "What actually happens to your blood after you donate",
    category: "EXPLAINER",
  },
  {
    date: "26 Jun 2026",
    title: "Weekend drive at Riverside Mall pulls in 62 new donors",
    category: "DRIVE RECAP",
  },
  {
    date: "21 Jun 2026",
    title: "Five myths about donating blood, debunked",
    category: "EXPLAINER",
  },
];

const MORE_UPDATES = [
  {
    date: "18 Jun 2026",
    category: "DRIVE",
    title: "Downtown office crawl: three companies, one blood drive",
    excerpt:
      "Local employers teamed up for a single-day drive that beat its own target by noon.",
  },
  {
    date: "14 Jun 2026",
    category: "MILESTONE",
    title: "Community Blood passes 10,000 registered donors",
    excerpt:
      "It took three years to reach the first thousand. The next nine thousand took eighteen months.",
  },
  {
    date: "9 Jun 2026",
    category: "GUIDE",
    title: "First time donating? Here's exactly what to expect",
    excerpt:
      "From the ID check to the fifteen minutes with a juice box afterward — a walk-through for new donors.",
  },
];

export default function News() {
  return (
    <div className={styles.page}>
      <Navbar tone="light" />

      <div className={styles.header}>
        <div className={styles.eyebrow}>Community Blood Donation Network</div>
        <h1 className={styles.heading}>NEWS</h1>
        <svg
          className={styles.pulseDivider}
          viewBox="0 0 900 32"
          preserveAspectRatio="none"
        >
          <path
            d="M0 16 H320 L345 16 L360 4 L378 28 L396 16 L420 16 H580 L605 16 L620 4 L638 28 L656 16 L680 16 H900"
            fill="none"
            stroke="#E31E24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className={styles.content}>
        <div className={styles.mainCol}>
          <button type="button" className={styles.featured}>
            <div className={styles.featuredArt}>
              <img src={FEATURED.image} alt="" />
            </div>
            <div className={styles.featuredBody}>
              <PulseTag label={FEATURED.tag} />
              <div className={styles.featuredDate}>{FEATURED.date}</div>
              <h2 className={styles.featuredTitle}>{FEATURED.title}</h2>
              <p className={styles.featuredExcerpt}>{FEATURED.excerpt}</p>
            </div>
          </button>
        </div>

        <div className={styles.sideCol}>
          {SIDEBAR_STORIES.map((s, i) => (
            <button type="button" key={i} className={styles.sideItem}>
              <div className={styles.sideThumb}>
                <img src={GALLERY[i % GALLERY.length]} alt="" />
              </div>
              <div>
                <div className={styles.sideDate}>{s.date}</div>
                <div className={styles.sideTitle}>{s.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.moreSection}>
        <h2 className={styles.moreTitle}>More Updates</h2>
        <div className={styles.moreGrid}>
          {MORE_UPDATES.map((u, i) => (
            <button type="button" key={i} className={styles.moreCard}>
              <div className={styles.moreArt}>
                <img
                  src={MORE_UPDATES_IMAGES[i % MORE_UPDATES_IMAGES.length]}
                  alt=""
                />
              </div>
              <div className={styles.moreCategory}>{u.category}</div>
              <div className={styles.moreDate}>{u.date}</div>
              <h3 className={styles.moreCardTitle}>{u.title}</h3>
              <p className={styles.moreExcerpt}>{u.excerpt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
