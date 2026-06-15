// src/pages/api/comments/[postId].ts
// 评论 API —— GET 获取评论列表，POST 发表评论
import type { APIRoute } from "astro";
import { getComments, addComment, deleteComment } from "../../../lib/comments-store";

export const GET: APIRoute = async ({ params }) => {
  const { postId } = params;
  if (!postId) {
    return new Response(JSON.stringify({ error: "缺少 postId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const comments = getComments(postId);
  return new Response(JSON.stringify({ comments }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
};

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const { postId } = params;
  if (!postId) {
    return new Response(JSON.stringify({ error: "缺少 postId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 读取登录身份
  const session = cookies.get("user_session");
  const email = session?.value;
  if (!email) {
    return new Response(JSON.stringify({ error: "请先登录后再评论" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 解析请求体
  let body: string;
  try {
    const data = await request.json();
    body = data.body;
  } catch {
    return new Response(JSON.stringify({ error: "请求格式错误" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body || typeof body !== "string" || body.trim().length === 0) {
    return new Response(JSON.stringify({ error: "评论内容不能为空" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body.trim().length > 500) {
    return new Response(JSON.stringify({ error: "评论内容不能超过 500 字" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const comment = addComment(postId, email, body.trim());
  return new Response(JSON.stringify({ comment }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  // 读取登录身份
  const session = cookies.get("user_session");
  const email = session?.value;
  if (!email) {
    return new Response(JSON.stringify({ error: "请先登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 从 query 或 body 中取 commentId
  let commentId: string | null = null;
  const url = new URL(request.url);
  commentId = url.searchParams.get("commentId");

  if (!commentId) {
    try {
      const data = await request.json();
      commentId = data.commentId;
    } catch { /* 忽略 */ }
  }

  if (!commentId) {
    return new Response(JSON.stringify({ error: "缺少 commentId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ok = deleteComment(commentId, email);
  if (!ok) {
    return new Response(JSON.stringify({ error: "删除失败：评论不存在或无权删除" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
