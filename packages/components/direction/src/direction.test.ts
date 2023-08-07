import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { DirectionProvider, useDirection } from './Direction'
import type { Direction } from './Direction'

describe('OkuDirection', () => {
  it('should renders correctly with ltr direction', () => {
    const wrapper = mount(DirectionProvider, {
      props: {
        dir: 'ltr',
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props()).toEqual({ dir: 'ltr' })
  })

  it('should renders correctly with rtl direction', () => {
    const wrapper = mount(DirectionProvider, {
      props: {
        dir: 'rtl',
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props()).toEqual({ dir: 'rtl' })
  })
})

describe('useDirection', () => {
  let wrapper: VueWrapper
  let _TestComponent: any
  let globalDir: Direction
  let localDir: Direction

  const TestComponent = (localDir?: Direction) => {
    return {
      setup() {
        const dir = useDirection(localDir)
        return { dir }
      },
      template: '<div :dir="dir"></div>',
    }
  }

  beforeEach(() => {
    globalDir = 'ltr'
    localDir = 'rtl'

    _TestComponent = TestComponent()

    wrapper = mount(DirectionProvider, {
      props: {
        dir: globalDir,
      },
      slots: {
        default: _TestComponent,
      },
    })
  })

  it('should return default (ltr) direction when neither local nor global direction is provided', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent(_TestComponent).attributes('dir')).toBe('ltr')
  })

  it('should return global direction when local direction is not provided', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props('dir')).toBe(globalDir)
    expect(wrapper.findComponent(_TestComponent).attributes('dir')).toBe(globalDir)
  })

  it('should return local direction when provided', () => {
    _TestComponent = TestComponent(localDir)

    wrapper = mount(DirectionProvider, {
      props: {
        dir: globalDir,
      },
      slots: {
        default: _TestComponent,
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props('dir')).toBe(globalDir)
    expect(wrapper.findComponent(_TestComponent).attributes('dir')).toBe(localDir)
  })
})
