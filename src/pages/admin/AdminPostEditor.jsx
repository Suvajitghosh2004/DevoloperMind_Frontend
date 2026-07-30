import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import typescript from 'highlight.js/lib/languages/typescript'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const lowlight = createLowlight()
lowlight.register('javascript', javascript)
lowlight.register('python', python)
lowlight.register('bash', bash)
lowlight.register('typescript', typescript)

const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button type="button" onMouseDown={e => { e.preventDefault(); onClick() }}
    title={title}
    className={`p-1.5 rounded text-sm transition-colors ${active ? 'bg-accent text-white' : 'text-text-muted hover:text-text-main hover:bg-surface'}`}>
    {children}
  </button>
)

export default function AdminPostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [categories, setCategories] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [thumbUploading, setThumbUploading] = useState(false)

  // HTML paste modal state
  const [showHtmlModal, setShowHtmlModal] = useState(false)
  const [rawHtml, setRawHtml] = useState('')

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', thumbnail: '', category: '',
    tags: '', status: 'draft', metaTitle: '', metaDescription: '',
    focusKeyword: '', isAIAssisted: false, series: '', seriesOrder: '',
    codeLanguage: 'javascript'
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      Youtube.configure({ controls: true }),
      Placeholder.configure({ placeholder: 'Start writing your article... or click "Paste HTML" to import HTML code.' }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    editorProps: {
      attributes: { class: 'min-h-96 focus:outline-none' }
    }
  })

  useEffect(() => {
    api.get('/admin/categories').then(r => setCategories(r.data.categories)).catch(() => {})
    api.get('/admin/series').then(r => setSeriesList(r.data.series)).catch(() => {})
    if (isEdit) {
      setLoading(true)
      api.get(`/admin/posts/${id}`)
        .then(r => {
          const post = r.data.post
          setForm({
            title: post.title || '', slug: post.slug || '', excerpt: post.excerpt || '',
            thumbnail: post.thumbnail || '', category: post.category?._id || post.category || '',
            tags: (post.tags || []).join(', '), status: post.status || 'draft',
            metaTitle: post.metaTitle || '', metaDescription: post.metaDescription || '',
            focusKeyword: post.focusKeyword || '', isAIAssisted: !!post.isAIAssisted,
            series: post.series?._id || post.series || '',
            seriesOrder: post.seriesOrder || '', codeLanguage: post.codeLanguage || 'javascript'
          })
          if (editor && post.content) editor.commands.setContent(post.content)
        })
        .finally(() => setLoading(false))
    }
  }, [id, editor])

  const autoSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => {
      const updated = { ...f, [name]: type === 'checkbox' ? checked : value }
      if (name === 'title' && !isEdit) updated.slug = autoSlug(value)
      return updated
    })
  }

  const uploadThumbnail = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setThumbUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const { data } = await api.post('/admin/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(f => ({ ...f, thumbnail: data.url }))
      toast.success('Thumbnail uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setThumbUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category) {
      toast.error('Title and category are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        content: editor?.getHTML() || '',
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        seriesOrder: form.seriesOrder ? Number(form.seriesOrder) : undefined,
        series: form.series || undefined,
      }
      if (isEdit) {
        await api.put(`/admin/posts/${id}`, payload)
        toast.success('Post updated!')
      } else {
        await api.post('/admin/posts', payload)
        toast.success('Post created!')
        navigate('/admin/posts')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const addImage = () => {
    const url = prompt('Image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addYoutube = () => {
    const url = prompt('YouTube URL:')
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  // Auto-format: detect short paragraph lines as headings / bullet lines as lists
  const autoFormat = () => {
    if (!editor) return
    const html = editor.getHTML()
    const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/g) || []
    if (paragraphs.length === 0) return

    let result = html
    paragraphs.forEach((block, i) => {
      const inner = block.replace(/<p[^>]*>([\s\S]*?)<\/p>/, '$1').replace(/<[^>]+>/g, '').trim()
      if (!inner) return
      const wordCount = inner.split(/\s+/).length
      const endsWithPeriod = /[.!?]$/.test(inner)
      const looksLikeBullet = /^[-•*]\s/.test(inner)

      if (looksLikeBullet) {
        const text = inner.replace(/^[-•*]\s+/, '')
        result = result.replace(block, `<ul><li><p>${text}</p></li></ul>`)
      } else if (!endsWithPeriod && !looksLikeBullet && i > 0 && wordCount <= 5) {
        result = result.replace(block, `<h3>${inner}</h3>`)
      } else if (!endsWithPeriod && !looksLikeBullet && i > 0 && wordCount <= 10) {
        result = result.replace(block, `<h2>${inner}</h2>`)
      }
    })

    if (result !== html) {
      editor.commands.setContent(result)
      toast.success('Formatting applied! Review headings and adjust if needed.')
    } else {
      toast('No plain-text headings detected.', { icon: 'ℹ️' })
    }
  }

  // Import raw HTML into TipTap as rendered content.
  // Handles both full HTML documents (<!DOCTYPE html>...) and plain fragments (<h2>...</h2>).
  const importHtml = () => {
    if (!rawHtml.trim()) {
      toast.error('Paste some HTML first')
      return
    }
    if (!editor) return

    let content = rawHtml.trim()

    // If it's a full HTML document, extract only the <body> inner content
    // so TipTap doesn't try to parse <head>, <style>, <meta> etc.
    if (/<html[\s>]/i.test(content) || /<!DOCTYPE/i.test(content)) {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        content = bodyMatch[1].trim()
      } else {
        // No <body> found — strip <head> block and use whatever's left
        content = content
          .replace(/<head[\s\S]*?<\/head>/gi, '')
          .replace(/<\/?html[^>]*>/gi, '')
          .replace(/<\/?body[^>]*>/gi, '')
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .trim()
      }
    }

    // Strip <style> and <script> blocks from the extracted content
    // (TipTap can't render them and they pollute the output)
    content = content
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .trim()

    if (!content) {
      toast.error('No renderable content found in the HTML')
      return
    }

    editor.commands.setContent(content)
    setRawHtml('')
    setShowHtmlModal(false)
    toast.success('HTML imported into editor!')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-text-muted">Loading post...</div>
  )

  return (
    <div>
      {/* HTML Paste Modal */}
      {showHtmlModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-dark rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark">
              <div>
                <h2 className="font-display font-bold text-text-main text-lg">Paste HTML Code</h2>
                <p className="text-text-muted text-xs mt-0.5">
                  Paste your raw HTML here. It will be imported into the editor as rendered content.
                </p>
              </div>
              <button onClick={() => { setShowHtmlModal(false); setRawHtml('') }}
                className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <div className="flex-1 overflow-auto p-4">
              <textarea
                value={rawHtml}
                onChange={e => setRawHtml(e.target.value)}
                placeholder={`Paste your HTML here, e.g:\n<h2>Introduction</h2>\n<p>Your content here...</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>`}
                className="w-full h-80 bg-primary border border-border-dark rounded-xl p-4 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent font-mono resize-none"
                autoFocus
              />
            </div>

            {/* Preview — shows extracted body content, not raw full-doc HTML */}
            {rawHtml.trim() && (() => {
              let preview = rawHtml.trim()
              if (/<html[\s>]/i.test(preview) || /<!DOCTYPE/i.test(preview)) {
                const m = preview.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
                preview = m ? m[1] : preview.replace(/<head[\s\S]*?<\/head>/gi, '').replace(/<\/?html[^>]*>/gi, '').replace(/<\/?body[^>]*>/gi, '').replace(/<!DOCTYPE[^>]*>/gi, '')
              }
              preview = preview.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<script[\s\S]*?<\/script>/gi, '').trim()
              return preview ? (
                <div className="mx-4 mb-4 border border-border-dark rounded-xl overflow-hidden">
                  <p className="text-xs text-text-muted px-3 py-1.5 bg-primary border-b border-border-dark">
                    Preview (what will be imported)
                  </p>
                  <div
                    className="prose-dark p-4 max-h-48 overflow-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: preview }}
                  />
                </div>
              ) : null
            })()}

            {/* Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-dark">
              <p className="text-text-muted text-xs">
                This will <span className="text-yellow-400 font-medium">replace</span> current editor content.
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setShowHtmlModal(false); setRawHtml('') }}
                  className="px-4 py-2 bg-primary border border-border-dark rounded-lg text-sm text-text-muted hover:text-text-main transition-colors">
                  Cancel
                </button>
                <button onClick={importHtml}
                  className="px-5 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-medium transition-colors">
                  Import into Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-text-main">
          {isEdit ? 'Edit Post' : 'New Post'}
        </h1>
        <button onClick={() => navigate('/admin/posts')}
          className="text-text-muted hover:text-text-main text-sm transition-colors">
          ← Back to Posts
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main editor column */}
        <div className="xl:col-span-2 space-y-5">

          {/* Title + slug */}
          <div className="bg-surface border border-border-dark rounded-xl p-5">
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Post title..." required
              className="w-full bg-transparent text-2xl font-display font-bold text-text-main placeholder:text-text-muted/50 focus:outline-none" />
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-dark">
              <span className="text-xs text-text-muted">Slug:</span>
              <input name="slug" value={form.slug} onChange={handleChange}
                className="flex-1 bg-primary border border-border-dark rounded px-2 py-1 text-xs text-text-muted focus:outline-none focus:border-accent font-mono" />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-surface border border-border-dark rounded-xl p-5">
            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">Excerpt</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange}
              placeholder="Short description of the article (max 300 chars)..." maxLength={300} rows={2}
              className="w-full bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none resize-none" />
          </div>

          {/* Rich Text Editor */}
          <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-border-dark px-3 py-2 flex flex-wrap items-center gap-0.5">
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold"><b>B</b></ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic"><i>I</i></ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline"><u>U</u></ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strike"><s>S</s></ToolbarBtn>
              <div className="w-px h-5 bg-border-dark mx-1" />
              {[1,2,3,4].map(level => (
                <ToolbarBtn key={level}
                  onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
                  active={editor?.isActive('heading', { level })} title={`H${level}`}>
                  <span className="font-bold text-xs">H{level}</span>
                </ToolbarBtn>
              ))}
              <div className="w-px h-5 bg-border-dark mx-1" />
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">•–</ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Ordered list">1.</ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Blockquote">"</ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline code">{`</>`}</ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code block">```</ToolbarBtn>
              <div className="w-px h-5 bg-border-dark mx-1" />
              <ToolbarBtn onClick={addImage} title="Insert image">🖼</ToolbarBtn>
              <ToolbarBtn onClick={addYoutube} title="Embed YouTube">▶</ToolbarBtn>
              <div className="w-px h-5 bg-border-dark mx-1" />

              {/* ── Paste HTML button ── */}
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); setShowHtmlModal(true) }}
                title="Import raw HTML code into the editor as rendered content"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/30"
              >
                {'</>'}  Paste HTML
              </button>

              <div className="w-px h-5 bg-border-dark mx-1" />

              {/* ── Fix Format button ── */}
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); autoFormat() }}
                title="Auto-format: converts short plain-text lines into H2/H3 headings"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-highlight/10 text-highlight hover:bg-highlight/20 transition-colors border border-highlight/20"
              >
                ✨ Fix Format
              </button>

              <div className="w-px h-5 bg-border-dark mx-1" />
              <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">↩</ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">↪</ToolbarBtn>
            </div>

            {/* Editor body */}
            <div className="p-5 min-h-96">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-surface border border-border-dark rounded-xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-text-main text-sm">SEO Settings</h3>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Meta Title</label>
              <input name="metaTitle" value={form.metaTitle} onChange={handleChange}
                placeholder="Leave blank to use post title"
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Meta Description</label>
              <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange}
                placeholder="Brief description for search engines..." rows={2}
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent resize-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Focus Keyword</label>
              <input name="focusKeyword" value={form.focusKeyword} onChange={handleChange}
                placeholder="e.g. langchain tutorial"
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-5">

          {/* Publish */}
          <div className="bg-surface border border-border-dark rounded-xl p-5">
            <h3 className="font-display font-semibold text-text-main text-sm mb-4">Publish</h3>
            <div className="mb-4">
              <label className="text-xs text-text-muted mb-1.5 block">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mb-5">
              <input type="checkbox" id="isAIAssisted" name="isAIAssisted"
                checked={form.isAIAssisted} onChange={handleChange}
                className="w-4 h-4 accent-accent" />
              <label htmlFor="isAIAssisted" className="text-sm text-text-muted cursor-pointer">
                AI-Assisted content
              </label>
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-accent hover:bg-accent/80 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Update Post' : 'Publish'}
            </button>
          </div>

          {/* Category & Tags */}
          <div className="bg-surface border border-border-dark rounded-xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-text-main text-sm">Category & Tags</h3>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent">
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="ai, langchain, tutorial"
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent" />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-surface border border-border-dark rounded-xl p-5">
            <h3 className="font-display font-semibold text-text-main text-sm mb-4">Thumbnail</h3>
            {form.thumbnail && (
              <img src={form.thumbnail} alt="Thumbnail"
                className="w-full h-32 object-cover rounded-lg mb-3" />
            )}
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={uploadThumbnail} className="hidden" />
              <span className="block text-center py-2 px-4 bg-primary border border-dashed border-border-dark rounded-lg text-sm text-text-muted hover:border-accent hover:text-accent transition-colors">
                {thumbUploading ? 'Uploading...' : '+ Upload Thumbnail'}
              </span>
            </label>
            {form.thumbnail && (
              <input name="thumbnail" value={form.thumbnail} onChange={handleChange}
                placeholder="Or paste image URL"
                className="w-full mt-2 bg-primary border border-border-dark rounded-lg py-1.5 px-2 text-xs text-text-muted focus:outline-none focus:border-accent font-mono" />
            )}
          </div>

          {/* Series */}
          <div className="bg-surface border border-border-dark rounded-xl p-5 space-y-3">
            <h3 className="font-display font-semibold text-text-main text-sm">Series</h3>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Assign to Series</label>
              <select name="series" value={form.series} onChange={handleChange}
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent">
                <option value="">None</option>
                {seriesList.map(s => (
                  <option key={s._id} value={s._id}>{s.title}</option>
                ))}
              </select>
            </div>
            {form.series && (
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Order in Series</label>
                <input type="number" name="seriesOrder" value={form.seriesOrder}
                  onChange={handleChange} min={1}
                  className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
              </div>
            )}
          </div>

          {/* Default code language */}
          <div className="bg-surface border border-border-dark rounded-xl p-5">
            <label className="text-xs text-text-muted mb-1.5 block">Default Code Language</label>
            <select name="codeLanguage" value={form.codeLanguage} onChange={handleChange}
              className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent">
              {['javascript','typescript','python','bash','html','css','json','rust','go','sql'].map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  )
}