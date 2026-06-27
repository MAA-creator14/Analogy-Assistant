import { z } from 'zod'

export const analogySchema = z.object({
  analogies: z.array(
    z.object({
      text: z.string().describe('The analogy itself — 1 to 3 sentences, ready to use'),
      fit: z.string().describe('One sentence explaining why this analogy works for the given audience and goal'),
    })
  ),
})

export type AnalogyResponse = z.infer<typeof analogySchema>
