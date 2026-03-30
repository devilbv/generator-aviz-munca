import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Web Digital Venture SRL · CUI 46880060
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <Link to="/termeni" className="hover:text-primary transition-colors">Termeni și Condiții</Link>
          <Link to="/confidentialitate" className="hover:text-primary transition-colors">Confidențialitate</Link>
          <Link to="/rambursare" className="hover:text-primary transition-colors">Rambursare</Link>
          <a href="mailto:contact@web-digital.eu" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
