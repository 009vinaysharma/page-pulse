/**
 * Card.jsx
 * The single "surface" primitive reused by every card in the app
 * (stat cards, error card, summary banner). Keeping the visual
 * treatment in one place means a design tweak here applies everywhere.
 */
export default function Card({ children, className = '', hoverable = false, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`pulse-card ${hoverable ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-xl hover:shadow-black/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
