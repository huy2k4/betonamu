import { NextResponse } from 'next/server'

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const values: string[] = []
    let current = ''
    let inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { values.push(current.trim()); current = ''; continue }
      current += ch
    }
    values.push(current.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

function toArray(val: string): string[] {
  if (!val) return []
  return val.split('|').map(s => s.trim()).filter(Boolean)
}

import { getAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { supabase, isAdmin } = await getAdminClient()
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const text = await file.text()
    const rows = parseCSV(text)
    if (rows.length === 0) return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })

    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (const row of rows) {
      const { character, onyomi, kunyomi, han_viet, meanings, mnemonic,
              notes, jlpt_level, stroke_count, radicals, frequency, tags, examples } = row

      if (!character || !meanings) {
        results.failed++
        results.errors.push(`Bỏ qua dòng thiếu field bắt buộc: "${character || '?'}"`)
        continue
      }

      const payload = {
        character: character.trim(),
        onyomi: toArray(onyomi),
        kunyomi: toArray(kunyomi),
        han_viet: han_viet?.trim() || null,
        meanings: toArray(meanings),
        mnemonic: mnemonic?.trim() || null,
        notes: notes?.trim() || null,
        jlpt_level: jlpt_level?.trim() || null,
        stroke_count: parseInt(stroke_count) || null,
        radicals: toArray(radicals),
        frequency: parseInt(frequency) || null,
        tags: toArray(tags),
        examples: toArray(examples),
        is_active: true,
      }

      const { data: existing } = await supabase
        .from('kanji')
        .select('id')
        .eq('character', character.trim())
        .maybeSingle()

      if (existing) {
        const { error: updateError } = await supabase
          .from('kanji')
          .update(payload)
          .eq('id', existing.id)
        if (updateError) {
          results.failed++
          results.errors.push(`Lỗi kanji "${character}": ${updateError.message}`)
          continue
        }
      } else {
        const { error: insertError } = await supabase
          .from('kanji')
          .insert(payload)
        if (insertError) {
          results.failed++
          results.errors.push(`Lỗi kanji "${character}": ${insertError.message}`)
          continue
        }
      }

      results.success++
    }

    return NextResponse.json({ success: true, imported: results.success, failed: results.failed, errors: results.errors })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
