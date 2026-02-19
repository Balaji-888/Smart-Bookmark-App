'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

interface Bookmark {
  id: string
  title: string
  url: string
  tags: string[]
  is_favorite: boolean
  notes: string
  user_id: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let channel: any

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/')
        return
      }

      setUserEmail(session.user.email ?? null)

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setBookmarks(data)

      channel = supabase
        .channel('realtime-bookmarks')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => [payload.new as Bookmark, ...prev])
            }

            if (payload.eventType === 'DELETE') {
              setBookmarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id)
              )
            }

            if (payload.eventType === 'UPDATE') {
              setBookmarks((prev) =>
                prev.map((b) =>
                  b.id === payload.new.id ? (payload.new as Bookmark) : b
                )
              )
            }
          }
        )
        .subscribe()
    }

    setup()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [router])

  const addBookmark = async () => {
    if (!title || !url) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('bookmarks').insert([
      {
        title,
        url,
        user_id: user.id,
        tags: [],
        is_favorite: false,
        notes: ''
      }
    ])

    if (error) {
      console.error(error)
      return
    }

    setTitle('')
    setUrl('')
  }

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) console.error(error)
  }

  const toggleFavorite = async (bookmark: Bookmark) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .update({ is_favorite: !bookmark.is_favorite })
      .eq('id', bookmark.id)
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === bookmark.id ? (data as Bookmark) : b
      )
    )
  }

  const editNotes = async (bookmark: Bookmark) => {
    const newNotes = prompt('Edit notes:', bookmark.notes ?? '')
    if (newNotes === null) return

    const { data, error } = await supabase
      .from('bookmarks')
      .update({ notes: newNotes })
      .eq('id', bookmark.id)
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === bookmark.id ? (data as Bookmark) : b
      )
    )
  }

  const addTag = async (bookmark: Bookmark) => {
    const newTag = prompt('Add a tag:')
    if (!newTag) return

    const updatedTags = [...(bookmark.tags ?? []), newTag]

    const { data, error } = await supabase
      .from('bookmarks')
      .update({ tags: updatedTags })
      .eq('id', bookmark.id)
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    setBookmarks((prev) =>
      prev.map((b) =>
        b.id === bookmark.id ? (data as Bookmark) : b
      )
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // 🔥 SMART SEARCH FILTER
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (!searchTerm) return true

    const term = searchTerm.toLowerCase()

    const inTitle = bookmark.title?.toLowerCase().includes(term)
    const inUrl = bookmark.url?.toLowerCase().includes(term)
    const inNotes = bookmark.notes?.toLowerCase().includes(term)
    const inTags = bookmark.tags?.some(tag =>
      tag.toLowerCase().includes(term)
    )

    return inTitle || inUrl || inNotes || inTags
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex justify-center items-start py-14 px-4">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Smart Bookmark
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Logged in as {userEmail}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition shadow-md font-medium"
          >
            Logout
          </button>
        </div>

        {/* 🔎 SEARCH BAR */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by title, URL, tags, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-white placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-gray-500 hover:underline mt-2"
            >
              Clear search
            </button>
          )}
        </div>

        {/* ADD BOOKMARK */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-inner mb-10 border border-indigo-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Add New Bookmark
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Bookmark Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-white placeholder-gray-400"
            />

            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-white placeholder-gray-400"
            />

            <button
              onClick={addBookmark}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:scale-105 transition transform font-semibold shadow-lg"
            >
              Add
            </button>
          </div>
        </div>

        {/* BOOKMARK LIST */}
        <div className="space-y-6">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {bookmark.title}
                  </h3>

                  <a
                    href={bookmark.url}
                    target="_blank"
                    className="text-indigo-600 text-sm hover:underline break-all"
                  >
                    {bookmark.url}
                  </a>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleFavorite(bookmark)}
                    className="text-2xl"
                  >
                    {bookmark.is_favorite ? '⭐' : '☆'}
                  </button>

                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition shadow-md text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {bookmark.notes && bookmark.notes.trim() !== '' ? (
                  <div className="bg-gray-50 border rounded-xl p-3 text-sm text-gray-600">
                    {bookmark.notes}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    No notes added
                  </p>
                )}

                <button
                  onClick={() => editNotes(bookmark)}
                  className="text-indigo-500 text-sm hover:underline mt-2"
                >
                  Edit Notes
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {bookmark.tags && bookmark.tags.length > 0 ? (
                  bookmark.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm italic">
                    No tags
                  </span>
                )}
              </div>

              <button
                onClick={() => addTag(bookmark)}
                className="text-indigo-500 text-sm hover:underline mt-2"
              >
                + Add Tag
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
