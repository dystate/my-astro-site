"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── 类型 ──
interface Comment {
  id: string;
  postId: string;
  author: string;
  authorEmail: string;
  body: string;
  createdAt: string;
}

// ── 时间格式化 ──
function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} 小时前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} 天前`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ── 从 cookie 读取当前用户 ──
function getCurrentEmail(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)user_session=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ── 组件 ──
export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getCurrentEmail());
  }, []);

  // ── 拉取评论 ──
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      /* 静默失败 */
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // 首次加载
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ── 多端互通：每 5 秒轮询 ──
  useEffect(() => {
    const timer = setInterval(fetchComments, 5000);
    return () => clearInterval(timer);
  }, [fetchComments]);

  // ── 提交评论 ──
  const handleSubmit = async () => {
    const body = input.trim();
    if (!body || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      if (res.ok) {
        setInput("");
        // 立即刷新列表
        await fetchComments();
      } else {
        const data = await res.json();
        setError(data.error || "发送失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSending(false);
    }
  };

  // ── 删除评论 ──
  const handleDelete = async (commentId: string) => {
    if (!confirm("确定删除这条评论吗？")) return;
    try {
      const res = await fetch(`/api/comments/${postId}?commentId=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchComments();
      } else {
        const data = await res.json();
        setError(data.error || "删除失败");
      }
    } catch {
      setError("网络错误，请重试");
    }
  };

  // ── 键盘提交 ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── 显示逻辑 ──
  const visibleComments = expanded ? comments : comments.slice(-3);
  const hiddenCount = comments.length - visibleComments.length;

  return (
    <div className="cmt-zone">
      {/* 评论列表 */}
      {loading ? (
        <div className="cmt-loading" />
      ) : comments.length > 0 ? (
        <div className="cmt-list">
          {hiddenCount > 0 && !expanded && (
            <button
              className="cmt-expand"
              onClick={() => setExpanded(true)}
            >
              查看全部 {comments.length} 条评论
            </button>
          )}
          {expanded && hiddenCount < 0 && comments.length > 3 && (
            <button
              className="cmt-expand"
              onClick={() => setExpanded(false)}
            >
              收起
            </button>
          )}
          {visibleComments.map((c) => (
            <div key={c.id} className="cmt-item">
              <span className="cmt-author">{c.author}</span>
              <span className="cmt-colon">: </span>
              <span className="cmt-body">{c.body}</span>
              <span className="cmt-time">{fmtTime(c.createdAt)}</span>
              {email && c.authorEmail === email && (
                <button
                  className="cmt-del"
                  onClick={() => handleDelete(c.id)}
                  title="删除"
                  aria-label="删除评论"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* 输入区 */}
      {email ? (
        <div className="cmt-input-row">
          <input
            ref={inputRef}
            className="cmt-input"
            type="text"
            placeholder="写评论..."
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            disabled={sending}
            maxLength={500}
          />
          <button
            className="cmt-send"
            onClick={handleSubmit}
            disabled={!input.trim() || sending}
          >
            {sending ? "…" : "发送"}
          </button>
        </div>
      ) : (
        <p className="cmt-login-hint">登录后即可评论</p>
      )}

      {error && <p className="cmt-error">{error}</p>}

      {/* 内联样式 —— 朋友圈评论风格 */}
      <style>{`
        .cmt-zone {
          margin-top: 8px;
          font-size: 13px;
        }
        .cmt-loading {
          height: 18px;
        }
        .cmt-list {
          background: rgba(0,0,0,.025);
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 8px;
        }
        .cmt-item {
          line-height: 1.7;
          padding: 2px 0;
        }
        .cmt-item + .cmt-item {
          border-top: 1px solid rgba(0,0,0,.04);
        }
        .cmt-author {
          color: #4a6fa5;
          font-weight: 600;
        }
        .cmt-colon {
          color: #999;
        }
        .cmt-body {
          color: #2c2c2c;
        }
        .cmt-time {
          float: right;
          font-size: 11px;
          color: #b0b0b0;
          margin-top: 1px;
        }
        .cmt-expand {
          display: block;
          width: 100%;
          border: none;
          background: none;
          color: #7a8599;
          font-size: 12px;
          cursor: pointer;
          padding: 2px 0 4px;
          text-align: left;
        }
        .cmt-expand:hover {
          color: #4a6fa5;
        }

        /* 输入行 */
        .cmt-input-row {
          display: flex;
          gap: 6px;
        }
        .cmt-input {
          flex: 1;
          border: none;
          border-radius: 18px;
          padding: 6px 14px;
          font-size: 13px;
          background: rgba(0,0,0,.05);
          color: #2c2c2c;
          outline: none;
          transition: background .2s;
        }
        .cmt-input:focus {
          background: rgba(0,0,0,.09);
        }
        .cmt-input::placeholder {
          color: #b0b0b0;
        }
        .cmt-send {
          flex: none;
          border: none;
          border-radius: 18px;
          padding: 6px 16px;
          background: #4a6fa5;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity .2s;
        }
        .cmt-send:disabled {
          opacity: .35;
          cursor: default;
        }
        .cmt-send:not(:disabled):hover {
          opacity: .85;
        }

        .cmt-del {
          float: right;
          border: none;
          background: none;
          color: #c0c0c0;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          padding: 0 0 0 6px;
          transition: color .15s;
        }
        .cmt-del:hover {
          color: #d4645c;
        }

        .cmt-login-hint {
          margin: 4px 0 0;
          font-size: 12px;
          color: #b0b0b0;
        }
        .cmt-error {
          margin: 4px 0 0;
          font-size: 12px;
          color: #d4645c;
        }
      `}</style>
    </div>
  );
}
