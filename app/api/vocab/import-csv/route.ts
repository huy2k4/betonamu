import { NextResponse } from 'next/server'
import { getAdminClient } from '@/utils/supabase/admin'

// Helper: parse CSV text → array of objects
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

  return lines.slice(1).map(line => {
    // Hỗ trợ values có dấu phẩy bên trong quotes
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

// Helper: chuyển string "A|B|C" thành array ['A','B','C']
function toArray(val: string): string[] {
  if (!val) return []
  return val.split('|').map(s => s.trim()).filter(Boolean)
}

export async function POST(request: Request) {
  try {
    const { supabase, isAdmin } = await getAdminClient()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Access is restricted to administrators' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }

    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (const row of rows) {
      const { word, reading, romaji, meanings, part_of_speech, han_viet, jlpt_level,
              topic, lesson, synonyms, antonyms, difficulty,
              example_sentence, example_reading, example_translation } = row

      if (!word || !reading || !meanings || !jlpt_level) {
        results.failed++
        results.errors.push(`Bỏ qua dòng thiếu field bắt buộc: "${word || '?'}"`)
        continue
      }

      const payload = {
        word: word.trim(),
        reading: reading.trim(),
        romaji: romaji?.trim() || null,
        meanings: toArray(meanings),
        part_of_speech: toArray(part_of_speech),
        han_viet: han_viet?.trim() || null,
        jlpt_level: jlpt_level.trim() as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
        topic: toArray(topic),
        lesson: lesson?.trim() || null,
        synonyms: toArray(synonyms),
        antonyms: toArray(antonyms),
        difficulty: parseInt(difficulty) || 1,
        is_active: true,
      }

      // Check existing word
      const { data: existing } = await supabase
        .from('vocabularies')
        .select('id')
        .eq('word', word.trim())
        .maybeSingle()

      let vocabId = existing?.id

      if (vocabId) {
        const { error: updateError } = await supabase
          .from('vocabularies')
          .update(payload)
          .eq('id', vocabId)
        if (updateError) {
          results.failed++
          results.errors.push(`Lỗi từ "${word}": ${updateError.message}`)
          continue
        }
      } else {
        const { data: newVocab, error: insertError } = await supabase
          .from('vocabularies')
          .insert(payload)
          .select('id')
          .single()
        if (insertError || !newVocab) {
          results.failed++
          results.errors.push(`Lỗi từ "${word}": ${insertError?.message}`)
          continue
        }
        vocabId = newVocab.id
      }

      // Insert/update example nếu có
      if (example_sentence && vocabId) {
        const { data: existingEx } = await supabase
          .from('vocab_examples')
          .select('id')
          .eq('vocab_id', vocabId)
          .eq('sentence', example_sentence)
          .maybeSingle()

        if (existingEx) {
          await supabase.from('vocab_examples').update({
            reading: example_reading || null,
            translation: example_translation || '',
          }).eq('id', existingEx.id)
        } else {
          await supabase.from('vocab_examples').insert({
            vocab_id: vocabId,
            sentence: example_sentence,
            reading: example_reading || null,
            translation: example_translation || '',
            position: 0,
          })
        }
      }

      results.success++
    }

    return NextResponse.json({
      success: true,
      imported: results.success,
      failed: results.failed,
      errors: results.errors,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
