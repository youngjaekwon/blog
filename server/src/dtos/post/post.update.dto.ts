import { updatePostSchema } from "@/validators/post/post.schemas";
import { z } from "zod";

export type UpdatePostDTO = z.infer<typeof updatePostSchema>

type ValidateDTO = {
    title?: string
    content?: string
    tgas?: string[]
}
const _typeCheck: ValidateDTO = {} as UpdatePostDTO