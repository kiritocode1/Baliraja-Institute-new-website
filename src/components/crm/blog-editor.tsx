"use client";

import {
  Bold,
  Eye,
  FileText,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Plus,
  Quote,
  Redo2,
  Save,
  Search,
  Send,
  Trash2,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  createBlogPostAction,
  deleteBlogPostAction,
  updateBlogPostAction,
} from "@/app/crm/actions";
import type {
  BlogPost,
  BlogPostInput,
  BlogPostStatus,
} from "@/lib/crm/blog-posts";

type BlogEditorProps = {
  posts: BlogPost[];
  usesBlobStorage: boolean;
};

const EMPTY_BODY =
  "<p>Write the opening paragraph for this guidance article.</p><p>Add exam method, notices, examples, and mentor notes here.</p>";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadTime(value: string) {
  const wordCount = stripHtml(value).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
}

function formatDate(value: string | null) {
  if (!value) return "Not published";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClass(status: BlogPostStatus) {
  if (status === "published") return "border-brass text-brass-deep";
  if (status === "archived") return "border-line-strong text-ink-soft";
  return "border-oxblood/30 text-oxblood";
}

async function uploadEditorImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/crm/media/upload", {
    method: "POST",
    body: formData,
  });
  const result = (await response.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  if (!response.ok || !result.url) {
    throw new Error(result.error || "Image upload failed.");
  }

  return result.url;
}

function BlogPostRow({ post, onEdit }: { post: BlogPost; onEdit: () => void }) {
  return (
    <article className="grid gap-4 border-t border-line py-5 lg:grid-cols-[8rem_1fr_auto] lg:items-center">
      <div className="relative aspect-[4/3] overflow-hidden bg-parchment-deep">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="8rem"
          className="object-cover"
        />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] ${getStatusClass(post.status)}`}
          >
            {post.status}
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {post.category}
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {post.readTime}
          </span>
        </div>
        <h3 className="mt-3 font-display text-2xl leading-tight text-oxblood">
          {post.title}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          {post.excerpt}
        </p>
        <p className="mt-3 text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
          {post.status === "published" ? "Published" : "Updated"}{" "}
          {formatDate(
            post.status === "published" ? post.publishedAt : post.updatedAt,
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        {post.status === "published" ? (
          <a
            href={`/news-events/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-line-strong px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
          >
            <Eye className="size-4" aria-hidden="true" />
            View
          </a>
        ) : null}
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 bg-oxblood px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
        >
          <FileText className="size-4" aria-hidden="true" />
          Edit
        </button>
      </div>
    </article>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex size-10 items-center justify-center border border-cream/15 text-cream/80 transition-colors hover:border-brass hover:text-brass"
    >
      {icon}
    </button>
  );
}

function BlogComposer({
  post,
  allPosts,
  usesBlobStorage,
  onClose,
}: {
  post: BlogPost | null;
  allPosts: BlogPost[];
  usesBlobStorage: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEditing = Boolean(post);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const inlineUploadRef = React.useRef<HTMLInputElement>(null);
  const coverUploadRef = React.useRef<HTMLInputElement>(null);
  const [title, setTitle] = React.useState(post?.title ?? "");
  const [slug, setSlug] = React.useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = React.useState(post?.excerpt ?? "");
  const [category, setCategory] = React.useState(post?.category ?? "Guidance");
  const [author, setAuthor] = React.useState(post?.author ?? "");
  const [readTime, setReadTime] = React.useState(post?.readTime ?? "");
  const [image, setImage] = React.useState(post?.image ?? "/img-classroom.jpg");
  const [status, setStatus] = React.useState<BlogPostStatus>(
    post?.status ?? "draft",
  );
  const [seoTitle, setSeoTitle] = React.useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(
    post?.seoDescription ?? "",
  );
  const [bodyHtml, setBodyHtml] = React.useState(post?.bodyHtml ?? EMPTY_BODY);
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    const initialBody = post?.bodyHtml ?? EMPTY_BODY;
    setBodyHtml(initialBody);

    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = initialBody;
      }
    });
  }, [post]);

  React.useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  function syncEditor() {
    const next = editorRef.current?.innerHTML ?? bodyHtml;
    setBodyHtml(next);

    if (!readTime) {
      setReadTime(estimateReadTime(next));
    }

    return next;
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditor();
  }

  function formatBlock(tag: "p" | "h2" | "h3" | "blockquote") {
    runCommand("formatBlock", tag);
  }

  function createLink() {
    const url = window.prompt("Paste the link URL");
    if (!url) return;
    runCommand("createLink", url);
  }

  function insertImage(url: string) {
    editorRef.current?.focus();
    document.execCommand("insertImage", false, url);
    syncEditor();
  }

  async function handleImageFile(file: File, mode: "cover" | "inline") {
    setUploading(true);
    setMessage("Uploading image...");

    try {
      const url = await uploadEditorImage(file);

      if (mode === "cover") {
        setImage(url);
      } else {
        insertImage(url);
      }

      setMessage(
        usesBlobStorage
          ? "Image uploaded to Vercel Blob."
          : "Image uploaded locally for development.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith("image/"),
    );

    if (!imageItem) return;

    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();
    await handleImageFile(file, "inline");
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    const file = Array.from(event.dataTransfer.files).find((item) =>
      item.type.startsWith("image/"),
    );

    if (!file) return;

    event.preventDefault();
    await handleImageFile(file, "inline");
  }

  function buildPayload(nextStatus = status): BlogPostInput {
    const html = syncEditor();
    const selectedSlug = slugify(slug || title);
    const duplicate = allPosts.find(
      (item) => item.slug === selectedSlug && item.id !== post?.id,
    );

    return {
      title,
      slug: duplicate ? "" : selectedSlug,
      excerpt,
      bodyHtml: html,
      category,
      author,
      readTime: readTime || estimateReadTime(html),
      image,
      status: nextStatus,
      seoTitle,
      seoDescription,
    };
  }

  async function save(nextStatus = status) {
    setBusy(true);
    setMessage(nextStatus === "published" ? "Publishing..." : "Saving...");

    try {
      const payload = buildPayload(nextStatus);
      const result =
        isEditing && post
          ? await updateBlogPostAction(post.id, payload)
          : await createBlogPostAction(payload);

      if (result.success) {
        setMessage(nextStatus === "published" ? "Published." : "Saved.");
        router.refresh();
        onClose();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function removePost() {
    if (!post) return;
    if (!window.confirm("Delete this blog post permanently?")) return;

    setBusy(true);
    setMessage("Deleting...");

    try {
      await deleteBlogPostAction(post.id);
      router.refresh();
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] bg-oxblood-deep text-cream">
      <div className="flex h-full flex-col">
        <header className="flex min-h-18 shrink-0 items-center justify-between border-b border-cream/12 bg-oxblood-deep px-4 py-3 sm:px-6">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-brass">
              {isEditing ? "Edit blog post" : "Create blog post"}
            </p>
            <h2 className="mt-1 max-w-[60vw] truncate font-display text-2xl text-cream">
              {title || "Untitled article"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] sm:inline-flex ${
                usesBlobStorage
                  ? "border-brass text-brass"
                  : "border-cream/25 text-cream-muted"
              }`}
            >
              {usesBlobStorage ? "Blob uploads" : "Local uploads"}
            </span>
            <button
              type="button"
              aria-label="Close editor"
              onClick={onClose}
              className="inline-flex size-10 items-center justify-center border border-cream/15 text-cream transition-colors hover:border-brass hover:text-brass"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[24rem_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-cream/12 bg-cream/[0.04] p-5 lg:border-r lg:border-b-0">
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="Current affairs without overwhelm"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Slug
                </span>
                <div className="flex gap-2">
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(slugify(event.target.value));
                    }}
                    className="min-w-0 flex-1 border border-cream/15 bg-oxblood-deep px-3 py-2.5 font-mono text-xs text-cream outline-none transition-colors focus:border-brass"
                    placeholder="article-slug"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSlugTouched(true);
                      setSlug(slugify(title));
                    }}
                    className="border border-cream/15 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cream-muted transition-colors hover:border-brass hover:text-brass"
                  >
                    Regen
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Excerpt
                </span>
                <textarea
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  rows={4}
                  maxLength={240}
                  className="w-full resize-none border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="Short summary used on cards and SEO previews."
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <label className="block">
                  <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                    Category
                  </span>
                  <input
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                    placeholder="Strategy"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                    Author
                  </span>
                  <input
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                    placeholder="Baliraja faculty"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Read time
                </span>
                <div className="flex gap-2">
                  <input
                    value={readTime}
                    onChange={(event) => setReadTime(event.target.value)}
                    className="min-w-0 flex-1 border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                    placeholder="6 min read"
                  />
                  <button
                    type="button"
                    onClick={() => setReadTime(estimateReadTime(syncEditor()))}
                    className="border border-cream/15 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cream-muted transition-colors hover:border-brass hover:text-brass"
                  >
                    Auto
                  </button>
                </div>
              </label>

              <div>
                <span className="mb-2 flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  <ImageIcon className="size-3.5" aria-hidden="true" />
                  Cover image
                </span>
                <input
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 font-mono text-xs text-cream outline-none transition-colors focus:border-brass"
                  placeholder="/img-classroom.jpg"
                />
                <button
                  type="button"
                  onClick={() => coverUploadRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-dashed border-cream/25 px-4 py-3 text-sm text-cream-muted transition-colors hover:border-brass hover:text-brass disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Upload className="size-4" aria-hidden="true" />
                  )}
                  Upload cover
                </button>
                <input
                  ref={coverUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleImageFile(file, "cover");
                    event.target.value = "";
                  }}
                />
                {image ? (
                  <div className="mt-3 aspect-video overflow-hidden border border-cream/15 bg-oxblood">
                    {/* biome-ignore lint/performance/noImgElement: The editor preview accepts temporary arbitrary image URLs before save-time normalization. */}
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Status
                </span>
                <div className="grid grid-cols-3 border border-cream/15">
                  {(["draft", "published", "archived"] as BlogPostStatus[]).map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setStatus(item)}
                        className={`px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                          status === item
                            ? "bg-brass text-oxblood-deep"
                            : "text-cream-muted hover:bg-cream/10 hover:text-cream"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="border-t border-cream/12 pt-5">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  SEO
                </p>
                <input
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                  className="mt-3 w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="SEO title"
                />
                <textarea
                  value={seoDescription}
                  onChange={(event) => setSeoDescription(event.target.value)}
                  rows={3}
                  className="mt-3 w-full resize-none border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="Meta description"
                />
              </div>
            </div>
          </aside>

          <section className="flex min-w-0 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-cream/12 bg-oxblood-deep px-4 py-3">
              <ToolbarButton
                label="Undo"
                icon={<Undo2 className="size-4" aria-hidden="true" />}
                onClick={() => runCommand("undo")}
              />
              <ToolbarButton
                label="Redo"
                icon={<Redo2 className="size-4" aria-hidden="true" />}
                onClick={() => runCommand("redo")}
              />
              <span className="mx-1 h-8 w-px bg-cream/12" />
              <ToolbarButton
                label="Paragraph"
                icon={<span className="text-sm font-semibold">P</span>}
                onClick={() => formatBlock("p")}
              />
              <ToolbarButton
                label="Heading 2"
                icon={<Heading2 className="size-4" aria-hidden="true" />}
                onClick={() => formatBlock("h2")}
              />
              <ToolbarButton
                label="Heading 3"
                icon={<Heading3 className="size-4" aria-hidden="true" />}
                onClick={() => formatBlock("h3")}
              />
              <ToolbarButton
                label="Bold"
                icon={<Bold className="size-4" aria-hidden="true" />}
                onClick={() => runCommand("bold")}
              />
              <ToolbarButton
                label="Italic"
                icon={<Italic className="size-4" aria-hidden="true" />}
                onClick={() => runCommand("italic")}
              />
              <ToolbarButton
                label="Bulleted list"
                icon={<List className="size-4" aria-hidden="true" />}
                onClick={() => runCommand("insertUnorderedList")}
              />
              <ToolbarButton
                label="Numbered list"
                icon={<ListOrdered className="size-4" aria-hidden="true" />}
                onClick={() => runCommand("insertOrderedList")}
              />
              <ToolbarButton
                label="Quote"
                icon={<Quote className="size-4" aria-hidden="true" />}
                onClick={() => formatBlock("blockquote")}
              />
              <ToolbarButton
                label="Link"
                icon={<LinkIcon className="size-4" aria-hidden="true" />}
                onClick={createLink}
              />
              <ToolbarButton
                label="Upload inline image"
                icon={<ImageIcon className="size-4" aria-hidden="true" />}
                onClick={() => inlineUploadRef.current?.click()}
              />
              <input
                ref={inlineUploadRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImageFile(file, "inline");
                  event.target.value = "";
                }}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-parchment px-4 py-6 sm:px-8">
              <div className="mx-auto max-w-4xl border border-line bg-parchment px-5 py-8 shadow-2xl shadow-oxblood-deep/20 sm:px-10 sm:py-12">
                {/* biome-ignore-start lint/a11y/useSemanticElements: This rich-text WYSIWYG surface needs contenteditable; a textarea would show raw HTML. */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncEditor}
                  onPaste={(event) => void handlePaste(event)}
                  onDrop={(event) => void handleDrop(event)}
                  role="textbox"
                  aria-multiline="true"
                  tabIndex={0}
                  className="crm-blog-editor min-h-[62vh] outline-none"
                  aria-label="Blog post body editor"
                />
                {/* biome-ignore-end lint/a11y/useSemanticElements: End contenteditable rich-text surface exception. */}
              </div>
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-cream/12 bg-oxblood-deep px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-h-5 text-sm text-cream-muted">
                {message || "Paste or drop images directly into the editor."}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {post ? (
                  <button
                    type="button"
                    onClick={() => void removePost()}
                    disabled={busy}
                    className="inline-flex items-center gap-2 border border-destructive/50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-destructive disabled:opacity-50"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void save("draft")}
                  disabled={busy}
                  className="inline-flex items-center gap-2 border border-cream/20 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:border-brass hover:text-brass disabled:opacity-50"
                >
                  <Save className="size-4" aria-hidden="true" />
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => void save("published")}
                  disabled={busy}
                  className="inline-flex items-center gap-2 bg-brass px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-oxblood-deep transition-colors hover:bg-brass-bright disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Send className="size-4" aria-hidden="true" />
                  )}
                  Publish
                </button>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
}

export function BlogEditor({ posts, usesBlobStorage }: BlogEditorProps) {
  const [query, setQuery] = React.useState("");
  const [editingPost, setEditingPost] = React.useState<BlogPost | null>(null);
  const [composerOpen, setComposerOpen] = React.useState(false);
  const filteredPosts = posts.filter((post) => {
    const haystack =
      `${post.title} ${post.excerpt} ${post.category}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const publishedCount = posts.filter(
    (post) => post.status === "published",
  ).length;
  const draftCount = posts.filter((post) => post.status === "draft").length;

  function openNewComposer() {
    setEditingPost(null);
    setComposerOpen(true);
  }

  function openEditComposer(post: BlogPost) {
    setEditingPost(post);
    setComposerOpen(true);
  }

  return (
    <section className="mt-10 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Blog
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            WYSIWYG editor
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Publish preparation insights with formatted headings, lists, links,
            cover images, and inline media. Public cards update on the home page
            and news page after publishing.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewComposer}
          className="inline-flex w-fit items-center gap-2 bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
        >
          <Plus className="size-4" aria-hidden="true" />
          New post
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-parchment-deep p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Published
          </p>
          <p className="mt-2 font-display text-3xl text-oxblood">
            {publishedCount}
          </p>
        </div>
        <div className="border border-line bg-parchment-deep p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Drafts
          </p>
          <p className="mt-2 font-display text-3xl text-oxblood">
            {draftCount}
          </p>
        </div>
        <div className="border border-line bg-parchment-deep p-4">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Media storage
          </p>
          <p className="mt-2 font-display text-3xl text-oxblood">
            {usesBlobStorage ? "Blob" : "Local"}
          </p>
        </div>
      </div>

      <label className="mt-6 flex max-w-xl items-center gap-3 border border-line-strong bg-parchment-deep px-4 py-3">
        <Search className="size-4 text-ink-soft" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search blog posts"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </label>

      <div className="mt-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <BlogPostRow
              key={post.id}
              post={post}
              onEdit={() => openEditComposer(post)}
            />
          ))
        ) : (
          <div className="border-t border-line py-12 text-center">
            <h3 className="font-display text-3xl text-oxblood">
              No blog posts yet
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              Create the first preparation insight, publish it, and it will feed
              the public insight cards.
            </p>
          </div>
        )}
      </div>

      {composerOpen ? (
        <BlogComposer
          key={editingPost?.id ?? "new-post"}
          post={editingPost}
          allPosts={posts}
          usesBlobStorage={usesBlobStorage}
          onClose={() => setComposerOpen(false)}
        />
      ) : null}
    </section>
  );
}
