"use client";

import {
  Bold,
  BookOpen,
  Eye,
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
  Undo2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { saveCoursePageAction } from "@/app/crm/actions";
import type {
  CoursePage,
  CoursePageInput,
  CoursePageStatus,
} from "@/lib/crm/course-pages";

type CourseEditorProps = {
  pages: CoursePage[];
  usesBlobStorage: boolean;
};

const EMPTY_BODY =
  "<h2>What this course covers</h2><p>Write the course promise, exam focus, and preparation structure here.</p><h3>Who should join</h3><p>Add student level, medium, and batch guidance.</p>";

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

function formatDate(value: string | null) {
  if (!value) return "Not published";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClass(status: CoursePageStatus) {
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

function CoursePageRow({
  page,
  onEdit,
}: {
  page: CoursePage;
  onEdit: () => void;
}) {
  return (
    <article className="grid gap-4 border-t border-line py-5 lg:grid-cols-[8rem_1fr_auto] lg:items-center">
      <div className="relative aspect-[4/3] overflow-hidden bg-parchment-deep">
        <Image
          src={page.image}
          alt=""
          fill
          sizes="8rem"
          className="object-cover"
        />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] ${getStatusClass(page.status)}`}
          >
            {page.status}
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {page.category}
          </span>
          {page.seedKey ? (
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Seeded
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 font-display text-2xl leading-tight text-oxblood">
          {page.title}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          {page.summary}
        </p>
        <p className="mt-3 text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
          {page.status === "published" ? "Published" : "Updated"}{" "}
          {formatDate(
            page.status === "published" ? page.publishedAt : page.updatedAt,
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        {page.status === "published" ? (
          <a
            href={`/courses/${page.slug}`}
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
          <BookOpen className="size-4" aria-hidden="true" />
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

function CourseComposer({
  page,
  allPages,
  usesBlobStorage,
  onClose,
}: {
  page: CoursePage | null;
  allPages: CoursePage[];
  usesBlobStorage: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEditing = Boolean(page);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const inlineUploadRef = React.useRef<HTMLInputElement>(null);
  const coverUploadRef = React.useRef<HTMLInputElement>(null);
  const [title, setTitle] = React.useState(page?.title ?? "");
  const [slug, setSlug] = React.useState(page?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(page?.slug));
  const [summary, setSummary] = React.useState(page?.summary ?? "");
  const [category, setCategory] = React.useState(page?.category ?? "Course");
  const [audience, setAudience] = React.useState(page?.audience ?? "");
  const [exams, setExams] = React.useState(page?.exams ?? "");
  const [duration, setDuration] = React.useState(page?.duration ?? "");
  const [displayOrder, setDisplayOrder] = React.useState(
    String(page?.displayOrder ?? 100),
  );
  const [image, setImage] = React.useState(page?.image ?? "/img-reading.jpg");
  const [imageAlt, setImageAlt] = React.useState(page?.imageAlt ?? "");
  const [status, setStatus] = React.useState<CoursePageStatus>(
    page?.status ?? "draft",
  );
  const [seoTitle, setSeoTitle] = React.useState(page?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = React.useState(
    page?.seoDescription ?? "",
  );
  const [bodyHtml, setBodyHtml] = React.useState(page?.bodyHtml ?? EMPTY_BODY);
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    const initialBody = page?.bodyHtml ?? EMPTY_BODY;
    setBodyHtml(initialBody);

    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = initialBody;
      }
    });
  }, [page]);

  React.useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  function syncEditor() {
    const next = editorRef.current?.innerHTML ?? bodyHtml;
    setBodyHtml(next);
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

  function buildPayload(nextStatus = status): CoursePageInput {
    const html = syncEditor();
    const selectedSlug = slugify(slug || title);
    const duplicate = allPages.find(
      (item) => item.slug === selectedSlug && item.id !== page?.id,
    );

    return {
      seedKey: page?.seedKey ?? null,
      title,
      slug: duplicate ? "" : selectedSlug,
      summary,
      bodyHtml: html,
      category,
      audience,
      exams,
      duration,
      image,
      imageAlt,
      status: nextStatus,
      seoTitle,
      seoDescription,
      displayOrder: Number(displayOrder || 100),
    };
  }

  async function save(nextStatus = status) {
    setBusy(true);
    setMessage(nextStatus === "published" ? "Publishing..." : "Saving...");

    try {
      const result = await saveCoursePageAction(
        page?.id ?? null,
        buildPayload(nextStatus),
      );

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

  return (
    <div className="fixed inset-0 z-[90] bg-oxblood-deep text-cream">
      <div className="flex h-full flex-col">
        <header className="flex min-h-18 shrink-0 items-center justify-between border-b border-cream/12 bg-oxblood-deep px-4 py-3 sm:px-6">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-brass">
              {isEditing ? "Edit course page" : "Create course page"}
            </p>
            <h2 className="mt-1 max-w-[60vw] truncate font-display text-2xl text-cream">
              {title || "Untitled course"}
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
                  placeholder="Army foundation course"
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
                    placeholder="army"
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
                  Summary
                </span>
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={4}
                  maxLength={260}
                  className="w-full resize-none border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="Short course summary used on cards and SEO previews."
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
                    placeholder="Defence"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                    Display order
                  </span>
                  <input
                    value={displayOrder}
                    onChange={(event) => setDisplayOrder(event.target.value)}
                    type="number"
                    className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                    placeholder="10"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Audience
                </span>
                <input
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="Defence aspirants"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Exams covered
                </span>
                <input
                  value={exams}
                  onChange={(event) => setExams(event.target.value)}
                  className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="NDA, CDS, AFCAT, Agniveer"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Duration / batch note
                </span>
                <input
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="Foundation, crash, and test-series support"
                />
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
                  placeholder="/img-reading.jpg"
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

              <label className="block">
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Image alt text
                </span>
                <input
                  value={imageAlt}
                  onChange={(event) => setImageAlt(event.target.value)}
                  className="w-full border border-cream/15 bg-oxblood-deep px-3 py-2.5 text-sm text-cream outline-none transition-colors focus:border-brass"
                  placeholder="Students preparing for defence exams"
                />
              </label>

              <div>
                <span className="mb-2 block text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-cream-muted">
                  Status
                </span>
                <div className="grid grid-cols-3 border border-cream/15">
                  {(
                    ["draft", "published", "archived"] as CoursePageStatus[]
                  ).map((item) => (
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
                  ))}
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
                  aria-label="Course page body editor"
                />
                {/* biome-ignore-end lint/a11y/useSemanticElements: End contenteditable rich-text surface exception. */}
              </div>
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-cream/12 bg-oxblood-deep px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-h-5 text-sm text-cream-muted">
                {message ||
                  "Paste or drop images directly into the course body."}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {page ? (
                  <button
                    type="button"
                    onClick={() => void save("archived")}
                    disabled={busy}
                    className="inline-flex items-center gap-2 border border-cream/20 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:border-brass hover:text-brass disabled:opacity-50"
                  >
                    Archive
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

export function CourseEditor({ pages, usesBlobStorage }: CourseEditorProps) {
  const [query, setQuery] = React.useState("");
  const [editingPage, setEditingPage] = React.useState<CoursePage | null>(null);
  const [composerOpen, setComposerOpen] = React.useState(false);
  const filteredPages = pages.filter((page) => {
    const haystack =
      `${page.title} ${page.summary} ${page.category} ${page.exams ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const publishedCount = pages.filter(
    (page) => page.status === "published",
  ).length;
  const draftCount = pages.filter((page) => page.status === "draft").length;
  const seededCount = pages.filter((page) => page.seedKey).length;

  function openNewComposer() {
    setEditingPage(null);
    setComposerOpen(true);
  }

  function openEditComposer(page: CoursePage) {
    setEditingPage(page);
    setComposerOpen(true);
  }

  return (
    <section id="crm-courses" className="mt-10 bg-parchment px-5 py-7 sm:px-7">
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Courses
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none text-oxblood">
            Special course pages
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Manage public pages for Army, Navy, MPSC, UPSC, Banking, SSC, Police
            Bharti, Talathi and ZP. Published pages feed the course grid, course
            detail routes, and the home-page course links.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewComposer}
          className="inline-flex w-fit items-center gap-2 bg-oxblood px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-oxblood-bright"
        >
          <Plus className="size-4" aria-hidden="true" />
          New course
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
            Seeded tracks
          </p>
          <p className="mt-2 font-display text-3xl text-oxblood">
            {seededCount}
          </p>
        </div>
      </div>

      <label className="mt-6 flex max-w-xl items-center gap-3 border border-line-strong bg-parchment-deep px-4 py-3">
        <Search className="size-4 text-ink-soft" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search course pages"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
        />
      </label>

      <div className="mt-4">
        {filteredPages.length > 0 ? (
          filteredPages.map((page) => (
            <CoursePageRow
              key={page.id}
              page={page}
              onEdit={() => openEditComposer(page)}
            />
          ))
        ) : (
          <div className="border-t border-line py-12 text-center">
            <h3 className="font-display text-3xl text-oxblood">
              No course pages yet
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              Create a course page and publish it to make a focused public
              destination for admissions.
            </p>
          </div>
        )}
      </div>

      {composerOpen ? (
        <CourseComposer
          key={editingPage?.id ?? "new-course"}
          page={editingPage}
          allPages={pages}
          usesBlobStorage={usesBlobStorage}
          onClose={() => setComposerOpen(false)}
        />
      ) : null}
    </section>
  );
}
