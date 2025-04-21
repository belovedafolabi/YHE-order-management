import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-6">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-0 text-center md:text-left">
        <p className="text-sm max-w-full md:max-w-[70%] leading-relaxed text-muted-foreground">
          <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent font-medium tracking-wide">
            Built with{" "}
            <span className="animate-pulse text-black dark:text-white font-extrabold text-lg md:text-2xl">
              &#9829;
            </span>{" "}
            by{" "}
            <Link
              href="https://bfa-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-amber-600 hover:decoration-amber-400 dark:decoration-amber-300 dark:hover:decoration-amber-500 font-semibold"
            >
              BFA
            </Link>
          </span>{" "}
          for YHE OrderTrack © {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
