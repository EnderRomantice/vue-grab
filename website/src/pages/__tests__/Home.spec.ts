import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../Home.vue'

describe('Home.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(Home)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders the Vue Grab logo', () => {
    const logo = wrapper.find('img[alt="Vue Grab"]')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('src')).toContain('vue-grab.svg')
  })

  it('renders the main heading with correct text', () => {
    const heading = wrapper.find('h1')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Vue Grab')
    expect(heading.classes()).toContain('pixel-font')
    expect(heading.classes()).toContain('text-3xl')
    expect(heading.classes()).toContain('tracking-widest')
    expect(heading.classes()).toContain('text-vueGreen')
  })

  it('renders the instruction text', () => {
    const paragraph = wrapper.find('p')
    expect(paragraph.exists()).toBe(true)
    expect(paragraph.text()).toBe('Use Ctrl to select and input prompts')
  })

  it('renders GitHub and npm badges', () => {
    const badges = wrapper.findAll('img')
    expect(badges.length).toBe(3) // Logo + 2 badges
    
    const githubBadge = wrapper.find('img[alt="GitHub Stars"]')
    expect(githubBadge.exists()).toBe(true)
    expect(githubBadge.attributes('src')).toBe('https://img.shields.io/github/stars/EnderRomantice/vue-grab.svg?style=social')
    
    const npmBadge = wrapper.find('img[alt="npm downloads"]')
    expect(npmBadge.exists()).toBe(true)
    expect(npmBadge.attributes('src')).toBe('https://img.shields.io/npm/d18m/@ender_romantice/vue-grab.svg')
  })

  it('has fade-item-home elements with data-i attributes', () => {
    const fadeItems = wrapper.findAll('.fade-item-home')
    expect(fadeItems.length).toBe(2)
    
    expect(fadeItems[0]?.attributes('data-i')).toBe('0')
    expect(fadeItems[1]?.attributes('data-i')).toBe('1')
  })

  it('has correct CSS classes for animation', () => {
    const fadeItems = wrapper.findAll('.fade-item-home')
    
    expect(fadeItems[0]?.classes()).toContain('text-center')
    expect(fadeItems[0]?.classes()).toContain('space-y-4')
    expect(fadeItems[0]?.classes()).toContain('transition-all')
    expect(fadeItems[0]?.classes()).toContain('duration-700')
    
    expect(fadeItems[1]?.classes()).toContain('flex')
    expect(fadeItems[1]?.classes()).toContain('justify-center')
    expect(fadeItems[1]?.classes()).toContain('gap-4')
    expect(fadeItems[1]?.classes()).toContain('mt-6')
    expect(fadeItems[1]?.classes()).toContain('transition-all')
    expect(fadeItems[1]?.classes()).toContain('duration-700')
  })
})