import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(App)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders the main navigation tabs', () => {
    const tabs = wrapper.findAll('button.pixel-tab')
    expect(tabs.length).toBe(4)
    
    const tabTexts = tabs.map(tab => tab.text())
    expect(tabTexts).toEqual(['HOME', 'ABOUT', 'BLOG', 'CONFIG'])
  })

  it('renders the vue-grab logo in header', () => {
    const logo = wrapper.find('img[alt="Vue Grab"]')
    expect(logo.exists()).toBe(true)
    expect(logo.classes()).toContain('w-10')
    expect(logo.classes()).toContain('h-10')
  })

  it('renders the vue-grab title in header', () => {
    const title = wrapper.find('.pixel-font.text-2xl')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('vue-grab')
  })

  it('shows Home component by default', () => {
    const homeComponent = wrapper.findComponent({ name: 'Home' })
    expect(homeComponent.exists()).toBe(true)
  })

  it('has correct main container classes', () => {
    const main = wrapper.find('main')
    expect(main.exists()).toBe(true)
    expect(main.classes()).toContain('retro-bg')
    expect(main.classes()).toContain('min-h-screen')
    expect(main.classes()).toContain('text-white')
    expect(main.classes()).toContain('flex')
    expect(main.classes()).toContain('flex-col')
  })

  it('has sticky header with correct classes', () => {
    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    expect(header.classes()).toContain('sticky')
    expect(header.classes()).toContain('top-0')
    expect(header.classes()).toContain('z-50')
    expect(header.classes()).toContain('bg-vueBlack')
  })

  it('renders the Vue Grab h1 element with correct structure', () => {
    const main = wrapper.find('main')
    expect(main.exists()).toBe(true)
    
    const section = main.find('section.flex-1.px-4')
    expect(section.exists()).toBe(true)
    
    const container = section.find('div.w-full.max-w-3xl')
    expect(container.exists()).toBe(true)
    
    const spaceContainer = container.find('div.space-y-5')
    expect(spaceContainer.exists()).toBe(true)
    
    const fadeItem = spaceContainer.find('div.fade-item-home.text-center')
    expect(fadeItem.exists()).toBe(true)
    
    const h1 = fadeItem.find('h1.pixel-font.text-3xl.tracking-widest.text-vueGreen')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('Vue Grab')
  })
})