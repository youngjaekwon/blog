import { Comment } from "@/models/comment/comment.model"

export interface Post {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    views: number
    tags: string[]
    comments?: Comment[]
}