import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import yaml from 'js-yaml'
import CollectionViewer from './CollectionViewer'

function CollectionList() {
  const [collections, setCollections] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/registry/registry.yml')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load registry')
        }
        return response.text()
      })
      .then(text => {
        const data = yaml.load(text)
        const cols = data.collections || []
        setCollections(cols)
        setFilteredCollections(cols)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCollections(collections)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = collections.filter(collection => 
        collection.name.toLowerCase().includes(query) ||
        collection.full_name.toLowerCase().includes(query) ||
        (collection.description && collection.description.toLowerCase().includes(query))
      )
      setFilteredCollections(filtered)
    }
  }, [searchQuery, collections])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading collections...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/opencollection-logo.svg" 
                alt="OpenCollection" 
                className="h-16"
              />
            </div>
            <p className="text-base text-gray-600 mb-6">
              Discover and explore API collections
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Collections List */}
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base">No collections found</p>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base">No collections match your search</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collection
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCollections.map((collection) => (
                      <tr 
                        key={collection.full_name} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/collection/${collection.name}`}
                      >
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {collection.name}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="text-sm text-gray-700">
                            {collection.description}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700">
                            latest
                            <svg
                              className="ml-1 w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <span>OpenCollection is a community-driven initiative by</span>
            <a href="https://www.usebruno.com" className="text-yellow-600" target="_blank" rel="noopener noreferrer">&nbsp;Bruno</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CollectionList />} />
        <Route path="/collection/:collectionName" element={<CollectionViewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
