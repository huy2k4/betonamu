import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

/**
 * @swagger
 * /api/vocab:
 *   get:
 *     summary: Lấy danh sách từ vựng
 *     tags: [Vocabulary]
 *     parameters:
 *       - in: query
 *         name: jlpt
 *         schema: { type: string, enum: [N5, N4, N3, N2, N1] }
 *       - in: query
 *         name: topic
 *         schema: { type: string }
 *       - in: query
 *         name: lesson
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: OK
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { searchParams } = new URL(request.url)
    const jlpt    = searchParams.get('jlpt')
    const topic   = searchParams.get('topic')
    const lesson  = searchParams.get('lesson')
    const search  = searchParams.get('search')
    const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit   = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
    const offset  = (page - 1) * limit

    let query = supabase
      .from('vocabularies')
      .select('*, vocab_examples(*)', { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('jlpt_level', { ascending: true })
      .order('lesson', { ascending: true })

    if (jlpt) query = query.eq('jlpt_level', jlpt)
    if (lesson) {
      const matchNum = lesson.match(/\d+/)
      if (matchNum) {
        const num = matchNum[0]
        query = query.or(`lesson.ilike.%Bài ${num}%,lesson.ilike.%Bài ${num}%,lesson.ilike.%bai ${num}%`)
      } else {
        query = query.ilike('lesson', `%${lesson}%`)
      }
    }
    if (topic)  query = query.contains('topic', [topic])
    if (search) {
      query = query.or(`word.ilike.%${search}%,reading.ilike.%${search}%,han_viet.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/vocab Error]:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Luôn chuẩn hóa NFC để giao diện không bị lỗi font Tiếng Việt
    const normalizedData = (data || []).map((v: Record<string, unknown>) => ({
      ...v,
      lesson: typeof v.lesson === 'string' ? v.lesson.normalize('NFC') : v.lesson,
      word: typeof v.word === 'string' ? v.word.normalize('NFC') : v.word,
      han_viet: typeof v.han_viet === 'string' ? v.han_viet.normalize('NFC') : v.han_viet,
      meanings: Array.isArray(v.meanings) ? v.meanings.map((m: unknown) => typeof m === 'string' ? m.normalize('NFC') : m) : v.meanings,
    }))

    return NextResponse.json({
      success: true,
      data: normalizedData,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[GET /api/vocab Catch Error]:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/vocab:
 *   post:
 *     summary: Tạo từ vựng mới (Admin)
 *     tags: [Vocabulary]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [word, reading, meanings, jlpt_level]
 *             properties:
 *               word: { type: string, example: "無料" }
 *               reading: { type: string, example: "むりょう" }
 *               romaji: { type: string, example: "muryou" }
 *               meanings: { type: array, items: { type: string } }
 *               part_of_speech: { type: array, items: { type: string } }
 *               han_viet: { type: string, example: "Vô Liệu" }
 *               jlpt_level: { type: string, enum: [N5, N4, N3, N2, N1] }
 *               topic: { type: array, items: { type: string } }
 *               lesson: { type: string, example: "Bài 1" }
 *               synonyms: { type: array, items: { type: string } }
 *               antonyms: { type: array, items: { type: string } }
 *               difficulty: { type: integer, minimum: 1, maximum: 5 }
 *               examples:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sentence: { type: string }
 *                     reading: { type: string }
 *                     translation: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Missing required fields }
 *       401: { description: Unauthorized }
 */
import { getAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { supabase, isAdmin } = await getAdminClient()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Access is restricted to administrators' }, { status: 401 })
    }

    const body = await request.json()
    const { word, reading, romaji, meanings, part_of_speech, han_viet, jlpt_level,
            topic, lesson, synonyms, antonyms, difficulty, examples, image_url, audio_url } = body

    if (!word || !reading || !meanings?.length || !jlpt_level) {
      return NextResponse.json(
        { error: 'Missing required fields: word, reading, meanings, jlpt_level' },
        { status: 400 }
      )
    }

    // Insert từ vựng
    const { data: vocab, error: vocabError } = await supabase
      .from('vocabularies')
      .insert({
        word, reading, romaji, meanings,
        part_of_speech: part_of_speech ?? [],
        han_viet, jlpt_level,
        topic: topic ?? [],
        lesson: lesson ?? null,
        synonyms: synonyms ?? [],
        antonyms: antonyms ?? [],
        difficulty: difficulty ?? 1,
        image_url: image_url ?? null,
        audio_url: audio_url ?? null,
      })
      .select()
      .single()

    if (vocabError || !vocab) {
      return NextResponse.json({ error: vocabError?.message ?? 'Insert failed' }, { status: 500 })
    }

    // Insert examples nếu có
    if (examples?.length) {
      const examplesPayload = examples.map((ex: { sentence: string; reading?: string; translation: string }, idx: number) => ({
        vocab_id: vocab.id,
        sentence: ex.sentence,
        reading: ex.reading ?? null,
        translation: ex.translation,
        position: idx,
      }))
      const { error: exErr } = await supabase.from('vocab_examples').insert(examplesPayload)
      if (exErr) console.error('Examples insert error:', exErr)
    }

    return NextResponse.json({ success: true, data: vocab }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
