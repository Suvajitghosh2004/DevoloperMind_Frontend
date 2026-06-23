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
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      CodeBlockLowlight.configure({ lowlight }),
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

  const autoSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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
      const { data } = await api.post('/admin/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
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
    if (!form.title || !form.category) { toast.error('Title and category are required'); return }
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

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-text-muted">Loading post...</div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-text-main">
          {isEdit ? 'Edit Post' : 'New Post'}
        </h1>
        <button onClick={() => navigate('/admin/posts')} className="text-text-muted hover:text-text-main text-sm">
          ← Back to Posts
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          {/* Title */}
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

          {/* Editor */}
          <div className="bg-surface border border-border-dark rounded-xl overflow-hidden">
            <div className="border-b border-border-dark px-4 py-2 flex flex-wrap items-center gap-0.5">
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold"><b>B</b></ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic"><i>I</i></ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline"><u>U</u></ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strike"><s>S</s></ToolbarBtn>
              <div className="w-px h-5 bg-border-dark mx-1" />
              {[1,2,3,4].map(level => (
                <ToolbarBtn key={level} onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
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
              <ToolbarBtn onClick={addImage} title="Image">🖼</ToolbarBtn>
              <ToolbarBtn onClick={addYoutube} title="YouTube">▶</ToolbarBtn>
              <div className="w-px h-5 bg-border-dark mx-1" />
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); autoFormat() }}
                title="Auto-format: converts short plain-text lines into H2/H3 headings. Use after pasting from Word or plain text."
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-highlight/10 text-highlight hover:bg-highlight/20 transition-colors border border-highlight/20"
              >
                ✨ Fix Format
              </button>
              <div className="w-px h-5 bg-border-dark mx-1" />
              <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo">↩</ToolbarBtn>
              <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo">↪</ToolbarBtn>
            </div>
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

        {/* Sidebar */}
        <div className="space-y-5">
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

          <div className="bg-surface border border-border-dark rounded-xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-text-main text-sm">Category & Tags</h3>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent">
                <option value="">Select category...</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="ai, langchain, tutorial"
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div className="bg-surface border border-border-dark rounded-xl p-5">
            <h3 className="font-display font-semibold text-text-main text-sm mb-4">Thumbnail</h3>
            {form.thumbnail && (
              <img src={form.thumbnail} alt="Thumbnail" className="w-full h-32 object-cover rounded-lg mb-3" />
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

          <div className="bg-surface border border-border-dark rounded-xl p-5 space-y-3">
            <h3 className="font-display font-semibold text-text-main text-sm">Series</h3>
            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Assign to Series</label>
              <select name="series" value={form.series} onChange={handleChange}
                className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent">
                <option value="">None</option>
                {seriesList.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
              </select>
            </div>
            {form.series && (
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Order in Series</label>
                <input type="number" name="seriesOrder" value={form.seriesOrder} onChange={handleChange}
                  min={1} className="w-full bg-primary border border-border-dark rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-accent" />
              </div>
            )}
          </div>

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