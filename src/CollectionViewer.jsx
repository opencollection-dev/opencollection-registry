import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

function CollectionViewer() {
  const { collectionName } = useParams()
  const viewerRef = useRef(null)
  const ocInstanceRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState('Initializing...')

  useEffect(() => {
    let mounted = true

    const loadCollection = async () => {
      console.log('CollectionViewer: Starting to load collection:', collectionName)
      
      if (!viewerRef.current) {
        console.log('CollectionViewer: viewerRef not ready yet')
        return
      }

      setLoading(true)
      setError(null)
      setLoadingMessage('Loading OpenCollection library...')

      // Wait for OpenCollection to be available
      let attempts = 0
      while (!window.OpenCollection && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (!window.OpenCollection) {
        console.error('CollectionViewer: OpenCollection library not available')
        if (mounted) {
          setError('OpenCollection library failed to load. Please refresh the page.')
          setLoading(false)
        }
        return
      }

      console.log('CollectionViewer: OpenCollection library loaded')

      // Clear previous instance
      if (ocInstanceRef.current && viewerRef.current) {
        viewerRef.current.innerHTML = ''
      }

      try {
        // Fetch the collection JSON
        setLoadingMessage(`Loading ${collectionName} collection...`)
        const collectionPath = `/registry/dist/${collectionName}/latest/opencollection.json`
        console.log('CollectionViewer: Fetching collection from:', collectionPath)
        
        const response = await fetch(collectionPath)
        
        if (!response.ok) {
          throw new Error(`Collection "${collectionName}" not found`)
        }
        
        const collectionData = await response.json()
        console.log('CollectionViewer: Collection data loaded:', collectionData)
        
        if (!mounted) return

        setLoadingMessage('Rendering collection...')
        
        if (viewerRef.current) {
          console.log('CollectionViewer: Initializing OpenCollection viewer')
          ocInstanceRef.current = new window.OpenCollection({
            target: viewerRef.current,
            opencollection: collectionData,
            theme: 'light'
          })
          console.log('CollectionViewer: OpenCollection viewer initialized')
        }
        
        setLoading(false)
      } catch (err) {
        console.error('CollectionViewer: Failed to load collection:', err)
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    loadCollection()

    // Cleanup on unmount
    return () => {
      mounted = false
      if (viewerRef.current) {
        viewerRef.current.innerHTML = ''
      }
      ocInstanceRef.current = null
    }
  }, [collectionName])

  return (
    <div className="min-h-screen flex flex-col" style={{ height: '100vh' }}>
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg
            className="mr-2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Registry
        </Link>
      </div>

      {/* OpenCollection Viewer */}
      <div className="flex-1 overflow-hidden relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-2">Loading collection...</div>
              <div className="text-sm text-gray-500">{loadingMessage}</div>
            </div>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-4">Error: {error}</div>
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Return to collection list
              </Link>
            </div>
          </div>
        )}
        
        {/* Viewer Container - Always rendered so ref is available */}
        <div ref={viewerRef} className="w-full h-full" />
      </div>
    </div>
  )
}

export default CollectionViewer

