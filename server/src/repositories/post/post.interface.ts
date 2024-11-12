import { CreatePostDTO } from "@/dtos/post/post.create.dto";
import { UpdatePostDTO } from "@/dtos/post/post.update.dto";
import { Post } from "@/models/post/post.model";
import { FindOptions } from "@/types/common/pagination.types";

export interface IPostRepository {
    findById(id: string): Promise<Post | null>
    create(data: CreatePostDTO): Promise<Post>
    update(id: string, data: UpdatePostDTO): Promise<Post>
    delete(id: string): Promise<void>
    findAll(options: FindOptions): Promise<{posts: Post[]; total: number}>
}