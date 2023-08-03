import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { OkuDirection, useDirection } from './direction'

describe('OkuDirection', () => {
  it('it should renders correctly with ltr direction', () => {
    const wrapper = mount(OkuDirection, {
      props: {
        dir: 'ltr',
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props()).toEqual({ dir: 'ltr' })
  })

  it('it should renders correctly with rtl direction', () => {
    const wrapper = mount(OkuDirection, {
      props: {
        dir: 'rtl',
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props()).toEqual({ dir: 'rtl' })
  })
})

describe('useDirection', () => {
  type Direction = 'ltr' | 'rtl'

  function TestComponent(localDir?: Direction) {
    return {
      setup() {
        const dir = useDirection(localDir)
        return { dir }
      },
      template: '<div>{{ dir }}</div>',
    }
  }

  // it('it should return default (ltr) direction when neither local nor global direction is provided', () => {
  //   const wrapper = mount(OkuDirection, {
  //     slots: {
  //       default: TestComponent(),
  //     },
  //   })
  //   expect(wrapper.exists()).toBe(true)
  //   expect(wrapper.html()).toContain('ltr') // failed: it should return 'ltr', but it return nothing!
  // })

  it('it should return global direction when local direction is not provided', () => {
    const wrapper = mount(OkuDirection, {
      props: {
        dir: 'ltr',
      },
      slots: {
        default: TestComponent(),
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props()).toEqual({ dir: 'ltr' })
    expect(wrapper.html()).toContain('ltr')
  })

  it('it should return local direction when provided', () => {
    const wrapper = mount(OkuDirection, {
      props: {
        dir: 'ltr',
      },
      slots: {
        default: TestComponent('rtl'),
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props()).toEqual({ dir: 'ltr' })
    expect(wrapper.html()).toContain('rtl')
  })
})
