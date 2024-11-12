import { Post } from "@/models/post/post.model"

export interface Comment {
    id: string
    content: string
    author?: string
    isAnonymous: boolean
    postId: string
    post?: Post
    createdAt: Date
    updatedAt: Date
}