/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const translations = {
  km: {
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    orders: 'ការបញ្ជាទិញ',
    products: 'ទំនិញក្នុងស្តុក',
    categories: 'ប្រភេទមុខទំនិញ',
    brands: 'ម៉ាកយីហោ',
    users: 'អ្នកប្រើប្រាស់',
    reports: 'របាយការណ៍លក់',
    settings: 'ការកំណត់',
    logout: 'ចាកចេញ',
    notifications: 'ការជូនដំណឹង',
    searchPlaceholder: 'ស្វែងរកទំនិញ, ការបញ្ជាទិញ...',
    markAllRead: 'អានទាំងអស់',
    viewAllOrders: 'មើលការបញ្ជាទិញទាំងអស់ →',
    newBadge: 'ថ្មី',
    darkMode: 'រចនាបថងងឹត',
    lightMode: 'រចនាបថពន្លឺ',
    language: 'ភាសា',
    all: 'ទាំងអស់',
    active: 'សកម្ម',
    inactive: 'អសកម្ម',
    confirmed: 'បានបញ្ជាក់',
    paid: 'បានទូទាត់',
    pending: 'រង់ចាំ',
    failed: 'បរាជ័យ',
    copyright: '© 2026 MINI STORE. រក្សាសិទ្ធិគ្រប់យ៉ាង។',
  },
  en: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    products: 'Products',
    categories: 'Categories',
    brands: 'Brands',
    users: 'Users',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    notifications: 'Notifications',
    searchPlaceholder: 'Search products, orders...',
    markAllRead: 'Mark all as read',
    viewAllOrders: 'View all orders →',
    newBadge: 'New',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    all: 'All',
    active: 'Active',
    inactive: 'Inactive',
    confirmed: 'Confirmed',
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
    copyright: '© 2026 MINI STORE. All rights reserved.',
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'km'
  })

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = (key, fallback = '') => {
    return translations[lang]?.[key] || fallback || key
  }

  const toggleLang = () => {
    setLang((prev) => (prev === 'km' ? 'en' : 'km'))
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return { lang: 'km', setLang: () => {}, toggleLang: () => {}, t: (k, fb) => fb || k }
  }
  return context
}
