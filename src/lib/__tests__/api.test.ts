import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../api'

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Session Management', () => {
    it('should store and retrieve access token', () => {
      api.setSession({ access: 'test-access', refresh: 'test-refresh' })
      expect(api.getAccessToken()).toBe('test-access')
      
      api.clearSession()
      expect(api.getAccessToken()).toBeNull()
    })

    it('should store and retrieve user data', () => {
      const user = { email: 'test@example.com', name: 'Test User' }
      api.setSession({ access: 'token', refresh: 'refresh' }, user)
      
      const retrieved = api.getUser()
      expect(retrieved?.email).toBe('test@example.com')
      
      api.clearSession()
      expect(api.getUser()).toBeNull()
    })
  })

  describe('API Functions', () => {
    it('should have login function', () => {
      expect(typeof api.login).toBe('function')
    })

    it('should have register function', () => {
      expect(typeof api.register).toBe('function')
    })

    it('should have getCountries function', () => {
      expect(typeof api.getCountries).toBe('function')
    })

    it('should have getBanks function', () => {
      expect(typeof api.getBanks).toBe('function')
    })

    it('should have getAccounts function', () => {
      expect(typeof api.getAccounts).toBe('function')
    })

    it('should have getTransactions function', () => {
      expect(typeof api.getTransactions).toBe('function')
    })

    it('should have getCart function', () => {
      expect(typeof api.getCart).toBe('function')
    })

    it('should have addToCart function', () => {
      expect(typeof api.addToCart).toBe('function')
    })

    it('should have getOrders function', () => {
      expect(typeof api.getOrders).toBe('function')
    })

    it('should have createOrder function', () => {
      expect(typeof api.createOrder).toBe('function')
    })
  })
})
