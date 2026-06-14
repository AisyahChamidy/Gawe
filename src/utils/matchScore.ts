export function calculateMatchScore(params: {
  freelancerSkills: string[]
  freelancerCategories?: string[]
  trustScore: number
  project: {
    skillsRequired: string[]
    category: string
    budgetMin: number
    budgetMax: number
  }
}): number {
  const { freelancerSkills, freelancerCategories, trustScore, project } = params
  const fsLower = freelancerSkills.map(s => s.toLowerCase())

  // skillOverlap (35%): fraction of required skills matched, case-insensitive substring
  let skillOverlap: number
  if (project.skillsRequired.length === 0) {
    skillOverlap = 0.7
  } else {
    const matched = project.skillsRequired.filter(req =>
      fsLower.some(fs => fs.includes(req.toLowerCase()) || req.toLowerCase().includes(fs))
    ).length
    skillOverlap = matched / project.skillsRequired.length
  }

  // categoryMatch (20%): exact category in preferences, or keyword overlap with skills
  const catLower = project.category.toLowerCase()
  const inCategories = (freelancerCategories ?? []).some(c => c.toLowerCase() === catLower)
  const inSkills = fsLower.some(s => s.includes(catLower) || catLower.split(' ').some(w => w.length > 2 && s.includes(w)))
  const categoryMatch = (inCategories || inSkills) ? 1 : 0.5

  // trustEligible (25%): higher trust → more eligible
  const trustEligible = trustScore >= 60 ? 1.0 : trustScore >= 30 ? 0.75 : 0.5

  // budgetFit (20%): neutral — no preference data yet
  const budgetFit = 0.8

  const raw = (skillOverlap * 0.35 + categoryMatch * 0.20 + trustEligible * 0.25 + budgetFit * 0.20) * 100
  return Math.min(98, Math.max(50, Math.round(raw)))
}
