import { useState } from 'react'
import type {
  SchoolFormData,
  School,
  SchoolsResponse,
  CreateSchoolResponse,
  UpdateSchoolResponse,
} from '@/types/school'

interface UseSchoolReturn {
  isLoading: boolean
  error: string | null
  success: boolean
  createSchool: (data: SchoolFormData) => Promise<CreateSchoolResponse>
  updateSchool: (id: string, data: Partial<SchoolFormData>) => Promise<UpdateSchoolResponse>
  deleteSchool: (id: string) => Promise<void>
  getSchool: (id: string) => Promise<School | null>
  getSchools: (page?: number, limit?: number, search?: string) => Promise<SchoolsResponse | null>
  clearError: () => void
  clearSuccess: () => void
}

export function useSchool(): UseSchoolReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const clearError = () => setError(null)
  const clearSuccess = () => setSuccess(false)

  const createSchool = async (data: SchoolFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validações
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (!data.agreeToTerms) {
        throw new Error('You must agree to the terms and conditions')
      }

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register school')
      }

      setSuccess(true)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register school'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateSchool = async (id: string, data: Partial<SchoolFormData>) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update school')
      }

      setSuccess(true)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update school'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSchool = async (id: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/schools/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete school')
      }

      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete school'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getSchool = async (id: string): Promise<School | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/schools/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch school')
      }

      const school = await response.json()
      return school
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch school'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const getSchools = async (page = 1, limit = 10, search = '') => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      })

      const response = await fetch(`/api/schools?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch schools')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch schools'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    success,
    createSchool,
    updateSchool,
    deleteSchool,
    getSchool,
    getSchools,
    clearError,
    clearSuccess,
  }
}
