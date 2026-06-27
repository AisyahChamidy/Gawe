import { NextRequest, NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'

function buildPrompt(type: string, context: Record<string, string>): string {
  if (type === 'cover_letter') {
    return `Tulis cover letter lamaran proyek freelance dalam Bahasa Indonesia, hangat dan profesional, 150-200 kata, untuk freelancer pemula tanpa pengalaman.

Proyek: ${context.projectTitle || ''}
Deskripsi proyek: ${context.projectDescription || ''}
Skill yang dibutuhkan: ${context.projectSkills || ''}
Skill freelancer: ${context.freelancerSkills || 'Belum tercantum'}

Tulis langsung isi cover letter-nya saja, tanpa salam pembuka format surat formal. Mulai dengan kalimat yang menarik perhatian.`
  }

  if (type === 'improve_profile') {
    return `Berikan saran perbaikan bio dan headline profil freelancer dalam Bahasa Indonesia, singkat dan menarik untuk klien UMKM.

Headline saat ini: ${context.currentHeadline || '(kosong)'}
Bio saat ini: ${context.currentBio || '(kosong)'}
Skill: ${context.skills || ''}

Berikan dalam format persis seperti ini:
HEADLINE: [tulis headline baru di sini, maksimal 10 kata]
BIO: [tulis bio baru di sini, 2-3 kalimat, hangat dan percaya diri]`
  }

  if (type === 'improve_brief') {
    return `Perbaiki dan lengkapi deskripsi brief proyek freelance dalam Bahasa Indonesia, detail dan jelas untuk freelancer pemula.

Judul proyek: ${context.title || ''}
Kategori: ${context.category || ''}
Deskripsi saat ini: ${context.currentDescription || '(kosong)'}

Tulis deskripsi yang sudah diperbaiki saja. Sertakan: apa yang dibutuhkan, gaya yang diinginkan, output yang diharapkan, dan informasi tambahan yang membantu freelancer. Maksimal 150 kata.`
  }

  return context.prompt || ''
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.type) {
    return NextResponse.json({ error: 'Missing type' }, { status: 400 })
  }

  const prompt = buildPrompt(body.type, body.context || {})

  let res: Response
  try {
    res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })
  } catch (fetchErr) {
    console.error('[ai/generate] fetch failed:', fetchErr)
    return NextResponse.json({ error: 'Network error reaching Gemini' }, { status: 502 })
  }

  if (!res.ok) {
    const errText = await res.text()
    console.error(`[ai/generate] Gemini ${res.status}:`, errText)
    return NextResponse.json({ error: `Gemini error ${res.status}` }, { status: 502 })
  }

  const data = await res.json()
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!result) {
    console.error('[ai/generate] Empty result from Gemini. Full response:', JSON.stringify(data))
  }
  return NextResponse.json({ result })
}
