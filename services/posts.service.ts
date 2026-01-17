import { Post } from "@/interfaces/Post";
import { functions, tablesDB } from "@/libs/appwrite";
import { ID, Query } from "react-native-appwrite";

const CRIC_TALK_DATABASE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_CRIC_TALK_DATABASE_ID!;
const POSTS_TABLES_ID = process.env.EXPO_PUBLIC_APPWRITE_POSTS_TABLE_ID!;
const POSTS_GUARD_FUNCTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_POSTS_GUARD_FUNCTION_ID!;

export async function fetchPosts() {
  try {
    return await tablesDB.listRows<Post>({
      databaseId: CRIC_TALK_DATABASE_ID,
      tableId: POSTS_TABLES_ID,
      queries: [
        Query.orderDesc("views"),
        Query.orderDesc("likes"),
        Query.orderDesc("$createdAt"),
      ],
    });
  } catch (error) {
    console.log(`Error while fetching posts ${error}`);
    throw error;
  }
}

export async function fetchPostsByUserId(userId: string) {
  try {
    return await tablesDB.listRows<Post>({
      databaseId: CRIC_TALK_DATABASE_ID,
      tableId: POSTS_TABLES_ID,
      queries: [Query.equal("authorId", userId), Query.orderDesc("$createdAt")],
    });
  } catch (error) {
    console.log(`Error while fetching posts by user id ${error}`);
    throw error;
  }
}

export async function createPost({
  content,
  image = [],
  authorId,
  authorName,
}: {
  content: string;
  image?: string[];
  authorId: string;
  authorName: string;
}) {
  try {
    return await tablesDB.createRow<Post>({
      databaseId: CRIC_TALK_DATABASE_ID,
      tableId: POSTS_TABLES_ID,
      rowId: ID.unique(),
      data: {
        content,
        image,
        authorId,
        authorName,
        likes: 0,
        likedBy: [],
        views: 0,
        viewedBy: [],
        commentCount: 0,
      },
    });
  } catch (error) {
    console.log(`Error while creating post ${error}`);
    throw error;
  }
}

export async function updatePost(id: string, postData: Partial<Post>) {
  try {
    return await tablesDB.updateRow({
      databaseId: CRIC_TALK_DATABASE_ID,
      tableId: POSTS_TABLES_ID,
      rowId: id,
      data: postData,
    });
  } catch (error) {
    console.log(`Error while updating post ${error}`);
    throw error;
  }
}

export async function deletePost(postId: string) {
  try {
    return await tablesDB.deleteRow({
      databaseId: CRIC_TALK_DATABASE_ID,
      tableId: POSTS_TABLES_ID,
      rowId: postId,
    });
  } catch (error) {
    console.log(`Error while deleting post ${error}`);
    throw error;
  }
}

export async function executePost({
  action,
  postId,
  content,
  images,
}: {
  action: "create" | "update" | "delete" | "like" | "view";
  content?: string;
  postId?: string;
  images?: string[];
}) {
  try {
    const execution = await functions.createExecution({
      functionId: POSTS_GUARD_FUNCTION_ID,
      body: JSON.stringify({ action, content, postId, images }),
      async: false,
    });

    if (execution.status === "failed") {
      throw new Error(`Post execution failed ${execution.errors}`);
    }

    return execution;
  } catch (error) {
    console.log(`Error while executing post ${action} action ${error}`);
    throw error;
  }
}
