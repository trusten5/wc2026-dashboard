import { useState, useEffect, useCallback } from 'react'

// Generic fetch hook with polling
export function useFetch(fetchFn, deps = [], intervalMs = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const result = await fetchFn()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    setLoading(true)
    load()
    if (intervalMs) {
      const id = setInterval(load, intervalMs)
      return () => clearInterval(id)
    }
  }, [load])

  return { data, loading, error, refetch: load }
}
