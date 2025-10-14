// Text colors matching glow colors from form fields
export const formTextColors = {
  children: 'text-cyan-400',      // rgba(103,232,249)
  applicant: 'text-blue-500',     // hsla(221, 83%, 53%)
  spouse: 'text-blue-300',        // Lighter blue for spouse
  parents: 'text-teal-500',       // rgba(20,184,166)
  grandparents: 'text-red-500',   // rgba(239,68,68)
  ggp: 'text-gray-400',           // rgba(209,213,219)
  poa: 'text-gray-400',           // rgba(156,163,175)
  citizenship: 'text-blue-500',   // rgba(59,130,246)
  'civil-reg': 'text-emerald-400' // rgba(110,231,183)
} as const;

export type ColorScheme = keyof typeof formTextColors;

export function getTitleColor(scheme: ColorScheme): string {
  return formTextColors[scheme] || formTextColors.applicant;
}
