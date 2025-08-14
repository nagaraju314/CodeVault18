import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#3a554e] text-white py-6 text-center">
      <div className="container mx-auto flex flex-wrap justify-between items-center px-30 text-sm">
        <div className="flex gap-6 items-center">
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <a
            href="https://github.com/yourusername/codevault"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            GitHub Repo
          </a>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </div>
        <p className="text-gray-400">
          &copy; {new Date().getFullYear()} CodeVault
        </p>
      </div>
    </footer>
  );
}
